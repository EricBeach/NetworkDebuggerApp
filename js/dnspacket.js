// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview A DNS packet that stores DNS records.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * DNSPacket holds the state of a DNS packet such as a question record and
 * associated responses along with other associated records.
 *
 * @param {number=} opt_flags Numerical flags to set in the DNS header.
 *                            For example, 0x100 sets the packet to a recursive
 *                            query. See Section 4.1.1 of RFC 1035 (optional).
 * @constructor
 */
ndebug.DNSPacket = function(opt_flags) {
  this.flags_ = opt_flags || 0;

  this.data_ = {};
  this.data_[ndebug.DNSUtil.PacketSection.QUESTION] = [];
  this.data_[ndebug.DNSUtil.PacketSection.ANSWER] = [];
  this.data_[ndebug.DNSUtil.PacketSection.AUTHORITY] = [];
  this.data_[ndebug.DNSUtil.PacketSection.ADDITIONAL] = [];
};



/**
 * Flags for the DNS packet.
 * @type {number}
 * @private
 */
ndebug.DNSPacket.prototype.flags_ = null;


/**
 * Array containing the specific DNS records that are a part of each
 *   section of the DNS packet.
 * @type Array.<string>.<ndebug.DNSRecord>
 * @private
 */
ndebug.DNSPacket.prototype.data_ = null;


/**
 * Return the flags of the DNS packet.
 * @return {number} Flags of DNS packet.
 */
ndebug.DNSPacket.prototype.getFlags = function() {
  return this.flags_;
};


/**
 * Return the number of answer records in the DNS packet.
 * @return {number} Number of DNS records in the answer section of the
 *                   DNS packet.
 */
ndebug.DNSPacket.prototype.getAnswerRecordCount = function() {
  return this.data_[ndebug.DNSUtil.PacketSection.ANSWER].length;
};


/**
 * Add a DNS record to a particular section of this DNS packet.
 * @param {ndebug.DNSUtil.PacketSection} packetSection Section of DNS record.
 * @param {ndebug.DNSRecord} dnsRecord DNS record to add to this packet.
 */
ndebug.DNSPacket.prototype.push = function(packetSection, dnsRecord) {
  this.data_[packetSection].push(dnsRecord);
};


/**
 * Invoke a callback function and pass each DNSRecord that is part of a
 *   specific DNS packet section.
 * @param {ndebug.DNSUtil.PacketSection} packetSection Section of DNS record.
 * @param {function(ndebug.DNSRecord)} callbackFunction Function to pass each
 *                                               DNS record that is part of
 *                                               a section to.
 */
ndebug.DNSPacket.prototype.eachRecord = function(packetSection,
                                                 callbackFunction) {
  var filter = false;
  this.data_[packetSection].forEach(function(rec) { callbackFunction(rec); });
};
