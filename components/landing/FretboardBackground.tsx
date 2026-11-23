"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useSyncExternalStore } from "react";

const FretboardScene = dynamic(() => import("./FretboardScene"), { ssr: false });

let webgl2Support: boolean | undefined;

/** three.js r163부터 WebGL2만 지원하므로 WebGL2 컨텍스트가 만들어지는지만 본다. */
function detectWebGL2() {
  if (webgl2Support === undefined) {
    try {
      webgl2Support = document.createElement("canvas").getContext("webgl2") !== null;
    } catch {
      webgl2Support = false;
    }
  }
  return webgl2Support;
}

const subscribeNever = () => () => {};

function StaticBackdrop() {
  return <div aria-hidden="true" className="bg-hero-fallback absolute inset-0" />;
}

/** 컨텍스트 생성 실패처럼 장면 안에서 난 에러를 받아 정적 배경으로 바꾼다. */
class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <StaticBackdrop /> : this.props.children;
  }
}

export function FretboardBackground() {
  const supported = useSyncExternalStore(subscribeNever, detectWebGL2, () => null);

  if (supported === null) return null;
  if (!supported) return <StaticBackdrop />;

  return (
    <SceneErrorBoundary>
      <FretboardScene />
    </SceneErrorBoundary>
  );
}
