import { randomString } from './utils/random'

export type IdentifiedCoord = {
  id: string
  coord: [number, number]
}

class Datas {
  private esp = 0.05

  coordinates: [number, number][] | null = null
  identifiedCoordinates: IdentifiedCoord[] = []

  constructor() {
    this.listen()
  }

  private listen() {
    window.electronAPI.response((coords: [number, number][]) => {
      if (!coords || coords.length === 0) {
        this.coordinates = null
      } else {
        this.coordinates = [...coords]
        this.updateHistory(this.coordinates)
      }
    })
  }

  private updateHistory(coords: [number, number][]) {
    const existIds: string[] = []

    for (const coord of coords) {
      let existHistory = false

      for (let i = 0; i < this.identifiedCoordinates.length; i++) {
        const prev = this.identifiedCoordinates[i].coord
        if (Math.abs(prev[0] - coord[0]) < this.esp && Math.abs(prev[1] - coord[1]) < this.esp) {
          this.identifiedCoordinates[i].coord = coord
          existHistory = true
          existIds.push(this.identifiedCoordinates[i].id)
          break
        }
      }

      if (!existHistory) {
        const id = randomString()
        this.identifiedCoordinates.push({ id, coord })
        existIds.push(id)
      }
    }

    this.identifiedCoordinates = this.identifiedCoordinates.filter((his) => existIds.includes(his.id))
  }
}

export const datas = new Datas()
