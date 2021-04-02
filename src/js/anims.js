
const BlenderWebSocket = require('../lib/BlenderWebSocket')
const BlenderHTML5Animations = require('../lib/blender-html5-animations.min')
const animationData = require('../blend/animation.json')


var animations = new BlenderHTML5Animations.ActionLibrary(animationData);
console.log(animationData);
// var position = anims['CameraAction'].paths['location'].evaluate(elapsed);

var anims = {};

Object.keys(animations).forEach(key => {
    if (animations[key].paths['location'] !== undefined)
    {
        const k = key.replace('Action', '');
        anims[k] = (animations[key].paths['location'].evaluate(0));
    }
});

console.log(anims);

var elapsed = 0;
var blenderTime = 0;

var blenderSocket = new BlenderWebSocket();
blenderSocket.addListener('frame', function(frame)
{
    blenderTime = frame / 24;
});
function xyz2xzy(a) { return [-a[0], a[2], a[1]]; }
function lerp(a, b, t) { return a * t + b * (1 - t); }
function lerpArray(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
function add(a, b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
// blenderSocket.addListener('data', function(data)
// {
//     Object.keys(data).forEach((key, index) => {
//         if (data[key].location !== undefined) {
//             anims[key] = xyz2xzy(data[key].location);
//         }
//     })
// });

anims.update = function(dt)
{
    elapsed = lerp(elapsed, blenderTime, dt);
    Object.keys(animations).forEach(key => {
        if (animations[key].paths['location'] !== undefined)
        {
            const k = key.replace('Action', '');
            anims[k] = lerpArray(anims[k], animations[key].paths['location'].evaluate(elapsed), dt);
        }
    });
}

module.exports = anims;