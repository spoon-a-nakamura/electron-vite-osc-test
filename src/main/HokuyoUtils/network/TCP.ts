import * as net from 'net'

export class TCP {
  readonly client: net.Socket

  constructor(
    public readonly ip_address: string,
    public readonly port: number
  ) {
    this.client = new net.Socket()
  }

  connect(callback: () => void) {
    this.client.connect({ host: this.ip_address, port: this.port }, callback)

    this.client.on('error', (e) => {
      console.error('tcp connection error: ' + e.message)
    })
  }

  send(command: string) {
    this.client.write(command)
  }

  listen(callback: (rawData: Buffer) => void) {
    this.client.on('data', callback)
  }

  disconnect(command?: string) {
    command && this.send(command)
    this.client.destroy()
  }
}
