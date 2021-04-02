

// document.getElementById("start").onclick = function()
// {
    const regl = require('regl')({
        extensions: 'OES_texture_float'
    })
    const glsl = x => x[0];
    const mat4 = require('gl-mat4')
    const axis = require('./mesh/axis')(regl)
    const grid = require('./mesh/grid')(regl)
    const cookie = require('./mesh/cookie')(regl)
    const anims = require('./js/anims')
    const Spray = require('./js/spray')
    const debug = require('./mesh/debug')(regl)
    const spray = new Spray(regl);
    const spray2 = new Spray(regl);
    // var audio = new Audio('music.mp3');
    // audio.play();
    var elapsed = 0;

    var scene = regl({
        context: {
            
            projection: function (context) {
            return mat4.perspective([],
                Math.PI / 3,
                context.viewportWidth / context.viewportHeight,
                0.01, 100.0)
            },

            view: function () {
                const from = anims.Camera;
                const to = anims.CameraTarget;
                return mat4.lookAt([], from, to, [0, 1, 0])
            },

            time: function() { return regl.now() },

        },

        uniforms: {
            view: regl.context('view'),
            projection: regl.context('projection'),
            time: regl.context('time'),
        }
    });

    regl.frame(() => {
        scene((context) => {
            const dt = Math.max(0, Math.min(1, regl.now() - elapsed));
            anims.update(2 * dt);
            elapsed = regl.now();
            Object.keys(anims).forEach((key) => context[key] = anims[key] )
            regl.clear({ color: [0, 0, 0, 255] })

            // axis(context)
            // grid(context)
            spray.draw(Object.assign({}, context, {
                transform: mat4.invert([], mat4.lookAt([], anims.PapillonBleu, anims.PapillonBleuTarget, [0,1,0])),
                offset: [0,0],
                colorHot: [0,1,0],
                colorCold: [0.5,0,1],
            }))
            spray2.draw(Object.assign({}, context, {
                transform: mat4.invert([], mat4.lookAt([], anims.PapillonRouge, anims.PapillonRougeTarget, [0,1,0])),
                offset: [1,0],
                colorHot: [1,1,0],
                colorCold: [1,0,0.5],
            }))

            // cookie(Object.assign({}, context, {
            //     transform: mat4.invert([], mat4.lookAt([], anims.Cookie, anims.CookieTarget, [0,1,0])),
            // }));

            // debug
            // debug({frame: spray.uniforms.frameColor, offset: [0, 0]});
            // debug({frame: spray2.uniforms.frameColor, offset: [1, 0]});
            // debug({frame: spray.uniforms.framePosition, offset: [1, 0]});
            // debug({frame: spray.uniforms.frameNormal, offset: [2, 0]});
        })
    })
// }
