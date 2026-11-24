import { notFound } from 'next/navigation'

import { getSong } from '@/entities/song'

import { SongEditor } from './song-editor'

export const EditSongPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const song = getSong(decodeURIComponent(slug))
  if (!song) notFound()
  return <SongEditor song={song} />
}
