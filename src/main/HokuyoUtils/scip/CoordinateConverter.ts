type SensorPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type XY = [number, number]

export class CoordinateConverter {
  private readonly sensorFov = 90 * (Math.PI / 180)
  private readonly sensorAxisRotationMatrix: { a11: number; a12: number; a21: number; a22: number }

  private readonly eps = 0.01
  private bunchBuffer: XY[] = []
  private prevCoord: XY = [99999, 99999]

  /**
   * @param sensorPlacement センサーの配置
   * @param sensorCoordinateFromCenter 投影面中央からのセンサー位置[m]
   * @param projectionAreaSize 投影面の大きさ[m]
   */
  constructor(
    sensorPlacement: SensorPlacement,
    private readonly sensorCoordinateFromCenter: XY,
    private readonly projectionAreaSize: XY,
  ) {
    this.sensorAxisRotationMatrix = this.calcSensorAxisRotationMatrix(sensorPlacement)
  }

  private calcSensorAxisRotationMatrix(placement: SensorPlacement) {
    let angle = 0
    if (placement === 'bottom-left') angle = 0
    else if (placement === 'bottom-right') angle = Math.PI / 2
    else if (placement === 'top-right') angle = Math.PI
    else if (placement === 'top-left') angle = Math.PI * (3 / 2)
    const s = Math.sin(angle)
    const c = Math.cos(angle)
    return { a11: c, a12: -s, a21: s, a22: c }
  }

  convert(distance: number, dataIndex: number, datasLength: number): XY {
    // 距離を[mm]から[m]に直す
    const meter = distance / 1000

    // センサー極座標[mm]を、センサー直交座標[m]に変換する
    const angle = (dataIndex / (datasLength - 1)) * this.sensorFov
    const localCoord = [meter * Math.cos(angle), meter * Math.sin(angle)]

    // センサー直交座標の軸の向きを、グローバル座標の軸の向きと揃える
    const mat = this.sensorAxisRotationMatrix
    const fixedAxisLocalCoord = [mat.a11 * localCoord[0] + mat.a12 * localCoord[1], mat.a21 * localCoord[0] + mat.a22 * localCoord[1]]

    // センサー直交座標から、グローバル座標に変換する
    const globalCoord = [this.sensorCoordinateFromCenter[0] + fixedAxisLocalCoord[0], this.sensorCoordinateFromCenter[1] + fixedAxisLocalCoord[1]]

    // 投影面のサイズで正規化(-1 ~ 1)する
    const normCoord = [globalCoord[0] / (this.projectionAreaSize[0] / 2), globalCoord[1] / (this.projectionAreaSize[1] / 2)]

    return normCoord as XY
  }

  inProjectionArea(normCoord: XY) {
    return -1 <= normCoord[0] && normCoord[0] <= 1 && -1 <= normCoord[1] && normCoord[1] <= 1
  }

  bunch(normCoord: XY, isLastData: boolean): XY | null {
    const dx = Math.abs(this.prevCoord[0] - normCoord[0])
    const dy = Math.abs(this.prevCoord[1] - normCoord[1])

    if (isLastData && dx < this.eps && dy < this.eps) {
      // 最後のデータで、前のデータとの差がなければbufferに追加する
      this.bunchBuffer.push(normCoord)
    }

    let x: number | null = null
    let y: number | null = null

    // bunchする条件
    const isBunch = 0 < this.bunchBuffer.length && (this.eps < dx || this.eps < dy || isLastData)

    if (isBunch) {
      // bufferに保存した座標の平均値を計算する
      x = 0
      y = 0
      for (const coord of this.bunchBuffer) {
        x += coord[0]
        y += coord[1]
      }
      x /= this.bunchBuffer.length
      y /= this.bunchBuffer.length

      // bufferをクリアする
      this.bunchBuffer.length = 0
    }

    if (this.inProjectionArea(normCoord) && !isLastData) {
      // 投影エリアに収まっていて、最後のデータでなければbufferに追加する
      this.bunchBuffer.push(normCoord)
    } else {
      this.bunchBuffer.length = 0
    }

    this.prevCoord = [normCoord[0], normCoord[1]]

    return x && y ? [x, y] : null
  }
}
