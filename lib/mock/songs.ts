// ⚠ 이 파일의 곡·아티스트·가사·TAB·연주 메모는 전부 지어낸 가상 데이터다.
// 저작권 문제를 피하려고 만든 시안 데이터이므로 실제 시드로 승격하지 말 것.
// (docs/design/README.md §7)

import type { Block, Slot, Song } from '@/lib/types';

function slots(spec: string, accents: number[]): Slot[] {
  return Array.from({ length: 16 }, (_, i) => {
    const c = spec.charAt(i);
    return {
      stroke: c === 'D' ? 'D' : c === 'U' ? 'U' : null,
      accent: accents.includes(i),
    };
  });
}

function line(...pairs: [string | null, string][]): Block {
  return { k: 'line', pairs: pairs.map(([chord, text]) => ({ chord, text })) };
}

const ALLEY_BLOCKS: Block[] = [
  { k: 'strum', use: 'Intro (첫 G 두 번) · Verse 1 · Pre-Chorus', slots: slots('D-D-DUD-D-D-DU--', [4, 12]) },
  { k: 'strum', use: 'Intro · Chorus · Verse 2 · Interlude · Bridge · Outro', slots: slots('D-D-D-DUDUD-D-DU', [4, 8, 12]) },
  { k: 'label', label: 'Intro' },
  {
    k: 'tab',
    title: '메인 리프',
    repeat: '×3',
    lines: [
      '-------------10------------',
      '--13-11----11----11----11--',
      '-------10----------10------',
      '---------------------------',
      '---------------------------',
      '---------------------------',
    ],
  },
  { k: 'label', label: 'Verse 1' },
  line(['G', '가로등 하나 '], ['Em', '꺼지고 남은 자리']),
  line(['Am', '우린 아직 '], ['D7', '여기 앉아 있어']),
  line(['G', '식은 커피를 '], ['Em', '사이에 두고']),
  line(['Am', '밤이 다 가도 '], ['D7', '모르는 채로']),
  { k: 'label', label: 'Chorus' },
  line(['C', '나는 그 밤을 '], ['G/B', '오래 접어두고']),
  line(['Am7', '가끔 꺼내 '], ['D', '읽어요']),
  line(['C', '아무 말 없이 '], ['G/B', '웃던 얼굴이']),
  line(['Am7', '아직 여기 '], ['D', '남아서']),
  { k: 'label', label: 'Interlude' },
  { k: 'comment', text: '패턴 B로 바뀝니다 — 손목 힘 빼고' },
  {
    k: 'tab',
    title: '간주 변형',
    repeat: '×3',
    lines: [
      '-------------10------------',
      '--13-11----11----11--------',
      '-------10----------10------',
      '---------------------------',
      '---------------------------',
      '---------------------------',
    ],
  },
  { k: 'label', label: 'Verse 2' },
  line(['G', '첫차가 오면 '], ['Em', '일어날 거야']),
  line(['Am', '그때까진 '], ['D7', '조금만 더 앉아']),
  line(['G', '골목 끝까지 '], ['Em', '같이 걸어요']),
  line(['Am', '새벽 두 시의 '], ['D7', '골목']),
  { k: 'label', label: 'Bridge' },
  line(['Em', '말하지 않아도 '], ['Bm7', '알겠다는 듯이']),
  line(['C', '고개를 끄덕이던 '], ['D', '너의 옆얼굴']),
  { k: 'label', label: 'Outro' },
  line(['C', '두 시의 골목 '], ['G', '그대로']),
  { k: 'comment', text: '마지막은 스트로크 없이 아르페지오로' },
];

const SIMPLE_BLOCKS: Block[] = [
  { k: 'strum', use: 'Verse · Chorus', slots: slots('D-DUD-DUD-DUD-DU', [0, 8]) },
  { k: 'label', label: 'Verse 1' },
  line(['C', '창문을 열면 '], ['Am', '겨울이 들어와']),
  line(['F', '정류장 불빛이 '], ['G', '흔들려']),
  { k: 'label', label: 'Chorus' },
  line(['F', '조금만 더 '], ['C', '기다릴게']),
  line(['Dm7', '다음 차가 '], ['G', '올 때까지']),
];

export const MOCK_SONGS: Song[] = [
  {
    slug: 'saebyeok-du-siui-golmok',
    title: '새벽 두 시의 골목',
    artist: '무렵',
    key: 'G',
    capo: 2,
    tuning: 'E A D G B E',
    tempo: 72,
    status: 'practicing',
    tags: ['포크', '핑거스타일'],
    updatedLabel: '3일 전',
    hasTab: true,
    note: 'Chorus 들어가기 전 한 박 쉬고 시작. Intro 리프는 13 → 11 슬라이드로 붙이면 편하다. 오토스크롤은 1.25×가 딱 맞음.',
    reference: 'https://www.youtube.com',
    blocks: ALLEY_BLOCKS,
  },
  {
    slug: 'gyeoul-jeongnyujang',
    title: '겨울 정류장',
    artist: '이하루',
    key: 'F',
    capo: 1,
    tuning: 'D A D G B E',
    tempo: 84,
    status: 'practicing',
    tags: ['발라드'],
    updatedLabel: '오늘',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
  {
    slug: 'neujeun-pyeonji',
    title: '늦은 편지',
    artist: '무렵',
    key: 'C',
    capo: 0,
    tuning: 'E A D G B E',
    tempo: 68,
    status: 'practicing',
    tags: ['포크'],
    updatedLabel: '오늘',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
  {
    slug: 'mogyoire-chang',
    title: '목요일의 창',
    artist: '밤섬편지',
    key: 'Am',
    capo: 1,
    tuning: 'E A D G B E',
    tempo: 76,
    status: 'practicing',
    tags: ['시티팝'],
    updatedLabel: '어제',
    hasTab: true,
    blocks: ALLEY_BLOCKS,
  },
  {
    slug: 'oraedoen-radio',
    title: '오래된 라디오',
    artist: '청계삼가',
    key: 'A',
    capo: 0,
    tuning: 'E A D G B E',
    tempo: 92,
    status: 'practicing',
    tags: ['시티팝'],
    updatedLabel: '5일 전',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
  {
    slug: 'usan-eopsi',
    title: '우산 없이',
    artist: '이하루',
    key: 'C',
    capo: 0,
    tuning: 'E A D G B E',
    tempo: 100,
    status: 'done',
    tags: ['발라드'],
    updatedLabel: '1주 전',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
  {
    slug: 'yeoreumi-gireotda',
    title: '여름이 길었다',
    artist: '소금북',
    key: 'D',
    capo: 0,
    tuning: 'E A D G B E',
    tempo: 88,
    status: 'done',
    tags: ['포크'],
    updatedLabel: '2주 전',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
  {
    slug: 'cheot-chareul-nochigo',
    title: '첫 차를 놓치고',
    artist: '무렵',
    key: 'Em',
    capo: 3,
    tuning: 'E A D G B E',
    tempo: 70,
    status: 'archived',
    tags: ['포크'],
    updatedLabel: '3주 전',
    hasTab: false,
    blocks: SIMPLE_BLOCKS,
  },
];

export const MOCK_STATS = {
  total: MOCK_SONGS.length,
  practicing: MOCK_SONGS.filter((s) => s.status === 'practicing').length,
};

export function getSong(slug: string) {
  return MOCK_SONGS.find((s) => s.slug === slug);
}

/** 히어로 `이어서 연습` 카드에 쓰는 가장 최근 수정 곡 */
export const CONTINUE_SONG = MOCK_SONGS[0];
