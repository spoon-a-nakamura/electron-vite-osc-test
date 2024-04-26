import * as net from 'net'

export class TCP {
  readonly client: net.Socket

  constructor(
    public readonly ip: string,
    public readonly port: number
  ) {
    this.client = new net.Socket()
  }

  connect(callback: () => void) {
    this.client.connect({ host: this.ip, port: this.port }, callback)
  }

  send(command: string) {
    this.client.write(command)
  }

  listen(callback: (rawData: Buffer) => void) {
    this.client.on('data', callback)
  }

  disconnect() {
    this.client.destroy()
  }
}
