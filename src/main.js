const regl = require('regl')({
  extensions: 'OES_texture_float'
})
const glsl = x => x[0];

const sdf = require('./js/sdf')(regl)
const axis = require('./js/axis')(regl)
const grid = require('./js/grid')(regl)
const anims = require('./js/animation')
const camera = require('./js/camera')(regl, {
    center: [0,0,0],
    distance: 4
})

const dimension = 128;
const sdfpoint = require('./js/sdf-point')(regl, dimension)

const fboColor = Array(2).fill().map(() =>
    regl.framebuffer({
        color: regl.texture({
            width: dimension,
            height: dimension,
            wrap: 'clamp'
        }),
        depthStencil: false
    }))

const fboPosition = Array(2).fill().map(() =>
    regl.framebuffer({
        radius: dimension,
        colorType: 'float',
        depthStencil: false
    }))

// const drawColor = regl({
//   framebuffer: fboColor
// })

// {tick}) => SPRITES[(tick) % 2]

for (var i = 0; i < 2; ++i) {
    fboColor[i].use(() => {
        regl.clear({ color: [0, 0, 0, 255] })
    });
    fboPosition[i].use(() => {
        regl.clear({ color: [0, 0, 0, 255] })
    });
}

regl.frame(({deltaTime, viewportWidth, viewportHeight, tick}) => {

    // var position = anims['CameraAction'].paths['location'].evaluate(elapsed);

    var uniforms = {
        mode: 0,
        spot: anims.spot,
        spotTarget: anims.spotTarget,
        frameColor: fboColor[tick%2],
        framePosition: fboPosition[tick%2],
    };

    fboColor[(tick+1)%2].use(() => {
        regl.clear({ color: [0, 0, 0, 255] })
        camera(anims, () => {
            sdf(uniforms);
        })
    })

    uniforms.mode = 1;

    fboPosition[(tick+1)%2].use(() => {
        regl.clear({ color: [0, 0, 0, 255] })
        camera(anims, () => {
            sdf(uniforms);
        })
    })
    camera(anims, () => {
        regl.clear({ color: [0, 0, 0, 255] })
        axis()
        grid({ time: regl.now() })
        sdfpoint(uniforms);
    })
})