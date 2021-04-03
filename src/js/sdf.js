

const glsl = x => x[0];

function sdf (regl)
{
    return regl({
        vert: glsl`
        precision mediump float;
        attribute vec2 position;
        varying vec2 uv;
        void main() {
            uv = 0.5 * (position + 1.0);
            gl_Position = vec4(position, 0, 1);
        }`,

        frag: glsl`

        precision mediump float;

        const int mode_color = 0;
        const int mode_position = 1;
        const int mode_normal = 2;

        uniform vec3 ParameterPoints;
        uniform mat4 transform;
        uniform float time;
        uniform int mode;
        uniform vec2 resolution;
        uniform sampler2D frameColor, framePosition, frameNormal;
        uniform vec3 colorHot, colorCold;

        varying vec2 uv;`
        +
        require('./glsl-common')
        +
        require('./sdf-map')
        +
        glsl`

        void main()
        {

            // previous state
            if (mode == mode_color)
                gl_FragColor = texture2D(frameColor, uv);
            else if (mode == mode_position)
                gl_FragColor = texture2D(framePosition, uv);
            else // if (mode == mode_normal)
                gl_FragColor = texture2D(frameNormal, uv);

            // spawn
            float lifetime = texture2D(framePosition, uv).a;
            if (lifetime > 1.0)
            {
                gl_FragColor.rgb = vec3(0);
                vec3 origin = (transform * vec4(0,0,0,1)).xyz;
                // raymarching
                vec2 uvp = uv;
                uvp += (hash22(uv.xy*200.)*2.0-1.0)*0.1;
                vec2 viewport = (uvp*2.-1.);//*vec2(resolution.x/resolution.y,1.0);
                // viewport = normalize(viewport) * pow(length(viewport), 100.);
                vec3 forward = (transform * vec4(0,0,-1,0)).xyz;
                vec3 ray = look(origin, forward, viewport);
                // vec3 ray = normalize(hash32(viewport*1000.+time)*2.-1.);
                vec3 pos = origin;
                vec3 color = vec3(0);
                const int count = 30;
                for (int index = 0; index < count; ++index)
                {
                    float dist = map(pos);
                    if (dist < 0.001)
                    {
                        vec3 normal = getNormal(pos);
                        if (mode == mode_color)
                        {
                            float shade = float(count-index)/float(count);
                            color = colorCold * shade;
                            color += colorHot * pow(clamp(dot(normal, normalize(origin-pos)), 0., 1.), 10.);
                            gl_FragColor.rgb = color;// * 0.5;
                        }
                        else if (mode == mode_position)
                        {
                            gl_FragColor.rgb = pos;
                        }
                        else // if (mode == mode_normal)
                        {
                            gl_FragColor.rgb = normal;
                        }
                        break;
                    }
                    pos += ray * dist;
                }
                lifetime = 0.0;
            }
            lifetime += 0.001 + ParameterPoints.y * hash12(uv*100.);
            gl_FragColor.a = lifetime;
        }
        `,
        attributes: {
            position: [ -4, -4, 4, -4, 0, 4 ]
        },
        uniforms: {
            resolution: ({viewportWidth, viewportHeight}) => [viewportWidth, viewportHeight],
            mode: regl.prop('mode'),
            transform: regl.prop('transform'),
            colorHot: regl.prop('colorHot'),
            colorCold: regl.prop('colorCold'),
            ParameterKIF: regl.prop('ParameterKIF'),
            ParameterPoints: regl.prop('ParameterPoints'),
            frameColor: regl.prop('frameColor'),
            framePosition: regl.prop('framePosition'),
            frameNormal: regl.prop('frameNormal'),
        },
        depth: { enable: false },
        count: 3
    });
}

module.exports = sdf;