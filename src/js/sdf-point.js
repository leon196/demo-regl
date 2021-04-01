
const quad = require('./quad')
const glsl = x => x[0];

function sdfpoints (regl, dimension)
{
    const quads = quad({
        position: Array(dimension*dimension).fill().map(function (item, index) {
            const x = (index % dimension) / dimension;
            const y = Math.floor(index / dimension) / dimension;
            return [x, y, 0]
        }).flat()
    })

    return regl({
        vert:glsl`
        precision mediump float;
        attribute vec3 position;
        attribute vec2 anchor, quantity;
        
        uniform mat4 projection, view;
        uniform vec3 eye;
        uniform float time;
        uniform sampler2D sdfcolor, sdfposition;

        varying vec3 vColor;
        varying vec2 vUV;
        varying float vShape;

        mat2 rot (in float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

        // Dave Hoskins https://www.shadertoy.com/view/4djSRW
        float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
        vec2 hash21(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx+p3.yz)*p3.zy); }
        vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }

        float luminance(vec3 c) { return (c.r+c.g+c.b)/3.; }

        void main()
        {
            // color
            vColor = texture2D(sdfcolor, position.xy).rgb;

            // position
            vec3 p = texture2D(sdfposition, position.xy).rgb;

            // size
            float size = 0.01 + 0.04 * pow(hash11(quantity.y+145.), 10.0);

            // color fade out
            size *= smoothstep(0.0, 0.1, luminance(vColor));


            // orientation
            vec3 z = normalize(eye-p);
            vec3 x = normalize(cross(z, vec3(0,1,0)));
            vec3 y = normalize(cross(x, z));
            vec2 v = anchor * rot(quantity.x*6.28);
            p += (x * v.x - y * v.y) * size;

            // projection
            gl_Position = projection * view * vec4(p, 1);
            
            // varyings
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

            // color
            gl_FragColor = vec4(vec3(vColor), 1.0);
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
            time: regl.prop('time'),
            sdfcolor: regl.prop('sdfcolor'),
            sdfposition: regl.prop('sdfposition'),
        },
        cull: {
            enable: true,
            face: 'back'
        },
    })
}

module.exports = sdfpoints;