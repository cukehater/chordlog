import { notFound } from "next/navigation";
import { getSong } from "@/lib/mock/songs";
import { SongEditor } from "@/components/editor/SongEditor";

export default async function EditSongPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const song = getSong(decodeURIComponent(slug));
  if (!song) notFound();
  return <SongEditor song={song} />;
}
