import { MathUtils, Object3D, type PerspectiveCamera, Vector3 } from 'three'

import { BOARD_LENGTH, BOARD_WIDTH, STRING_START, STRINGS } from './fretboard-model'

/*
 * 장면은 1440×900 "무대" 좌표로 짜여 있다. 카메라는 무대 중심에서 1600px 떨어진 원근 카메라이고,
 * 화면 크기에 맞춰 무대를 k배로 줄이거나 키우고 옮긴다(stageLayout).
 */
const STAGE_W = 1440
const STAGE_H = 900
export const PERSPECTIVE = 1600
/** 지판 중심이 놓이는 무대 좌표(px, y 아래로). */
const RIG_AT = [1247, 420] as const
export const RIG_POSITION = [RIG_AT[0] - STAGE_W / 2, STAGE_H / 2 - RIG_AT[1], 0] as const
/** 기본 자세: 뒤로 40° 눕히고 화면에서 32° 돌린다. */
export const BASE_TILT = 40
export const BOARD_TURN = 32
/** 줄 중심이 지판 윗면에서 떠 있는 높이. */
const STRING_Z = 9

const deg = MathUtils.degToRad

/** 지판 좌표(px, 좌상단 원점, y 아래로)를 three.js 로컬 좌표(중심 원점, y 위로)로 바꾼다. */
export const toBoard = (x: number, y: number): [number, number] => [
  x - BOARD_LENGTH / 2,
  BOARD_WIDTH / 2 - y,
]

const stageLayout = (width: number, height: number) => {
  if (height >= width) {
    const k = Math.max(0.5, Math.min(0.9, width / 700))
    return {
      k,
      left: width * 0.32 - 700 * k,
      top: Math.min(height * 0.8, height * 0.5 + 300) - 720 * k,
    }
  }
  const k = Math.min(width / STAGE_W, (height / STAGE_H) * 1.1)
  return { k, left: width - STAGE_W * k, top: height - STAGE_H * k }
}

/** 무대 중심을 원근 중심으로 유지한 채 화면 안 원하는 위치로 옮긴다(setViewOffset). */
export const applyStageCamera = (cam: PerspectiveCamera, width: number, height: number) => {
  const { k, left, top } = stageLayout(width, height)
  const cx = left + (STAGE_W / 2) * k
  const cy = top + (STAGE_H / 2) * k
  const fullW = 2 * Math.max(cx, width - cx)
  const fullH = 2 * Math.max(cy, height - cy)

  cam.fov = MathUtils.radToDeg(2 * Math.atan(fullH / (2 * k * PERSPECTIVE)))
  cam.aspect = fullW / fullH
  cam.position.set(0, 0, PERSPECTIVE)
  cam.setViewOffset(fullW, fullH, fullW / 2 - cx, fullH / 2 - cy, width, height)
  cam.updateProjectionMatrix()
  cam.updateMatrixWorld()
}

/** 화면 px 좌표로 본 줄 하나의 양 끝(너트 쪽 x1·y1, 지판 끝 x2·y2). */
export type StringEndsType = { x1: number; y1: number; x2: number; y2: number }

/**
 * 마우스 기울기 0인 기본 자세에서 줄 6개의 양 끝을 화면 px로 투영한다.
 * setViewOffset이 걸린 투영 행렬을 거쳐야 화면 위치가 맞는다.
 */
export const projectStringEnds = (
  cam: PerspectiveCamera,
  width: number,
  height: number,
): StringEndsType[] => {
  const pose = new Object3D()
  pose.position.set(...RIG_POSITION)
  pose.rotation.set(deg(-BASE_TILT), 0, deg(BOARD_TURN), 'YXZ')
  pose.updateMatrixWorld()

  const toScreen = (x: number, y: number) => {
    const [lx, ly] = toBoard(x, y)
    const ndc = pose.localToWorld(new Vector3(lx, ly, STRING_Z)).project(cam)
    return [((ndc.x + 1) / 2) * width, ((1 - ndc.y) / 2) * height] as const
  }

  return STRINGS.map((s) => {
    const [x1, y1] = toScreen(STRING_START, s.y)
    const [x2, y2] = toScreen(BOARD_LENGTH, s.y)
    return { x1, y1, x2, y2 }
  })
}
