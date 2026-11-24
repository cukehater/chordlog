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

const fretStart = (fret: number) => (fret <= 1 ? NUT_WIDTH : FRET_X[fret - 2])

/** 운지 점 x. 앞 프렛에서 해당 프렛 쪽으로 60% 지점이다. */
export const noteX = (fret: number) => fretStart(fret) + 0.6 * (FRET_X[fret - 1] - fretStart(fret))

const betweenFrets = (fret: number) => (FRET_X[fret - 2] + FRET_X[fret - 1]) / 2
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

type StopType = readonly [offset: number, color: string]

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

const pearl = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
  const g = ctx.createRadialGradient(cx - 2.4, cy - 3.2, 0, cx - 2.4, cy - 3.2, 15.3)
  g.addColorStop(0, '#fffaf0')
  g.addColorStop(0.4, '#efe6d6')
  g.addColorStop(0.75, '#c9bda9')
  g.addColorStop(1, '#a39784')
  ctx.beginPath()
  ctx.arc(cx, cy, 8, 0, Math.PI * 2)
  ctx.fillStyle = g
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, 7.5, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.lineWidth = 1
  ctx.stroke()
}

/** 지판 윗면: 로즈우드 결, 바인딩, 자개 마커, 프렛·줄·운지 점의 그림자까지 한 장에 굽는다. */
const woodTexture = () => {
  const W = BOARD_LENGTH
  const H = BOARD_WIDTH
  return paint(W, H, 2, (ctx, scale) => {
    ctx.fillStyle = '#4a2b1e'
    ctx.fillRect(0, 0, W, H)
    grain(ctx, W, H, 0.6, 23, [[9, 10.5, 'rgba(20, 8, 2, 0.22)']])
    grain(ctx, W, H, -0.7, 15, [
      [5, 6, 'rgba(20, 8, 2, 0.3)'],
      [13, 15, 'rgba(255, 200, 150, 0.06)'],
    ])
    ctx.fillStyle = gradient(ctx, 0, 0, 0, H, [
      [0, 'rgba(0, 0, 0, 0.34)'],
      [0.46, 'rgba(255, 214, 170, 0.06)'],
      [0.54, 'rgba(255, 214, 170, 0.06)'],
      [1, 'rgba(0, 0, 0, 0.38)'],
    ])
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = gradient(ctx, 0, 0, W, 0, [
      [0, 'rgba(255, 196, 140, 0.14)'],
      [0.38, 'rgba(255, 196, 140, 0)'],
      [1, 'rgba(0, 0, 0, 0.3)'],
    ])
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = '#e3d5ba'
    ctx.fillRect(0, 0, W, 3)
    ctx.fillStyle = '#cdbe9f'
    ctx.fillRect(0, H - 3, W, 3)

    for (const inlay of INLAYS) pearl(ctx, inlay.x, inlay.y)

    softRect(ctx, scale, [5, 0, NUT_WIDTH, H], 8, 'rgba(0, 0, 0, 0.45)')
    for (const x of FRET_X) softRect(ctx, scale, [x + 1, 2, 4, H], 4, 'rgba(0, 0, 0, 0.45)')

    for (const s of STRINGS) {
      const h = s.gauge + 3
      const top = s.y + 4 - h / 2
      ctx.fillStyle = gradient(ctx, 0, top, 0, top + h, [
        [0, 'rgba(0, 0, 0, 0)'],
        [0.5, 'rgba(0, 0, 0, 0.45)'],
        [1, 'rgba(0, 0, 0, 0)'],
      ])
      ctx.fillRect(NUT_WIDTH, top, W - NUT_WIDTH, h)
    }

    for (const note of CHORD.fretted) {
      softDisc(ctx, noteX(note.fret) + 4, STRINGS[note.string].y + 8, 19, '#000000', 0.55)
    }
  })
}

/** 관객 쪽 옆면: 바인딩, 로즈우드, 마호가니 넥, 사이드 도트. */
const sideTexture = () => {
  const H = BOARD_THICKNESS
  return paint(BOARD_LENGTH, H, 2, (ctx) => {
    ctx.fillStyle = gradient(ctx, 0, 0, 0, H, [
      [0, '#e8dcc2'],
      [3 / H, '#cbbb9b'],
      [3 / H, '#3a2116'],
      [12 / H, '#2c190f'],
      [12 / H, '#74462b'],
      [0.55, '#5b3521'],
      [1, '#2a170e'],
    ])
    ctx.fillRect(0, 0, BOARD_LENGTH, H)
    ctx.fillStyle = '#efe6d3'
    for (const x of SIDE_DOTS) {
      ctx.beginPath()
      ctx.arc(x, 7.5, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

/** 너트 쪽 끝면. 오른쪽 끝이 지판 윗면과 닿는다. */
const endTexture = () => {
  const W = BOARD_THICKNESS
  return paint(W, BOARD_WIDTH, 2, (ctx) => {
    ctx.fillStyle = gradient(ctx, 0, 0, W, 0, [
      [0, '#24130b'],
      [0.45, '#5b3521'],
      [0.54, '#74462b'],
      [0.54, '#2c190f'],
      [1, '#3a2116'],
    ])
    ctx.fillRect(0, 0, W, BOARD_WIDTH)
  })
}

export const SHADOW_SIZE = [1460, 350] as const

/** 지판 아래 떠 있는 그림자. */
const shadowTexture = () => {
  const [W, H] = SHADOW_SIZE
  return paint(W, H, 0.25, (ctx) => {
    ctx.translate(W / 2, H / 2)
    ctx.scale(1, H / W)
    const r = W / 2
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    g.addColorStop(0, 'rgba(0, 0, 0, 0.62)')
    g.addColorStop(0.55, 'rgba(0, 0, 0, 0.3)')
    g.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = g
    ctx.fillRect(-r, -r, W, W)
  })
}

/** 기울일 때 지판 위를 지나가는 은은한 광택. offset.x를 움직여 쓴다. */
export const SHEEN_SPAN = 2.2

const sheenTexture = () => {
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
        [0.34, 'rgba(255, 224, 186, 0)'],
        [0.47, 'rgba(255, 224, 186, 0.1)'],
        [0.6, 'rgba(255, 224, 186, 0)'],
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

const dotTexture = (finger: number, palette: PaletteType, fonts: FontsType) => {
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
    ctx.fillStyle = 'rgba(18, 13, 10, 0.6)'
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

    ctx.fillStyle = '#1b120b'
    ctx.font = `600 14px ${fonts.mono}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(finger), c, c + 0.5)
  })
}

export const MARKER_PLANE = 12

/** 개방현 표시(o). */
const openTexture = () => {
  return paint(MARKER_PLANE, MARKER_PLANE, 4, (ctx) => {
    ctx.beginPath()
    ctx.arc(6, 6, 5, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(244, 236, 221, 0.8)'
    ctx.lineWidth = 2
    ctx.stroke()
  })
}

/** 소리 내지 않는 줄 표시(x). */
const mutedTexture = () => {
  return paint(MARKER_PLANE, MARKER_PLANE, 4, (ctx) => {
    ctx.beginPath()
    ctx.moveTo(2, 2)
    ctx.lineTo(10, 10)
    ctx.moveTo(10, 2)
    ctx.lineTo(2, 10)
    ctx.strokeStyle = 'rgba(244, 236, 221, 0.8)'
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

const labelTexture = (palette: PaletteType, fonts: FontsType) => {
  const [W, H] = LABEL_SIZE
  return paint(W, H, 3, (ctx) => {
    const baseline = LABEL_PAD + 55
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f4ecdd'
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

/** 글꼴과 무관한 텍스처. 한 번만 만든다. */
export const createSurfaceTextures = () => {
  return {
    wood: woodTexture(),
    side: sideTexture(),
    end: endTexture(),
    shadow: shadowTexture(),
    sheen: sheenTexture(),
    winding: windingTexture(),
    open: openTexture(),
    muted: mutedTexture(),
  }
}

/** 글꼴이 들어가는 텍스처. 웹폰트가 로드되면 다시 만든다. */
export const createLabelTextures = (palette: PaletteType, fonts: FontsType) => {
  return {
    dots: CHORD.fretted.map((note) => dotTexture(note.finger, palette, fonts)),
    label: labelTexture(palette, fonts),
  }
}

export const disposeTextures = (textures: Record<string, Texture | Texture[]>) => {
  for (const value of Object.values(textures)) {
    for (const texture of Array.isArray(value) ? value : [value]) texture.dispose()
  }
}

export const LABEL_PADDING = LABEL_PAD
