// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Manage the labels, references, and names in a DNS response.
 *
 * @author ebeach@google.com (Eric Beach)
 */



/**
 * RespLabelPtManager handles DNS's name compression and labeling,
 * helping re-assemble a name with references.
 *
 * @param {ArrayBuffer|Uint8Array} arg ArrayBuffer of data received from socket.
 * @see http://developer.chrome.com/apps/socket.html#type-ReadInfo
 * @see  RFC 1035 section 4.1.4.
 * @constructor
 */
ndebug.RespLabelPtManager = function(arg) {
  if (arg instanceof Uint8Array) {
    this.view_ = arg;
  } else {
      this.view_ = new Uint8Array(arg);
  }
};


/**
 * ArrayBuffer containing the full binary data received from the socket.
 * @type {Uint8Array}
 * @private
 */
ndebug.RespLabelPtManager.prototype.view_ = null;


/**
 * Obtain a reference byte offset and reassemble the DNS name living at that
 * specified byte offset.
 *
 * @param {number} ref Offset number of byte containing full name.
 * @return {string} Reassembled DNS name.
 */
ndebug.RespLabelPtManager.prototype.getNameFromReference = function(ref) {
  // Array Buffer containing data from the beginning offset to the end
  var subArrayBuffer = this.view_.subarray(ref);

  // Reassemble name from reference in DNS packet
  var subPacketDeserializer = new ndebug.DNSPacketDeserializer(subArrayBuffer,
                                                               this);
  var sectionDeserializer = new ndebug.Deserializer(subArrayBuffer);
  var subName = subPacketDeserializer.parseName(this, sectionDeserializer);
  return subName;
};
