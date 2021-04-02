
const BlenderWebSocket = require('../lib/BlenderWebSocket')
const BlenderHTML5Animations = require('../lib/blender-html5-animations.min')
const animationData = require('../../blend/animation.json')


var animations = new BlenderHTML5Animations.ActionLibrary(animationData);
// console.log(animationData);
// var position = anims['CameraAction'].paths['location'].evaluate(elapsed);


var elapsed = 0;
var anims = {
    Camera: [0,0,-4],
    CameraTarget: [0,0,0],
    Spot: [0,3,-5],
    SpotTarget: [0,0,0],
    Points: [0,0,0],
    KIF: [0,0,0],
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
    Object.keys(data).forEach((key, index) => {
        if (data[key].location !== undefined) {
            anims[key] = xyz2xzy(data[key].location);
        }
    })
});

module.exports = anims;