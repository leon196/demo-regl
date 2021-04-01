
const BlenderWebSocket = require('./lib/BlenderWebSocket')
const BlenderHTML5Animations = require('./lib/blender-html5-animations.min')
const animationData = require('../../blend/animation.json')

// console.log(animationData);
var animations = new BlenderHTML5Animations.ActionLibrary(animationData);

var elapsed = 0;
var anims = {
    position: [0,0,-4],
    target: [0,0,0],
    spot: [0,0,0],
    spotTarget: [0,0,0],
}

var blenderSocket = new BlenderWebSocket();
blenderSocket.addListener('frame', function(frame)
{
    elapsed = frame / 24;
});
function xyz2xzy(a) { return [-a[0], a[2], a[1]]; }
function add(a, b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
blenderSocket.addListener('data', function(data)
{
    if (data.Camera !== undefined) anims.position = xyz2xzy(data.Camera.location);
    if (data.CameraTarget !== undefined) anims.target = xyz2xzy(data.CameraTarget.location);
    if (data.Spot !== undefined) anims.spot = xyz2xzy(data.Spot.location);
    if (data.SpotTarget !== undefined) anims.spotTarget = xyz2xzy(data.SpotTarget.location);
    // cam.r
    // console.log(data.Camera);
    // cam.target = xyz2xzy(data.CameraTarget.location);
});

module.exports = anims;