import { PerspectiveCamera } from 'three'
import { describe, expect, it } from 'vitest'

import {
  easeOutBack,
  introSchedule,
  introTitleScale,
  stringPose,
  strumProgress,
} from './intro-timeline'
import { applyStageCamera, projectStringEnds } from './stage'

const projectAt = (width: number, height: number) => {
  const cam = new PerspectiveCamera(50, 1, 10, 4000)
  applyStageCamera(cam, width, height)
  return projectStringEnds(cam, width, height)
}

describe('줄 착지 좌표', () => {
  it('1440×900에서 A줄은 (729, 757)에서 −29.1°로 약 1122px 뻗는다', () => {
    const a = stringPose(projectAt(1440, 900)[4]!)
    expect(a.x).toBeCloseTo(729, -1)
    expect(a.y).toBeCloseTo(757, -1)
    expect((a.angle * 180) / Math.PI).toBeCloseTo(-29.1, 0)
    expect(a.length).toBeCloseTo(1122, -1)
  })

  it('세로 화면에서도 줄 6개가 순서대로 나란히 투영된다', () => {
    const ends = projectAt(375, 812)
    expect(ends).toHaveLength(6)
    for (let i = 1; i < ends.length; i++) expect(ends[i]!.y1).toBeGreaterThan(ends[i - 1]!.y1)
  })
})

describe('전환 시간표', () => {
  it('로딩 경로는 morph에서 시작해 2500ms에 끝난다', () => {
    const schedule = introSchedule(true, false)
    expect(schedule[0]).toEqual(['morph', 0])
    expect(schedule.at(-1)).toEqual(['done', 2500])
  })

  it('빠른 경로는 morph 없이 reveal부터 같은 간격으로 간다', () => {
    expect(introSchedule(false, false).map(([phase]) => phase)).toEqual([
      'reveal',
      'text',
      'strum',
      'done',
    ])
  })

  it('reduced-motion은 1초 안에 끝난다', () => {
    expect(introSchedule(true, true).at(-1)![1]).toBeLessThan(1000)
  })
})

describe('strum', () => {
  it('easeOutBack은 0에서 시작해 1에 앉는다', () => {
    expect(easeOutBack(0)).toBeCloseTo(0)
    expect(easeOutBack(1)).toBeCloseTo(1)
  })

  it('시작 전엔 숨기고, 끝나면 모두 보인다', () => {
    expect(strumProgress(null, 3).dots[0]).toEqual({ scale: 0.4, opacity: 0 })
    const done = strumProgress(Infinity, 3)
    expect(done.settled).toBe(true)
    expect(done.label).toBe(1)
    expect(done.dots.every((d) => d.scale === 1 && d.opacity === 1)).toBe(true)
  })

  it('운지 점은 120ms 간격으로 차례로 나온다', () => {
    const p = strumProgress(100, 3)
    expect(p.dots[0]!.opacity).toBeGreaterThan(0)
    expect(p.dots[1]!.opacity).toBe(0)
    expect(p.settled).toBe(false)
  })
})

describe('타이틀 축소 비율', () => {
  it('1440px에서는 56px / 158.4px', () => {
    expect(introTitleScale(1440)).toBeCloseTo(56 / 158.4)
  })
})
