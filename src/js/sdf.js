
const glsl = x => x[0];

module.exports = glsl`

precision mediump float;

uniform vec3 eye;
uniform float time;
uniform vec2 resolution;
varying vec2 uv;

mat2 rot (in float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
float hash11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
vec2 hash21(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx+p3.yz)*p3.zy); }
vec3 hash31(float p) { vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx+33.33); return fract((p3.xxy+p3.yzz)*p3.zyx); }

vec3 look (vec3 eye, vec3 target, vec2 anchor) {
    vec3 forward = normalize(target-eye);
    vec3 right = normalize(cross(forward, vec3(0,1,0)));
    vec3 up = normalize(cross(right, forward));
    return normalize(forward + right * anchor.x + up * anchor.y);
}

float map(vec3 p)
{
    float dist = 100.;
    
    dist = length(p)-1.0;

    return dist;
}

void main()
{
    vec2 viewport = (uv*2.-1.)*vec2(resolution.x/resolution.y,1.0);
    vec3 at = vec3(0);
    vec3 ray = look(eye, at, viewport);
    vec3 pos = eye;
    vec3 color = vec3(0);
    const int count = 30;
    for (int index = 0; index < count; ++index)
    {
        float dist = map(pos);
        if (dist < 0.001)
        {
            float shade = float(count-index)/float(count);
            color = vec3(shade);
            break;
        }
        pos += ray * dist;
    }

    gl_FragColor = vec4(color, 1);
}

`