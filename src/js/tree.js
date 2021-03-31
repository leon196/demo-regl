
const quad = require('./quad')
const glsl = x => x[0];

function tree (regl)
{
    const count = 12*12;
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
    }, [1, 20])

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

        vec3 curve(float t)
        {
            float id = ceil(quantity.y/8.);
            // vec2 xz = (hash21(id)*2.-1.)*20.;
            float angle = hash11(id)*6.28;
            float radius = pow(hash11(id+457.), 0.5) * 20.;
            vec3 p = vec3(cos(angle), 0, sin(angle)) * radius;
            vec3 offset = hash31(quantity.y+357.)*2.-1.;
            offset.xz *= rot(t*3.);
            offset.yx *= rot(t*3.);
            offset.yz *= rot(t*3.);
            float yy = anchor.y*0.5+0.5;
            float height = 1.5+4.5 * pow(hash11(quantity.y), 2.0);
            p.y += t * height;
            p += offset * yy * 0.5;
            // p.xz += offset.xz * yy * sin(length(p.xz) * 0.5 - time + yy*3.);
            return p;
        }

        void main()
        {
            vec3 seed = position;
            
            // parameters
            float size = 0.1;

            // fade size
            float yy = anchor.y*0.5+0.5;
            size *= smoothstep(1.5, 0.0, yy);

            // position
            vec3 p = curve(yy);
            vec3 n = curve(yy+0.1);
            // float id = ceil(quantity.y/4.);
            // vec2 xz = (hash21(id)*2.-1.)*20.;
            // vec3 p = vec3(xz.x, 0, xz.y);

            // vec2 nxz = p.xz + (hash21(quantity.y+375.)*2.-1.);
            // vec3 n = vec3(nxz.x, height, nxz.y);
            // n.x += sin(anchor.y * 4. + quantity.x * 6.28) * yy * spread;

            // orientation
            vec3 z = normalize(n-p);
            vec3 y = -normalize(cross(-normalize(p-eye), z));
            p = mix(p, n, anchor.y * 0.5 + 0.5);
            p += anchor.x * y * size;

            // projection
            gl_Position = projection * view * vec4(p, 1);

            // color
            // vColor = vec3(1);
            vColor = vec3(0.5)+vec3(0.5)*cos(vec3(0,1,3)*(hash11(quantity.y+45.)-anchor.y)*1.5);
            // vColor *= pow(yy,0.5);
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

module.exports = tree;