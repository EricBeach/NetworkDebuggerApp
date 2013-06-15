// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview DNS MX record.
 *
 * @author ebeach@google.com (Eric Beach)
 */



/**
 * MX Record.
 * @param {string} name Name of the MX record.
 * @param {number} ttl Time to live of the record.
 * @extends ndebug.DNSRecord
 * @constructor
 */
ndebug.DNSRecordMX = function(name, ttl) {
  this.name_ = name;
  this.type_ = ndebug.DNSUtil.RecordNumber.MX;
  this.cl_ = 1;
  this.ttl_ = ttl;
};
ndebug.DNSRecordMX.prototype = new ndebug.DNSRecord();
ndebug.DNSRecordMX.prototype.constructor = ndebug.DNSRecord;
ndebug.DNSRecordMX.prototype.parent = ndebug.DNSRecord.prototype;


/**
 * Mail exchange host.
 * @type {string}
 * @private
 */
ndebug.DNSRecordMX.prototype.mailExchanger_ = null;


/**
 * Preference number of the record.
 * @type {number}
 * @private
 */
ndebug.DNSRecordMX.prototype.preferenceNumber_ = null;


/**
 * Set the mail exchange of the record.
 * @param {string} mx Mail exchange address.
 */
ndebug.DNSRecordMX.prototype.setMailExchanger = function(mx) {
  this.mailExchanger_ = mx;
};


/**
 * Return the mail exchange pointed to by this MX record.
 * @return {string} Mail exchange address.
 */
ndebug.DNSRecordMX.prototype.getMailExchanger = function() {
  return this.mailExchanger_;
};


/**
 * Set the preference number of the record.
 * @param {number} n Preference number.
 */
ndebug.DNSRecordMX.prototype.setPreferenceNumber = function(n) {
  this.preferenceNumber_ = n;
};


/**
 * Return the preference number of this MX record.
 * @return {number} MX record preference number.
 */
ndebug.DNSRecordMX.prototype.getPreferenceNumber = function() {
  return this.preferenceNumber_;
};
