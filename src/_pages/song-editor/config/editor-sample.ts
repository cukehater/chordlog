// ⚠ 가상 데이터.
export const SAMPLE_SOURCE = `{title: 새벽 두 시의 골목}
{artist: 무렵}
{key: G}
{capo: 2}
{tuning: E A D G B E}
{tempo: 72}

{sos: Intro (첫 G 두 번), Verse 1, Pre-Chorus}
D - D - D U D - D - D - D U - -
>               >
{eos}

{sot: 메인 리프  x3}
E|-------------10------------|
B|--13-11----11----11----11--|
G|-------10----------10------|
D|---------------------------|
A|---------------------------|
E|---------------------------|
{eot}

{soc: Verse 1}
[G]가로등 하나 [Em]꺼지고 남은 자리
[Am7 우린 아직 [D7]여기 앉아 있어
{eoc}`

/** 파서가 붙기 전까지 쓰는 고정 오류 — 24행 닫히지 않은 대괄호 */
export const SAMPLE_ERROR = {
  line: 24,
  message: '닫히지 않은 대괄호 [Am7 — 이 줄은 코드 없이 가사로만 렌더링됩니다',
  /** 미리보기에서 좌측 danger 바를 그릴 line 블록 인덱스 */
  previewLineIndexes: [1],
}
