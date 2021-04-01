const regl = require('regl')({
  extensions: 'OES_texture_float'
})
const glsl = x => x[0];

const axis = require('./js/axis')(regl)
const grid = require('./js/grid')(regl)
const anims = require('./js/animation')
const sdfspray = require('./js/sdf-spray')(regl)
const camera = require('./js/camera')(regl, {
    center: [0,0,0],
    distance: 4
})

regl.frame(({deltaTime, viewportWidth, viewportHeight, tick}) => {

    // var position = anims['CameraAction'].paths['location'].evaluate(elapsed);

    // points
    camera(anims, () => {
        regl.clear({ color: [0, 0, 0, 255] })
        // axis()
        grid({ time: regl.now() })
        sdfspray(tick)
    })
})