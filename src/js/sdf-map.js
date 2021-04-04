
const glsl = x => x[0];

module.exports = glsl`

uniform vec3 ParameterKIF;

float map(vec3 p)
{
    float dist = 100.;
    vec3 p0 = p;

    // const int count = 8;
    // float radius = ParameterKIF.x;
    // float range = ParameterKIF.y;
    // float falloff = ParameterKIF.z;

    // float a = 1.0;
    // for (int index = 0; index < count; ++index)
    // {
    //     p.xz *= rot(1.0/a);
    //     p.yz *= rot(1.0/a);
    //     p.xz = abs(p.xz) - range*a;
    //     dist = min(dist, length(p)-radius*a);
    //     a /= falloff;
    // }

    // dist = abs(dist)-0.01;
    dist = sdBox(p, vec3(1));
    dist = min(dist, p0.y);

    return dist;
}

// NuSan https://www.shadertoy.com/view/3sBGzV
vec3 getNormal(vec3 p) {
    vec2 off=vec2(0.001,0);
    return normalize(map(p)-vec3(map(p-off.xyy), map(p-off.yxy), map(p-off.yyx)));
}

`