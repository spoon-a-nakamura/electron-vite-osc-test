import { Command, SCIP } from './SCIP'

class GD extends SCIP {
  constructor(command?: Command) {
    super('GD', command)
  }
}

class GS extends SCIP {
  constructor(command?: Command) {
    super('GS', command)
  }
}

class MD extends SCIP {
  constructor(command?: Command) {
    super('MD', command)
  }
}

class MS extends SCIP {
  constructor(command?: Command) {
    super('MS', command)
  }
}

export const UST10LX = { GD, GS, MD, MS }
