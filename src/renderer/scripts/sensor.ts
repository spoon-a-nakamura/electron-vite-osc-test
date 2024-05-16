import { randomString } from './utils/random'

export type Coord = [number, number]

export type IdentifiedCoord = {
  id: string
  coord: Coord
}

class Sensor {
  private eps = 0.05 // [m]

  coords: Coord[] | null = null
  identifiedCoords: IdentifiedCoord[] = []

  constructor() {
    this.listen()
  }

  private listen() {
    window.electronAPI.response((coords: Coord[]) => {
      if (!coords || coords.length === 0) {
        this.coords = null
      } else {
        this.coords = [...coords]
        this.updateHistory(this.coords)
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
}

export const sensor = new Sensor()
