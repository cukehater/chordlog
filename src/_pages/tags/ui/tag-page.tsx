import { MOCK_SONGS, TrackList } from '@/entities/song'
import { SiteHeader } from '@/widgets/site-header'

export const TagPage = async ({ params }: { params: Promise<{ name: string }> }) => {
  const { name } = await params
  const tag = decodeURIComponent(name)
  const songs = MOCK_SONGS.filter((s) => s.tags.includes(tag))

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <SiteHeader variant="list" />
      <main className="grow flex flex-col gap-[26px] page-grid pt-[56px] md:pt-10 pb-11">
        <div className="flex flex-col gap-[10px]">
          <span className="font-mono text-[11px] tracking-[0.16em] text-accent">
            {songs.length} SONGS
          </span>
          <h1 className="m-0 font-display text-[32px] md:text-[46px] font-bold tracking-[-0.03em] leading-none">
            #{tag}
          </h1>
        </div>
        <TrackList songs={songs} />
      </main>
    </div>
  )
}
