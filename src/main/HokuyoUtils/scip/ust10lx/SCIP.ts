import { type CoordinateConverter } from '../CoordinateConverter'

/**
 * コマンド生成に必要なパラメーター ※param - デフォルト値（制限）
 * @param fov - undefined（0 - 270度）｜センサーの中心からの視野角。これを指定した場合startとendの指定は無視される。90（度）と指定した場合、センサーの中心から左右に45度ずつ角度が取られ、この時のstart, end indexが計算される。
 * @param start - 0（4桁）｜開始インデックス
 * @param end - 1080（4桁）｜終了インデックス。センサーの規格によって異なり、UST-10LXの場合は1080stepまで。
 * @param grouping - 0（2桁）｜まとめる取得データ数。0または1の場合、0.25度（製品最大分解能の角度）ずつデータを取得し、2の場合は0.5度，3の場合は0.75度ずつ取得する。
 * @param skips - 0（1桁）｜何周期に1回取得するか。1周期は40fps(25ms)なので、1を指定した場合はデータの取得速度が20fps(50ms)になる。
 * @param scans - 0（2桁）｜何回取得するか。0の場合は垂れ流しでずっと取得する。
 * @link https://sourceforge.net/p/urgnetwork/wiki/scip_capture_jp/
 */
export type Command = {
  fov?: number
  start?: number
  end?: number
  grouping?: number
  skips?: number
  scans?: number
}

type CommandType = 'GD' | 'GS' | 'MD' | 'MS'

export abstract class SCIP {
  private static readonly MIN_STEP = 0
  private static readonly MAX_STEP = 1080

  private readonly dataSize: number

  public readonly command: { request: string; quit: string }
  public timestamp = 0
  private distances: number[] = []
  private coordinates: [number, number][] = []
  private decoder = new TextDecoder()
  private prevTime = performance.now()

  constructor(
    private readonly type: CommandType,
    command?: Command,
  ) {
    this.command = {
      request: this.createRequestCommand(command),
      quit: 'QT\n',
    }

    this.dataSize = type.endsWith('D') ? 3 : 2
  }

  private createRequestCommand(command?: Command) {
    let start: string
    let end: string
    if (command?.fov) {
      const range = this.convertAngleToRangeIndex(command.fov)
      start = range.start.toString().padStart(4, '0')
      end = range.end.toString().padStart(4, '0')
    } else {
      start = (command?.start ?? SCIP.MIN_STEP).toString().padStart(4, '0')
      end = (command?.end ?? SCIP.MAX_STEP).toString().padStart(4, '0')
    }
    const grouping = (command?.grouping ?? 0).toString().padStart(2, '0')
    const skips = (command?.skips ?? 0).toString()
    const scans = (command?.scans ?? 0).toString().padStart(2, '0')

    if (this.type === 'MD' || this.type === 'MS') {
      // MD, MS
      return `${this.type}${start}${end}${grouping}${skips}${scans}\n`
    } else {
      // GD, GS
      return `${this.type}${start}${end}${grouping}\n`
    }
  }

  private convertAngleToRangeIndex(degree: number) {
    const maxAngle = 270
    const startAngle = maxAngle / 2 - degree / 2
    const endAngle = maxAngle / 2 + degree / 2
    const startIndex = SCIP.MAX_STEP * (startAngle / maxAngle)
    const endIndex = SCIP.MAX_STEP * (endAngle / maxAngle)
    return { start: Math.round(startIndex), end: Math.round(endIndex) }
  }

  getResponseTime() {
    const current = performance.now()
    const result = current - this.prevTime
    this.prevTime = current
    return result
  }

  decodeBuffer(buffer: Buffer) {
    return this.decoder.decode(buffer)
  }

  /**
   * 応答データから距離データを取得する
   */
  getDistancesFromBuffer(buffer: Buffer) {
    return this.getDistances(this.decodeBuffer(buffer))
  }

  /**
   * 応答データから距離データを取得する
   */
  getDistances(responseData: string) {
    this.distances.length = 0
    this.timestamp = 0

    const respLines = responseData.split('\n')

    if (respLines[0].startsWith(this.type) && (respLines[1].startsWith('00') || respLines[1].startsWith('99'))) {
      this.timestamp = this.decode(respLines[2], 4)

      let dataLine = ''
      for (let i = 3; i < respLines.length; ++i) {
        dataLine += respLines[i].substring(0, respLines[i].length - 1)
      }
      this.decodeArray(dataLine, this.dataSize, this.distances)
    }

    return this.distances
  }

  /**
   * 応答データからデコードした距離データを、スクリーン座標（画面中央を原点とする-1~1の座標系）で返す
   */
  getCoordinatesFromBuffer(converter: CoordinateConverter, buffer: Buffer, isBunch = true) {
    this.coordinates.length = 0
    this.timestamp = 0

    const respLines = this.decoder.decode(buffer).split('\n')

    if (respLines[0].startsWith(this.type) && (respLines[1].startsWith('00') || respLines[1].startsWith('99'))) {
      this.timestamp = this.decode(respLines[2], 4)

      let dataLine = ''
      for (let i = 3; i < respLines.length; ++i) {
        dataLine += respLines[i].substring(0, respLines[i].length - 1)
      }
      this.decodeArrayToCoord(converter, dataLine, this.dataSize, isBunch, this.coordinates)
    }

    return this.coordinates
  }

  private decodeArray(data: string, size: number, results: number[]) {
    for (let pos = 0; pos <= data.length - size; pos += size) {
      results.push(this.decode(data, size, pos))
    }
  }

  private decodeArrayToCoord(converter: CoordinateConverter, data: string, size: number, isBunch: boolean, results: [number, number][]) {
    const len = (data.length - size) / size + 1
    let index = 0

    for (let pos = 0; pos <= data.length - size; pos += size) {
      index = pos / size
      const distance = this.decode(data, size, pos)
      const screenCoord = converter.convert(distance, index, len)

      if (isBunch) {
        const bunchedCoord = converter.bunch(screenCoord, index === 0 ? 'first' : index === len - 1 ? 'last' : 'middle')
        if (bunchedCoord) results.push(converter.normalize(bunchedCoord))
      } else {
        const normCoord = converter.normalize(screenCoord)
        if (converter.inProjectionArea(normCoord)) results.push(normCoord)
      }
    }
  }

  private decode(data: string, size: number, offset = 0) {
    let value = 0
    for (let i = 0; i < size; ++i) {
      value <<= 6
      value |= data.charCodeAt(offset + i) - 0x30
    }
    return value
  }
}
