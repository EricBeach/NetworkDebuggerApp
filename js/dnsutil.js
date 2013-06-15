// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Static utility class with enums and conversion functions.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * Static helper class for DNS information.
 */
ndebug.DNSUtil = function() {};


/**
 * Enum for DNS record type.
 * @enum {number}
 */
ndebug.DNSUtil.RecordNumber = {
  A: 1,
  AAAA: 28,
  MX: 15,
  CNAME: 5,
  TXT: 16
};


/**
 * Enum for section of the DNS packet (i.e., type of resource record).
 * @enum {string}
 */
ndebug.DNSUtil.PacketSection = {
  QUESTION: 'qd',
  ANSWER: 'an',
  AUTHORITY: 'ns',
  ADDITIONAL: 'ar'
};


/**
 * @param {string} name Name of DNS record type.
 * @return {ndebug.DNSUtil.RecordNumber} RFC 1035 DNS record number type.
 */
ndebug.DNSUtil.getRecordTypeNumByRecordTypeName = function(name) {
  switch (name.toUpperCase()) {
    case 'MX':
      return ndebug.DNSUtil.RecordNumber.MX;
    case 'AAAA':
      return ndebug.DNSUtil.RecordNumber.AAAA;
    case 'CNAME':
      return ndebug.DNSUtil.RecordNumber.CNAME;
    case 'TXT':
      return ndebug.DNSUtil.RecordNumber.TXT;
    default:
      return ndebug.DNSUtil.RecordNumber.A;
  }
};


/**
 * Static function to return the DNS record type number.
 * @param {number} num DNS record type number.
 * @return {string} The DNS record type as a string.
 */
ndebug.DNSUtil.getRecordTypeNameByRecordTypeNum = function(num) {
  switch (num) {
    case ndebug.DNSUtil.RecordNumber.AAAA:
      return 'AAAA';

    case ndebug.DNSUtil.RecordNumber.MX:
      return 'MX';

    case ndebug.DNSUtil.RecordNumber.CNAME:
      return 'CNAME';

    case ndebug.DNSUtil.RecordNumber.TXT:
      return 'TXT';

    case ndebug.DNSUtil.RecordNumber.A:
    default:
      return 'A';
   }
};
