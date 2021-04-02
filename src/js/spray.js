

function sdfspray(regl) {
    
    const anims = require('./anims')
    
    // 128 * 128 points * 4 vertices = pow(2, 16) = 65536
    const dimension = 128;
    
    // 
    const sdf = require('./sdf')(regl)
    const sdfpoint = require('../mesh/point')(regl, dimension)
    const sdfdebug = require('../mesh/debug')(regl)

    // shared parameters
    const fboAttributes = {
        radius: dimension,
        colorType: 'float',
        depthStencil: false
    }

    // double fbos
    const fboColor = [regl.framebuffer(fboAttributes), regl.framebuffer(fboAttributes)]
    const fboPosition = [regl.framebuffer(fboAttributes), regl.framebuffer(fboAttributes)]
    const fboNormal = [regl.framebuffer(fboAttributes), regl.framebuffer(fboAttributes)]

    // clear color fbos
    const init = () => { regl.clear({ color: [0, 0, 0, 255] }) };
    for (var i = 0; i < 2; ++i) {
        fboColor[i].use(init);
        fboPosition[i].use(init);
        fboNormal[i].use(init);
    }

    return (tick) => {

        // shared uniforms
        var uniforms = {
            mode: 0,
            frameColor: fboColor[tick%2],
            framePosition: fboPosition[tick%2],
            frameNormal: fboNormal[tick%2],
        };

        Object.keys(anims).forEach((key, index) => {
            uniforms[key] = anims[key];
        })

        // color buffer
        uniforms.mode = 0;
        fboColor[(tick+1)%2].use(() => {
            regl.clear({ color: [0, 0, 0, 255] })
            sdf(uniforms);
        })

        // position buffer
        uniforms.mode = 1;
        fboPosition[(tick+1)%2].use(() => {
            regl.clear({ color: [0, 0, 0, 255] })
            sdf(uniforms);
        })

        // normal buffer
        uniforms.mode = 2;
        fboNormal[(tick+1)%2].use(() => {
            regl.clear({ color: [0, 0, 0, 255] })
            sdf(uniforms);
        });

        // points
        sdfpoint(uniforms);

        // debug
        // sdfdebug({frame: uniforms.frameColor});
    }
}

module.exports = sdfspray;