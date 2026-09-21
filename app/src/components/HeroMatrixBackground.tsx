import { useEffect, useRef } from 'react'

import { useUIStore } from '@/stores/ui'

const ROW_HEIGHT = 18
const CELL_WIDTH = 14
const FONT_SIZE = 15
const FRAME_INTERVAL = 1000 / 40
const CENTER_FADE = 220
const EDGE_FADE = 90
const VERTICAL_FADE = 30
const DEEP_COLOR = [17, 88, 109] as const
const MID_COLOR = [58, 175, 210] as const
const LIGHT_COLOR = [141, 213, 234] as const

type Rgb = readonly [number, number, number]

const CHAR_POOL = createCharPool()

function createCharPool() {
  const ranges: Array<[number, number]> = [
    [0x0061, 0x007a],
    [0x0030, 0x0039],
    [0x05d0, 0x05ea],
    [0x0621, 0x063a],
    [0x0641, 0x064a],
  ]
  const chars: Array<string> = []
  for (const [start, end] of ranges) {
    for (let code = start; code <= end; code++) {
      chars.push(String.fromCodePoint(code))
    }
  }
  return chars
}

function randomChar() {
  return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)] ?? 'a'
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

function mixColor(from: Rgb, to: Rgb, amount: number): Rgb {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ]
}

function rampColor(shade: number): Rgb {
  return shade <= 0.5
    ? mixColor(DEEP_COLOR, MID_COLOR, shade * 2)
    : mixColor(MID_COLOR, LIGHT_COLOR, (shade - 0.5) * 2)
}

function toRgba(color: Rgb, alpha: number) {
  const red = Math.round(color[0])
  const green = Math.round(color[1])
  const blue = Math.round(color[2])
  return `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`
}

type Stream = {
  head: number
  speed: number
  length: number
  alpha: number
  tint: number
  wobble: number
  wobbleRate: number
  phase: number
  lastCell: number
}

type Lane = {
  y: number
  fade: number
  brightLimit: number
  cells: Array<string>
  streams: Array<Stream>
}

type Side = {
  direction: 1 | -1
  spawnX: number
  halfWidth: number
  columns: number
  lanes: Array<Lane>
}

function createStream(columns: number, seeded: boolean): Stream {
  const length = Math.round(randomBetween(7, 26))
  return {
    head: seeded
      ? randomBetween(-length, columns)
      : -randomBetween(length, length + columns * 0.9),
    speed: randomBetween(3.5, 13),
    length,
    alpha: randomBetween(0.45, 1),
    tint: randomBetween(0.18, 1),
    wobble: randomBetween(0, 0.35),
    wobbleRate: randomBetween(0.3, 1.6),
    phase: randomBetween(0, Math.PI * 2),
    lastCell: Number.NaN,
  }
}

function createLane(y: number, height: number, columns: number): Lane {
  const cells: Array<string> = []
  for (let index = 0; index < columns; index++) {
    cells.push(randomChar())
  }
  const streams = [createStream(columns, true)]
  if (Math.random() < 0.7) {
    streams.push(createStream(columns, true))
  }
  const edgeFade =
    clamp01(y / VERTICAL_FADE) * clamp01((height - y) / VERTICAL_FADE)
  return {
    y,
    fade: 0.35 + 0.65 * edgeFade,
    brightLimit: 0.62 - 0.12 * clamp01(y / height),
    cells,
    streams,
  }
}

function createSides(width: number, height: number): Array<Side> {
  const halfWidth = width / 2
  const columns = Math.max(1, Math.ceil(halfWidth / CELL_WIDTH) + 1)
  const laneCount = Math.max(1, Math.floor(height / ROW_HEIGHT))
  const offset = (height - laneCount * ROW_HEIGHT) / 2 + ROW_HEIGHT / 2

  const layouts: Array<{ direction: 1 | -1; spawnX: number }> = [
    { direction: 1, spawnX: 0 },
    { direction: -1, spawnX: width },
  ]

  return layouts.map(({ direction, spawnX }) => {
    const lanes: Array<Lane> = []
    for (let index = 0; index < laneCount; index++) {
      lanes.push(createLane(offset + index * ROW_HEIGHT, height, columns))
    }
    return {
      direction,
      spawnX,
      halfWidth,
      columns,
      lanes,
    }
  })
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  sides: Array<Side>,
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${FONT_SIZE}px ui-monospace, SFMono-Regular, Menlo, monospace`

  for (const side of sides) {
    for (const lane of side.lanes) {
      for (const stream of lane.streams) {
        const headCell = Math.floor(stream.head)
        for (let index = 0; index < stream.length; index++) {
          const cell = headCell - index
          if (cell < 0 || cell >= side.columns) {
            continue
          }
          const distance = (cell + 0.5) * CELL_WIDTH
          const visibility =
            clamp01((side.halfWidth - distance) / CENTER_FADE) *
            clamp01(distance / EDGE_FADE) *
            lane.fade
          if (visibility <= 0.01) {
            continue
          }
          const trail = index / stream.length
          const alpha =
            stream.alpha * Math.pow(1 - trail, 1.1) * visibility +
            (index === 0 ? 0.2 * visibility : 0)
          if (alpha <= 0.015) {
            continue
          }
          const shade =
            index === 0
              ? lane.brightLimit
              : stream.tint * lane.brightLimit * (1 - trail * 0.55)
          const color = rampColor(shade)
          const x = side.spawnX + side.direction * distance
          if (index === 0) {
            ctx.shadowColor = toRgba(MID_COLOR, Math.min(0.6, alpha))
            ctx.shadowBlur = 10
          }
          ctx.fillStyle = toRgba(color, Math.min(1, alpha))
          ctx.fillText(lane.cells[cell] ?? '', x, lane.y)
          if (index === 0) {
            ctx.shadowBlur = 0
          }
        }
      }
    }
  }
}

function advance(sides: Array<Side>, delta: number, time: number) {
  for (const side of sides) {
    for (const lane of side.lanes) {
      if (Math.random() < 0.3) {
        const index = Math.floor(Math.random() * side.columns)
        lane.cells[index] = randomChar()
      }
      for (let index = 0; index < lane.streams.length; index++) {
        const stream = lane.streams[index]
        if (!stream) {
          continue
        }
        const wobble =
          stream.wobble * Math.sin(time * stream.wobbleRate + stream.phase)
        stream.head += stream.speed * (1 + wobble) * delta
        const headCell = Math.floor(stream.head)
        if (headCell !== stream.lastCell) {
          stream.lastCell = headCell
          if (headCell >= 0 && headCell < side.columns) {
            lane.cells[headCell] = randomChar()
          }
        }
        if (stream.head - stream.length > side.columns) {
          lane.streams[index] = createStream(side.columns, false)
        }
      }
    }
  }
}

type MotionControls = {
  start: () => void
  stop: () => void
}

export function HeroMatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controlsRef = useRef<MotionControls | null>(null)
  const paused = useUIStore((state) => state.backgroundMotionPaused)
  const setPaused = useUIStore((state) => state.setBackgroundMotionPaused)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    let sides: Array<Side> = []
    let width = 0
    let height = 0
    let frame = 0
    let lastTime = 0
    let lastDraw = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        return
      }
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      sides = createSides(width, height)
      drawFrame(ctx, sides, width, height)
    }

    const loop = (timestamp: number) => {
      frame = requestAnimationFrame(loop)
      if (sides.length === 0) {
        return
      }
      if (timestamp - lastDraw < FRAME_INTERVAL) {
        return
      }
      const delta =
        lastTime === 0 ? 0 : Math.min((timestamp - lastTime) / 1000, 0.1)
      lastTime = timestamp
      lastDraw = timestamp
      advance(sides, delta, timestamp / 1000)
      drawFrame(ctx, sides, width, height)
    }

    const start = () => {
      if (frame !== 0) {
        return
      }
      lastTime = 0
      lastDraw = 0
      frame = requestAnimationFrame(loop)
    }

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    const observer = new ResizeObserver(() => {
      resize()
    })
    observer.observe(canvas)
    resize()
    controlsRef.current = { start, stop }

    return () => {
      observer.disconnect()
      stop()
      controlsRef.current = null
    }
  }, [])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) {
      return
    }
    if (paused) {
      controls.stop()
    } else {
      controls.start()
    }
  }, [paused])

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => {
      if (motionQuery.matches) {
        setPaused(true)
      }
    }
    motionQuery.addEventListener('change', syncMotionPreference)
    return () => {
      motionQuery.removeEventListener('change', syncMotionPreference)
    }
  }, [setPaused])

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        tabIndex={-1}
        className="size-full"
      />
    </div>
  )
}
