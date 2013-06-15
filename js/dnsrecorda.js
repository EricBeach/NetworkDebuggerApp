// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview DNS A record.
 *
 * @author ebeach@google.com (Eric Beach)
 */



/**
 * DNS A-record, storing the name, TTL, IP, etc..
 * @param {string} name Name of the A record.
 * @param {number} ttl Time to live.
 * @extends ndebug.DNSRecord
 * @constructor
 */
ndebug.DNSRecordA = function(name, ttl) {
  this.name_ = name;
  this.type_ = ndebug.DNSUtil.RecordNumber.A;
  this.cl_ = 1;
  this.ttl_ = ttl;
};
ndebug.DNSRecordA.prototype = new ndebug.DNSRecord();
ndebug.DNSRecordA.prototype.constructor = ndebug.DNSRecord;
ndebug.DNSRecordA.prototype.parent = ndebug.DNSRecord.prototype;


/**
 * IPv4 address.
 * @type {string}
 * @private
 */
ndebug.DNSRecordA.prototype.ip_ = null;


/**
 * Set the IPv4 address of the record.
 * @param {string} ip IPv4 address.
 */
ndebug.DNSRecordA.prototype.setIp = function(ip) {
  this.ip_ = ip;
};


/**
 * Return the IPv4 address pointed to by this A record.
 * @return {string} IPv4 address.
 */
ndebug.DNSRecordA.prototype.getIp = function() {
  return this.ip_;
};
