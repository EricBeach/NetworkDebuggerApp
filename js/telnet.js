// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Model a basic Telnet client to send/receive TCP commuincations.
 *
 * @author ebeach@google.com (Eric Beach)
 */



/**
 * Open a TCP connection with a specific host on a specific port.
 * @param {string} host Hostname to open a connection with.
 * @param {number} port Port number to connect on.
 * @param {ndebug.OutputRecordManager} outputRecordManager Manage output logs.
 * @constructor
 */
ndebug.Telnet = function(host, port, outputRecordManager) {
  this.host_ = host;
  this.port_ = port;
  this.outputRecordManager_ = outputRecordManager;
};


/**
 * Hostname to connect to.
 * @type {string}
 * @private
 */
ndebug.Telnet.prototype.host_ = null;


/**
 * Port to connect on.
 * @type {number}
 * @private
 */
ndebug.Telnet.prototype.port_ = null;


/**
 * ID of socket used to connect to host.
 * @type {number}
 * @private
 */
ndebug.Telnet.prototype.socketId_ = null;


/**
 * ArrayBuffer of binary data to send to destination host.
 * @type {ArrayBuffer}
 * @private
 */
ndebug.Telnet.prototype.abDataToSend_ = null;


/**
 * ASCII text to send.
 * @type {string}
 * @private
 */
ndebug.Telnet.prototype.strDataToSend_ = null;


/**
 * SocketInfo object for the socket used to connect to the destination host.
 * @type {SocketInfo}
 * @private
 */
ndebug.Telnet.prototype.objSocketInfo_ = null;


/**
 * Store log/record of technical details.
 * @type {ndebug.OutputRecordManager}
 * @private
 */
ndebug.Telnet.prototype.outputRecordManager_ = null;


/**
 * Function to callback upon completion of the telnet session.
 * @type {function(ndebug.OutputRecordManager)}
 * @private
 */
ndebug.Telnet.prototype.completedCallbackFnc_ = null;


/**
 * Set function to be called when telnet is finished.
 * @param {function(ndebug.OutputRecordManager)} fnc Function to call upon
 *                                                   completion of telnet
 *                                                   session.
 */
ndebug.Telnet.prototype.setCompletedCallbackFnc = function(fnc) {
  this.completedCallbackFnc_ = fnc;
};


/**
  * Converts an array buffer to a string.
  * @param {ArrayBuffer} buf The buffer to convert.
  * @param {Function} callback The function to call when conversion is complete.
  * @private
  */
ndebug.Telnet.prototype.arrayBufferToString_ = function(buf, callback) {
  var bb = new Blob([new Uint8Array(buf)]);
  var f = new FileReader();
  f.onload = function(e) {
    callback(e.target.result);
  };
  f.readAsText(bb);
};


/**
 * Converts a string to an array buffer.
 * @param {string} str The string to convert.
 * @param {Function} callback The function to call when conversion is complete.
 * @private
 */
ndebug.Telnet.prototype.stringToArrayBuffer_ = function(str, callback) {
  var bb = new Blob([str]);
  var f = new FileReader();
  f.onload = function(e) {
    callback(e.target.result);
  };
  f.readAsArrayBuffer(bb);
};


/**
 * Set the text to send to the host.
 * @param {string} textToSend Text to send to the host.
 */
ndebug.Telnet.prototype.setPlainTextDataToSend = function(textToSend) {
  this.strDataToSend_ = textToSend;
};


/**
 * Process the data read over the socket.
 * @param {ReadInfo} readInfo Data read from the socket.
 * @see http://developer.chrome.com/apps/socket.html#type-ReadInfo
 * @private
 */
ndebug.Telnet.prototype.onReadCompletedCallback_ = function(readInfo) {
  /**
   * Receive string response from host.
   * @param {string} str Text received from destination host.
   * @this {ndebug.Telnet}
   */
  function receiveString_(str) {
    this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.DEBUG,
        str);
    this.closeSocket_();
    this.completedCallbackFnc_(this.outputRecordManager_);
  }

  if (readInfo.resultCode > 0) {
    this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.DEBUG,
        'Successfully read ' + readInfo.resultCode + ' bytes of data');
    this.arrayBufferToString_(readInfo.data, receiveString_.bind(this));
  } else {
    this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.ERROR,
        'Error reading data. Code ' + readInfo.resultCode);
  }
};


/**
 * Read data from the TCP socket.
 * @private
 */
ndebug.Telnet.prototype.read_ = function() {
  chrome.socket.read(this.socketId_, this.onReadCompletedCallback_.bind(this));
};


/**
 * Function to call upon completing the writing of data.
 * @param {WriteInfo} writeInfo Information about data written to host.
 * @see http://developer.chrome.com/apps/socket.html#type-WriteInfo
 * @private
 */
ndebug.Telnet.prototype.onWriteCompleteCallback_ = function(writeInfo) {
  this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.DEBUG,
      'Successfully sent ' + writeInfo.bytesWritten + ' bytes of data');
  this.read_();
};


/**
 * Write binary data to destination host.
 * @private
 */
ndebug.Telnet.prototype.write_ = function() {
  this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.DEBUG,
      'Prepared to send ' + this.abDataToSend_.byteLength + ' bytes of data');

  chrome.socket.write(this.socketId_,
                      this.abDataToSend_,
                      this.onWriteCompleteCallback_.bind(this));
};


/**
 * Process socket information upon successful TCP connection with host.
 * @private
 */
ndebug.Telnet.prototype.onConnectedCallback_ = function() {
  this.objSocketInfo_ = new ndebug.SocketInfo(this.socketId_,
                                       this.outputRecordManager_);
  this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.DEBUG,
      'TCP connection with ' + this.host_ +
      ' on port ' + this.port_ + ' established');
  this.objSocketInfo_.recordSocketInfo();


  /**
   * Receive converted ArrayBuffer.
   * @param {ArrayBuffer} ab ArrayBuffer of information to send.
   * @this {ndebug.Telnet}
   */
  function receiveArrBuffer(ab) {
    this.abDataToSend_ = ab;

    //socket open, data converted to binary, ready to send it
    this.write_();
  }

  this.stringToArrayBuffer_(this.strDataToSend_, receiveArrBuffer.bind(this));
};


/**
 * Create a TCP socket.
 */
ndebug.Telnet.prototype.createSocket = function() {
  /**
   * Process created socket information.
   * @param {CreatedInfo} createInfo Info on created socket.
   * @this {ndebug.Telnet}
   * @see http://developer.chrome.com/apps/socket.html#type-CreateInfo
   * @private
   */
  function onCreated_(createInfo) {
    this.socketId_ = createInfo.socketId;
    chrome.socket.connect(this.socketId_,
                          this.host_,
                          this.port_,
                          this.onConnectedCallback_.bind(this));
  }

  chrome.socket.create('tcp', {}, onCreated_.bind(this));
};


/**
 * Close TCP socket.
 * @private
 */
ndebug.Telnet.prototype.closeSocket_ = function() {
  chrome.socket.disconnect(this.socketId_);
};
