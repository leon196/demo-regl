
const glsl = x => x[0];

function debug(regl) {
    return regl({
        vert: glsl`
        precision mediump float;
        attribute vec2 uv;
        uniform vec2 resolution;//, offset;
        varying vec2 vUV;
        void main() {
            vUV = uv;
            vec2 p = uv;
            // p += offset;
            // p.x *= resolution.y/resolution.x;
            // p = p*0.5-1.0;
            gl_Position = vec4(p*2.-1., 0, 1);
        }`,

        frag: glsl`
        precision mediump float;
        varying vec2 vUV;
        uniform sampler2D frame;
        uniform vec2 resolution;
        void main() {
            vec3 color = texture2D(frame, vUV).rga;
            gl_FragColor = vec4(color, 1.0);
        }`,

        attributes: {
            uv: [ 0,0, 1,0, 0,1, 1,1 ],
        },
        uniforms: {
            frame: regl.prop('frame'),
            // offset: regl.prop('offset'),
            resolution: ({viewportWidth, viewportHeight}) => [viewportWidth, viewportHeight],
        },
        depth: { enable: false },
        primitive: 'triangle strip',
        count: 4
        })
    }

module.exports = debug;