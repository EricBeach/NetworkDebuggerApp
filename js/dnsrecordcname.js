// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview DNS CNAME record.
 *
 * @author ebeach@google.com (Eric Beach)
 */



/**
 * CNAME DNS record.
 * @param {string} name Name of the CNAME record.
 * @param {number} ttl Time to live of the record.
 * @extends ndebug.DNSRecord
 * @constructor
 */
ndebug.DNSRecordCNAME = function(name, ttl) {
  this.name_ = name;
  this.type_ = ndebug.DNSUtil.RecordNumber.CNAME;
  this.cl_ = 1;
  this.ttl_ = ttl;
};
ndebug.DNSRecordCNAME.prototype = new ndebug.DNSRecord();
ndebug.DNSRecordCNAME.prototype.constructor = ndebug.DNSRecord;
ndebug.DNSRecordCNAME.prototype.parent = ndebug.DNSRecord.prototype;


/**
 * Text value.
 * @type {string}
 * @private
 */
ndebug.DNSRecordCNAME.prototype.cname_ = null;


/**
 * Set the cname of the record.
 * @param {string} cname Text value.
 */
ndebug.DNSRecordCNAME.prototype.setCname = function(cname) {
  this.cname_ = cname;
};


/**
 * Return the cname stored by this record.
 * @return {string} CNAME value.
 */
ndebug.DNSRecordCNAME.prototype.getCname = function() {
  return this.cname_;
};
