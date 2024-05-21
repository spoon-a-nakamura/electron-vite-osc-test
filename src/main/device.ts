/**
 * How to grant permission to audio in electron app in Windows?
 * https://stackoverflow.com/questions/60732227/how-to-grant-permission-to-audio-in-electron-app-in-windows
 *
 * Electron Doc: session
 * https://www.electronjs.org/ja/docs/latest/api/session
 *
 * Electron Doc: デバイスアクセス
 * https://www.electronjs.org/ja/docs/latest/tutorial/devices#webusb-api
 */

import { BrowserWindow } from 'electron'

export function acceptAudio(win: BrowserWindow) {
  // win.webContents.session.setPermissionRequestHandler((_, permission, callback, details) => {
  //   if (permission === 'media' && details.mediaTypes?.[0] === 'audio') {
  //     console.log('permission request success')
  //     callback(true)
  //   }
  //   callback(false)
  // })

  // ==============================================
  let grantedDeviceThroughPermHandler

  win.webContents.session.on('select-usb-device', (event, details, callback) => {
    console.log('select-usb-device')

    // Add events to handle devices being added or removed before the callback on
    // `select-usb-device` is called.
    win.webContents.session.on('usb-device-added', (event, device) => {
      console.log('usb-device-added FIRED WITH', device)
      // Optionally update details.deviceList
    })

    win.webContents.session.on('usb-device-removed', (event, device) => {
      console.log('usb-device-removed FIRED WITH', device)
      // Optionally update details.deviceList
    })

    event.preventDefault()
    if (details.deviceList && details.deviceList.length > 0) {
      const deviceToReturn = details.deviceList.find((device) => {
        return !grantedDeviceThroughPermHandler || device.deviceId !== grantedDeviceThroughPermHandler.deviceId
      })
      if (deviceToReturn) {
        callback(deviceToReturn.deviceId)
      } else {
        callback()
      }
    }
  })

  win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    // if (permission === 'usb' && details.securityOrigin === 'file:///') {
    if (permission === 'usb') {
      return true
    }
    return false
  })

  win.webContents.session.setDevicePermissionHandler((details) => {
    // if (details.deviceType === 'usb' && details.origin === 'file://') {
    if (details.deviceType === 'usb') {
      if (!grantedDeviceThroughPermHandler) {
        grantedDeviceThroughPermHandler = details.device
        return true
      } else {
        return false
      }
    }
    return false
  })

  win.webContents.session.setUSBProtectedClassesHandler((details) => {
    return details.protectedClasses.filter((usbClass) => {
      // Exclude classes except for audio classes
      return usbClass.indexOf('audio') === -1
    })
  })
}
