
const quad = require('./quad')
const glsl = x => x[0];

function ground (regl)
{
    const count = 128*128;
    const range = 20.;
    const quads = quad({
        position: Array(count).fill().map(function (item, index) {
            const a = Math.random()*6.28;
            const r = Math.pow(Math.random(), 0.5);
            const x = Math.cos(a)*r;
            const z = Math.sin(a)*r;
            const y = Math.random();
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

        void main()
        {
            // size
            float size = 0.1 + 0.2 * pow(hash11(quantity.y), 10.0);

            // distribution
            vec3 seed = position;
            vec3 p = position;

            // orientation
            vec3 z = vec3(0,1,0);
            z.yx *= rot((quantity.x*2.-1.)*0.8);
            z.xz *= rot((quantity.x*2.-1.)*0.8);
            vec3 x = normalize(cross(z, vec3(0,1,0)));
            vec3 y = normalize(cross(x, z));
            vec2 v = anchor * rot(quantity.x*6.28);
            p += (x * v.x + y * v.y) * size;

            // projection
            gl_Position = projection * view * vec4(p, 1);
            
            // varyings
            vUV = anchor;
            vShape = floor(hash11(quantity.y+654.)*3.);
            vColor = 1.-vec3(0.75)*cos(vec3(0.5,1,2)*quantity.x*1.5);
        }
        `,
        frag:glsl`
        precision mediump float;
        varying vec3 vColor;
        varying vec2 vUV;
        varying float vShape;
        uniform float time;
        float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
        vec2 moda(vec2 p, float count) {
            float angle = 6.28/count;
            float a = atan(p.y, p.x) + angle/2.;
            a = mod(a,angle) - angle/2.;
            return vec2(cos(a), sin(a))*length(p);
        }
        void main()
        {
            // circle
            if (vShape == 0.0) {
                float dist = length(vUV);
                if (dist > 1.0) discard;
            }
            // triangle
            else if (abs(vShape-1.0) < 0.5) {
                vec2 p = moda(vUV, 3.);
                p.x -= 0.5;
                if (p.x > 0.) discard;
            }
            // else square

            // color
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