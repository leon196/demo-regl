

// document.getElementById("start").onclick = function()
// {
    const regl = require('regl')({
        extensions: 'OES_texture_float'
    })
    const glsl = x => x[0];
    const mat4 = require('gl-mat4')

    console.log(mat4);

    const axis = require('./js/axis')(regl)
    const grid = require('./js/grid')(regl)
    const anims = require('./js/animation')
    const sdfspray = require('./js/sdf-spray')(regl)
    const papillon = require('./js/papillon')(regl)
    // var audio = new Audio('music.mp3');
    // audio.play();

    var context = regl({
        context: {
            projection: function (context) {
            return mat4.perspective([],
                Math.PI / 4,
                context.viewportWidth / context.viewportHeight,
                0.01,
                1000.0)
            },

            view: function (context, props) {
                const from = anims.Camera;
                const to = anims.CameraTarget;
                return mat4.lookAt([],
                    from,
                    to,
                    [0, 1, 0])
            },
        },

        uniforms: Object.assign({}, {
            view: regl.context('view'),
            projection: regl.context('projection'),
            time: function() { return regl.now() },
            
        }, Object.keys(anims).reduce(function (uniforms, name) {
            uniforms[name] = anims[name];
            return uniforms;
            }, {})
        ), 
    });

    regl.frame(({deltaTime, viewportWidth, viewportHeight, tick}) => {
    
        // var position = anims['CameraAction'].paths['location'].evaluate(elapsed);
    
        // points
        context({}, () => {
            regl.clear({ color: [0, 0, 0, 255] })
            // grid()
            sdfspray(tick)
            papillon({Spot: anims.Spot})
        })
    })
// }
