const regl = require('regl')()
const BlenderWebSocket = require('./BlenderWebSocket')
const animationData = require('./animation.json')
const BlenderHTML5Animations = require('./blender-html5-animations.min')
const neon = require('./neon')(regl)
const camera = require('./camera')(regl, {
    center: [0,0,0],
    distance: 4
})

console.log(animationData);
var animations = new BlenderHTML5Animations.ActionLibrary(animationData);

var elapsed = 0;

var blenderSocket = new BlenderWebSocket();
blenderSocket.addListener('frame', function(frame)
{
    elapsed = frame / 24;
});

regl.frame(function () {
    regl.clear({
        color: [0, 0, 0, 1]
    })

    var position = animations['CameraAction'].paths['location'].evaluate(elapsed);
    
    camera(position, () => {
        neon({ time: regl.now() })
    })
    // console.log(position);
})