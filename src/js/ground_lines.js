
const quad = require('./quad')
const glsl = x => x[0];

function ground_lines (regl)
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

        mat2 rot (in float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

        // Dave Hoskins https://www.shadertoy.com/view/4djSRW
        float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
        vec2 hash21(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx+p3.yz)*p3.zy); }
        vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }

        void main() {
            vec3 seed = position;
            
            // size
            float size = 0.02;
            float len = 2.0 * pow(hash11(quantity.y), 2.0);

            // position
            vec2 xz = (hash21(quantity.y)*2.-1.)*20.;
            vec3 p = vec3(xz.x, 0, xz.y);

            vec2 nxz = xz + (hash21(quantity.y+375.)*2.-1.) * len;
            vec3 n = vec3(nxz.x, 0, nxz.y);


            // orientation
            // vec3 z = normalize(p-eye);
            // vec3 x = normalize(cross(z, vec3(0,1,0)));
            // vec3 y = normalize(cross(x, z));
            // vec2 v = anchor * rot(quantity.x*6.28);
            vec3 z = normalize(n-p);
            vec3 y = -normalize(cross(-normalize(p-eye), z));
            p = mix(p, n, anchor.x * 0.5 + 0.5);
            p += anchor.y * y * size;

            // projection
            gl_Position = projection * view * vec4(p, 1);

            // color
            vColor = 1.-vec3(0.75)*cos(vec3(0.5,1,2)*quantity.x*1.5);
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
        // cull: {
        //     enable: true,
        //     face: 'back'
        // },
    })
}

module.exports = ground_lines;