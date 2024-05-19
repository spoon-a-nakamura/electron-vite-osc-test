/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { sensor } from '@scripts/sensor'
import { gsap } from 'gsap'

// World Wide Web Consortium (W3C) が1997年に公開したHTML 3.2の仕様書（）において、標準の色名として以下の基本16色が定義されたらしい。
const colors = [
  'black',
  'silver',
  'gray',
  'white',
  'maroon',
  'red',
  'purple',
  'fuchsia',
  'green',
  'lime',
  'olive',
  'yellow',
  'navy',
  'blue',
  'teal',
  'aqua'
]

// 画面で表示させたいテキスト定義
const colorNames = {
  black: 'くろ',
  silver: 'ぎん',
  gray: 'はいいろ',
  white: 'しろ',
  maroon: 'くりいろ',
  red: 'あか',
  purple: 'むらさき',
  fuchsia: 'ピンク',
  green: 'みどり',
  lime: 'きみどり',
  olive: 'おりーぶ',
  yellow: 'きいろ',
  navy: 'こん',
  blue: 'あお',
  teal: 'あおみどり',
  aqua: 'みずいろ'
}

// その色をちょっとグラデーションで表現
const gradientColors = {
  black: `linear-gradient(${getRandomAngle()}deg, black, darkgrey)`,
  silver: `linear-gradient(${getRandomAngle()}deg, silver, lightgray)`,
  gray: `linear-gradient(${getRandomAngle()}deg, gray, darkgray)`,
  white: `linear-gradient(${getRandomAngle()}deg, white, whitesmoke)`,
  maroon: `linear-gradient(${getRandomAngle()}deg, maroon, darkred)`,
  red: `linear-gradient(${getRandomAngle()}deg, red, darkred)`,
  purple: `linear-gradient(${getRandomAngle()}deg, purple, indigo)`,
  fuchsia: `linear-gradient(${getRandomAngle()}deg, fuchsia, deeppink)`,
  green: `linear-gradient(${getRandomAngle()}deg, green, darkgreen)`,
  lime: `linear-gradient(${getRandomAngle()}deg, lime, limegreen)`,
  olive: `linear-gradient(${getRandomAngle()}deg, olive, darkolivegreen)`,
  yellow: `linear-gradient(${getRandomAngle()}deg, yellow, goldenrod)`,
  navy: `linear-gradient(${getRandomAngle()}deg, navy, midnightblue)`,
  blue: `linear-gradient(${getRandomAngle()}deg, blue, navy)`,
  teal: `linear-gradient(${getRandomAngle()}deg, teal, darkslategray)`,
  aqua: `linear-gradient(${getRandomAngle()}deg, aqua, lightseagreen)`
}

// 色が表示された際に再生される音声ファイル
const audioFiles = {
  black: new Audio('./voice/akifumi/black.m4a'),
  silver: new Audio('./voice/akifumi/silver.m4a'),
  gray: new Audio('./voice/akifumi/gray.m4a'),
  white: new Audio('./voice/akifumi/white.m4a'),
  maroon: new Audio('./voice/akifumi/maroon.m4a'),
  red: new Audio('./voice/nagisa/red.m4a'),
  purple: new Audio('./voice/akifumi/purple.m4a'),
  fuchsia: new Audio('./voice/akifumi/fuchsia.m4a'),
  green: new Audio('./voice/akifumi/green.m4a'),
  lime: new Audio('./voice/akifumi/lime.m4a'),
  olive: new Audio('./voice/akifumi/olive.m4a'),
  yellow: new Audio('./voice/nagisa/yellow.m4a'),
  navy: new Audio('./voice/akifumi/navy.m4a'),
  blue: new Audio('./voice/nagisa/blue.m4a'),
  teal: new Audio('./voice/akifumi/teal.m4a'),
  aqua: new Audio('./voice/akifumi/aqua.m4a')
}

// ランダムなインデックスを生成する関数
function getRandomIndex() {
  return Math.floor(Math.random() * colors.length)
}

// ランダムな角度を生成する関数
function getRandomAngle() {
  return Math.floor(Math.random() * 360)
}

// 現在の色を記憶
let currentColorIndex = getRandomIndex()

// 処理させたいHTML要素
const colorNameElement = document.querySelector('.color-name') as HTMLElement
const colorBurstElement = document.querySelector('.color-burst') as HTMLElement

// 初期色の設定
if (colorNameElement) {
  const initialColor = colors[currentColorIndex]
  const initialGradient = gradientColors[initialColor]
  document.body.style.background = initialGradient
  colorNameElement.innerText = colorNames[initialColor]
}

// 手が触れているタイミングで次の色に進まないように、センサーのデバウンス処理
const debounceTime = 200
let lastSensorTime = 0
let colorChangeRequested = false
let sensorActive = false

// 色を変える処理
function changeColor() {
  let newColorIndex
  do {
    newColorIndex = getRandomIndex()
  } while (newColorIndex === currentColorIndex) // 同じ色が連続しないようにする

  currentColorIndex = newColorIndex
  const newColor = colors[currentColorIndex]
  const newGradient = gradientColors[newColor]
  document.body.style.background = newGradient

  if (colorNameElement) {
    colorNameElement.innerText = colorNames[newColor]

    // 背景色に合わせて文字色の変更
    if (newColor === 'white' || newColor === 'silver' || newColor === 'yellow') {
      colorNameElement.style.color = 'black'
    } else {
      colorNameElement.style.color = 'white'
    }

    // テキスト切り替え時の演出
    gsap.fromTo(
      colorNameElement,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.75)' }
    )
  }

  // 色彩切替時の演出
  if (colorBurstElement) {
    colorBurstElement.classList.add('color-burst-active')
    setTimeout(() => {
      colorBurstElement.classList.remove('color-burst-active')
    }, 500) // カラーバーストのアニメーション時間と一致させる
  }

  // 録音した音声の再生
  const audio = audioFiles[newColor]
  audio.currentTime = 0 // 再生位置を先頭にリセット
  audio.play()
}

// センサーと描画の連動処理
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

// 色名参考をメモ記録

// 基本の16色

// 	1.	black
// 	2.	silver
// 	3.	gray
// 	4.	white
// 	5.	maroon
// 	6.	red
// 	7.	purple
// 	8.	fuchsia
// 	9.	green
// 	10.	lime
// 	11.	olive
// 	12.	yellow
// 	13.	navy
// 	14.	blue
// 	15.	teal
// 	16.	aqua

// 拡張色

// 	17.	aliceblue
// 	18.	antiquewhite
// 	19.	aquamarine
// 	20.	azure
// 	21.	beige
// 	22.	bisque
// 	23.	blanchedalmond
// 	24.	blueviolet
// 	25.	brown
// 	26.	burlywood
// 	27.	cadetblue
// 	28.	chartreuse
// 	29.	chocolate
// 	30.	coral
// 	31.	cornflowerblue
// 	32.	cornsilk
// 	33.	crimson
// 	34.	cyan
// 	35.	darkblue
// 	36.	darkcyan
// 	37.	darkgoldenrod
// 	38.	darkgray
// 	39.	darkgreen
// 	40.	darkgrey
// 	41.	darkkhaki
// 	42.	darkmagenta
// 	43.	darkolivegreen
// 	44.	darkorange
// 	45.	darkorchid
// 	46.	darkred
// 	47.	darksalmon
// 	48.	darkseagreen
// 	49.	darkslateblue
// 	50.	darkslategray
// 	51.	darkslategrey
// 	52.	darkturquoise
// 	53.	darkviolet
// 	54.	deeppink
// 	55.	deepskyblue
// 	56.	dimgray
// 	57.	dimgrey
// 	58.	dodgerblue
// 	59.	firebrick
// 	60.	floralwhite
// 	61.	forestgreen
// 	62.	gainsboro
// 	63.	ghostwhite
// 	64.	gold
// 	65.	goldenrod
// 	66.	greenyellow
// 	67.	grey
// 	68.	honeydew
// 	69.	hotpink
// 	70.	indianred
// 	71.	indigo
// 	72.	ivory
// 	73.	khaki
// 	74.	lavender
// 	75.	lavenderblush
// 	76.	lawngreen
// 	77.	lemonchiffon
// 	78.	lightblue
// 	79.	lightcoral
// 	80.	lightcyan
// 	81.	lightgoldenrodyellow
// 	82.	lightgray
// 	83.	lightgreen
// 	84.	lightgrey
// 	85.	lightpink
// 	86.	lightsalmon
// 	87.	lightseagreen
// 	88.	lightskyblue
// 	89.	lightslategray
// 	90.	lightslategrey
// 	91.	lightsteelblue
// 	92.	lightyellow
// 	93.	limegreen
// 	94.	linen
// 	95.	magenta
// 	96.	mediumaquamarine
// 	97.	mediumblue
// 	98.	mediumorchid
// 	99.	mediumpurple
// 	100.	mediumseagreen
// 	101.	mediumslateblue
// 	102.	mediumspringgreen
// 	103.	mediumturquoise
// 	104.	mediumvioletred
// 	105.	midnightblue
// 	106.	mintcream
// 	107.	mistyrose
// 	108.	moccasin
// 	109.	navajowhite
// 	110.	oldlace
// 	111.	olivedrab
// 	112.	orangered
// 	113.	orchid
// 	114.	palegoldenrod
// 	115.	palegreen
// 	116.	paleturquoise
// 	117.	palevioletred
// 	118.	papayawhip
// 	119.	peachpuff
// 	120.	peru
// 	121.	pink
// 	122.	plum
// 	123.	powderblue
// 	124.	rosybrown
// 	125.	royalblue
// 	126.	saddlebrown
// 	127.	salmon
// 	128.	sandybrown
// 	129.	seagreen
// 	130.	seashell
// 	131.	sienna
// 	132.	skyblue
// 	133.	slateblue
// 	134.	slategray
// 	135.	slategrey
// 	136.	snow
// 	137.	springgreen
// 	138.	steelblue
// 	139.	tan
// 	140.	thistle
// 	141.	tomato
// 	142.	turquoise
// 	143.	violet
// 	144.	wheat
// 	145.	whitesmoke
// 	146.	yellowgreen
// 	147.	rebeccapurple
