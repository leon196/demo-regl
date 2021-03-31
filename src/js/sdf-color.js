

const sdf = require('./sdf')
const glsl = x => x[0];

function sdfcolor (regl)
{
    return regl({
        vert: glsl`
        precision mediump float;
        attribute vec2 position;
        varying vec2 uv;
        void main() {
            uv = 0.5 * (position + 1.0);
            gl_Position = vec4(position, 0, 1);
        }`,

        frag: sdf,

        attributes: {
            position: [ -4, -4, 4, -4, 0, 4 ]
        },
        uniforms: {
            resolution: ({viewportWidth, viewportHeight}) => [viewportWidth, viewportHeight],
        },
        depth: { enable: false },
        count: 3
    });
}

module.exports = sdfcolor;