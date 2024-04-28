import { SCIP } from './SCIP'

class GD extends SCIP {
  protected readonly type = 'GD'
  protected readonly dataSize = 3
}

class GS extends SCIP {
  protected readonly type = 'GS'
  protected readonly dataSize = 2
}

class MD extends SCIP {
  protected readonly type = 'MD'
  protected readonly dataSize = 3
}

class MS extends SCIP {
  protected readonly type = 'MS'
  protected readonly dataSize = 2
}

export const UST10LX = { GD, GS, MD, MS }
