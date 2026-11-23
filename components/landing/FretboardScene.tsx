"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MathUtils, MeshStandardMaterial, type Group, type MeshBasicMaterial, type PerspectiveCamera } from "three";

import { fraunces, plexMono } from "@/app/fonts";

import {
  BOARD_LENGTH,
  BOARD_THICKNESS,
  BOARD_WIDTH,
  CHORD,
  DOT_PLANE,
  FRET_X,
  LABEL_ORIGIN,
  LABEL_PADDING,
  LABEL_SIZE,
  MARKER_PLANE,
  NUT_WIDTH,
  SHADOW_SIZE,
  SHEEN_SPAN,
  STRINGS,
  STRING_LENGTH,
  STRING_START,
  createLabelTextures,
  createSurfaceTextures,
  disposeTextures,
  noteX,
  type Fonts,
  type Palette,
} from "./fretboard-model";
import { easeFactor, usePointerTarget, usePrefersReducedMotion } from "./pointer";

/*
 * 장면은 1440×900 "무대" 좌표로 짜여 있다. 카메라는 무대 중심에서 1600px 떨어진 원근 카메라이고,
 * 화면 크기에 맞춰 무대를 k배로 줄이거나 키우고 옮긴다(stageLayout).
 */
const STAGE_W = 1440;
const STAGE_H = 900;
const PERSPECTIVE = 1600;
/** 지판 중심이 놓이는 무대 좌표(px, y 아래로). */
const RIG_AT = [1247, 420] as const;
/** 기본 자세: 뒤로 40° 눕히고 화면에서 32° 돌린다. 마우스로 ±10°까지 더 기운다. */
const BASE_TILT = 40;
const BOARD_TURN = 32;
const MAX_TILT = 10;
const EASE = 0.08;

const deg = MathUtils.degToRad;

/** 지판 좌표(px, 좌상단 원점, y 아래로)를 three.js 로컬 좌표(중심 원점, y 위로)로 바꾼다. */
const toBoard = (x: number, y: number): [number, number] => [x - BOARD_LENGTH / 2, BOARD_WIDTH / 2 - y];

function stageLayout(width: number, height: number) {
  if (height >= width) {
    const k = Math.max(0.5, Math.min(0.9, width / 700));
    return { k, left: width * 0.32 - 700 * k, top: Math.min(height * 0.8, height * 0.5 + 300) - 720 * k };
  }
  const k = Math.min(width / STAGE_W, (height / STAGE_H) * 1.1);
  return { k, left: width - STAGE_W * k, top: height - STAGE_H * k };
}

/** 무대 중심을 원근 중심으로 유지한 채 화면 안 원하는 위치로 옮긴다(setViewOffset). */
function StageCamera() {
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const get = useThree((s) => s.get);

  useLayoutEffect(() => {
    const { camera, invalidate } = get();
    const cam = camera as PerspectiveCamera;
    const { k, left, top } = stageLayout(width, height);
    const cx = left + (STAGE_W / 2) * k;
    const cy = top + (STAGE_H / 2) * k;
    const fullW = 2 * Math.max(cx, width - cx);
    const fullH = 2 * Math.max(cy, height - cy);

    cam.fov = MathUtils.radToDeg(2 * Math.atan(fullH / (2 * k * PERSPECTIVE)));
    cam.aspect = fullW / fullH;
    cam.position.set(0, 0, PERSPECTIVE);
    cam.setViewOffset(fullW, fullH, fullW / 2 - cx, fullH / 2 - cy, width, height);
    cam.updateProjectionMatrix();
    invalidate();
  }, [width, height, get]);

  return null;
}

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  return {
    accent: style.getPropertyValue("--color-accent").trim() || "#f0a04b",
    accentDeep: style.getPropertyValue("--color-accent-deep").trim() || "#825229",
  };
}

const FONTS: Fonts = { display: fraunces.style.fontFamily, mono: plexMono.style.fontFamily };
const FALLBACK_FONTS: Fonts = { display: "Georgia, serif", mono: "ui-monospace, monospace" };

/** 캔버스에 글자를 그리기 전에 웹폰트를 기다린다. 실패해도 대체 글꼴로 그린다. */
function useWebFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.all([
      document.fonts.load(`italic 600 64px ${FONTS.display}`, CHORD.name),
      document.fonts.load(`600 14px ${FONTS.mono}`, "0123"),
      document.fonts.load(`500 16px ${FONTS.mono}`, CHORD.shape),
    ])
      .catch(() => undefined)
      .then(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

function Fretboard() {
  const rig = useRef<Group>(null);
  const sheen = useRef<MeshBasicMaterial>(null);
  const current = useRef({ x: 0, y: 0 });
  const invalidate = useThree((s) => s.invalidate);
  const reduced = usePrefersReducedMotion();
  const target = usePointerTarget(!reduced, invalidate);
  const fontsReady = useWebFontsReady();

  const surface = useMemo(() => createSurfaceTextures(), []);
  const labels = useMemo(() => createLabelTextures(readPalette(), fontsReady ? FONTS : FALLBACK_FONTS), [fontsReady]);
  const materials = useMemo(
    () => ({
      fret: new MeshStandardMaterial({ color: "#e6e1d6", metalness: 1, roughness: 0.24 }),
      steel: new MeshStandardMaterial({ color: "#ece8df", metalness: 1, roughness: 0.26 }),
      bronze: new MeshStandardMaterial({ color: "#e2b36e", metalness: 1, roughness: 0.38, map: surface.winding }),
      nut: new MeshStandardMaterial({ color: "#efe5cf", metalness: 0, roughness: 0.55 }),
    }),
    [surface],
  );

  useEffect(() => () => disposeTextures(surface), [surface]);
  useEffect(() => () => disposeTextures(labels), [labels]);
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);
  useEffect(() => invalidate(), [labels, invalidate]);

  useFrame((_, delta) => {
    const group = rig.current;
    if (!group) return;
    const c = current.current;
    const t = target.current;
    if (reduced) {
      c.x = 0;
      c.y = 0;
    } else {
      const k = easeFactor(EASE, delta);
      c.x += (t.x - c.x) * k;
      c.y += (t.y - c.y) * k;
    }
    const settled = Math.abs(t.x - c.x) < 1e-3 && Math.abs(t.y - c.y) < 1e-3;
    if (settled) {
      c.x = t.x;
      c.y = t.y;
    }

    // CSS rotateY(x) rotateX(40° - y) rotateZ(-32°)와 같은 자세. three.js는 y축이 위라서 X·Z 부호가 반대다.
    group.rotation.set(deg(-(BASE_TILT - c.y * MAX_TILT)), deg(c.x * MAX_TILT), deg(BOARD_TURN), "YXZ");
    // 광택 띠는 마우스 x에 따라 15%~85% 위치를 오간다.
    const sheenMap = sheen.current?.map;
    if (sheenMap) sheenMap.offset.x = ((SHEEN_SPAN - 1) / SHEEN_SPAN) * (0.5 + c.x * 0.35);

    if (!settled) invalidate();
  });

  const [labelX, labelY] = toBoard(
    LABEL_ORIGIN[0] - LABEL_PADDING + LABEL_SIZE[0] / 2,
    LABEL_ORIGIN[1] - LABEL_PADDING + LABEL_SIZE[1] / 2,
  );

  return (
    <group ref={rig} position={[RIG_AT[0] - STAGE_W / 2, STAGE_H / 2 - RIG_AT[1], 0]} rotation={[deg(-BASE_TILT), 0, deg(BOARD_TURN), "YXZ"]}>
      {/* 아래로 떨어진 그림자 */}
      <mesh position={[0, 0, -130]} renderOrder={-1}>
        <planeGeometry args={SHADOW_SIZE} />
        <meshBasicMaterial map={surface.shadow} transparent depthWrite={false} />
      </mesh>

      {/* 지판 두께: 관객 쪽 옆면과 너트 쪽 끝면 */}
      <mesh position={[0, -BOARD_WIDTH / 2, -BOARD_THICKNESS / 2]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[BOARD_LENGTH, BOARD_THICKNESS]} />
        <meshBasicMaterial map={surface.side} />
      </mesh>
      <mesh position={[-BOARD_LENGTH / 2, 0, -BOARD_THICKNESS / 2]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[BOARD_THICKNESS, BOARD_WIDTH]} />
        <meshBasicMaterial map={surface.end} />
      </mesh>

      {/* 지판 윗면과 광택 */}
      <mesh>
        <planeGeometry args={[BOARD_LENGTH, BOARD_WIDTH]} />
        <meshBasicMaterial map={surface.wood} />
      </mesh>
      <mesh position={[0, 0, 0.5]}>
        <planeGeometry args={[BOARD_LENGTH, BOARD_WIDTH]} />
        <meshBasicMaterial ref={sheen} map={surface.sheen} transparent depthWrite={false} />
      </mesh>

      {/* 프렛 12개 */}
      {FRET_X.map((x) => (
        <mesh key={x} position={[toBoard(x, 0)[0], 0, 0.4]} material={materials.fret}>
          <cylinderGeometry args={[2, 2, BOARD_WIDTH, 12, 1]} />
        </mesh>
      ))}

      {/* 너트 */}
      <mesh position={[toBoard(NUT_WIDTH / 2, 0)[0], 0, 3]} material={materials.nut}>
        <boxGeometry args={[NUT_WIDTH, BOARD_WIDTH, 6]} />
      </mesh>

      {/* 줄 6개: 1·2번은 스틸, 3~6번은 브론즈 와운드 */}
      {STRINGS.map((s) => (
        <mesh
          key={s.y}
          position={[toBoard(STRING_START + STRING_LENGTH / 2, 0)[0], toBoard(0, s.y)[1], 9]}
          rotation-z={Math.PI / 2}
          material={s.wound ? materials.bronze : materials.steel}
        >
          <cylinderGeometry args={[s.gauge / 2, s.gauge / 2, STRING_LENGTH, 16, 1]} />
        </mesh>
      ))}

      {/* 개방현(o)과 소리 내지 않는 줄(x) 표시 */}
      {[...CHORD.open, ...CHORD.muted].map((index) => (
        <mesh key={index} position={[toBoard(-21, 0)[0], toBoard(0, STRINGS[index].y)[1], 3]}>
          <planeGeometry args={[MARKER_PLANE, MARKER_PLANE]} />
          <meshBasicMaterial
            map={(CHORD.muted as readonly number[]).includes(index) ? surface.muted : surface.open}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* C 코드 운지 점 */}
      {CHORD.fretted.map((note, i) => {
        const [x, y] = toBoard(noteX(note.fret), STRINGS[note.string].y);
        return (
          <mesh key={note.string} position={[x, y, 22]}>
            <planeGeometry args={[DOT_PLANE, DOT_PLANE]} />
            <meshBasicMaterial map={labels.dots[i]} transparent depthWrite={false} />
          </mesh>
        );
      })}

      {/* 코드 이름 */}
      <mesh position={[labelX, labelY, 36]}>
        <planeGeometry args={LABEL_SIZE} />
        <meshBasicMaterial map={labels.label} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function FretboardScene() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Canvas
        flat
        dpr={[1, 2]}
        frameloop="demand"
        camera={{ manual: true, position: [0, 0, PERSPECTIVE], near: 10, far: 4000 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <StageCamera />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.4} color="#ffe2c2" position={[-3, 4, 5]} scale={[8, 3, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={0.9} color="#ffc98f" position={[5, -2, 4]} scale={[5, 5, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={0.25} color="#6b4a33" position={[0, 0, -6]} scale={[10, 10, 1]} target={[0, 0, 0]} />
        </Environment>
        <ambientLight intensity={0.6} color="#ffe6cc" />
        <directionalLight position={[-600, 800, 900]} intensity={1.4} color="#ffe0bd" />
        <Fretboard />
      </Canvas>
    </div>
  );
}
