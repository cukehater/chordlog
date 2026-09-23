export type Slot = { stroke: 'D' | 'U' | null; accent: boolean };

export type Pair = { chord: string | null; text: string };

export type Block =
  | { k: 'label'; label: string }
  | { k: 'line'; pairs: Pair[] }
  | { k: 'comment'; text: string }
  | { k: 'strum'; use: string; slots: Slot[] }      // slots는 정확히 16개
  | { k: 'tab'; title: string; repeat: string; lines: string[] }; // lines는 정확히 6줄

export type SongStatus = 'practicing' | 'done' | 'archived';

export const STATUS_LABEL: Record<SongStatus, string> = {
  practicing: '연습중',
  done: '완성',
  archived: '보관',
};

export type Song = {
  slug: string;
  title: string;
  artist: string;
  key: string;          // 원키. 예: 'G'
  capo: number;         // 0~7. 표시 전용 — 코드에 영향 없음
  tuning: string;       // 6번줄(low E) → 1번줄. 예: 'E A D G B E'
  tempo: number;        // BPM
  status: SongStatus;
  tags: string[];
  updatedLabel: string; // '3일 전' — 실제 날짜 포맷은 데이터 단계에서
  hasTab: boolean;
  note?: string;        // PRACTICE NOTE
  reference?: string;   // 원본 영상 URL
  blocks: Block[];
};

export type SongSummary = Omit<Song, 'blocks' | 'note' | 'reference'>;

export const STANDARD_TUNING = 'E A D G B E';
