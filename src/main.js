

// document.getElementById("start").onclick = function()
// {
    const regl = require('regl')({
        extensions: 'OES_texture_float'
    })
    const glsl = x => x[0];
    const mat4 = require('gl-mat4')

    const axis = require('./mesh/axis')(regl)
    const grid = require('./mesh/grid')(regl)
    const papillon = require('./mesh/papillon')(regl)
    const anims = require('./js/anims')
    const sdfspray = require('./js/spray')(regl)
    // var audio = new Audio('music.mp3');
    // audio.play();

    var scene = regl({
        context: Object.assign({}, {
            
            projection: function (context) {
            return mat4.perspective([],
                Math.PI / 4,
                context.viewportWidth / context.viewportHeight,
                0.01, 100.0)
            },

            view: function () {
                const from = anims.Camera;
                const to = anims.CameraTarget;
                return mat4.lookAt([], from, to, [0, 1, 0])
            },

            time: function() { return regl.now() },

        }, Object.keys(anims).reduce(function (uniforms, name) {
            uniforms[name] = anims[name];
            return uniforms;
            }, {})
        ),

        uniforms: {
            view: regl.context('view'),
            projection: regl.context('projection'),
            time: regl.context('time'),
        }
    });

    regl.frame(() => {
        scene((context) => {
            Object.keys(anims).forEach((key) => context[key] = anims[key] )
            regl.clear({ color: [0, 0, 0, 255] })
            sdfspray(context)
            papillon(context)
        })
    })
// }
