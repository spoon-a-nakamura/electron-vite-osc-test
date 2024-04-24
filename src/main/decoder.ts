/* eslint-disable @typescript-eslint/explicit-function-return-type */
export class MD {
  private readonly SIZE = 3

  isNormal(responseData: string) {
    const respLines = responseData.split('\n')

    if (!respLines[0].startsWith('MD')) return false
    if (respLines[1].startsWith('00') || respLines[1].startsWith('99')) return true
    else return false
  }

  getDistances(responseData: string) {
    // eslint-disable-next-line prefer-const
    let distances: number[] = []
    if (!this.isNormal(responseData)) return distances

    const respLines = responseData.split('\n')
    let dataLine = ''
    for (let i = 3; i < respLines.length; ++i) {
      dataLine += respLines[i].substring(0, respLines[i].length - 1)
    }

    return this.decodeArray(dataLine)
  }

  private decodeArray(data: string) {
    const datas: number[] = []
    for (let pos = 0; pos <= data.length - this.SIZE; pos += this.SIZE) {
      datas.push(this.decode(data, pos))
    }
    return datas
  }

  private decode(data: string, offset: number = 0) {
    let value = 0
    for (let i: number = 0; i < this.SIZE; ++i) {
      value <<= 6
      value |= data.charCodeAt(offset + i) - 0x30
    }
    return value
  }
}
