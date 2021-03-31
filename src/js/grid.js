
const glsl = x => x[0];

function grid (regl, width, height)
{
    width = width || 10;
    height = height || 10;

    return regl({
        vert:glsl`
        precision mediump float;
        attribute vec3 position;
        uniform mat4 projection, view;

        void main() {
            gl_Position = projection * view * vec4(position, 1);
        }
        `,
        frag:glsl`
        precision mediump float;
        void main() {
            gl_FragColor = vec4(0.3,0.3,0.3,1.0);
        }
        `,
        attributes: {
            position: Array((width+height)*2).fill().map(function(item,index) {
                var x, z;
                if (index / 2 < width)
                {
                    x = Math.floor(index/2)/(width-1);
                    z = index % 2 == 0 ? 0 : 1;
                }
                else
                {
                    x = index % 2 == 0 ? 0 : 1;
                    z = Math.floor(index/2-width)/(height-1);
                }
                return [(x*2-1)*10, 0, (z*2-1)*10];
            }),
        },
        elements: regl.elements({
            primitive: 'lines',
            data: new Uint16Array(Array(width*height).fill().map(function(item,index) {
                return [index*2, index*2+1];
            }).flat()),
        }),
        uniforms: {
            time: regl.prop('time')
        },
    })
}

module.exports = grid;