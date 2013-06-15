// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Manage a DNS query and its response.
 *
 * @author ebeach@google.com (Eric Beach)
 */



/**
 * Manage a DNS query.
 * @param {string} hostname Hostname to lookup a record for.
 * @param {number} recordTypeNum Type of record to lookup.
 * @param {string} dnsServer Server to query against records.
 * @param {function(ndebug.DNSQueryManager)} finalCallbackFnc Callback function
 *                                                            run when query
 *                                                            is done.
 * @param {ndebug.OutputRecordManager} outputRecordManager Manage output logs.
 * @constructor
 */
ndebug.DNSQueryManager = function(hostname, recordTypeNum,
                           dnsServer, finalCallbackFnc,
                           outputRecordManager) {
  this.hostname_ = hostname;
  this.recordTypeNum_ = recordTypeNum;
  this.dnsServer_ = dnsServer;
  this.finalCallbackFnc_ = finalCallbackFnc;
  this.outputRecordManager_ = outputRecordManager;
};


/**
 * The hostname being looked up.
 * @type {string}
 * @private
 */
ndebug.DNSQueryManager.prototype.hostname_ = null;


/**
 * DNS record type number.
 * @type {number}
 * @private
 */
ndebug.DNSQueryManager.prototype.recordTypeNum_ = null;


/**
 * Server to use for resolving DNS queries.
 * @type {string}
 * @private
 */
ndebug.DNSQueryManager.prototype.dnsServer_ = null;


/**
 * Port to use in connecting to DNS server.
 * @type {number}
 * @private
 */
ndebug.DNSQueryManager.prototype.dnsPort_ = 53;


/**
 * Whether to perform a recursive DNS query. Default is true.
 * @type {boolean}
 * @private
 */
ndebug.DNSQueryManager.prototype.isRecursionDesired_ = true;


/**
 * ID of the socket used to make a DNS query.
 * @type {number}
 * @private
 */
ndebug.DNSQueryManager.prototype.socketId_ = null;


/**
 * Store log/record of technical details.
 * @type {ndebug.OutputRecordManager}
 * @private
 */
ndebug.DNSQueryManager.prototype.outputRecordManager_ = null;


/**
 * SocketInfo object storing information about the socket used
 *    to send and receive a DNS packet.
 * @type {SocketInfo}
 * @private
 */
ndebug.DNSQueryManager.prototype.socketInfo_ = null;


/**
 * DNS Packet sent as a DNS query.
 * @type {ndebug.DNSPacket}
 * @private
 */
ndebug.DNSQueryManager.prototype.queryPacket_ = null;


/**
 * Serialized DNS packet data to send as a DNS query.
 * @type {ArrayBuffer}
 * @private
 */
ndebug.DNSQueryManager.prototype.serializedQueryPacket_ = null;


/**
 * Serialized DNS packet data received as a response to a query.
 * @type {ArrayBuffer}
 * @private
 */
ndebug.DNSQueryManager.prototype.serializedResponsePacket_ = null;


/**
 * DNS packet received in response to the DNS query.
 * @type {ndebug.DNSPacket}
 * @private
 */
ndebug.DNSQueryManager.prototype.responsePacket_ = null;


/**
 * Function to be called when DNS query reaches an end.
 * @type {function(ndebug.DNSQueryManager)}
 * @private
 */
ndebug.DNSQueryManager.prototype.finalCallbackFnc_ = null;


/**
 * Store the status of the DNS query.
 * @type {ndebug.DNSQueryManager.QueryResultStatus} Status of the DNS query.
 * @private
 */
ndebug.DNSQueryManager.prototype.queryResultStatus_ = null;


/**
 * Get the DNS packet returned in the query.
 * @return {ndebug.DNSPacket} DNS packet returned in DNS query.
 */
ndebug.DNSQueryManager.prototype.getResponsePacket = function() {
  return this.responsePacket_;
};


/**
 * Enum to capture the result of a DNS query.
 * @enum {number}
 */
ndebug.DNSQueryManager.QueryResultStatus = {
  SUCCESS_PACKET_PARSE: 0,
  FAIL_TIMEOUT: 1
};


/**
 * This method exists primarily to allow for testing.
 * @param {ArrayBuffer} data Raw binary data that will simulate the response
 *                           data from the DNS query.
 */
ndebug.DNSQueryManager.prototype.setSerializedResponsePacket = function(data) {
  this.serializedResponsePacket_ = data;
};

/**
 * Return the output manager that records output logs on this DNS query.
 * @return {ndebug.OutputRecordManager} Recorded information from DNS query.
 */
ndebug.DNSQueryManager.prototype.getOutputRecordManager = function() {
  return this.outputRecordManager_;
};


/**
 * Set whether to perform a recursive DNS query.
 * @param {boolean} isDesired Whether the DNS query should be recursive.
 */
ndebug.DNSQueryManager.prototype.setRecursionDesired = function(isDesired) {
  this.isRecursionDesired_ = (isDesired === true);
};


/**
 * Obtain the bits for the DNS packet header.
 * See Section 4.1.1 of RFC 1035 for the specifics.
 * @return {number} Integer corresponding to the 16 bits of a DNS packet header.
 * @private
 */
ndebug.DNSQueryManager.prototype.getFormattedHeader_ = function() {
  if (this.isRecursionDesired_) {
    // header is hex 100 or binary "00000000100000000"
    return 0x100;
  } else {
    return 0;
  }
};


/**
 * After the query has returned serialized data, parse it.
 */
ndebug.DNSQueryManager.prototype.parsePacketFromSerializedData = function() {
  var lblNameManager = new ndebug.RespLabelPtManager(
      this.serializedResponsePacket_);
  var packetDeserializer = new ndebug.DNSPacketDeserializer(
      this.serializedResponsePacket_,
      lblNameManager);
  packetDeserializer.deserializePacket();
  this.responsePacket_ = packetDeserializer.getDeserializedPacket();

  this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.DEBUG,
      'Query response contains ' +
      this.responsePacket_.getAnswerRecordCount() + ' answer ' +
      'records');
};


/**
 * Send the formatted DNS packet as a query to the desired DNS server.
 */
ndebug.DNSQueryManager.prototype.sendRequest = function() {
  var udpTimeoutSec = 7;
  var udpTimeoutFunction = setInterval(timeout_.bind(this),
                                         udpTimeoutSec * 1000);

  /**
   * Perform clean up operation on the socket, such as closing it.
   * @this {ndebug.DNSQueryManager}
   * @private
   */
  function cleanUp_() {
    chrome.socket.destroy(this.socketId_);
    this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.DEBUG,
         'Socket closed');

    if (this.queryResultStatus_ ==
        ndebug.DNSQueryManager.QueryResultStatus.SUCCESS_PACKET_PARSE) {
      this.finalCallbackFnc_(this);
    }
  };

  /**
   * Clean up socket as no response is coming back.
   * @this {ndebug.DNSQueryManager}
   * @private
   */
  function timeout_() {
    this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.DEBUG,
        'Received no response in ' + udpTimeoutSec +
        ' seconds, closing socket');
    clearTimeout(udpTimeoutFunction);
    this.queryResultStatus_ =
      ndebug.DNSQueryManager.QueryResultStatus.FAIL_TIMEOUT;
    cleanUp_.apply(this);
  };


  /**
   * @param {ReadInfo} readInfo Information about data read over the socket.
   * @this {ndebug.DNSQueryManager}
   * @see http://developer.chrome.com/apps/socket.html
   * @private
   */
  function dataRead_(readInfo) {
    clearTimeout(udpTimeoutFunction);

    this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.ERROR,
        'Received ' + readInfo.resultCode + ' byte query response');
    this.serializedResponsePacket_ = readInfo.data;

    this.parsePacketFromSerializedData();

    this.queryResultStatus_ =
      ndebug.DNSQueryManager.QueryResultStatus.SUCCESS_PACKET_PARSE;
    cleanUp_.apply(this);
  };


  /**
   * Read data over socket from DNS server.
   * @this {ndebug.DNSQueryManager}
   * @private
   */
  function readData_() {
    chrome.socket.read(this.socketId_, dataRead_.bind(this));
  }


 /**
  * Receive and handle information about data written to DNS server.
  * @param {WriteInfo} writeInfo Information about data written over socket.
  * @this {ndebug.DNSQueryManager}
  * @see http://developer.chrome.com/apps/socket.html
  * @private
  */
  function onDataWritten_(writeInfo) {
    if (writeInfo.bytesWritten != this.serializedQueryPacket_.byteLength) {
       this.outputRecordManager_.pushEntry(
           ndebug.OutputRecord.DetailLevel.ERROR,
           'Error writing DNS packet.');
       chrome.socket.destroy(this.socketId_);
    } else {
       this.outputRecordManager_.pushEntry(
           ndebug.OutputRecord.DetailLevel.DEBUG,
           'Successfully sent ' + writeInfo.bytesWritten +
           ' bytes in a DNS packet');
       readData_.apply(this);
    }
  };


  /**
   * Send serialized UDP packet data composing a DNS request to DNS server.
   * @this {ndebug.DNSQueryManager}
   * @private
   */
  function sendData_() {
    var packetHeader = this.getFormattedHeader_();
    this.queryPacket_ = new ndebug.DNSPacket(packetHeader);
    this.queryPacket_.push(ndebug.DNSUtil.PacketSection.QUESTION,
                            new ndebug.DNSRecord(this.hostname_,
                                          this.recordTypeNum_,
                                          1));


    // take data and serialize it into binary as an ArrayBuffer to send
    var serializer = new ndebug.DNSPacketSerializer(this.queryPacket_);
    this.serializedQueryPacket_ = serializer.serialize();

    var infoLog = 'Preparing to query server ' + this.dnsServer_ + ' ' +
              'for record type ' +
              ndebug.DNSUtil.
                getRecordTypeNameByRecordTypeNum(this.recordTypeNum_) +
              ' with hostname ' + this.hostname_;
    this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.DEBUG,
         infoLog);

    chrome.socket.write(this.socketId_,
                          this.serializedQueryPacket_,
                          onDataWritten_.bind(this));
  };


  /**
   * Receive the result of a connection attempt.
   * @param {number} result Information about connected socket.
   * @this {ndebug.DNSQueryManager}
   * @private
   */
  function onConnectedCallback_(result) {
    this.socketInfo_ = new ndebug.SocketInfo(this.socketId_,
                                       this.outputRecordManager_);

    this.socketInfo_.recordSocketInfo();
    sendData_.apply(this);
  };


  /**
   * Connect to the DNS server.
   * @this {ndebug.DNSQueryManager}
   * @private
   */
  function connect_() {
    chrome.socket.connect(this.socketId_,
                              this.dnsServer_,
                              this.dnsPort_,
                              onConnectedCallback_.bind(this));
  };


  /**
   * Process information about a socket after creation.
   * @param {CreateInfo} createInfo CreateInfo about a socket.
   * @this {ndebug.DNSQueryManager}
   * @see http://developer.chrome.com/apps/socket.html
   * @private
   */
  function onCreatedCallback_(createInfo) {
    this.socketId_ = createInfo.socketId;
    connect_.apply(this);
  };


  // create a UDP socket for sending and receiving a DNS packet
  chrome.socket.create('udp', null, onCreatedCallback_.bind(this));
};
