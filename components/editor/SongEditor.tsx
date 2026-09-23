'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import type { Song } from '@/lib/types';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { MetaForm } from './MetaForm';
import { InsertToolbar } from './InsertToolbar';
import { SourcePane } from './SourcePane';
import { PreviewPane } from './PreviewPane';
import { Segmented } from '@/components/ui/Segmented';
import { SAMPLE_SOURCE, SAMPLE_ERROR } from '@/lib/mock/editorSample';
import { MOCK_SONGS } from '@/lib/mock/songs';

export function SongEditor({ song }: { song?: Song }) {
  const [source, setSource] = useState(song ? SAMPLE_SOURCE : '');
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preview = song ?? MOCK_SONGS[0];
  // 임시방편: 파서가 없어 "그 미종결 대괄호가 아직 있는가"만 본다. 파서가 붙으면 실제 파싱 결과로 교체.
  const error = source.includes('[Am7 ') ? SAMPLE_ERROR : undefined;

  function insert(snippet: string) {
    const el = textareaRef.current;
    if (!el) { setSource((s) => s + snippet); return; }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    setSource(source.slice(0, start) + snippet + source.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  const saveBar = (
    <>
      <Link href={song ? `/songs/${song.slug}` : '/'}
        className="h-[34px] flex items-center px-[14px] border border-line rounded-lg text-ink-4 text-[13px] no-underline">
        취소
      </Link>
      <button type="button"
        className="h-[34px] px-5 border-0 rounded-lg bg-accent text-accent-ink text-[13.5px] font-bold cursor-pointer">
        저장
      </button>
    </>
  );

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <SiteHeader variant="editor" crumb={song ? song.title : 'NEW SONG'} actions={saveBar} />

      {/* 모바일 상단 — 상태바 자리 52px */}
      <header className="md:hidden shrink-0 pt-[52px] px-3 pb-[10px] flex items-center gap-2">
        <Link href={song ? `/songs/${song.slug}` : '/'} className="h-11 flex items-center px-2 text-[14px] text-ink-4 no-underline">취소</Link>
        <span className="grow text-center font-mono text-[11px] tracking-[0.14em] text-ink-5">
          {song ? 'EDIT SONG' : 'NEW SONG'}
        </span>
        <button type="button" className="h-11 md:h-9 px-4 border-0 rounded-md bg-accent text-accent-ink text-[13.5px] font-bold cursor-pointer">저장</button>
      </header>

      <div className="md:hidden px-5 pb-[14px]">
        <Segmented grow value={tab} onChange={(v) => setTab(v as 'write' | 'preview')}
          options={[{ value: 'write', label: '작성' }, { value: 'preview', label: '미리보기' }]} />
      </div>

      <MetaForm song={song} />

      <div className="grow grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className={`${tab === 'write' ? 'flex' : 'hidden'} md:flex flex-col overflow-hidden`}>
          <SourcePane
            value={source} onChange={setSource} textareaRef={textareaRef}
            toolbar={<InsertToolbar onInsert={insert} />}
            errorLine={error?.line} errorMessage={error?.message}
          />
        </div>
        <div className={`${tab === 'preview' ? 'flex' : 'hidden'} md:flex flex-col overflow-hidden`}>
          <PreviewPane song={preview} errorLines={error?.previewLineIndexes ?? []} />
        </div>
      </div>
    </div>
  );
}
