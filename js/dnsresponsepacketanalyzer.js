// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Analyze a DNS packet received from a server.
 *
 * @author ebeach@google.com (Eric Beach)
 */



/**
 * Parse a completed DNS response.
 * @param {ndebug.DNSQueryManager} queryManager DNS query manager with query and
 *                                       response.
 * @constructor
 */
ndebug.DNSResponsePacketAnalyzer = function(queryManager) {
  this.dnsQueryManager_ = queryManager;
};


/**
 * List of IPv4 addresses in Google's netblock.
 * @type {Array}
 */
ndebug.DNSResponsePacketAnalyzer.googleIp4Netblock = [
  '216.239.32.0/19', '64.233.160.0/19', '66.249.80.0/20', '72.14.192.0/18',
  '209.85.128.0/17', '66.102.0.0/20', '74.125.0.0/16', '64.18.0.0/20',
  '207.126.144.0/20', '173.194.0.0/16'
];


/**
 * List of IPv6 addresses in Google's netblock.
 * @type {Array}
 */
ndebug.DNSResponsePacketAnalyzer.googleIp6Netblock = [
  '6:2607:f8b0:4000::/36', '2a00:1450:4000::/36'
];


/**
 * Determine whether an IP is a part of a CIDR range.
 * @param {string} testIp IPv4 address.
 * @param {string} cidrRange CIDR range (e.g., 173.194.0.0/16).
 * @return {boolean} Whether address is in a specific IPv4 CIDR range.
 */
ndebug.DNSResponsePacketAnalyzer.isIp4AddressInCidrBlock = function(
                                                             testIp,
                                                             cidrRange) {
  function pad(strNumber, length) {
    while (strNumber.length < length) {
      strNumber = '0' + strNumber;
    }
    return strNumber;
  }

  // Step 1: Parse basic variables
  var cidrIpAddressBase = cidrRange.substring(0, cidrRange.indexOf('/'));
  var maskBitsNum = Number(cidrRange.substring(cidrRange.indexOf('/') + 1));

  // Step 2: Convert test address to binary string
  var octectTestArr = testIp.split('.');
  var binaryAddressTestIp = '';
  for (var i = 0; i < octectTestArr.length; i++) {
    var decimalOctet = Number(octectTestArr[i]);
    var binaryOctet = ndebug.Util.baseConversion(decimalOctet, 2, 10);
    var paddedBinaryOctet = pad(binaryOctet, 8);
    binaryAddressTestIp += paddedBinaryOctet;
  }

  // Step 3: Convert CIDR address base range to binary string
  var octectCidrArr = cidrIpAddressBase.split('.');
  var binaryAddressCidrIp = '';
  for (var n = 0; n < octectCidrArr.length; n++) {
    var decimalOctet = Number(octectCidrArr[n]);
    var binaryOctet = ndebug.Util.baseConversion(decimalOctet, 2, 10);
    var paddedBinaryOctet = pad(binaryOctet, 8);
    binaryAddressCidrIp += paddedBinaryOctet;
  }

  // Step 4: See if bits of testIp match first mask bits of binaryAddressStr
  var cidrCompare = binaryAddressCidrIp.substr(0, maskBitsNum);
  var testCompare = binaryAddressTestIp.substr(0, maskBitsNum);
  return (cidrCompare == testCompare);
};


/**
 * Determine whether an IPv4 address belongs to Google's netblocks.
 * @param {string} addressToTest IPv4 address to test.
 * @return {boolean} Whether address is in Google's IPv4 netblocks.
 */
ndebug.DNSResponsePacketAnalyzer.isGoogleIp4Address = function(addressToTest) {
  var numNetblocks =
    ndebug.DNSResponsePacketAnalyzer.googleIp4Netblock.length;
  for (var i = 0; i < numNetblocks; i++) {
    if (ndebug.DNSResponsePacketAnalyzer.isIp4AddressInCidrBlock(
          addressToTest,
          ndebug.DNSResponsePacketAnalyzer.googleIp4Netblock[i])) {
      return true;
    }
  }
  return false;
};


/**
 * DNS query manager containing a query and response.
 *
 * @type {ndebug.DNSQueryManager}
 * @private
 */
ndebug.DNSResponsePacketAnalyzer.prototype.dnsQueryManager_ = null;


/**
 * Return DNS query manager containing the query and its response.
 *
 * @return {ndebug.DNSQueryManager} DNS query manager containing the query
 *                                  and its response.
 */
ndebug.DNSResponsePacketAnalyzer.prototype.getDnsQueryManager = function() {
  return this.dnsQueryManager_;
};


/**
 * Print the default packet response.
 */
ndebug.DNSResponsePacketAnalyzer.prototype.defaultPrintResponse = function() {
  // represent question section
  this.dnsQueryManager_.getResponsePacket().eachRecord(
      ndebug.DNSUtil.PacketSection.QUESTION,
                            function(dnsPacket) {}.bind(this));

  // represent answer section
  function analyzeAnswerResponsePackets(dnsRecord) {

    // add general information to the DEBUG logs
    var str = '';
    str += ndebug.DNSUtil.getRecordTypeNameByRecordTypeNum(
           dnsRecord.getType()) +
           ' record with name ' +
           dnsRecord.getName() + ' and TTL ' + dnsRecord.getTTL() +
           ' and data section of ' + dnsRecord.getDataText() + '\r\n';

    this.dnsQueryManager_.getOutputRecordManager().pushEntry(
        ndebug.OutputRecord.DetailLevel.DEBUG,
          str);

      // parse each specific record type and perform analysis
      switch (dnsRecord.getType()) {
        case ndebug.DNSUtil.RecordNumber.A:
          var ip = dnsRecord.getIp();
            if (!ndebug.DNSResponsePacketAnalyzer.isGoogleIp4Address(ip)) {
              this.dnsQueryManager_.getOutputRecordManager().pushEntry(
                  ndebug.OutputRecord.DetailLevel.ERROR,
                  'Query returned non-Google IP, ' + ip);
            } else {
              this.dnsQueryManager_.getOutputRecordManager().pushEntry(
                  ndebug.OutputRecord.DetailLevel.DEBUG,
                  'Query returned Google IP, ' + ip);
            }
        break;
      }
    };

    this.dnsQueryManager_.getResponsePacket().eachRecord(
        ndebug.DNSUtil.PacketSection.ANSWER,
        analyzeAnswerResponsePackets.bind(this));

    // represent authority section
    this.dnsQueryManager_.getResponsePacket().eachRecord(
        ndebug.DNSUtil.PacketSection.AUTHORITY,
                              function(dnsPacket) {});
};
