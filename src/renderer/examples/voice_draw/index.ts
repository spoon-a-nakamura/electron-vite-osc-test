import { USBDevice } from 'electron'

const SafeSpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition

const recognition = new SafeSpeechRecognition()
recognition.lang = 'ja-JP'

const log = document.querySelector<HTMLElement>('.skecth .log')!

recognition.onresult = (e) => {
  console.log('-------------------------')
  log.innerText = e.results[0][0].transcript
  console.log(e.results)
}

document.querySelector<HTMLButtonElement>('.sketch button')?.addEventListener('click', async () => {
  console.log('start')
  // recognition.start()

  // testIt()

  const grantedDevice = (await (navigator as any).usb.requestDevice({ filters: [{ productId: 5903, vendorId: 2385 }] })) as USBDevice
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: grantedDevice.deviceId } } })
  console.log(stream)

  // document.createElement('audio').setSinkId(grantedDevice.deviceId)

  recognition.start()

  // const devices = await navigator.mediaDevices.enumerateDevices()
  // console.log(devices)
})

// async function testIt() {
//   const grantedDevices = await (navigator as any).usb.getDevices()
//   console.log(grantedDevices)

//   try {
//     const grantedDevice = (await (navigator as any).usb.requestDevice({ filters: [{ productId: 5903, vendorId: 2385 }] })) as USBDevice
//     console.log(grantedDevice)

//     // document.createElement('audio').setSinkId(grantedDevice.productId)

//     const devices = await navigator.mediaDevices.enumerateDevices()
//     const audioDevice = devices.find((device) => device.kind === 'audioinput')
//     console.log(audioDevice)

//     recognition.start()
//   } catch (e) {
//     console.error(`デバイスがありません。${e}`)
//   }
// }
