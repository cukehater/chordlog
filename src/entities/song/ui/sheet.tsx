'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { BlockType } from '../model/types'
import { ChordLine } from './chord-line'
import { CommentBlock } from './comment-block'
import { SectionLabel } from './section-label'
import { TabBlock } from './tab-block'

/** 스트러밍 패턴은 시트 밖 카드에서 따로 렌더링한다 */
const sheetBlocks = (blocks: BlockType[]): BlockType[] => {
  return blocks.filter((b) => b.k !== 'strum')
}

export const Sheet = ({
  blocks,
  semi,
  fontSize,
  cols,
  errorLines = [],
  containerRef,
}: {
  blocks: BlockType[]
  semi: number
  fontSize: number
  cols: 1 | 2
  errorLines?: number[]
  containerRef?: (el: HTMLDivElement) => void | (() => void)
}) => {
  let lineIndex = 0

  // 2단에서 셋째 단부터는 시트 오른쪽 밖으로 넘친다. 넘친 단이 있을 때만 넘김 버튼을 보여준다.
  const scroller = useRef<HTMLDivElement | null>(null)
  const [pager, setPager] = useState({ prev: false, next: false })
  const setRef = useCallback(
    (el: HTMLDivElement) => {
      scroller.current = el
      return containerRef?.(el)
    },
    [containerRef],
  )

  useEffect(() => {
    const el = scroller.current
    if (!el || cols !== 2) {
      setPager({ prev: false, next: false })
      return
    }
    const update = () =>
      setPager({
        prev: el.scrollLeft > 1,
        next: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      })
    update()
    el.addEventListener('scroll', update)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro?.disconnect()
    }
  }, [cols, blocks, fontSize])

  // 한 장 = 두 단 + 단 간격(60px)
  const turn = (dir: 1 | -1) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: dir * (el.clientWidth + 60), behavior: 'smooth' })
  }

  return (
    <div className="grow min-w-0 flex flex-col">
      <div
        ref={setRef}
        data-sheet
        className={`grow min-h-0 bg-bg ${
          cols === 1
            ? 'pb-10 overflow-x-hidden overflow-y-auto'
            : 'pb-4 overflow-x-auto overflow-y-hidden'
        }`}
      >
        <div
          className="[&>div:first-child>div]:mt-0"
          // 2단은 높이를 시트에 맞추고 왼쪽 단을 끝까지 채운 뒤 오른쪽으로 잇는다(넘치면 가로로 다음 단)
          style={{
            fontSize: `${fontSize}px`,
            columnCount: cols,
            ...(cols === 2 ? { height: '100%', columnFill: 'auto' as const } : {}),
            columnGap: '60px',
            columnRule: '1px solid var(--color-line-soft)',
          }}
        >
          {sheetBlocks(blocks).map((b, i) => {
            const key = `${b.k}-${i}`
            if (b.k === 'line') {
              const n = lineIndex++
              return (
                <div key={key} className="break-inside-avoid mb-3">
                  <ChordLine hasError={errorLines.includes(n)} pairs={b.pairs} semi={semi} />
                </div>
              )
            }
            // 섹션 라벨이 단 끝에 혼자 남지 않게 다음 블록과 붙인다
            return (
              <div
                key={key}
                className={`break-inside-avoid mb-3 ${b.k === 'label' ? 'break-after-avoid' : ''}`}
              >
                {b.k === 'label' ? <SectionLabel label={b.label} /> : null}
                {b.k === 'comment' ? <CommentBlock text={b.text} /> : null}
                {b.k === 'tab' ? (
                  <TabBlock lines={b.lines} repeat={b.repeat} title={b.title} />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
      {pager.prev || pager.next ? (
        <div
          data-sheet-pager
          className="shrink-0 flex items-center justify-end gap-2 py-3 border-t border-line"
        >
          <span className="mr-auto text-[13px] text-ink-5">
            {pager.next ? '오른쪽에 이어지는 단이 있어요' : '마지막 단이에요'}
          </span>
          <button
            className="h-9 px-3 border border-line rounded-md bg-bg text-[13px] text-ink-3 cursor-pointer hover:bg-surface-2 disabled:opacity-40 disabled:cursor-default"
            disabled={!pager.prev}
            type="button"
            onClick={() => turn(-1)}
          >
            ← 이전 단
          </button>
          <button
            className="h-9 px-3 border border-line rounded-md bg-bg text-[13px] text-ink-3 cursor-pointer hover:bg-surface-2 disabled:opacity-40 disabled:cursor-default"
            disabled={!pager.next}
            type="button"
            onClick={() => turn(1)}
          >
            다음 단 →
          </button>
        </div>
      ) : null}
    </div>
  )
}
