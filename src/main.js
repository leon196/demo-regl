const regl = require('regl')({
  extensions: 'OES_texture_float'
})
const glsl = x => x[0];

const BlenderWebSocket = require('./js/lib/BlenderWebSocket')
const BlenderHTML5Animations = require('./js/lib/blender-html5-animations.min')
const animationData = require('../blend/animation.json')
const neon = require('./js/neon')(regl)
const ground = require('./js/ground')(regl)
const ground_lines = require('./js/ground_lines')(regl)
const tree = require('./js/tree')(regl)
const sdf = require('./js/sdf')(regl)
const dust = require('./js/dust')(regl)
const axis = require('./js/axis')(regl)
const grid = require('./js/grid')(regl)
const camera = require('./js/camera')(regl, {
    center: [0,0,0],
    distance: 4
})

const dimension = 128;
const sdfpoint = require('./js/sdf-point')(regl, dimension)

const fboColor = regl.framebuffer({
    color: regl.texture({
        width: dimension,
        height: dimension,
        wrap: 'clamp'
    }),
    depthStencil: false
})

const fboPosition = regl.framebuffer({
    radius: dimension,
    colorType: 'float',
    depthStencil: false
})

// const drawColor = regl({
//   framebuffer: fboColor
// })


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
  uniform vec2 resolution;
  void main() {
    // vec3 edge = smoothstep(0.0, 1.0, edge(tex, uv, resolution/4.).rgb);
    vec3 color = texture2D(tex, uv).rgb;
    // color = smoothstep(0.3,0.6,color);
    // color -= edge;
    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor.rgb = 1.-gl_FragColor.rgb;
  }`,

  attributes: {
    position: [ -4, -4, 4, -4, 0, 4 ]
  },
  uniforms: {
    tex: ({count}) => fbo,
    resolution: ({viewportWidth, viewportHeight}) => [viewportWidth, viewportHeight],
  },
  depth: { enable: false },
  count: 3
})

// console.log(animationData);
var animations = new BlenderHTML5Animations.ActionLibrary(animationData);

var elapsed = 0;
var anims = {
    position: [0,0,-4],
    target: [0,0,0],
    spot: [0,0,0],
    spotTarget: [0,0,0],
}

var blenderSocket = new BlenderWebSocket();
blenderSocket.addListener('frame', function(frame)
{
    elapsed = frame / 24;
});
function xyz2xzy(a) { return [-a[0], a[2], a[1]]; }
function add(a, b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
blenderSocket.addListener('data', function(data)
{
    if (data.Camera !== undefined) anims.position = xyz2xzy(data.Camera.location);
    if (data.CameraTarget !== undefined) anims.target = xyz2xzy(data.CameraTarget.location);
    if (data.Spot !== undefined) anims.spot = xyz2xzy(data.Spot.location);
    if (data.SpotTarget !== undefined) anims.spotTarget = xyz2xzy(data.SpotTarget.location);
    // cam.r
    // console.log(data.Camera);
    // cam.target = xyz2xzy(data.CameraTarget.location);
});

regl.frame(({deltaTime, viewportWidth, viewportHeight}) => {

    // var position = anims['CameraAction'].paths['location'].evaluate(elapsed);

    // fboColor.resize(64,64)
    
    // drawScene({}, () => {
    //     regl.clear({
    //         color: [0, 0, 0, 255],
    //         depth: 1
    //     })
    //     camera(cam.position, cam.target, () => {
    //         neon({ time: regl.now() })
    //         // axis()
    //         // grid({ time: regl.now() })
    //         ground({ time: regl.now() })
    //         ground_lines({ time: regl.now() })
    //         tree({ time: regl.now() })
    //         // dust({ time: regl.now() })
    //     })
    // })

    fboColor.use(() => {
        regl.clear({ color: [0, 0, 0, 255] })
        camera(anims, () => {
            sdf({mode: 0, spot: anims.spot, spotTarget: anims.spotTarget});
        })
    })
    fboPosition.use(() => {
        regl.clear({ color: [0, 0, 0, 255] })
        camera(anims, () => {
            sdf({mode: 1, spot: anims.spot, spotTarget: anims.spotTarget});
        })
    })
    camera(anims, () => {
        regl.clear({ color: [0, 0, 0, 255] })
        axis()
        grid({ time: regl.now() })
        sdfpoint({
            sdfcolor: fboColor,
            sdfposition: fboPosition,
         });
    })
    // postprocess();
})