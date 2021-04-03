
const glsl = x => x[0];

module.exports = glsl`

mat2 rot (in float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

mat4 rotationMatrix(vec3 ax, float angle) {
    ax = normalize(ax);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(oc*ax.x*ax.x + c, oc*ax.x*ax.y - ax.z*s, oc*ax.z*ax.x + ax.y*s, 0.0,
                oc*ax.x*ax.y + ax.z*s, oc*ax.y*ax.y + c, oc*ax.y*ax.z - ax.x*s, 0.0,
                oc*ax.z*ax.x - ax.y*s, oc*ax.y*ax.z + ax.x*s, oc*ax.z*ax.z + c, 0.0,
                0.0, 0.0, 0.0, 1.0);
}

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
float hash11(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
float hash12(vec2 p) {
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
vec2 hash21(float p) {
    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
vec3 hash31(float p) {
    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

// Dave Hoskins https://www.shadertoy.com/view/4djSRW
vec3 hash32(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

vec3 look (vec3 eye, vec3 forward, vec2 anchor) {
    vec3 right = normalize(cross(forward, vec3(0,1,0)));
    vec3 up = normalize(cross(right, forward));
    return normalize(forward + right * anchor.x + up * anchor.y);
}

vec3 lookAt (vec3 eye, vec3 target, vec2 anchor) {
    vec3 forward = normalize(target-eye);
    vec3 right = normalize(cross(forward, vec3(0,1,0)));
    vec3 up = normalize(cross(right, forward));
    return normalize(forward + right * anchor.x + up * anchor.y);
}

`