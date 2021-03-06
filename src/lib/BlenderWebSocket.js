

const url = 'ws://localhost:8137/';

class BlenderWebSocket {
	constructor() {
		const listeners = this.listeners = {};

		function emit(event) {
			var handlers = listeners[event];
			if (handlers) {
				var args = Array.prototype.slice.call(arguments, 1);
				handlers.forEach(function (handler) {
					handler.apply(null, args);
				});
			}
		}

		let websocket;

		function connect() {
			websocket = new WebSocket(url);

			websocket.onopen = function () {
				emit('open');
			};

			websocket.onclose = function () {
				emit('close');
				setTimeout(connect, 100);
			};

			websocket.onerror = function () {
				emit('error');
			};

			websocket.onmessage = function (event) {
				try {
					var data = JSON.parse(event.data);
				} catch (err) {
					emit('badFormat', event.data);
					return;
				}

				// console.log(data);

				if (data[0] == 'data')
				{
					// console.log(data[1].objects.Camera.location);
					emit('data', data[1].objects);
				}

				if (data[2] !== undefined)
				{
					emit('frame', data[2].frame);
				}

				switch (data[0]) {
				case 'refresh':
					emit('refresh');
					break;


				case 'time':
					self.time = data[1];
					emit('time', self.time);
					break;

				default:
					emit('unknownMessage', data);
					break;
				}
			};
		}

		connect();
	}

	addListener(event, handler) {
		if (!this.listeners[event])
			this.listeners[event] = [handler];
		else
			this.listeners[event].push(handler);
	}

	removeListener(event, handler) {
		if (!this.listeners[event])
			return;
		var index = this.listeners[event].indexOf(handler);
		if (index !== -1)
			this.listeners[event].splice(index, 1);
	}
}

module.exports = BlenderWebSocket;