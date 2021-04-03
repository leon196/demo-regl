
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
const sdfdebug = require('./js/sdf-debug')(regl)
const Camera = require('./js/camera')
const Spray = require('./js/spray')

const camera = new Camera(storageKeys);
const spray = new Spray(regl)

var scene = regl({
    context: {
        time: function() {
            return regl.now()
        },

        resolution: function(context) {
        return [
            context.viewportWidth,
            context.viewportHeight]
        },
        
        projection: function (context) {
        return mat4.perspective([],
            Math.PI / 4,
            context.viewportWidth / context.viewportHeight,
            0.01,
            1000.0)
        },

        view: function (context, props) {
        return mat4.lookAt([],
            props.eye,
            props.target,
            [0, 1, 0])
        },

        ParameterKIF: [.8, 1.1, 1.8],
        ParameterPoints: [.05, 0.01, 1.8],
        transform: function(context) {
            const t = context.time * 0.2
            const r = 4
            const x = Math.cos(t) * r
            const y = Math.sin(t) * r
            return mat4.invert([], mat4.lookAt([], [x,1,y], [0,0,0], [0,1,0]))
        },
        colorHot: [1,1,0],
        colorCold: [1,0,0],
        offset: [0,0],
    },
    uniforms: {
        time: regl.context('time'),
        view: regl.context('view'),
        resolution: regl.context('resolution'),
        projection: regl.context('projection'),
    }
});

regl.frame(() => {
    camera.update()
    scene({
        eye: mat4.getTranslation([], camera.eye),
        target: [0,0,0],
    }, (context) => {
        
        Object.keys(storageKeys).forEach((key) => {
            localStorage.setItem(key, camera[key])
        })
        regl.clear({ color: [1, 1, 1, 1] })
        // debug({frame: spray.uniforms.frameColor})
        sdfdebug({
            transform: mat4.invert([], mat4.lookAt([], mat4.getTranslation([], camera.eye), [0,0,0], [0,1,0])),
            ParameterKIF: context.ParameterKIF,
        })
        axis()
        grid()
        spray.draw(context)
    })
})
