import { randomString } from './utils/random'

export type Coord = [number, number]

export type IdentifiedCoord = {
  id: string
  coord: Coord
}

class Sensor {
  private eps = 0.05 // [m]
  /** 欠損したデータが何回連続で取得されたか */
  private missingCount = 0
  /** 空データが何回連続で取得されたか */
  private emptyCount = 0

  coords: Coord[] | null = null
  identifiedCoords: IdentifiedCoord[] = []

  constructor() {
    this.listen()
  }

  private listen() {
    window.electronAPI.response((coords: Coord[] | null) => {
      if (!coords) {
        this.coords = null
        this.missingCount++
      } else if (coords.length === 0) {
        this.coords = []
        this.identifiedCoords = []
        this.emptyCount++
      } else {
        this.coords = [...coords]
        this.updateHistory(this.coords)
        this.missingCount = 0
        this.emptyCount = 0
      }
    })
  }

  private updateHistory(coords: Coord[]) {
    const existIds: string[] = []

    for (const coord of coords) {
      let existHistory = false

      for (let i = 0; i < this.identifiedCoords.length; i++) {
        const prev = this.identifiedCoords[i].coord
        if (Math.abs(prev[0] - coord[0]) < this.eps && Math.abs(prev[1] - coord[1]) < this.eps) {
          this.identifiedCoords[i].coord = coord
          existHistory = true
          existIds.push(this.identifiedCoords[i].id)
          break
        }
      }

      if (!existHistory) {
        const id = randomString()
        this.identifiedCoords.push({ id, coord })
        existIds.push(id)
      }
    }

    this.identifiedCoords = this.identifiedCoords.filter((ic) => existIds.includes(ic.id))
  }

  clone<T extends IdentifiedCoord | Coord>(coord: T) {
    return structuredClone(coord)
  }

  /**
   * データが欠損しているかどうか
   * @param lowCount 欠損データが何回連続で続いたかの下限値
   */
  isMissing(lowCount = 1) {
    return lowCount <= this.missingCount
  }

  /**
   * データが空かどうか
   * @param lowCount 空データが何回連続で続いたかの下限値
   */
  isEmpty(lowCount = 1) {
    return lowCount <= this.emptyCount
  }
}

export const sensor = new Sensor()
