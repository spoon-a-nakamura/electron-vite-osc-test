import fs from 'fs'
import { parse } from 'ini'
import type { SensorPlacement } from './HokuyoUtils/scip/CoordinateConverter'

export type AppConfig = {
  app: {
    window_size: [number, number]
    renderer_file: string
    visibled_marker: boolean
    visibled_sketch: boolean
  }
  projection: {
    screen_size: [number, number]
  }
  sensor: {
    fov?: number
    start?: number
    end?: number
    grouping?: number
    scans?: number
    skips?: number
    _1: {
      ip: string
      port: number
      placement: SensorPlacement
      coordinate_from_center: [number, number]
    }
  }
  coordinate_converter: {
    normalize?: boolean
    bunch?: boolean
    bunchEps?: number
    bunchPrecisionCount?: number
  }
}

export function readAppConfig(path: string) {
  const buffer = fs.readFileSync(path)
  const data = buffer.toString('utf-8')
  const obj = parse(data) as AppConfig

  const strToNum = (o: Object) => {
    for (const key in o) {
      const v = o[key]
      if (typeof v === 'object') {
        strToNum(v)
      } else {
        if (typeof v === 'string') {
          const n = Number(v)
          if (!Number.isNaN(n)) o[key] = n
        }
      }
    }
  }

  strToNum(obj)
  return obj
}
