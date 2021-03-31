const regl = require('regl')()
const glsl = x => x[0];

const BlenderWebSocket = require('./js/lib/BlenderWebSocket')
const BlenderHTML5Animations = require('./js/lib/blender-html5-animations.min')
const animationData = require('../blend/animation.json')
const neon = require('./js/neon')(regl)
const ground = require('./js/ground')(regl)
const ground_lines = require('./js/ground_lines')(regl)
const tree = require('./js/tree')(regl)
const dust = require('./js/dust')(regl)
const axis = require('./js/axis')(regl)
const grid = require('./js/grid')(regl)
const camera = require('./js/camera')(regl, {
    center: [0,0,0],
    distance: 4
})

const fbo = regl.framebuffer({
  color: regl.texture({
    width: 1,
    height: 1,
    wrap: 'clamp'
  }),
  depth: true
})

const drawScene = regl({
  framebuffer: fbo
})


const postprocess = regl({
  vert: glsl`
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = 0.5 * (position + 1.0);
    gl_Position = vec4(position, 0, 1);
  }`,

  frag: glsl`
  precision mediump float;
  varying vec2 uv;
  uniform sampler2D tex;
  void main() {
    gl_FragColor = texture2D(tex, uv);
    // gl_FragColor.rgb = 1.-gl_FragColor.rgb;
  }`,

  attributes: {
    position: [ -4, -4, 4, -4, 0, 4 ]
  },
  uniforms: {
    tex: ({count}) => fbo,
  },
  depth: { enable: false },
  count: 3
})

// console.log(animationData);
var animations = new BlenderHTML5Animations.ActionLibrary(animationData);

var elapsed = 0;
var cam = {
    position: [0,0,-4],
    target: [0,0,0]
}

var blenderSocket = new BlenderWebSocket();
blenderSocket.addListener('frame', function(frame)
{
    elapsed = frame / 24;
});
function xyz2xzy(a) { return [-a[0], a[2], a[1]]; }
blenderSocket.addListener('data', function(data)
{
    cam.position = xyz2xzy(data.Camera.location);
    cam.target = xyz2xzy(data.CameraTarget.location);
});

regl.frame(({deltaTime, viewportWidth, viewportHeight}) => {

    // var position = animations['CameraAction'].paths['location'].evaluate(elapsed);

    fbo.resize(viewportWidth, viewportHeight)
    
    drawScene({}, () => {
        regl.clear({
            color: [0, 0, 0, 255],
            depth: 1
        })
        camera(cam.position, cam.target, () => {
            neon({ time: regl.now() })
            // axis()
            // grid({ time: regl.now() })
            ground({ time: regl.now() })
            ground_lines({ time: regl.now() })
            tree({ time: regl.now() })
            // dust({ time: regl.now() })
        })
    })

    postprocess();
})