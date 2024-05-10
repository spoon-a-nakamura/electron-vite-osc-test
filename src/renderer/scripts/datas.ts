class Datas {
  coordinates: [number, number][] | null = null

  constructor() {
    this.listen()
  }

  private listen() {
    window.electronAPI.response((coords: [number, number][]) => {
      if (!coords) {
        this.coordinates = null
      } else {
        this.coordinates = [...coords]
      }
    })
  }
}

export const datas = new Datas()
