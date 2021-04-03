
const mat4 = require('gl-matrix').mat4
const mouseChange = require('mouse-change')
const mouseWheel = require('mouse-wheel')

var Camera = function(props) {
    props = props || {}
    this.eye = mat4.identity([])
    this.prevX = 0
    this.prevY = 0
    this.rotX = props.rotX || 0
    this.rotY = props.rotY || .5
    this.distance = props.distance || 10

    this.update = function () {
        mat4.identity(this.eye)
        mat4.rotateY(this.eye, this.eye, -this.rotX)
        mat4.rotateX(this.eye, this.eye, -this.rotY)
        mat4.translate(this.eye, this.eye, [0,0,this.distance])
    }

    var self = this;

    mouseChange(function (buttons, x, y) {
        if (buttons & 1) {
            var dx = (x - self.prevX) / window.innerWidth
            var dy = (y - self.prevY) / window.innerHeight
            self.rotX += dx * 4
            self.rotY += dy * 4
        }
        self.prevX = x
        self.prevY = y
    })

    mouseWheel(function (dx, dy) {
        self.distance += dy / window.innerHeight * 10
    })
}

module.exports = Camera