'use client'

import { Environment, Lightformer } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  type Group,
  MathUtils,
  type Mesh,
  type MeshBasicMaterial,
  MeshStandardMaterial,
  type PerspectiveCamera,
} from 'three'

import { fraunces, plexMono } from '@/shared/config'

import {
  BOARD_LENGTH,
  BOARD_THICKNESS,
  BOARD_WIDTH,
  CHORD,
  createLabelTextures,
  createSurfaceTextures,
  disposeTextures,
  DOT_PLANE,
  type FontsType,
  FRET_X,
  LABEL_ORIGIN,
  LABEL_PADDING,
  LABEL_SIZE,
  MARKER_PLANE,
  noteX,
  NUT_WIDTH,
  type PaletteType,
  SHADOW_SIZE,
  SHEEN_SPAN,
  STRING_LENGTH,
  STRING_START,
  STRINGS,
} from '../lib/fretboard-model'
import { strumProgress } from '../lib/intro-timeline'
import { easeFactor, usePointerTarget, usePrefersReducedMotion } from '../lib/pointer'
import {
  applyStageCamera,
  BASE_TILT,
  BOARD_TURN,
  PERSPECTIVE,
  projectStringEnds,
  RIG_POSITION,
  toBoard,
} from '../lib/stage'
import { getIntroSnapshot, markIntroReady, setIntroLanding, useIntro } from '../model/intro-store'

/** 마우스로 기본 자세에서 ±10°까지 더 기운다. */
const MAX_TILT = 10
const EASE = 0.08

const deg = MathUtils.degToRad

/** 화면 크기에 맞춰 카메라를 옮기고, 인트로 줄이 내려앉을 지판 줄 좌표를 다시 잰다. */
const StageCamera = () => {
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)
  const get = useThree((s) => s.get)

  useLayoutEffect(() => {
    const { camera, invalidate } = get()
    const cam = camera as PerspectiveCamera
    applyStageCamera(cam, width, height)
    setIntroLanding(projectStringEnds(cam, width, height))
    invalidate()
  }, [width, height, get])

  return null
}

const readPalette = (): PaletteType => {
  const style = getComputedStyle(document.documentElement)
  return {
    accent: style.getPropertyValue('--color-accent').trim() || '#f0a04b',
    accentDeep: style.getPropertyValue('--color-accent-deep').trim() || '#825229',
  }
}

const FONTS: FontsType = { display: fraunces.style.fontFamily, mono: plexMono.style.fontFamily }
const FALLBACK_FONTS: FontsType = { display: 'Georgia, serif', mono: 'ui-monospace, monospace' }

/** 캔버스에 글자를 그리기 전에 웹폰트를 기다린다. 실패해도 대체 글꼴로 그린다. */
const useWebFontsReady = () => {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    Promise.all([
      document.fonts.load(`italic 600 64px ${FONTS.display}`, CHORD.name),
      document.fonts.load(`600 14px ${FONTS.mono}`, '0123'),
      document.fonts.load(`500 16px ${FONTS.mono}`, CHORD.shape),
    ])
      .catch(() => undefined)
      .then(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [])
  return ready
}

/** 지금 시각의 운지 점·라벨 상태. 인트로를 건너뛴 경우(done인데 strum 기록 없음)는 끝난 상태다. */
const strumStep = (reduced: boolean) => {
  const { phase, strumAt } = getIntroSnapshot()
  if (strumAt === null)
    return strumProgress(phase === 'done' ? Infinity : null, CHORD.fretted.length)
  return strumProgress(reduced ? Infinity : performance.now() - strumAt, CHORD.fretted.length)
}

const Fretboard = () => {
  const rig = useRef<Group>(null)
  const sheen = useRef<MeshBasicMaterial>(null)
  const dots = useRef<(Mesh | null)[]>([])
  const label = useRef<MeshBasicMaterial>(null)
  const readySent = useRef(false)
  const current = useRef({ x: 0, y: 0 })
  const invalidate = useThree((s) => s.invalidate)
  const reduced = usePrefersReducedMotion()
  const { phase } = useIntro()
  // 인트로가 끝나기 전에는 기울지 않는다(착지 좌표가 기본 자세 기준이다)
  const target = usePointerTarget(!reduced && phase === 'done', invalidate)
  const fontsReady = useWebFontsReady()

  const surface = useMemo(() => createSurfaceTextures(), [])
  const labels = useMemo(
    () => createLabelTextures(readPalette(), fontsReady ? FONTS : FALLBACK_FONTS),
    [fontsReady],
  )
  const materials = useMemo(
    () => ({
      fret: new MeshStandardMaterial({ color: '#e6e1d6', metalness: 1, roughness: 0.24 }),
      steel: new MeshStandardMaterial({ color: '#ece8df', metalness: 1, roughness: 0.26 }),
      bronze: new MeshStandardMaterial({
        color: '#e2b36e',
        metalness: 1,
        roughness: 0.38,
        map: surface.winding,
      }),
      nut: new MeshStandardMaterial({ color: '#efe5cf', metalness: 0, roughness: 0.55 }),
    }),
    [surface],
  )

  useEffect(() => () => disposeTextures(surface), [surface])
  useEffect(() => () => disposeTextures(labels), [labels])
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials])
  useEffect(() => invalidate(), [labels, phase, invalidate])

  useFrame((_, delta) => {
    const group = rig.current
    if (!group) return
    const c = current.current
    const t = target.current
    if (reduced) {
      c.x = 0
      c.y = 0
    } else {
      const k = easeFactor(EASE, delta)
      c.x += (t.x - c.x) * k
      c.y += (t.y - c.y) * k
    }
    const settled = Math.abs(t.x - c.x) < 1e-3 && Math.abs(t.y - c.y) < 1e-3
    if (settled) {
      c.x = t.x
      c.y = t.y
    }

    // CSS rotateY(x) rotateX(40° - y) rotateZ(-32°)와 같은 자세. three.js는 y축이 위라서 X·Z 부호가 반대다.
    group.rotation.set(
      deg(-(BASE_TILT - c.y * MAX_TILT)),
      deg(c.x * MAX_TILT),
      deg(BOARD_TURN),
      'YXZ',
    )
    // 광택 띠는 마우스 x에 따라 15%~85% 위치를 오간다.
    const sheenMap = sheen.current?.map
    if (sheenMap) sheenMap.offset.x = ((SHEEN_SPAN - 1) / SHEEN_SPAN) * (0.5 + c.x * 0.35)

    // 웹폰트 텍스처로 그린 첫 프레임이 화면에 나간 뒤 인트로에 준비를 알린다
    if (fontsReady && !readySent.current) {
      readySent.current = true
      requestAnimationFrame(markIntroReady)
    }

    const strum = strumStep(reduced)
    strum.dots.forEach(({ scale, opacity }, i) => {
      const mesh = dots.current[i]
      if (!mesh) return
      mesh.scale.setScalar(scale)
      ;(mesh.material as MeshBasicMaterial).opacity = opacity
    })
    if (label.current) label.current.opacity = strum.label

    if (!settled || !strum.settled) invalidate()
  })

  const [labelX, labelY] = toBoard(
    LABEL_ORIGIN[0] - LABEL_PADDING + LABEL_SIZE[0] / 2,
    LABEL_ORIGIN[1] - LABEL_PADDING + LABEL_SIZE[1] / 2,
  )

  return (
    <group
      ref={rig}
      position={RIG_POSITION}
      rotation={[deg(-BASE_TILT), 0, deg(BOARD_TURN), 'YXZ']}
    >
      {/* 아래로 떨어진 그림자 */}
      <mesh position={[0, 0, -130]} renderOrder={-1}>
        <planeGeometry args={SHADOW_SIZE} />
        <meshBasicMaterial transparent depthWrite={false} map={surface.shadow} />
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
        <meshBasicMaterial ref={sheen} transparent depthWrite={false} map={surface.sheen} />
      </mesh>

      {/* 프렛 12개 */}
      {FRET_X.map((x) => (
        <mesh key={x} material={materials.fret} position={[toBoard(x, 0)[0], 0, 0.4]}>
          <cylinderGeometry args={[2, 2, BOARD_WIDTH, 12, 1]} />
        </mesh>
      ))}

      {/* 너트 */}
      <mesh material={materials.nut} position={[toBoard(NUT_WIDTH / 2, 0)[0], 0, 3]}>
        <boxGeometry args={[NUT_WIDTH, BOARD_WIDTH, 6]} />
      </mesh>

      {/* 줄 6개: 1·2번은 스틸, 3~6번은 브론즈 와운드 */}
      {STRINGS.map((s) => (
        <mesh
          key={s.y}
          material={s.wound ? materials.bronze : materials.steel}
          position={[toBoard(STRING_START + STRING_LENGTH / 2, 0)[0], toBoard(0, s.y)[1], 9]}
          rotation-z={Math.PI / 2}
        >
          <cylinderGeometry args={[s.gauge / 2, s.gauge / 2, STRING_LENGTH, 16, 1]} />
        </mesh>
      ))}

      {/* 개방현(o)과 소리 내지 않는 줄(x) 표시 */}
      {[...CHORD.open, ...CHORD.muted].map((index) => (
        <mesh key={index} position={[toBoard(-21, 0)[0], toBoard(0, STRINGS[index]!.y)[1], 3]}>
          <planeGeometry args={[MARKER_PLANE, MARKER_PLANE]} />
          <meshBasicMaterial
            transparent
            depthWrite={false}
            map={(CHORD.muted as readonly number[]).includes(index) ? surface.muted : surface.open}
          />
        </mesh>
      ))}

      {/* C 코드 운지 점 */}
      {CHORD.fretted.map((note, i) => {
        const [x, y] = toBoard(noteX(note.fret), STRINGS[note.string]!.y)
        return (
          <mesh
            key={note.string}
            ref={(mesh) => {
              dots.current[i] = mesh
            }}
            position={[x, y, 22]}
          >
            <planeGeometry args={[DOT_PLANE, DOT_PLANE]} />
            <meshBasicMaterial transparent depthWrite={false} map={labels.dots[i]!} />
          </mesh>
        )
      })}

      {/* 코드 이름 */}
      <mesh position={[labelX, labelY, 36]}>
        <planeGeometry args={LABEL_SIZE} />
        <meshBasicMaterial ref={label} transparent depthWrite={false} map={labels.label} />
      </mesh>
    </group>
  )
}

const FretboardScene = () => {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Canvas
        flat
        camera={{ manual: true, position: [0, 0, PERSPECTIVE], near: 10, far: 4000 }}
        dpr={[1, 2]}
        frameloop="demand"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <StageCamera />
        <Environment frames={1} resolution={256}>
          <Lightformer
            color="#ffe2c2"
            form="rect"
            intensity={2.4}
            position={[-3, 4, 5]}
            scale={[8, 3, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            color="#ffc98f"
            form="rect"
            intensity={0.9}
            position={[5, -2, 4]}
            scale={[5, 5, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            color="#6b4a33"
            form="rect"
            intensity={0.25}
            position={[0, 0, -6]}
            scale={[10, 10, 1]}
            target={[0, 0, 0]}
          />
        </Environment>
        <ambientLight color="#ffe6cc" intensity={0.6} />
        <directionalLight color="#ffe0bd" intensity={1.4} position={[-600, 800, 900]} />
        <Fretboard />
      </Canvas>
    </div>
  )
}

export default FretboardScene
