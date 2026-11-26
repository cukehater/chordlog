import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three'

/*
 * 지판 치수와 표면 텍스처.
 * 좌표는 디자인 시안과 같은 px 단위이고, 원점은 너트 쪽 위 모서리(1번 줄 쪽), y는 아래로 증가한다.
 * 텍스처는 모두 캔버스에 코드로 그린다. 외부 이미지·텍스처 파일은 쓰지 않는다.
 */

export const BOARD_LENGTH = 1300
export const BOARD_WIDTH = 210
export const BOARD_THICKNESS = 26
export const NUT_WIDTH = 16
const SCALE_LENGTH = 2400
/** 줄은 너트 위(x=6)에서 시작해 지판 끝까지 간다. */
export const STRING_START = 6
export const STRING_LENGTH = BOARD_LENGTH - STRING_START

/** 12평균율 프렛 와이어 중심 x. FRET_X[0]이 1프렛이다. */
export const FRET_X = Array.from(
  { length: 12 },
  (_, i) => NUT_WIDTH + SCALE_LENGTH * (1 - 2 ** (-(i + 1) / 12)),
)

export type GuitarStringType = { y: number; gauge: number; wound: boolean }

/** 위에서부터 1번 줄(e)부터 6번 줄(E). */
export const STRINGS: readonly GuitarStringType[] = [
  { y: 20, gauge: 1.4, wound: false },
  { y: 54, gauge: 1.8, wound: false },
  { y: 88, gauge: 2.4, wound: true },
  { y: 122, gauge: 3, wound: true },
  { y: 156, gauge: 3.6, wound: true },
  { y: 190, gauge: 4.2, wound: true },
]

/** 지판에 표시하는 코드. string은 STRINGS 인덱스. */
export const CHORD = {
  name: 'C',
  shape: 'x32010',
  fretted: [
    { string: 1, fret: 1, finger: 1 },
    { string: 3, fret: 2, finger: 2 },
    { string: 4, fret: 3, finger: 3 },
  ],
  open: [0, 2],
  muted: [5],
} as const

const fretStart = (fret: number) => (fret <= 1 ? NUT_WIDTH : FRET_X[fret - 2]!)

/** 운지 점 x. 앞 프렛에서 해당 프렛 쪽으로 60% 지점이다. */
export const noteX = (fret: number) => fretStart(fret) + 0.6 * (FRET_X[fret - 1]! - fretStart(fret))

const betweenFrets = (fret: number) => (FRET_X[fret - 2]! + FRET_X[fret - 1]!) / 2
const SINGLE_DOT_FRETS = [3, 5, 7, 9]

const INLAYS = [
  ...SINGLE_DOT_FRETS.map((fret) => ({ x: betweenFrets(fret), y: BOARD_WIDTH / 2 })),
  { x: betweenFrets(12), y: 71 },
  { x: betweenFrets(12), y: 139 },
]

const SIDE_DOTS = [
  ...SINGLE_DOT_FRETS.map(betweenFrets),
  betweenFrets(12) - 4,
  betweenFrets(12) + 4,
]

export type PaletteType = { accent: string; accentDeep: string }
export type FontsType = { display: string; mono: string }

type StopType = readonly [offset: number, color: string]

/** 테마별 지판 색. rgb는 'r, g, b' 문자열이고 쓰는 곳에서 알파를 붙인다. */
export type SurfacePaletteType = {
  wood: string
  grain: string
  grainFine: readonly [dark: string, light: string]
  across: readonly StopType[]
  along: readonly StopType[]
  binding: { size: number; top: string; bottom: string }
  inlay: readonly StopType[]
  inlayBorder: string
  fretShadow: string
  nutShadow: string
  stringShadow: readonly [rgb: string, alpha: number]
  dotShadow: readonly [hex: string, alpha: number]
  side: readonly StopType[]
  sideDot: string
  end: readonly StopType[]
  floatShadow: readonly [rgb: string, center: number, middle: number]
  sheen: readonly [rgb: string, alpha: number]
  dotRing: string
  dotNumber: string
  openMark: string
  mutedMark: string
  chordName: string
}

/** 로즈우드 지판, 자개 마커. */
export const DARK_SURFACE: SurfacePaletteType = {
  wood: '#4a2b1e',
  grain: 'rgba(20, 8, 2, 0.22)',
  grainFine: ['rgba(20, 8, 2, 0.3)', 'rgba(255, 200, 150, 0.06)'],
  across: [
    [0, 'rgba(0, 0, 0, 0.34)'],
    [0.46, 'rgba(255, 214, 170, 0.06)'],
    [0.54, 'rgba(255, 214, 170, 0.06)'],
    [1, 'rgba(0, 0, 0, 0.38)'],
  ],
  along: [
    [0, 'rgba(255, 196, 140, 0.14)'],
    [0.38, 'rgba(255, 196, 140, 0)'],
    [1, 'rgba(0, 0, 0, 0.3)'],
  ],
  binding: { size: 3, top: '#e3d5ba', bottom: '#cdbe9f' },
  inlay: [
    [0, '#fffaf0'],
    [0.4, '#efe6d6'],
    [0.75, '#c9bda9'],
    [1, '#a39784'],
  ],
  inlayBorder: 'rgba(0, 0, 0, 0.25)',
  fretShadow: 'rgba(0, 0, 0, 0.45)',
  nutShadow: 'rgba(0, 0, 0, 0.45)',
  stringShadow: ['0, 0, 0', 0.45],
  dotShadow: ['#000000', 0.55],
  side: [
    [0, '#e8dcc2'],
    [3 / BOARD_THICKNESS, '#cbbb9b'],
    [3 / BOARD_THICKNESS, '#3a2116'],
    [12 / BOARD_THICKNESS, '#2c190f'],
    [12 / BOARD_THICKNESS, '#74462b'],
    [0.55, '#5b3521'],
    [1, '#2a170e'],
  ],
  sideDot: '#efe6d3',
  end: [
    [0, '#24130b'],
    [0.45, '#5b3521'],
    [0.54, '#74462b'],
    [0.54, '#2c190f'],
    [1, '#3a2116'],
  ],
  floatShadow: ['0, 0, 0', 0.62, 0.3],
  sheen: ['255, 224, 186', 0.1],
  dotRing: 'rgba(18, 13, 10, 0.6)',
  dotNumber: '#1b120b',
  openMark: 'rgba(244, 236, 221, 0.8)',
  mutedMark: 'rgba(244, 236, 221, 0.8)',
  chordName: '#f4ecdd',
}

/** 메이플 지판, 검은 점 마커. */
export const LIGHT_SURFACE: SurfacePaletteType = {
  wood: '#E4C48E',
  grain: 'rgba(150, 96, 36, 0.14)',
  grainFine: ['rgba(150, 96, 36, 0.18)', 'rgba(255, 240, 210, 0.2)'],
  across: [
    [0, 'rgba(120, 78, 30, 0.2)'],
    [0.46, 'rgba(255, 246, 228, 0.12)'],
    [0.54, 'rgba(255, 246, 228, 0.12)'],
    [1, 'rgba(120, 78, 30, 0.24)'],
  ],
  along: [
    [0, 'rgba(255, 248, 232, 0.28)'],
    [0.4, 'rgba(255, 248, 232, 0)'],
    [1, 'rgba(110, 70, 25, 0.18)'],
  ],
  binding: { size: 2, top: 'rgba(90, 58, 24, 0.55)', bottom: 'rgba(90, 58, 24, 0.65)' },
  inlay: [
    [0, '#4A3A2E'],
    [0.45, '#241A13'],
    [1, '#120C08'],
  ],
  inlayBorder: 'rgba(255, 240, 215, 0.25)',
  fretShadow: 'rgba(90, 58, 24, 0.35)',
  nutShadow: 'rgba(0, 0, 0, 0.45)',
  stringShadow: ['80, 50, 20', 0.32],
  dotShadow: ['#502D0F', 0.38],
  side: [
    [0, '#8A6436'],
    [2 / BOARD_THICKNESS, '#8A6436'],
    [2 / BOARD_THICKNESS, '#D9B57A'],
    [12 / BOARD_THICKNESS, '#CFA86C'],
    [12 / BOARD_THICKNESS, '#C99D5E'],
    [0.55, '#B58A4E'],
    [1, '#8E6A3C'],
  ],
  sideDot: '#1F1712',
  end: [
    [0, '#8E6A3C'],
    [0.45, '#BE945A'],
    [0.54, '#D4AF74'],
    [0.54, '#CBA368'],
    [1, '#DDBB82'],
  ],
  floatShadow: ['92, 60, 28', 0.34, 0.14],
  sheen: ['255, 255, 255', 0.28],
  dotRing: 'rgba(255, 248, 236, 0.85)',
  dotNumber: '#FFF6E8',
  openMark: 'rgba(31, 23, 18, 0.7)',
  mutedMark: 'rgba(31, 23, 18, 0.8)',
  chordName: '#1F1712',
}

type DrawType = (ctx: CanvasRenderingContext2D, scale: number) => void

const paint = (width: number, height: number, scale: number, draw: DrawType) => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas is not available')
  ctx.scale(scale, scale)
  draw(ctx, scale)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

const gradient = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: readonly StopType[],
) => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  for (const [offset, color] of stops) g.addColorStop(offset, color)
  return g
}

/** 살짝 기운 반복 줄무늬. 나뭇결을 만든다. */
const grain = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  angleDeg: number,
  period: number,
  bands: readonly (readonly [from: number, to: number, color: string])[],
) => {
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate((angleDeg * Math.PI) / 180)
  const span = width * 1.2
  for (let y = -height / 2 - 24; y < height / 2 + 24; y += period) {
    for (const [from, to, color] of bands) {
      ctx.fillStyle = color
      ctx.fillRect(-span / 2, y + from, span, to - from)
    }
  }
  ctx.restore()
}

/** CSS box-shadow처럼 흐린 사각형. 도형은 캔버스 밖에 그리고 그림자만 안으로 들인다. */
const softRect = (
  ctx: CanvasRenderingContext2D,
  scale: number,
  rect: readonly [x: number, y: number, w: number, h: number],
  blur: number,
  color: string,
) => {
  const [x, y, w, h] = rect
  const offset = ctx.canvas.width + 1000
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.shadowColor = color
  ctx.shadowBlur = blur * scale
  ctx.shadowOffsetX = offset
  ctx.fillStyle = '#000'
  ctx.fillRect(x * scale - offset, y * scale, w * scale, h * scale)
  ctx.restore()
}

const softDisc = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  alpha: number,
) => {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  g.addColorStop(0, withAlpha(color, alpha))
  g.addColorStop(1, withAlpha(color, 0))
  ctx.fillStyle = g
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
}

const withAlpha = (hex: string, alpha: number) => {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value
  const n = Number.parseInt(full, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

const inlay = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  surface: SurfacePaletteType,
) => {
  const g = ctx.createRadialGradient(cx - 2.4, cy - 3.2, 0, cx - 2.4, cy - 3.2, 15.3)
  for (const [offset, color] of surface.inlay) g.addColorStop(offset, color)
  ctx.beginPath()
  ctx.arc(cx, cy, 8, 0, Math.PI * 2)
  ctx.fillStyle = g
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, 7.5, 0, Math.PI * 2)
  ctx.strokeStyle = surface.inlayBorder
  ctx.lineWidth = 1
  ctx.stroke()
}

/** 지판 윗면: 나뭇결, 바인딩, 포지션 마커, 프렛·줄·운지 점의 그림자까지 한 장에 굽는다. */
const woodTexture = (surface: SurfacePaletteType) => {
  const W = BOARD_LENGTH
  const H = BOARD_WIDTH
  return paint(W, H, 2, (ctx, scale) => {
    ctx.fillStyle = surface.wood
    ctx.fillRect(0, 0, W, H)
    grain(ctx, W, H, 0.6, 23, [[9, 10.5, surface.grain]])
    grain(ctx, W, H, -0.7, 15, [
      [5, 6, surface.grainFine[0]],
      [13, 15, surface.grainFine[1]],
    ])
    ctx.fillStyle = gradient(ctx, 0, 0, 0, H, surface.across)
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = gradient(ctx, 0, 0, W, 0, surface.along)
    ctx.fillRect(0, 0, W, H)

    const { size, top, bottom } = surface.binding
    ctx.fillStyle = top
    ctx.fillRect(0, 0, W, size)
    ctx.fillStyle = bottom
    ctx.fillRect(0, H - size, W, size)

    for (const mark of INLAYS) inlay(ctx, mark.x, mark.y, surface)

    softRect(ctx, scale, [5, 0, NUT_WIDTH, H], 8, surface.nutShadow)
    for (const x of FRET_X) softRect(ctx, scale, [x + 1, 2, 4, H], 4, surface.fretShadow)

    const [shadowRgb, shadowAlpha] = surface.stringShadow
    for (const s of STRINGS) {
      const h = s.gauge + 3
      const top = s.y + 4 - h / 2
      ctx.fillStyle = gradient(ctx, 0, top, 0, top + h, [
        [0, `rgba(${shadowRgb}, 0)`],
        [0.5, `rgba(${shadowRgb}, ${shadowAlpha})`],
        [1, `rgba(${shadowRgb}, 0)`],
      ])
      ctx.fillRect(NUT_WIDTH, top, W - NUT_WIDTH, h)
    }

    for (const note of CHORD.fretted) {
      softDisc(ctx, noteX(note.fret) + 4, STRINGS[note.string]!.y + 8, 19, ...surface.dotShadow)
    }
  })
}

/** 관객 쪽 옆면: 바인딩, 지판, 넥, 사이드 도트. */
const sideTexture = (surface: SurfacePaletteType) => {
  const H = BOARD_THICKNESS
  return paint(BOARD_LENGTH, H, 2, (ctx) => {
    ctx.fillStyle = gradient(ctx, 0, 0, 0, H, surface.side)
    ctx.fillRect(0, 0, BOARD_LENGTH, H)
    ctx.fillStyle = surface.sideDot
    for (const x of SIDE_DOTS) {
      ctx.beginPath()
      ctx.arc(x, 7.5, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

/** 너트 쪽 끝면. 오른쪽 끝이 지판 윗면과 닿는다. */
const endTexture = (surface: SurfacePaletteType) => {
  const W = BOARD_THICKNESS
  return paint(W, BOARD_WIDTH, 2, (ctx) => {
    ctx.fillStyle = gradient(ctx, 0, 0, W, 0, surface.end)
    ctx.fillRect(0, 0, W, BOARD_WIDTH)
  })
}

export const SHADOW_SIZE = [1460, 350] as const

/** 지판 아래 떠 있는 그림자. */
const shadowTexture = (surface: SurfacePaletteType) => {
  const [rgb, center, middle] = surface.floatShadow
  const [W, H] = SHADOW_SIZE
  return paint(W, H, 0.25, (ctx) => {
    ctx.translate(W / 2, H / 2)
    ctx.scale(1, H / W)
    const r = W / 2
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    g.addColorStop(0, `rgba(${rgb}, ${center})`)
    g.addColorStop(0.55, `rgba(${rgb}, ${middle})`)
    g.addColorStop(1, `rgba(${rgb}, 0)`)
    ctx.fillStyle = g
    ctx.fillRect(-r, -r, W, W)
  })
}

/** 기울일 때 지판 위를 지나가는 은은한 광택. offset.x를 움직여 쓴다. */
export const SHEEN_SPAN = 2.2

const sheenTexture = (surface: SurfacePaletteType) => {
  const [rgb, alpha] = surface.sheen
  const W = BOARD_LENGTH * SHEEN_SPAN
  const H = BOARD_WIDTH
  const texture = paint(W, H, 0.25, (ctx) => {
    const angle = (108 * Math.PI) / 180
    const dx = Math.sin(angle)
    const dy = -Math.cos(angle)
    const half = (Math.abs(W * dx) + Math.abs(H * dy)) / 2
    ctx.fillStyle = gradient(
      ctx,
      W / 2 - dx * half,
      H / 2 - dy * half,
      W / 2 + dx * half,
      H / 2 + dy * half,
      [
        [0.34, `rgba(${rgb}, 0)`],
        [0.47, `rgba(${rgb}, ${alpha})`],
        [0.6, `rgba(${rgb}, 0)`],
      ],
    )
    ctx.fillRect(0, 0, W, H)
  })
  texture.repeat.x = 1 / SHEEN_SPAN
  return texture
}

/** 감은 줄(와운드)의 나선 무늬. 원기둥 둘레 한 바퀴에 한 칸씩 내려가게 그린다. */
const windingTexture = () => {
  const W = 32
  const H = 16
  const texture = paint(W, H, 1, (ctx) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#8f7a66'
    const band = H * 0.36
    for (let x = 0; x < W; x++) {
      const y = (x / W) * H
      ctx.fillRect(x, y, 1, band)
      ctx.fillRect(x, y - H, 1, band)
    }
  })
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(1, STRING_LENGTH / 2.4)
  return texture
}

/** 운지 점: 바깥 빛 번짐, 어두운 테두리, 앰버 원판, 손가락 번호. 80×80 평면에 그린다. */
export const DOT_PLANE = 80

const dotTexture = (
  finger: number,
  palette: PaletteType,
  fonts: FontsType,
  surface: SurfacePaletteType,
) => {
  const S = DOT_PLANE
  const c = S / 2
  return paint(S, S, 3, (ctx) => {
    const glow = ctx.createRadialGradient(c, c, 15, c, c, 39)
    glow.addColorStop(0, withAlpha(palette.accent, 0.55))
    glow.addColorStop(1, withAlpha(palette.accent, 0))
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, S, S)

    ctx.beginPath()
    ctx.arc(c, c, 17, 0, Math.PI * 2)
    ctx.fillStyle = surface.dotRing
    ctx.fill()

    const fx = c - 15 + 0.34 * 30
    const fy = c - 15 + 0.3 * 30
    const body = ctx.createRadialGradient(fx, fy, 0, fx, fy, 28.9)
    body.addColorStop(0, '#fff1d8')
    body.addColorStop(0.46, palette.accent)
    body.addColorStop(1, palette.accentDeep)
    ctx.beginPath()
    ctx.arc(c, c, 15, 0, Math.PI * 2)
    ctx.fillStyle = body
    ctx.fill()

    ctx.fillStyle = surface.dotNumber
    ctx.font = `600 14px ${fonts.mono}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(finger), c, c + 0.5)
  })
}

export const MARKER_PLANE = 12

/** 개방현 표시(o). */
const openTexture = (surface: SurfacePaletteType) => {
  return paint(MARKER_PLANE, MARKER_PLANE, 4, (ctx) => {
    ctx.beginPath()
    ctx.arc(6, 6, 5, 0, Math.PI * 2)
    ctx.strokeStyle = surface.openMark
    ctx.lineWidth = 2
    ctx.stroke()
  })
}

/** 소리 내지 않는 줄 표시(x). */
const mutedTexture = (surface: SurfacePaletteType) => {
  return paint(MARKER_PLANE, MARKER_PLANE, 4, (ctx) => {
    ctx.beginPath()
    ctx.moveTo(2, 2)
    ctx.lineTo(10, 10)
    ctx.moveTo(10, 2)
    ctx.lineTo(2, 10)
    ctx.strokeStyle = surface.mutedMark
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  })
}

/** 지판 위에 떠 있는 코드 이름 "C x32010". */
export const LABEL_SIZE = [240, 90] as const
/** 라벨 글자 상자의 왼쪽 위 모서리(지판 좌표). */
export const LABEL_ORIGIN = [140, -96] as const
const LABEL_PAD = 10

const labelTexture = (palette: PaletteType, fonts: FontsType, surface: SurfacePaletteType) => {
  const [W, H] = LABEL_SIZE
  return paint(W, H, 3, (ctx) => {
    const baseline = LABEL_PAD + 55
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = surface.chordName
    ctx.font = `italic 600 64px ${fonts.display}`
    ctx.fillText(CHORD.name, LABEL_PAD, baseline)

    let x = LABEL_PAD + ctx.measureText(CHORD.name).width + 14
    ctx.fillStyle = palette.accent
    ctx.font = `500 16px ${fonts.mono}`
    for (const ch of CHORD.shape) {
      ctx.fillText(ch, x, baseline)
      x += ctx.measureText(ch).width + 16 * 0.18
    }
  })
}

/** 글꼴과 무관한 텍스처. 테마가 바뀔 때만 다시 만든다. */
export const createSurfaceTextures = (surface: SurfacePaletteType) => {
  return {
    wood: woodTexture(surface),
    side: sideTexture(surface),
    end: endTexture(surface),
    shadow: shadowTexture(surface),
    sheen: sheenTexture(surface),
    winding: windingTexture(),
    open: openTexture(surface),
    muted: mutedTexture(surface),
  }
}

/** 글꼴이 들어가는 텍스처. 웹폰트가 로드되거나 테마가 바뀌면 다시 만든다. */
export const createLabelTextures = (
  palette: PaletteType,
  fonts: FontsType,
  surface: SurfacePaletteType,
) => {
  return {
    dots: CHORD.fretted.map((note) => dotTexture(note.finger, palette, fonts, surface)),
    label: labelTexture(palette, fonts, surface),
  }
}

export const disposeTextures = (textures: Record<string, Texture | Texture[]>) => {
  for (const value of Object.values(textures)) {
    for (const texture of Array.isArray(value) ? value : [value]) texture.dispose()
  }
}

export const LABEL_PADDING = LABEL_PAD
