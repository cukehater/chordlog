'use client'

import dynamic from 'next/dynamic'
import { Component, type ReactNode, useEffect, useSyncExternalStore } from 'react'

import { markIntroFallback } from '../model/intro-store'

const FretboardScene = dynamic(() => import('./fretboard-scene'), { ssr: false })

let webgl2Support: boolean | undefined

/** three.js r163부터 WebGL2만 지원하므로 WebGL2 컨텍스트가 만들어지는지만 본다. */
const detectWebGL2 = () => {
  if (webgl2Support === undefined) {
    try {
      webgl2Support = document.createElement('canvas').getContext('webgl2') !== null
    } catch {
      webgl2Support = false
    }
  }
  return webgl2Support
}

const subscribeNever = () => () => {}

/** WebGL2가 없거나 장면이 실패했을 때. 인트로에는 3D 없이 끝난다고 알린다. */
const StaticBackdrop = () => {
  useEffect(() => markIntroFallback(), [])
  return <div aria-hidden="true" className="bg-hero-fallback absolute inset-0" />
}

/** 컨텍스트 생성 실패처럼 장면 안에서 난 에러를 받아 정적 배경으로 바꾼다. */
class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override render() {
    return this.state.failed ? <StaticBackdrop /> : this.props.children
  }
}

export const FretboardBackground = () => {
  const supported = useSyncExternalStore(subscribeNever, detectWebGL2, () => null)

  if (supported === null) return null
  if (!supported) return <StaticBackdrop />

  return (
    <SceneErrorBoundary>
      <FretboardScene />
    </SceneErrorBoundary>
  )
}
