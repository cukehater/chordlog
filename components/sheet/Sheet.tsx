import type { Ref } from 'react';
import type { Block } from '@/lib/types';
import { ChordLine } from './ChordLine';
import { SectionLabel } from './SectionLabel';
import { CommentBlock } from './CommentBlock';
import { TabBlock } from './TabBlock';

/** 스트러밍 패턴은 시트 밖 카드에서 따로 렌더링한다 */
export function sheetBlocks(blocks: Block[]): Block[] {
  return blocks.filter((b) => b.k !== 'strum');
}

export function strumBlocks(blocks: Block[]) {
  return blocks.filter((b): b is Extract<Block, { k: 'strum' }> => b.k === 'strum');
}

export function Sheet({
  blocks, semi, fontSize, cols, errorLines = [], containerRef,
}: {
  blocks: Block[]; semi: number; fontSize: number; cols: 1 | 2;
  errorLines?: number[]; containerRef?: Ref<HTMLDivElement>;
}) {
  let lineIndex = 0;

  return (
    <div
      ref={containerRef}
      className={`grow bg-surface border border-line-soft rounded-xl p-[30px_36px] overflow-x-hidden ${
        cols === 1 ? 'overflow-y-auto' : 'overflow-y-hidden'
      }`}
    >
      <div
        style={{
          fontSize: `${fontSize}px`,
          columnCount: cols,
          columnGap: '60px',
          columnRule: '1px solid var(--color-line-soft)',
        }}
      >
        {sheetBlocks(blocks).map((b, i) => {
          const key = `${b.k}-${i}`;
          if (b.k === 'line') {
            const n = lineIndex++;
            return (
              <div key={key} className="break-inside-avoid mb-3">
                <ChordLine pairs={b.pairs} semi={semi} hasError={errorLines.includes(n)} />
              </div>
            );
          }
          return (
            <div key={key} className="break-inside-avoid mb-3">
              {b.k === 'label' ? <SectionLabel label={b.label} /> : null}
              {b.k === 'comment' ? <CommentBlock text={b.text} /> : null}
              {b.k === 'tab' ? <TabBlock title={b.title} repeat={b.repeat} lines={b.lines} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
