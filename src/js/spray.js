

function Spray(regl) {
    
    const anims = require('./anims')
    const random = require('../mesh/random')(regl)
    
    // 128 * 128 points * 4 vertices = pow(2, 16) = 65536
    const dimension = 128;
    
    // 
    this.sdf = require('./sdf')(regl)
    this.sdfpoint = require('../mesh/point')(regl, dimension)
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
    const init = () => { regl.clear({ color: [0, 0, 0, 1] }); random(); };
    for (var i = 0; i < 2; ++i) {
        this.fboColor[i].use(init);
        this.fboPosition[i].use(init);
        this.fboNormal[i].use(init);
    }

    this.regl = regl;
    this.uniforms = {};
}

Spray.prototype.draw = function(context) {

    const tick = context.tick;

    var self = this;
    var regl = this.regl;

    // shared uniforms
    self.uniforms = Object.assign({}, context);

    self.uniforms.frameColor = self.fboColor[tick%2];
    self.uniforms.framePosition = self.fboPosition[tick%2];
    self.uniforms.frameNormal = self.fboNormal[tick%2];

    // color buffer
    self.uniforms.mode = 0;
    self.fboColor[(tick+1)%2].use(() => {
        regl.clear({ color: [0, 0, 0, 1] })
        self.sdf(self.uniforms);
    })

    // position buffer
    self.uniforms.mode = 1;
    self.fboPosition[(tick+1)%2].use(() => {
        regl.clear({ color: [0, 0, 0, 1] })
        self.sdf(self.uniforms);
    })

    // normal buffer
    self.uniforms.mode = 2;
    self.fboNormal[(tick+1)%2].use(() => {
        regl.clear({ color: [0, 0, 0, 1] })
        self.sdf(self.uniforms);
    });

    // points
    self.sdfpoint(self.uniforms);
    
    // papillon
    self.papillon(self.uniforms);
}

module.exports = Spray;