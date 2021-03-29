
const quad = require('./quad');
const glsl = x => x[0];

function neon (regl)
{
    const count = 40;
    const subdivisions = [100, 1];
    const quads = quad({
        position: Array(count).fill().map(function (item, index) {
            const x = Math.random()*2-1;
            const y = Math.random()*2-1;
            const z = Math.random()*2-1;
            return [x, y, z]
        }).flat()
    }, subdivisions)

    return regl({
        vert:glsl`
        precision mediump float;
        attribute vec3 position;
        attribute vec2 anchor, quantity;
        uniform mat4 projection, view;
        uniform vec3 eye;
        uniform float time;
        varying vec2 uv;
        varying vec3 world;
        varying float offset;

        mat2 rot (in float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

        vec3 curve (in vec3 p, in float offset)
        {
            p.y *= 0.1;
            p.xz = normalize(p.xz) * (0.5+0.5*length(p.xz));
            float angle = quantity.x+anchor.x*3.+offset;
            // p.xy *= rot(angle);
            p.xz *= rot(angle);
            float lod = 1.5;
            float t = floor(cos(angle)*lod)/lod;
            p.y += t * 0.1;
            return p;
        }

        void main() {
            float thin = 0.01;
            vec3 p = curve(position, 0.0);
            vec3 n = curve(position, 0.01);
            vec3 z = normalize(n-p);
            vec3 y = -normalize(cross(-normalize(p-eye), z));
            p += y * anchor.y * thin;
            // p.y += anchor.y * thin;
            gl_Position = projection * view * vec4(p, 1);
            uv = anchor * 0.5 + 0.5;
            world = p;
            offset = quantity.x;
        }
        `,
        frag:glsl`
        precision mediump float;
        varying float offset;
        varying vec2 uv;
        varying vec3 world;
        uniform vec3 eye;
        uniform float time;
        void main() {
            if (sin(time-(uv.x+offset)*6.28) < 0.0) discard;
            // float d = length(eye-world);
            // d = smoothstep(6.0, 2.0, d);
            // gl_FragColor = vec4(vec3(d), 1);
            // float d = abs(uv.y*2.-1.);
            // float neon = (1.-d)*0.1/d;
            // vec3 tint = vec3(1, 0.772, 0.360);
            vec3 tint = vec3(0.5)+vec3(0.5)*cos(vec3(1,2,3)*uv.x*2.);
            gl_FragColor = vec4(tint,1.);
        }
        `,
        // depth: {
        //     enable: false,
        // },
        // blend: {
        //     enable: true,
        //     func: {
        //         srcRGB: 'one',
        //         srcAlpha: 1,
        //         dstRGB: 'one',
        //         dstAlpha: 1
        //         // srcRGB: 'src alpha',
        //         // srcAlpha: 1,
        //         // dstRGB: 'one minus src alpha',
        //         // dstAlpha: 1
        //     },
        //     equation: {
        //     rgb: 'add',
        //     alpha: 'add'
        //     },
        //     color: [0, 0, 0, 0]
        // },
        attributes: {
            position: quads[0].position,
            anchor: quads[0].anchor,
            quantity: quads[0].quantity,
        },
        elements: regl.elements({
            primitive: 'triangles',
            data: new Uint16Array(quads[0].indices.data),
        }),
        uniforms: {
            time: regl.prop('time')
        },
    })
}

module.exports = neon;