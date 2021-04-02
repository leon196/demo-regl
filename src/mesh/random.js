
const glsl = x => x[0];

function random(regl) {
    return regl({
        vert: glsl`
        precision mediump float;
        attribute vec2 position;
        varying vec2 uv;
        void main() {
            uv = 0.5 * (position + 1.0);
            gl_Position = vec4(position, 0, 1);
        }`,

        frag: glsl`
        precision mediump float;
        varying vec2 uv;
        uniform sampler2D frame;
        uniform vec2 resolution;
        float hash12(vec2 p) { vec3 p3  = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
        void main() {
            gl_FragColor = vec4(0,0,0,hash12(uv*1000.));
        }`,

        attributes: {
            position: [ -4, -4, 4, -4, 0, 4 ]
        },
        depth: { enable: false },
        count: 3
        })
    }

module.exports = random;