import { Command, SCIP } from './SCIP'

export class GD extends SCIP {
  constructor(command?: Command) {
    super('GD', command)
  }
}

export class GS extends SCIP {
  constructor(command?: Command) {
    super('GS', command)
  }
}

export class MD extends SCIP {
  constructor(command?: Command) {
    super('MD', command)
  }
}

export class MS extends SCIP {
  constructor(command?: Command) {
    super('MS', command)
  }
}
