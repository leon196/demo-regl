

function Spray(regl) {
    
    const anims = require('./anims')
    
    // 128 * 128 points * 4 vertices = pow(2, 16) = 65536
    const dimension = 128;
    
    // 
    this.sdf = require('./sdf')(regl)
    this.sdfpoint = require('../mesh/point')(regl, dimension)
    this.sdfdebug = require('../mesh/debug')(regl)
    this.papillon = require('../mesh/papillon')(regl)

    // shared parameters
    const fboAttributes = {
        radius: dimension,
        colorType: 'float',
        depthStencil: false
    }

    // double fbos
    this.fboColor = [regl.framebuffer(fboAttributes), regl.framebuffer(fboAttributes)]
    this.fboPosition = [regl.framebuffer(fboAttributes), regl.framebuffer(fboAttributes)]
    this.fboNormal = [regl.framebuffer(fboAttributes), regl.framebuffer(fboAttributes)]

    // clear color fbos
    const init = () => { regl.clear({ color: [0, 0, 0, 255] }) };
    for (var i = 0; i < 2; ++i) {
        this.fboColor[i].use(init);
        this.fboPosition[i].use(init);
        this.fboNormal[i].use(init);
    }

    this.regl = regl;
}

Spray.prototype.draw = function(context, batchID) {

    const tick = context.tick;

    var self = this;
    var regl = this.regl;

    // shared uniforms
    var uniforms = Object.assign({}, context);

    uniforms.frameColor = self.fboColor[tick%2];
    uniforms.framePosition = self.fboPosition[tick%2];
    uniforms.frameNormal = self.fboNormal[tick%2];

    // color buffer
    uniforms.mode = 0;
    self.fboColor[(tick+1)%2].use(() => {
        regl.clear({ color: [0, 0, 0, 255] })
        self.sdf(uniforms);
    })

    // position buffer
    uniforms.mode = 1;
    self.fboPosition[(tick+1)%2].use(() => {
        regl.clear({ color: [0, 0, 0, 255] })
        self.sdf(uniforms);
    })

    // normal buffer
    uniforms.mode = 2;
    self.fboNormal[(tick+1)%2].use(() => {
        regl.clear({ color: [0, 0, 0, 255] })
        self.sdf(uniforms);
    });

    // points
    self.sdfpoint(uniforms);
    
    // papillon
    self.papillon(uniforms);

    // debug
    self.sdfdebug({frame: uniforms.frameColor, offset: [batchID, 0]});
}

module.exports = Spray;