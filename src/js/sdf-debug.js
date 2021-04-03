
const glsl = x => x[0];

module.exports = sdfdebug;

function sdfdebug(regl) {
    return regl({
        vert: glsl`

        precision mediump float;
        attribute vec2 uv;
        varying vec2 vUV;

        void main() {
            vUV = uv;
            gl_Position = vec4(vUV*2.-1., 0, 1);
        }`,

        frag: glsl`

        precision mediump float;
        varying vec2 vUV;
        uniform sampler2D frame;
        uniform vec2 resolution;
        uniform mat4 transform;
        `
        +
        require('./glsl-common')
        +
        require('./sdf-map')
        +
        glsl`

        void main() {
            gl_FragColor = vec4(0,0,0,1);

            vec2 viewport = (vUV*2.-1.);
            vec3 origin = (transform * vec4(0,0,0,1)).xyz;
            vec3 forward = (transform * vec4(0,0,-1,0)).xyz;
            vec3 ray = look(origin, forward, viewport);
            vec3 pos = origin;
            const int count = 30;
            for (int index = 0; index < count; ++index)
            {
                float dist = map(pos);
                if (dist < 0.001)
                {
                    float shade = float(count-index)/float(count);
                    gl_FragColor.rgb = vec3(shade);
                    break;
                }
                pos += ray * dist;
            }
        }`,

        attributes: {
            uv: [ 0,0, 1,0, 0,1, 1,1 ],
        },
        uniforms: {
            resolution: ({viewportWidth, viewportHeight}) => [viewportWidth, viewportHeight],
            transform: regl.prop('transform'),
            ParameterKIF: regl.prop('ParameterKIF'),
        },
        depth: { enable: false },
        primitive: 'triangle strip',
        count: 4
    })
}