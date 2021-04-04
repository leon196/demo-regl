
const quad = require('../js/quad')
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
        
        uniform mat4 projection, view, transform;
        uniform vec3 ParameterPoints;
        uniform float time;
        uniform sampler2D frameColor, framePosition, frameNormal;

        varying vec3 vColor;
        varying vec2 vUV;
        varying float vShape;
        
        `
        +
        require('../js/glsl-common')
        +
        glsl`

        float luminance(vec3 c) { return (c.r+c.g+c.b)/3.; }

        void main()
        {
            // uv
            vec2 uv = position.xy;

            // jitter
            // uv += (hash22(position.xy*200.)*2.0-1.0)*0.01;

            vec3 origin = (transform * vec4(0,0,0,1)).xyz;

            // attributes
            vec4 color = texture2D(frameColor, uv);
            vec4 pos = texture2D(framePosition, uv);
            vec4 normal = texture2D(frameNormal, uv);

            vec3 n = normal.rgb;
            vec3 p = pos.rgb;
            float lifetime = color.a;
            float depth = pos.a;
            vColor = color.rgb;

            // p = mix(origin, p, pow(lifetime, 0.1));

            // size
            float size = ParameterPoints.x + ParameterPoints.y * pow(hash13(p*145.), 10.0) + ParameterPoints.z * depth;

            // color fade out
            size *= smoothstep(0.0, 0.1, luminance(vColor));

            // lifetime fade out
            // size *= pow(sin(lifetime*3.14), 0.1);

            // orientation
            vec3 z = n+.001;//normalize(eye-p);
            vec3 x = normalize(cross(z, vec3(0,1,0)));
            vec3 y = normalize(cross(x, z));
            vec2 v = anchor * rot(quantity.x*6.28);
            p += (x * v.x - y * v.y) * size;

            // projection
            gl_Position = projection * view * vec4(p, 1);
            gl_Position.z += hash11(quantity.y)*0.01;
            
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
            // // circle
            // if (vShape == 0.0) {
            //     float dist = length(vUV);
            //     if (dist > 1.0) discard;
            // }
            // // triangle
            // else if (abs(vShape-1.0) < 0.5) {
            //     vec2 p = moda(vUV, 3.);
            //     p.x -= 0.5;
            //     if (p.x > 0.) discard;
            // }

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
            frameColor: regl.prop('frameColor'),
            framePosition: regl.prop('framePosition'),
            frameNormal: regl.prop('frameNormal'),
        },
        cull: {
            enable: true,
            face: 'back'
        },
    })
}

module.exports = sdfpoints;