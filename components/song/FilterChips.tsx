"use client";

import { useState } from "react";

export function FilterChips({ groups }: { groups: { items: string[] }[] }) {
  const [active, setActive] = useState("전체");
  return (
    <div className="flex items-center gap-2 flex-wrap overflow-x-auto">
      {groups.map((g, gi) => (
        <span key={gi} className="flex items-center gap-2">
          {gi > 0 ? (
            <span className="w-px h-[18px] bg-line mx-[6px] hidden md:block" />
          ) : null}
          {g.items.map((item) => {
            const on = item === active;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(item)}
                className={`shrink-0 h-[44px] md:h-[32px] px-[13px] rounded-lg border text-[13px] cursor-pointer ${
                  on
                    ? "border-accent bg-accent/12 text-accent font-bold"
                    : "border-line bg-transparent text-ink-3"
                }`}
              >
                {item}
              </button>
            );
          })}
        </span>
      ))}
    </div>
  );
}
