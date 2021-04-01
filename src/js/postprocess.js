

const postprocess = regl({
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
  varying vec2 uv;
  uniform sampler2D tex;
  uniform vec2 resolution;
  void main() {
    // vec3 edge = smoothstep(0.0, 1.0, edge(tex, uv, resolution/4.).rgb);
    vec3 color = texture2D(tex, uv).rgb;
    // color = smoothstep(0.3,0.6,color);
    // color -= edge;
    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor.rgb = 1.-gl_FragColor.rgb;
  }`,

  attributes: {
    position: [ -4, -4, 4, -4, 0, 4 ]
  },
  uniforms: {
    tex: ({count}) => fbo,
    resolution: ({viewportWidth, viewportHeight}) => [viewportWidth, viewportHeight],
  },
  depth: { enable: false },
  count: 3
})