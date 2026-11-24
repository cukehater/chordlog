'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

import { MOCK_SONGS, type SongType } from '@/entities/song'
import { Segmented } from '@/shared/ui/segmented'
import { SiteHeader } from '@/widgets/site-header'

import { SAMPLE_ERROR, SAMPLE_SOURCE } from '../config/editor-sample'
import { InsertToolbar } from './insert-toolbar'
import { MetaForm } from './meta-form'
import { PreviewPane } from './preview-pane'
import { SourcePane } from './source-pane'

export const SongEditor = ({ song }: { song?: SongType }) => {
  const [source, setSource] = useState(song ? SAMPLE_SOURCE : '')
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const preview = song ?? MOCK_SONGS[0]
  // 임시방편: 파서가 없어 "그 미종결 대괄호가 아직 있는가"만 본다. 파서가 붙으면 실제 파싱 결과로 교체.
  const error = source.includes('[Am7 ') ? SAMPLE_ERROR : undefined

  const insert = (snippet: string) => {
    const el = textareaRef.current
    if (!el) {
      setSource((s) => s + snippet)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    setSource(source.slice(0, start) + snippet + source.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + snippet.length
      el.setSelectionRange(pos, pos)
    })
  }

  const saveBar = (
    <>
      <Link
        className="h-[34px] flex items-center px-[14px] border border-line rounded-lg text-ink-4 text-[13px] no-underline"
        href={song ? `/songs/${song.slug}` : '/songs'}
      >
        취소
      </Link>
      <button
        className="h-[34px] px-5 border-0 rounded-lg bg-accent text-accent-ink text-[13.5px] font-bold cursor-pointer"
        type="button"
      >
        저장
      </button>
    </>
  )

  return (
    <div className="min-h-dvh md:h-dvh flex flex-col bg-bg">
      <SiteHeader actions={saveBar} crumb={song ? song.title : 'NEW SONG'} variant="editor" />

      {/* 모바일 상단 — 상태바 자리 52px */}
      <header className="md:hidden shrink-0 pt-[52px] px-3 pb-[10px] flex items-center gap-2">
        <Link
          className="h-11 flex items-center px-2 text-[14px] text-ink-4 no-underline"
          href={song ? `/songs/${song.slug}` : '/songs'}
        >
          취소
        </Link>
        <span className="grow text-center font-mono text-[11px] tracking-[0.14em] text-ink-4">
          {song ? 'EDIT SONG' : 'NEW SONG'}
        </span>
        <button
          className="h-11 md:h-9 px-4 border-0 rounded-md bg-accent text-accent-ink text-[13.5px] font-bold cursor-pointer"
          type="button"
        >
          저장
        </button>
      </header>

      <div className="md:hidden px-5 pb-[14px]">
        <Segmented
          grow
          options={[
            { value: 'write', label: '작성' },
            { value: 'preview', label: '미리보기' },
          ]}
          value={tab}
          onChange={(v) => setTab(v as 'write' | 'preview')}
        />
      </div>

      <MetaForm song={song} />

      <main className="grow grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className={`${tab === 'write' ? 'flex' : 'hidden'} md:flex flex-col overflow-hidden`}>
          <SourcePane
            errorLine={error?.line}
            errorMessage={error?.message}
            textareaRef={textareaRef}
            toolbar={<InsertToolbar onInsert={insert} />}
            value={source}
            onChange={setSource}
          />
        </div>
        <div
          className={`${tab === 'preview' ? 'flex' : 'hidden'} md:flex flex-col overflow-hidden`}
        >
          <PreviewPane errorLines={error?.previewLineIndexes ?? []} song={preview} />
        </div>
      </main>
    </div>
  )
}
