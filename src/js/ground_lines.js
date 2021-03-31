
const quad = require('./quad')
const glsl = x => x[0];

function ground_lines (regl)
{
    const count = 32*32;
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
    }, [10, 1])

    return regl({
        vert:glsl`
        precision mediump float;
        attribute vec3 position;
        uniform mat4 projection, view;
        uniform vec3 eye;
        uniform float time;
        attribute vec2 anchor, quantity;
        varying vec3 vColor;

        mat2 rot (in float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

        // Dave Hoskins https://www.shadertoy.com/view/4djSRW
        float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
        vec2 hash21(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx+p3.yz)*p3.zy); }
        vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }

        vec3 curve (float t)
        {
            vec3 p = vec3(position.x, 0, position.z);
            vec2 offset = hash21(quantity.y+74.)*2.-1.;
            offset *= rot(t+time);
            p.xz += offset * (0.5+2.*pow(hash11(quantity.y+354.), 10.));
            return p;
        }

        void main() {
            vec3 seed = position;
            
            // size
            float size = 0.02;
            float len = 0.01+0.1 * pow(hash11(quantity.y), 2.0);

            // size *= sin((anchor.x*0.5+0.5)*3.14);

            // position
            // vec2 xz = (hash21(quantity.y)*2.-1.)*20.;
            // vec3 p = vec3(position.x, 0, position.z);
            vec3 p = curve(anchor.x);
            vec3 n = curve(anchor.x+len);

            // vec2 nxz = p.xz + (hash21(quantity.y+375.)*2.-1.) * len;
            // vec3 n = vec3(nxz.x, 0, nxz.y);

            // orientation
            vec3 z = normalize(n-p);
            vec3 y = -normalize(cross(-normalize(p-eye), z));
            // p = mix(p, n, anchor.x * 0.5 + 0.5);
            p -= anchor.y * y * size;

            // projection
            gl_Position = projection * view * vec4(p, 1);

            // color
            // vColor = vec3(1);
            vColor = vec3(0.5)+vec3(0.5)*cos(vec3(0,2,3)*(quantity.x+anchor.x*0.2)*1.5);
        }
        `,
        frag:glsl`
        precision mediump float;
        varying vec3 vColor;
        uniform float time;
        void main() {
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
        cull: {
            enable: true,
            face: 'back'
        },
    })
}

module.exports = ground_lines;