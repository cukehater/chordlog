'use client'

import { useState } from 'react'

import { Fretboard, type SongType, TuningTokens } from '@/entities/song'
import { MicroLabel } from '@/shared/ui/micro-label'
import { UnderlineField } from '@/shared/ui/underline-field'

const UNDERLINE =
  'h-[44px] md:h-[34px] w-full p-0 border-0 border-b border-line-strong bg-transparent text-ink outline-none focus:border-accent'
const TUNING_PRESETS: Record<string, string> = {
  표준: 'E A D G B E',
  'Drop D': 'D A D G B E',
  '반음 내림': 'Eb Ab Db Gb Bb Eb',
  '오픈 G': 'D G D G B D',
}

export const MetaForm = ({ song }: { song?: SongType | undefined }) => {
  const [tuning, setTuning] = useState(song?.tuning ?? TUNING_PRESETS['표준']!)
  const [capo, setCapo] = useState(song?.capo ?? 0)
  const [tags, setTags] = useState<string[]>(song?.tags ?? [])
  const [tuningCustom, setTuningCustom] = useState(
    () => !Object.values(TUNING_PRESETS).includes(tuning),
  )
  const tuningPreset = tuningCustom
    ? '직접 입력'
    : (Object.keys(TUNING_PRESETS).find((k) => TUNING_PRESETS[k] === tuning) ?? '직접 입력')

  return (
    <section className="shrink-0 box-border p-[22px_20px_20px] md:p-[22px_48px_20px] border-b border-line-header grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
      <UnderlineField htmlFor="title" label="TITLE *" span={4}>
        <input
          className={`${UNDERLINE} font-display text-[20px] font-semibold`}
          defaultValue={song?.title ?? ''}
          id="title"
          type="text"
        />
      </UnderlineField>

      <UnderlineField htmlFor="artist" label="ARTIST" span={2}>
        <input
          className={`${UNDERLINE} text-[16px]`}
          defaultValue={song?.artist ?? ''}
          id="artist"
          type="text"
        />
      </UnderlineField>

      <UnderlineField htmlFor="key" label="KEY" span={1}>
        <select
          className={`${UNDERLINE} font-mono text-[16px] font-medium`}
          defaultValue={song?.key ?? 'G'}
          id="key"
        >
          {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Am', 'Em', 'Dm'].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </UnderlineField>

      <UnderlineField htmlFor="tempo" label="TEMPO" span={1}>
        <input
          className={`${UNDERLINE} font-mono text-[16px]`}
          defaultValue={song?.tempo ?? 90}
          id="tempo"
          max={240}
          min={40}
          type="number"
        />
      </UnderlineField>

      <UnderlineField htmlFor="status" label="STATUS" span={2}>
        <select
          className={`${UNDERLINE} text-[15px]`}
          defaultValue={song?.status ?? 'practicing'}
          id="status"
        >
          <option value="practicing">연습중</option>
          <option value="done">완성</option>
          <option value="archived">보관</option>
        </select>
      </UnderlineField>

      <UnderlineField htmlFor="ref" label="REFERENCE" span={2}>
        <input
          className={`${UNDERLINE} text-[14px]`}
          defaultValue={song?.reference ?? ''}
          id="ref"
          placeholder="원본 영상 주소"
          type="url"
        />
      </UnderlineField>

      {/* 박스 카드 3종 */}
      <div className="md:col-span-3 flex flex-col gap-[9px]">
        <MicroLabel as="label" htmlFor="tuning">
          TUNING
        </MicroLabel>
        <div className="flex flex-wrap items-center gap-3 bg-surface-2 border border-line rounded-lg p-[11px_14px]">
          <select
            className="h-[44px] md:h-[38px] px-2 border border-line-strong rounded-lg bg-bg text-[13.5px] text-ink outline-none focus:border-accent"
            id="tuning"
            value={tuningPreset}
            onChange={(e) => {
              const preset = TUNING_PRESETS[e.target.value]
              if (preset) {
                setTuning(preset)
                setTuningCustom(false)
              } else {
                setTuningCustom(true)
              }
            }}
          >
            {[...Object.keys(TUNING_PRESETS), '직접 입력'].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          {tuningPreset === '직접 입력' ? (
            <>
              <MicroLabel as="label" className="sr-only" htmlFor="tuning-custom">
                튜닝 직접 입력
              </MicroLabel>
              <input
                className="h-[44px] md:h-[38px] px-2 border border-line-strong rounded-lg bg-bg text-[13.5px] text-ink outline-none focus:border-accent"
                id="tuning-custom"
                placeholder="E A D G B E"
                type="text"
                value={tuning}
                onChange={(e) => setTuning(e.target.value)}
              />
            </>
          ) : null}
          <TuningTokens size="editor" tuning={tuning} />
        </div>
      </div>

      <div className="md:col-span-5 flex flex-col gap-[9px]">
        <MicroLabel as="label" htmlFor="capo">
          CAPO — 끼우는 위치만 기록합니다
        </MicroLabel>
        <div className="flex flex-wrap items-center gap-4 bg-surface-2 border border-line rounded-lg p-[11px_14px]">
          <select
            className="h-[44px] md:h-[38px] px-[10px] border border-line-strong rounded-lg bg-bg font-mono text-[15px] font-bold text-ink outline-none focus:border-accent"
            id="capo"
            value={capo}
            onChange={(e) => setCapo(Number(e.target.value))}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i} value={i}>
                {i}프렛
              </option>
            ))}
          </select>
          <Fretboard fret={capo} size="editor" />
          <span className="text-[12.5px] leading-[1.6] text-ink-4">
            악보 코드는 바뀌지 않아요.
            <br />
            연주할 때 참고용으로만 보입니다.
          </span>
        </div>
      </div>

      <div className="md:col-span-4 flex flex-col gap-[9px]">
        <MicroLabel as="label" htmlFor="tags">
          TAGS
        </MicroLabel>
        <div className="flex items-center gap-2 flex-wrap min-h-[62px] box-border p-[4px_12px] border border-line rounded-lg bg-surface-2 focus-within:border-accent">
          {tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-[7px] text-[13px] text-accent border border-accent/35 bg-accent/10 px-[10px] py-1 rounded-sm"
            >
              {t}
              <button
                aria-label={`${t} 태그 제거`}
                className="border-0 bg-transparent text-accent text-[13px] leading-none cursor-pointer p-0 min-w-11 min-h-11 md:min-w-0 md:min-h-0 flex items-center justify-center"
                type="button"
                onClick={() => setTags(tags.filter((x) => x !== t))}
              >
                ×
              </button>
            </span>
          ))}
          <input
            className="grow h-[44px] md:h-[28px] border-0 bg-transparent text-[13px] text-ink outline-none"
            id="tags"
            placeholder="입력 후 Enter"
            type="text"
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              const v = e.currentTarget.value.trim()
              if (v && !tags.includes(v)) setTags([...tags, v])
              e.currentTarget.value = ''
            }}
          />
        </div>
      </div>
    </section>
  )
}
