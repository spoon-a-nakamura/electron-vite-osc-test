/**
 * コマンド生成に必要なパラメーター ※param - デフォルト値（制限）
 * @param fov - undefined（0 - 270度）｜センサーの中心からの視野角。これを指定した場合startとendの指定は無視される。90（度）と指定した場合、センサーの中心から左右に45度ずつ角度が取られ、この時のstart, end indexが計算される。
 * @param start - 0（4桁）｜開始インデックス
 * @param end - 1080（4桁）｜終了インデックス。センサーの規格によって異なり、UST-10LXの場合は1080stepまで。
 * @param grouping - 0（2桁）｜まとめる取得データ数。0または1の場合、0.25度（製品最大分解能の角度）ずつデータを取得し、2の場合は0.5度，3の場合は0.75度ずつ取得する。
 * @param skips - 0（1桁）｜何周期に1回取得するか。1周期は40fpsなので、2を指定した場合はデータの取得速度が20fpsになる。
 * @param scans - 0（2桁）｜何回取得するか。0の場合は垂れ流しでずっと取得する。
 * @link https://sourceforge.net/p/urgnetwork/wiki/scip_capture_jp/
 */
type Command = {
  fov?: number
  start?: number
  end?: number
  grouping?: number
  skips?: number
  scans?: number
}

export class MD {
  private static readonly TYPE = 'MD'
  private static readonly DATA_SIZE = 3
  private static readonly MIN_STEP = 0
  private static readonly MAX_STEP = 1080

  public readonly commnad: string
  private distances: number[] = []
  private decoder = new TextDecoder()
  private _timestamp: number = 0

  constructor(command?: Command) {
    this.commnad = this.createCommand(command)
  }

  private createCommand(command?: Command) {
    let start: string
    let end: string
    if (command?.fov) {
      const range = this.convertAngleToRangeIndex(command.fov)
      start = range.start.toString().padStart(4, '0')
      end = range.end.toString().padStart(4, '0')
    } else {
      start = (command?.start ?? MD.MIN_STEP).toString().padStart(4, '0')
      end = (command?.end ?? MD.MAX_STEP).toString().padStart(4, '0')
    }
    const grouping = (command?.grouping ?? 0).toString().padStart(2, '0')
    const skips = (command?.skips ?? 0).toString()
    const scans = (command?.scans ?? 0).toString().padStart(2, '0')

    return `${MD.TYPE}${start}${end}${grouping}${skips}${scans}\n`
  }

  private convertAngleToRangeIndex(degree: number) {
    const maxAngle = 270
    const startAngle = maxAngle / 2 - degree / 2
    const endAngle = maxAngle / 2 + degree / 2
    const startIndex = MD.MAX_STEP * (startAngle / maxAngle)
    const endIndex = MD.MAX_STEP * (endAngle / maxAngle)

    return { start: Math.round(startIndex), end: Math.round(endIndex) }
  }

  get timestamp() {
    return this._timestamp
  }

  /**
   * 応答データから距離データを取得する
   */
  getDistancesFromBuffer(buffer: Buffer) {
    return this.getDistances(this.decoder.decode(buffer))
  }

  /**
   * 応答データから距離データを取得する
   */
  getDistances(responseData: string) {
    this.distances.length = 0
    this._timestamp = 0

    const respLines = responseData.split('\n')

    if (
      respLines[0].startsWith(MD.TYPE) &&
      (respLines[1].startsWith('00') || respLines[1].startsWith('99'))
    ) {
      this._timestamp = this.decode(respLines[2], 4)

      let dataLine = ''
      for (let i = 3; i < respLines.length; ++i) {
        dataLine += respLines[i].substring(0, respLines[i].length - 1)
      }
      this.decodeArray(dataLine, MD.DATA_SIZE, this.distances)
    }

    return this.distances
  }

  private decodeArray(data: string, size: number, results: number[]) {
    for (let pos = 0; pos <= data.length - size; pos += size) {
      results.push(this.decode(data, size, pos))
    }
  }

  private decode(data: string, size: number, offset: number = 0) {
    let value = 0
    for (let i: number = 0; i < size; ++i) {
      value <<= 6
      value |= data.charCodeAt(offset + i) - 0x30
    }
    return value
  }
}
