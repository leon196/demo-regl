

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

        uniform vec3 ParameterKIF;
        uniform mat4 transform;
        uniform float time;
        uniform int mode;
        uniform vec2 resolution;
        uniform sampler2D frameColor, framePosition, frameNormal;
        uniform vec3 colorHot, colorCold;

        varying vec2 uv;

        mat2 rot (in float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

        // Dave Hoskins https://www.shadertoy.com/view/4djSRW
        float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
        float hash12(vec2 p) { vec3 p3  = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
        vec2 hash21(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx+p3.yz)*p3.zy); }
        vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
        vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }
        vec3 hash32(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yxz+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }

        vec3 look (vec3 eye, vec3 target, vec2 anchor) {
            vec3 forward = normalize(target-eye);
            vec3 right = normalize(cross(forward, vec3(0,1,0)));
            vec3 up = normalize(cross(right, forward));
            return normalize(forward + right * anchor.x + up * anchor.y);
        }

        float map(vec3 p)
        {
            float dist = 100.;
            vec3 p0 = p;

            const int count = 2;
            float radius = ParameterKIF.x;
            float range = ParameterKIF.y;
            float falloff = ParameterKIF.z;

            float a = 1.0;
            for (int index = 0; index < count; ++index)
            {
                p.xz *= rot(1.0/a);
                p.yz *= rot(1.0/a);
                p.xz = abs(p.xz) - range*a;
                dist = min(dist, length(p)-radius*a);
                a /= falloff;
            }

            dist = abs(dist)-0.01;

            dist = min(dist, p0.y);

            return dist;
        }

        // NuSan https://www.shadertoy.com/view/3sBGzV
        vec3 getNormal(vec3 p) {
            vec2 off=vec2(0.001,0);
            return normalize(map(p)-vec3(map(p-off.xyy), map(p-off.yxy), map(p-off.yyx)));
        }

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
                uvp += (hash22(uv.xy*200.)*2.0-1.0)*0.5;
                vec2 viewport = (uvp*2.-1.);//*vec2(resolution.x/resolution.y,1.0);
                vec3 ray = look(origin, vec3(0), viewport);
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
                            gl_FragColor.rgb = color * 0.5;
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
            lifetime += 0.001 + 0.01 * hash12(uv*100.);
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
            frameColor: regl.prop('frameColor'),
            framePosition: regl.prop('framePosition'),
            frameNormal: regl.prop('frameNormal'),
        },
        depth: { enable: false },
        count: 3
    });
}

module.exports = sdf;