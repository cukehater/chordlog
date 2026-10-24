'use client';

import { useState } from 'react';
import type { Song } from '@/lib/types';
import { MicroLabel } from '@/components/ui/MicroLabel';
import { UnderlineField } from '@/components/ui/UnderlineField';
import { Fretboard } from '@/components/song/Fretboard';
import { TuningTokens } from '@/components/song/TuningTokens';

const UNDERLINE = 'h-[44px] md:h-[34px] w-full p-0 border-0 border-b border-line-strong bg-transparent text-ink outline-none focus:border-accent';
const TUNING_PRESETS: Record<string, string> = {
  '표준': 'E A D G B E',
  'Drop D': 'D A D G B E',
  '반음 내림': 'Eb Ab Db Gb Bb Eb',
  '오픈 G': 'D G D G B D',
};

export function MetaForm({ song }: { song?: Song }) {
  const [tuning, setTuning] = useState(song?.tuning ?? TUNING_PRESETS['표준']);
  const [capo, setCapo] = useState(song?.capo ?? 0);
  const [tags, setTags] = useState<string[]>(song?.tags ?? []);
  const [tuningCustom, setTuningCustom] = useState(() => !Object.values(TUNING_PRESETS).includes(tuning));
  const tuningPreset = tuningCustom
    ? '직접 입력'
    : Object.keys(TUNING_PRESETS).find((k) => TUNING_PRESETS[k] === tuning) ?? '직접 입력';

  return (
    <section className="shrink-0 box-border p-[22px_20px_20px] md:p-[22px_48px_20px] border-b border-line-header grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
      <UnderlineField label="TITLE *" htmlFor="title" span={4}>
        <input id="title" type="text" defaultValue={song?.title ?? ''}
          className={`${UNDERLINE} font-display text-[20px] font-semibold`} />
      </UnderlineField>

      <UnderlineField label="ARTIST" htmlFor="artist" span={2}>
        <input id="artist" type="text" defaultValue={song?.artist ?? ''} className={`${UNDERLINE} text-[16px]`} />
      </UnderlineField>

      <UnderlineField label="KEY" htmlFor="key" span={1}>
        <select id="key" defaultValue={song?.key ?? 'G'} className={`${UNDERLINE} font-mono text-[16px] font-medium`}>
          {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Am', 'Em', 'Dm'].map((k) => <option key={k}>{k}</option>)}
        </select>
      </UnderlineField>

      <UnderlineField label="TEMPO" htmlFor="tempo" span={1}>
        <input id="tempo" type="number" min={40} max={240} defaultValue={song?.tempo ?? 90}
          className={`${UNDERLINE} font-mono text-[16px]`} />
      </UnderlineField>

      <UnderlineField label="STATUS" htmlFor="status" span={2}>
        <select id="status" defaultValue={song?.status ?? 'practicing'} className={`${UNDERLINE} text-[15px]`}>
          <option value="practicing">연습중</option>
          <option value="done">완성</option>
          <option value="archived">보관</option>
        </select>
      </UnderlineField>

      <UnderlineField label="REFERENCE" htmlFor="ref" span={2}>
        <input id="ref" type="url" placeholder="원본 영상 주소" defaultValue={song?.reference ?? ''}
          className={`${UNDERLINE} text-[14px]`} />
      </UnderlineField>

      {/* 박스 카드 3종 */}
      <div className="md:col-span-3 flex flex-col gap-[9px]">
        <MicroLabel as="label" htmlFor="tuning">TUNING</MicroLabel>
        <div className="flex flex-wrap items-center gap-3 bg-surface-2 border border-line rounded-lg p-[11px_14px]">
          <select id="tuning" value={tuningPreset}
            onChange={(e) => {
              const preset = TUNING_PRESETS[e.target.value];
              if (preset) {
                setTuning(preset);
                setTuningCustom(false);
              } else {
                setTuningCustom(true);
              }
            }}
            className="h-[44px] md:h-[38px] px-2 border border-line-strong rounded-lg bg-bg text-[13.5px] text-ink outline-none focus:border-accent">
            {[...Object.keys(TUNING_PRESETS), '직접 입력'].map((k) => <option key={k}>{k}</option>)}
          </select>
          {tuningPreset === '직접 입력' ? (
            <>
              <MicroLabel as="label" htmlFor="tuning-custom" className="sr-only">튜닝 직접 입력</MicroLabel>
              <input id="tuning-custom" type="text" value={tuning} onChange={(e) => setTuning(e.target.value)}
                placeholder="E A D G B E"
                className="h-[44px] md:h-[38px] px-2 border border-line-strong rounded-lg bg-bg text-[13.5px] text-ink outline-none focus:border-accent" />
            </>
          ) : null}
          <TuningTokens tuning={tuning} size="editor" />
        </div>
      </div>

      <div className="md:col-span-5 flex flex-col gap-[9px]">
        <MicroLabel as="label" htmlFor="capo">CAPO — 끼우는 위치만 기록합니다</MicroLabel>
        <div className="flex flex-wrap items-center gap-4 bg-surface-2 border border-line rounded-lg p-[11px_14px]">
          <select id="capo" value={capo} onChange={(e) => setCapo(Number(e.target.value))}
            className="h-[44px] md:h-[38px] px-[10px] border border-line-strong rounded-lg bg-bg font-mono text-[15px] font-bold text-ink outline-none focus:border-accent">
            {Array.from({ length: 8 }, (_, i) => <option key={i} value={i}>{i}프렛</option>)}
          </select>
          <Fretboard fret={capo} size="editor" />
          <span className="text-[12.5px] leading-[1.6] text-ink-4">
            악보 코드는 바뀌지 않아요.<br />연주할 때 참고용으로만 보입니다.
          </span>
        </div>
      </div>

      <div className="md:col-span-4 flex flex-col gap-[9px]">
        <MicroLabel as="label" htmlFor="tags">TAGS</MicroLabel>
        <div className="flex items-center gap-2 flex-wrap min-h-[62px] box-border p-[4px_12px] border border-line rounded-lg bg-surface-2 focus-within:border-accent">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-[7px] text-[13px] text-accent border border-accent/35 bg-accent/10 px-[10px] py-1 rounded-sm">
              {t}
              <button type="button" aria-label={`${t} 태그 제거`} onClick={() => setTags(tags.filter((x) => x !== t))}
                className="border-0 bg-transparent text-accent text-[13px] leading-none cursor-pointer p-0 min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center">×</button>
            </span>
          ))}
          <input id="tags" type="text" placeholder="입력 후 Enter"
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              const v = e.currentTarget.value.trim();
              if (v && !tags.includes(v)) setTags([...tags, v]);
              e.currentTarget.value = '';
            }}
            className="grow h-[44px] md:h-[28px] border-0 bg-transparent text-[13px] text-ink outline-none" />
        </div>
      </div>
    </section>
  );
}
