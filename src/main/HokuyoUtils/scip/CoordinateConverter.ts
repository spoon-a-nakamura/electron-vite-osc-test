type SensorPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type XY = [number, number]

export class CoordinateConverter {
  private readonly sensorFov = 90 * (Math.PI / 180)
  private readonly sensorAxisRotationMatrix: { a11: number; a12: number; a21: number; a22: number }

  // バンチするときに、座標を同一位置とみなすための誤差
  private readonly bunchEps = 0.05 // [m]
  // 座標をバンチする時に、bufferにいくつ以上座標データがあることを前提にするか（1とかだと、検知の振れで誤ったデータがとれることがあるための回避策）
  private readonly bunchPrecisionCount = 3
  private bunchBuffer: XY[] = []
  private prevCoord: XY = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]

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

  /**
   * 距離データをスクリーン座標に変換する
   * @param distance 距離[mm]
   * @param dataIndex データのインデックス
   * @param datasLength データ列の長さ
   * @returns
   */
  convert(distance: number, dataIndex: number, datasLength: number): XY {
    // 距離を[mm]から[m]に直す
    const meter = distance / 1000

    // センサー極座標[mm]を、センサー直交座標[m]に変換する
    const angle = (dataIndex / (datasLength - 1)) * this.sensorFov
    const localCoord = [meter * Math.cos(angle), meter * Math.sin(angle)]

    // センサー直交座標の軸の向きを、グローバル（スクリーン）座標の軸の向きと揃える
    const mat = this.sensorAxisRotationMatrix
    const fixedAxisLocalCoord = [mat.a11 * localCoord[0] + mat.a12 * localCoord[1], mat.a21 * localCoord[0] + mat.a22 * localCoord[1]]

    // センサー直交座標から、グローバル座標に変換する
    const globalCoord: XY = [this.sensorCoordinateFromCenter[0] + fixedAxisLocalCoord[0], this.sensorCoordinateFromCenter[1] + fixedAxisLocalCoord[1]]

    return globalCoord
  }

  /**
   * 投影面のサイズで正規化(-1 ~ 1)する
   * @param coord 座標[m]
   */
  normalize(coord: XY): XY {
    return [coord[0] / (this.projectionAreaSize[0] / 2), coord[1] / (this.projectionAreaSize[1] / 2)]
  }

  /**
   * 正規化した座標が、投影面内にあるか
   * @param normCoord
   */
  inProjectionArea(normCoord: XY) {
    return -1 <= normCoord[0] && normCoord[0] <= 1 && -1 <= normCoord[1] && normCoord[1] <= 1
  }

  /**
   * 付近の検知座標をまとめる（同一オブジェクトの検知）
   * @param coord スクリーン空間の座標[m]
   * @param dataPlace データのデータ列上の位置
   * @returns 付近の検知座標の平均座標｜null
   */
  bunch(coord: XY, dataPlace: 'first' | 'last' | 'middle' = 'middle'): XY | null {
    if (!this.inProjectionArea(this.normalize(coord))) {
      // 投影面に座標が入ってない場合
      this.prevCoord = [...coord]
      if (0 < this.bunchBuffer.length) {
        return this.calcBunchAvarage()
      } else {
        return null
      }
    }

    if (dataPlace === 'first') {
      // データ列の最初のデータの場合
      this.bunchBuffer.length = 0
      this.bunchBuffer.push(coord)
      this.prevCoord = [...coord]
      return null
    }

    if (dataPlace === 'middle') {
      // データ列の途中のデータの場合
      let result: XY | null = null
      if (0 < this.bunchBuffer.length) {
        const dx = Math.abs(this.prevCoord[0] - coord[0])
        const dy = Math.abs(this.prevCoord[1] - coord[1])
        if (this.bunchEps < dx || this.bunchEps < dy) {
          result = this.calcBunchAvarage()
        }
      }
      this.bunchBuffer.push(coord)
      this.prevCoord = [...coord]
      return result
    }

    if (dataPlace === 'last' && 0 < this.bunchBuffer.length) {
      // データ列の最後のデータの場合
      return this.calcBunchAvarage()
    }

    return null
  }

  private calcBunchAvarage() {
    let result: XY | null = null

    if (this.bunchPrecisionCount <= this.bunchBuffer.length) {
      result = [0, 0]
      for (const coord of this.bunchBuffer) {
        result[0] += coord[0]
        result[1] += coord[1]
      }
      result[0] /= this.bunchBuffer.length
      result[1] /= this.bunchBuffer.length
    }

    this.bunchBuffer.length = 0
    return result
  }
}
