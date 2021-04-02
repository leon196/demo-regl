
const quad = require('../js/quad');
const glsl = x => x[0];

function papillon(regl)
{
    const quads = quad({ position: [0,0,0] }, [ 10, 10 ])

    return regl({

        vert:glsl`
        precision mediump float;
        
        attribute vec3 position;
        attribute vec2 anchor, quantity;
        
        uniform mat4 projection, view;
        uniform float time;
        uniform mat4 transform;

        varying vec2 uv;

        mat2 rot (in float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

        mat4 rotationMatrix(vec3 axis, float angle) {
            axis = normalize(axis);
            float s = sin(angle);
            float c = cos(angle);
            float oc = 1.0 - c;
            return mat4(oc*axis.x*axis.x + c, oc*axis.x*axis.y - axis.z*s, oc*axis.z*axis.x + axis.y*s, 0.0,
                        oc*axis.x*axis.y + axis.z*s, oc*axis.y*axis.y + c, oc*axis.y*axis.z - axis.x*s, 0.0,
                        oc*axis.z*axis.x - axis.y*s, oc*axis.y*axis.z + axis.x*s, oc*axis.z*axis.z + c, 0.0,
                        0.0, 0.0, 0.0, 1.0);
        }

        void main() {
            vec3 p = (transform * vec4(position, 1)).xyz;

            // p += transform;


            float size = 0.5;
            float speed = 10.0;
            
            // orientation
            vec3 z = normalize(vec3(0,0,1));
            z = (transform * vec4(z, 0)).xyz;
            vec3 x = normalize(cross(z, vec3(0,1,0)));
            vec3 y = normalize(cross(x, z));
            vec2 v = anchor;

            // waving wings
            x = (rotationMatrix(y, sin(time*sign(anchor.x)*speed-anchor.x)) * vec4(x, 0)).xyz;

            // jiggle
            p.y += sin(time * speed) * 0.1;

            // horizontal shape
            v.x += ((sin(v.y * 2. + 3.)) * sign(v.x)) * abs(v.x) * 0.25;

            // vertical shape
            // v.y += sin(abs(anchor.x*3.)+2.) * 0.25 * abs(v.x);

            // shrink shape
            v.y *= 0.25+0.75*abs(anchor.x);

            p += (x * v.x - y * v.y) * size;

            gl_Position = projection * view * vec4(p, 1);
            uv = anchor;// * 0.5 + 0.5;
        }
        `,

        frag:glsl`
        precision mediump float;
        varying vec2 uv;
        uniform float time;
        uniform vec3 colorHot, colorCold;
        
        void main() {
            vec3 color = mix(colorHot, colorCold, pow(abs(uv.x), 0.5));
            // color *= abs(uv.x)*0.5+0.5;
            color *= smoothstep(0.9, 0.5, abs(uv.x));
            color = mix(color, vec3(1), smoothstep(0.9, 1.0, abs(uv.x)));
            gl_FragColor = vec4(color, 1);
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
            colorHot: regl.prop('colorHot'),
            colorCold: regl.prop('colorCold'),
        }
    })
}

module.exports = papillon;