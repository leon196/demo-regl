

function Spray(regl) {
    
    // this.anims = require('./anims')
    this.random = require('../mesh/random')(regl)
    
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
    const init = () => { regl.clear({ color: [0, 0, 0, 1] }); this.random(); };
    for (var i = 0; i < 2; ++i) {
        this.fboColor[i].use(init);
        this.fboPosition[i].use(init);
        this.fboNormal[i].use(init);
    }

    this.regl = regl;
    this.uniforms = {
        frameColor: 0,
        framePosition: 0,
        frameNormal: 0,
    };
    this.tick = 0
}

Spray.prototype.draw = function() {

    var self = this;
    var regl = this.regl;

    // shared uniforms
    self.uniforms.frameColor = self.fboColor[this.tick%2];
    self.uniforms.framePosition = self.fboPosition[this.tick%2];
    self.uniforms.frameNormal = self.fboNormal[this.tick%2];

    // if (self.anims.ParameterPoints[2] > 0.5)
    // {
    //     // clear color fbos
    //     const init = () => { regl.clear({ color: [0, 0, 0, 1] }); self.random(); };
    //     for (var i = 0; i < 2; ++i) {
    //         this.fboColor[i].use(init);
    //         this.fboPosition[i].use(init);
    //         this.fboNormal[i].use(init);
    //     }
    // }

    // color buffer
    self.uniforms.mode = 0;
    self.fboColor[(this.tick+1)%2].use(() => {
        regl.clear({ color: [0, 0, 0, 1] })
        self.sdf(self.uniforms);
    })

    // position buffer
    self.uniforms.mode = 1;
    self.fboPosition[(this.tick+1)%2].use(() => {
        regl.clear({ color: [0, 0, 0, 1] })
        self.sdf(self.uniforms);
    })

    // normal buffer
    self.uniforms.mode = 2;
    self.fboNormal[(this.tick+1)%2].use(() => {
        regl.clear({ color: [0, 0, 0, 1] })
        self.sdf(self.uniforms);
    });

    // points
    self.sdfpoint(self.uniforms);
    
    // papillon
    // self.papillon(self.uniforms);

    // ticking
    this.tick = this.tick+1;
}

module.exports = Spray;