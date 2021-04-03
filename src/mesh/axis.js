
const glsl = x => x[0];

function axis (regl)
{
    return regl({
        vert:glsl`
        precision mediump float;
        attribute vec3 position, color;
        uniform mat4 projection, view;
        varying vec3 vColor;

        void main() {
            gl_Position = projection * view * vec4(position, 1);
            vColor = color;
        }
        `,
        frag:glsl`
        precision mediump float;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor,1.);
        }
        `,
        attributes: {
            position: [-10,0,0, 10,0,0, /* 0,-10,0, 0,10,0, */ 0,0,-10, 0,0,10],
            color: [1,0,0, 1,0,0, /* 0,1,0, 0,1,0, */ 0,0,1, 0,0,1]
        },
        elements: regl.elements({
            primitive: 'lines',
            data: new Uint16Array([0,1,2,3,4,5]),
        }),
    })
}

module.exports = axis;