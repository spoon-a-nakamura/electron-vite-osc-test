import { Bodies, Composite, Composites, Engine, Render, Runner } from 'matter-js'

const { innerWidth: width, innerHeight: height } = window

const engine = Engine.create()
const world = engine.world

const render = Render.create({
  element: document.querySelector<HTMLElement>('.sketch')!,
  engine,
  options: {
    width: width,
    height: height,
    pixelRatio: 1,
    showAngleIndicator: true,
  },
})

Render.run(render)

// window.addEventListener('resize', () => {
//   render.options.width = window.innerWidth
//   render.options.height = window.innerHeight
//   Render.setPixelRatio(render, 1)
// })

const runner = Runner.create()
Runner.run(runner, engine)

// circles
const stack = Composites.stack(100, 600 - 21 - 20 * 20, 1, 1, 20, 0, (x, y) => Bodies.circle(x, y, 20, { isStatic: true }))

const thickness = 50

Composite.add(world, [
  // walls
  Bodies.rectangle(width / 2, 0, width, thickness, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, thickness, { isStatic: true }),
  Bodies.rectangle(width, height / 2, thickness, height, { isStatic: true }),
  Bodies.rectangle(0, height / 2, thickness, height, { isStatic: true }),
  // Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
  // Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
  // Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
  // Bodies.rectangle(0, 300, 50, 600, { isStatic: true }),
  stack,
])

Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: width, y: height },
  // max: { x: 800, y: 600 },
})

// stack.bodies[0].
console.log(stack.bodies[0])
console.log(world.composites)
