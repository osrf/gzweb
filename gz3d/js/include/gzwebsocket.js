GZWebSocket = function(options) {
  options = options || {};
  var url = options.url;
  this.socket = null;
  this.idCounter = 0;

  // Sets unlimited event listeners (EventEmitter2).
  // this.setMaxListeners(0);

  // begin by checking if a URL was given
  if (url) {
    this.connect(url);
  }
};

GZWebSocket.prototype.__proto__ = EventEmitter2.prototype;

/**
 * Connect to the specified WebSocket.
 *
 * @param url - WebSocket URL
 */
GZWebSocket.prototype.connect = function(url) {
  var that = this;

  /**
   * Emits a 'connection' event on WebSocket connection.
   *
   * @param event - the argument to emit with the event.
   */
  function onOpen(event) {
    console.log("connected!");
    that.emit('connection', event);
  }

  /**
   * Emits a 'close' event on WebSocket disconnection.
   *
   * @param event - the argument to emit with the event.
   */
  function onClose(event) {
    that.emit('close', event);
  }

  /**
   * Emits an 'error' event whenever there was an error.
   *
   * @param event - the argument to emit with the event.
   */
  function onError(event) {
    that.emit('error', event);
  }

  /**
   * Parses message responses from rosbridge and sends to the appropriate
   * topic, service, or param.
   *
   * @param message - the raw JSON message
   */
  function onMessage(message) {
    function handleMessage(message) {
      if (message.op === 'publish') {
        that.emit(message.topic, message.msg);
      } else if (message.op === 'service_response') {
        that.emit(message.id, message.values);
      }
    }

    console.log("got msg!" + message.data);

    var data = JSON.parse(message.data);
    handleMessage(data);

  }

  console.log("connecting to " + url);

  this.socket = new WebSocket(url, "default");
  this.socket.onopen = onOpen;
  this.socket.onclose = onClose;
  this.socket.onerror = onError;
  this.socket.onmessage = onMessage;
};

/**
 * Disconnect from the WebSocket server.
 */
GZWebSocket.prototype.close = function() {
  if (this.socket) {
    this.socket.close();
  }
};

/**
 * Sends the message over the WebSocket, but queues the message up if not yet
 * connected.
 */
GZWebSocket.prototype.callOnConnection = function(message) {
  var that = this;
  var messageJson = JSON.stringify(message);

  if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
    that.once('connection', function() {
      that.socket.send(messageJson);
    });
  } else {
    that.socket.send(messageJson);
  }
};
