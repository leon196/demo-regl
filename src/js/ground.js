
const quad = require('./quad')
const glsl = x => x[0];

function ground (regl)
{
    const count = 128*128;
    const quads = quad({
        position: Array(count).fill().map(function (item, index) {
            const x = Math.random();
            const y = Math.random();
            const z = Math.random();
            return [x, y, z]
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

        void main() {
            float size = 0.1;
            vec3 seed = position*2.-1.;
            seed.xz *= 10.;
            float yy = sin(length(seed.xz))*0.1;
            vec3 p = vec3(seed.x, yy, seed.z);
            // vec3 z = normalize(p-eye);
            // vec3 x = normalize(cross(z, vec3(0,1,0)));
            // vec3 y = normalize(cross(x, z));
            // p += (x * anchor.x + y * anchor.y) * size;
            vec2 v = anchor * rot(quantity.x*6.28);
            p.xz -= vec2(v.x, -v.y) * size;
            gl_Position = projection * view * vec4(p, 1);
            vColor = vec3(0.5)+vec3(0.5)*cos(vec3(1,3,2)*quantity.x);
            // vColor *= (anchor.x*0.25+0.75);
        }
        `,
        frag:glsl`
        precision mediump float;
        varying vec3 vColor;
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

module.exports = ground;