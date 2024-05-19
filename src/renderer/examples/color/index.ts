import { Coord, sensor } from '@scripts/sensor'
import * as Tone from 'tone'

const colors = ['red', 'blue', 'yellow', 'green', 'orange']
const colorNames = {
  red: 'Red',
  blue: 'Blue',
  yellow: 'Yellow',
  green: 'Green',
  orange: 'Orange'
}
let currentColorIndex = 0

const body = document.body
body.style.backgroundColor = colors[currentColorIndex]

// 色名を表示する要素を作成
const colorNameElement = document.createElement('div')
colorNameElement.style.position = 'absolute'
colorNameElement.style.top = '50%'
colorNameElement.style.left = '50%'
colorNameElement.style.transform = 'translate(-50%, -50%)'
colorNameElement.style.fontSize = '48px'
colorNameElement.style.color = 'white'
colorNameElement.innerText = colorNames[colors[currentColorIndex]]
body.appendChild(colorNameElement)

// 音声合成の設定
const utterance = new SpeechSynthesisUtterance()
utterance.rate = 1
utterance.pitch = 1
utterance.onend = () => {
  // キューをクリア
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel()
  }
}

// トーンの設定
const synth = new Tone.Synth().toDestination()

// デバウンス時間（ミリ秒）
const debounceTime = 200
let lastSensorTime = 0
let colorChangeRequested = false
let sensorActive = false

function changeColor() {
  currentColorIndex = (currentColorIndex + 1) % colors.length
  const newColor = colors[currentColorIndex]
  body.style.backgroundColor = newColor
  colorNameElement.innerText = colorNames[newColor]

  // 色の名前を音声で再生
  utterance.text = colorNames[newColor]
  window.speechSynthesis.speak(utterance)

  // トーンを再生
  synth.triggerAttackRelease('C4', '8n')
}

function anime() {
  const now = Date.now()

  if (sensor.coords && sensor.coords.length > 0) {
    if (!sensorActive) {
      sensorActive = true
      if (now - lastSensorTime >= debounceTime) {
        lastSensorTime = now
        colorChangeRequested = true
      }
    }
  } else {
    sensorActive = false
  }

  if (colorChangeRequested) {
    colorChangeRequested = false
    changeColor()
  }

  requestAnimationFrame(anime)
}

anime()
