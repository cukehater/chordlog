'use client';

import type { ReactNode } from 'react';

/** 데스크톱 컨트롤 바 전용 토글. 항상 label과 함께 쓴다. 높이 32px는 아트보드 실측값이므로, 44px 터치 타깃이 필요한 모바일 하단 독에는 쓰지 말 것 — 독은 자체 46×44 버튼을 쓴다. */
export function ToolToggle({
  active, onClick, icon, label,
}: {
  active: boolean; onClick: () => void; icon: ReactNode;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-[32px] px-[13px] flex items-center gap-2 rounded-lg border text-[13px] cursor-pointer ${
        active
          ? 'border-accent bg-accent text-accent-ink font-bold'
          : 'border-line bg-transparent text-ink-2 font-medium'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
