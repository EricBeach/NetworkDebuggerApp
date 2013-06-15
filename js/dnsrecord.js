// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Deserialize binary data.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * DNSRecord is a record inside a DNS packet; e.g. a QUESTION, or an ANSWER,
 * AUTHORITY, or ADDITIONAL record. Note that QUESTION records are special,
 * and do not have ttl or data.
 *
 * @param {string} name Name part of the DNS record.
 * @param {number} type DNS record type.
 * @param {number} cl Class of record.
 * @param {number=} opt_ttl TTL for the record (optional).
 * @param {Uint8Array=} opt_data Uint8Array containing
 *                                          extra data (optional).
 * @constructor
 */
ndebug.DNSRecord = function(name, type, cl, opt_ttl, opt_data) {
  this.name_ = name;
  this.type_ = type;
  this.cl_ = cl;

  if (arguments.length > 3) {
    this.ttl_ = opt_ttl;
    this.data_ = opt_data;
  }
};


/**
 * Name component of DNS packet.
 * @type {string}
 * @protected
 */
ndebug.DNSRecord.prototype.name_ = null;


/**
 * Type of DNS record as a number.
 * @type {number}
 * @see Section 3.2.2. of RFC 1035.
 * @protected
 */
ndebug.DNSRecord.prototype.type_ = null;


/**
 * Class of DNS record as a number.
 * @type {number}
 * @see Section 3.2.2. of RFC 1035.
 * @protected
 */
ndebug.DNSRecord.prototype.cl_ = null;


/**
 * Label pointer manager that keeps track of entire DNS packet, so labels
 * and names can be reassembled from DNS compression.
 * @type {ndebug.RespLabelPtManager}
 * @see Section 4.1.4 of RFC 1035.
 * @private
 */
ndebug.DNSRecord.prototype.lblPointManager_ = null;


/**
 * Binary information from the data section of a DNS record.
 * @type {ArrayBuffer}
 * @private
 */
ndebug.DNSRecord.prototype.data_ = null;


/**
 * Information stored in data section of packet.
 * @type {string}
 * @private
 */
ndebug.DNSRecord.prototype.dataTxt_ = null;


/**
 * Set the label pointer manager for the DNS packet to which the record belongs.
 * @param {ndebug.RespLabelPtManager} obj Label manager to help
 *                                                 reassemble DNS packet data.
 */
ndebug.DNSRecord.prototype.setLblPointManager = function(obj) {
  this.lblPointManager_ = obj;
};


/**
 * Obtain the DNS name of the DNS record.
 * @return {string} DNS name.
 */
ndebug.DNSRecord.prototype.getName = function() {
  return this.name_;
};


/**
 * Return the class of the DNS record.
 * @return {number} Class of DNS record.
 */
ndebug.DNSRecord.prototype.getCl = function() {
  return this.cl_;
}


/**
 * Obtain the DNS record type number.
 * @return {number} DNS record type number.
 */
ndebug.DNSRecord.prototype.getType = function() {
  return this.type_;
};


/**
 * Obtain a text processed versino of the data section.
 * @return {string} Text representation of the data section of the DNS record.
 */
ndebug.DNSRecord.prototype.getDataText = function() {
  return this.dataTxt_;
};


/**
 * Return the TTL of the DNS record.
 * @return {number} TTL of DNS record.
 */
ndebug.DNSRecord.prototype.getTTL = function() {
  return this.ttl_;
};


/**
 * Set a text representation of the DNS packet's data section.
 * @param {string} dataStr Text representation of data section.
 */
ndebug.DNSRecord.prototype.setData = function(dataStr) {
  this.dataTxt_ = dataStr;
};
