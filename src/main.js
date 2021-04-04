
const storageKeys = {
    rotX: 0,
    rotY: 0.5,
    distance : 10,
}

Object.keys(storageKeys).forEach((key) => {
    const item = localStorage.getItem(key)
    if (item !== undefined && item !== null) {
        var value = item.split(',').map(n => +n)
        if (value.length == 1) value = value[0]
        storageKeys[key] = value
    }
})

const regl = require('regl')({ extensions: 'OES_texture_float' })
const mat4 = require('gl-matrix').mat4
const axis = require('./mesh/axis')(regl)
const grid = require('./mesh/grid')(regl)
const debug = require('./mesh/debug')(regl)
const sdfdebug = require('./js/sdf-debug')(regl)
const Camera = require('./js/camera')
const Spray = require('./js/spray')

const camera = new Camera(storageKeys);
const spray = new Spray(regl)

var scene = regl({
    context: {
        view: (context, props) => { return mat4.lookAt([], mat4.getTranslation([], camera.eye), [0,0,0], [0, 1, 0]) },
        projection: (context) => { return mat4.perspective([], Math.PI / 4, context.viewportWidth / context.viewportHeight, 0.01, 1000.0) }
    },
    uniforms: {

        time: () => { return regl.now() },
        resolution: (context) => { return [ context.viewportWidth, context.viewportHeight ] },

        view: (context) => context.view,
        viewInvert: (context) => { return mat4.invert([], context.view) },
        projection: (context) => { return context.projection },
        projectionInvert: (context) => { return mat4.invert([], context.projection) },

        transform: (context) => {
            const t = context.time * 0.2
            const r = 3
            const x = Math.cos(t) * r
            const z = Math.sin(t) * r
            const y = 4
            return mat4.invert([], mat4.lookAt([], [x,y,z], [0,0,0], [0,1,0]))
        },

        colorHot: [1,1,0],
        colorCold: [1,0,0],
        offset: [0,0],

        ParameterKIF: [.8, 1.2, 1.8],
        ParameterPoints: [.01, 0.02, 0.01],
    }
});

regl.frame(() => {
    camera.update()
    scene(() => {
        
        Object.keys(storageKeys).forEach((key) => {
            localStorage.setItem(key, camera[key])
        })
        
        regl.clear({ color: [0, 0, 0, 1] })
        // axis()
        // grid()
        spray.draw()
        debug({ frame: spray.uniforms.frameColor, offset: [0,0] })
        debug({ frame: spray.uniforms.framePosition, offset: [0,1] })
        // sdfdebug()
    })
})
