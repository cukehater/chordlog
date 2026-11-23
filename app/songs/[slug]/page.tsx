import { notFound } from "next/navigation";
import { getSong } from "@/lib/mock/songs";
import { SongDetailView } from "@/components/play/SongDetailView";

function parseSemi(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  if (!v || Number.isNaN(n)) return 0;
  return Math.max(-11, Math.min(11, Math.trunc(n)));
}

export default async function SongPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string | string[] }>;
}) {
  const { slug } = await params;
  const { key } = await searchParams;
  const song = getSong(decodeURIComponent(slug));
  if (!song) notFound();

  return <SongDetailView song={song} initialSemi={parseSemi(key)} />;
}
