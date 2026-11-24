'use client'

import { type ReactNode, type Ref, useRef } from 'react'

export const SourcePane = ({
  value,
  onChange,
  toolbar,
  errorLine,
  errorMessage,
  textareaRef,
}: {
  value: string
  onChange: (v: string) => void
  toolbar?: ReactNode
  errorLine?: number
  errorMessage?: string
  textareaRef?: Ref<HTMLTextAreaElement>
}) => {
  const lines = value.split('\n').length
  const gutterRef = useRef<HTMLDivElement>(null)

  return (
    <section className="flex flex-col bg-sunk md:border-r border-line-header overflow-hidden">
      <div className="shrink-0 h-10 px-5 flex items-center gap-3 border-b border-line-hair">
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-dim">
          SOURCE · CHORDPRO
        </span>
      </div>

      {toolbar}

      <div className="grow flex overflow-hidden">
        <div
          ref={gutterRef}
          data-gutter
          aria-hidden="true"
          className="shrink-0 w-12 box-border pt-4 pr-3 pb-4 text-right font-mono text-[12.5px] leading-6 text-dim flex flex-col overflow-hidden"
        >
          {Array.from({ length: lines }, (_, i) => {
            const n = i + 1
            return (
              <span key={n} className={n === errorLine ? 'text-danger font-bold' : ''}>
                {n}
              </span>
            )
          })}
        </div>
        <label className="sr-only" htmlFor="src">
          악보 원문
        </label>
        <textarea
          ref={textareaRef}
          className="grow box-border border-0 resize-none pt-4 pr-5 pb-4 font-mono text-[12.5px] leading-6 text-ink-2 bg-transparent outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-accent/35"
          id="src"
          spellCheck={false}
          value={value}
          wrap="off"
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => {
            if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop
          }}
        />
      </div>

      {errorMessage ? (
        <div
          data-error-strip
          className="shrink-0 flex items-center gap-[11px] p-[12px_20px] border-t border-line-hair bg-danger/7"
        >
          <span className="shrink-0 w-[18px] h-[18px] rounded-xs bg-danger text-danger-ink text-[12px] font-bold flex items-center justify-center">
            !
          </span>
          <span className="text-[12.5px] text-danger-text">
            <strong className="font-mono font-bold">{errorLine}행</strong> · {errorMessage}
          </span>
        </div>
      ) : null}
    </section>
  )
}
