const regl = require('regl')()
const BlenderWebSocket = require('./js/lib/BlenderWebSocket')
const BlenderHTML5Animations = require('./js/lib/blender-html5-animations.min')
const animationData = require('./blend/animation.json')
const neon = require('./js/neon')(regl)
const axis = require('./js/axis')(regl)
const camera = require('./js/camera')(regl, {
    center: [0,0,0],
    distance: 4
})

console.log(animationData);
var animations = new BlenderHTML5Animations.ActionLibrary(animationData);

var elapsed = 0;
var cam = {
    position: [0,0,-4],
    target: [0,0,0]
}

var blenderSocket = new BlenderWebSocket();
blenderSocket.addListener('frame', function(frame)
{
    elapsed = frame / 24;
});
function xyz2xzy(a) { return [-a[0], a[2], a[1]]; }
blenderSocket.addListener('data', function(data)
{
    cam.position = xyz2xzy(data.Camera.location);
    cam.target = xyz2xzy(data.CameraTarget.location);
});

regl.frame(function () {
    regl.clear({
        color: [0, 0, 0, 1]
    })

    // var position = animations['CameraAction'].paths['location'].evaluate(elapsed);
    
    camera(cam.position, cam.target, () => {
        neon({ time: regl.now() })
        axis()
    })
    // console.log(position);
})