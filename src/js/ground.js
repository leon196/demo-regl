
const quad = require('./quad')
const glsl = x => x[0];

function ground (regl)
{
    const count = 128*128;
    const range = 20.;
    const quads = quad({
        position: Array(count).fill().map(function (item, index) {
            const x = Math.random()*2.-1.;
            const y = Math.random();
            const z = Math.random()*2.-1.;
            return [x*range, y, z*range]
        }).flat()
    })

    return regl({
        vert:glsl`
        precision mediump float;
        attribute vec3 position;
        uniform mat4 projection, view;
        uniform vec3 eye;
        uniform float time;
        attribute vec2 anchor, quantity;
        varying vec3 vColor;
        varying vec2 vUV;
        varying float vShape;

        mat2 rot (in float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

        // Dave Hoskins https://www.shadertoy.com/view/4djSRW
        float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }

        void main() {
            float size = 0.1 + 0.2 * pow(hash11(quantity.y), 10.0);
            vec3 seed = position;
            float yy = sin(length(seed.xz)*.2)*0.2;
            vec3 p = vec3(seed.x, yy, seed.z);
            // p.xz = normalize(p.xz) * mod(hash11(quantity.y+67.) * 20. + time, 20.);
            // float d = length(p.xz);
            // float angle = sin(length(seed.xz) + sin(seed.x));
            // float anim = fract(d / 20.);
            // p.xz += vec2(cos(angle), sin(angle)) * anim;
            // vec3 z = normalize(p-eye);
            vec3 z = vec3(0,1,0);
            z.yx *= rot((quantity.x*2.-1.)*0.8);
            z.xz *= rot((quantity.x*2.-1.)*0.8);
            vec3 x = normalize(cross(z, vec3(0,1,0)));
            vec3 y = normalize(cross(x, z));
            vec2 v = anchor * rot(quantity.x*6.28);
            // size *= smoothstep(0.0, 0.1, anim) * smoothstep(1.0, 0.9, anim);
            p += (x * v.x + y * v.y) * size;
            // p.xz -= vec2(v.x, -v.y) * size;
            gl_Position = projection * view * vec4(p, 1);
            vColor = 1.-vec3(0.75)*cos(vec3(0.5,1,2)*quantity.x*1.5);
            // vColor *= (anchor.x*0.25+0.75);
            vUV = anchor;
            vShape = floor(hash11(quantity.y+654.)*3.);
        }
        `,
        frag:glsl`
        precision mediump float;
        varying vec3 vColor;
        varying vec2 vUV;
        varying float vShape;
        uniform float time;
        float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
        void main() {
            if (vShape == 0.0)
            {
                float dist = length(vUV);
                if (dist > 1.0) discard;
            }
            // if (hash12(vUV*100.+time) + dist * 2. > 1.5) discard;
            gl_FragColor = vec4(vColor, 1.0);
        }
        `,
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
        // cull: {
        //     enable: true,
        //     face: 'back'
        // },
    })
}

module.exports = ground;