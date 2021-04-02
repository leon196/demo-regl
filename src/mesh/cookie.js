


const quad = require('../js/quad');
const glsl = x => x[0];

function cookie(regl)
{
    const quads = quad({ position: [0,0,0] }, [ 1000, 1 ])

    return regl({

        vert:glsl`
        precision mediump float;
        
        attribute vec3 position;
        attribute vec2 anchor, quantity;
        
        uniform mat4 projection, view;
        uniform float time;
        uniform mat4 transform;
        uniform vec2 offset;

        varying vec2 uv;

        mat2 rot (in float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }
        
        vec2 cookie(float t) {
            return vec2(0.08 + cos(t - 1.58) * 0.23 + cos(t * 2.-1.24) * 0.14 + cos(t * 3.-1.12) * 0.09 + cos(t * 4.-0.76) * 0.06 + cos(t * 5.-0.59) * 0.05 + cos(t * 6.+0.56) * 0.03 + cos(t * 7.-2.73) * 0.03 + cos(t * 8.-1.26) * 0.02 + cos(t * 9.-1.44) * 0.02 + cos(t * 10. - 2.09) * 0.03 + cos(t * 11. - 2.18) * 0.01 + cos(t * 12. - 1.91) * 0.02, cos(3.14) * 0.05 + cos(t + 0.35) * 0.06 + cos(t * 2.+0.54) * 0.09 + cos(t * 3.+0.44) * 0.03 + cos(t * 4.+1.02) * 0.07 + cos(t * 6.+0.39) * 0.03 + cos(t * 7.-1.48) * 0.02 + cos(t * 8.-3.06) * 0.02 + cos(t * 9.-0.39) * 0.07 + cos(t * 10. - 0.39) * 0.03 + cos(t * 11. - 0.03) * 0.04 + cos(t * 12. - 2.08) * 0.02);
        }

        void main() {
            vec3 p = (transform * vec4(position, 1)).xyz;

            float c = anchor.x * 3.14;

            vec2 t = cookie(c) * 10.;

            float size = 0.1;
            float speed = 10.0;
            
            // orientation
            vec3 z = normalize(vec3(0,0,1));
            z = (transform * vec4(z, 0)).xyz;
            vec3 x = normalize(cross(z, vec3(0,1,0)));
            vec3 y = normalize(cross(x, z));
            vec2 v = anchor;
            

            // p += t * 10.;

            p += (x * t.x + y * t.y);
            p += y * anchor.y * size;

            gl_Position = projection * view * vec4(p, 1);
            uv = anchor;
        }
        `,

        frag:glsl`
        precision mediump float;
        varying vec2 uv;
        uniform float time;
        uniform vec3 colorHot, colorCold;
        
        void main() {
            gl_FragColor = vec4(1);
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
            transform: regl.prop('transform'),
        }
    })
}

module.exports = cookie;