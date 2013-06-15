// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Serialize a DNS packet for sending over a UDP socket.
 *
 * @author ebeach@google.com (Eric Beach)
 */



/**
 * Serialize a DNS packet to be sent over the socket.
 * @param {ndebug.DNSPacket} dnsPacket The DNS packet to be serialized.
 * @constructor
 */
ndebug.DNSPacketSerializer = function(dnsPacket) {
  this.dnsPacket_ = dnsPacket;
};


/**
 * DNS packet to be serialized.
 * @type {ndebug.DNSPacket}
 * @private
 */
ndebug.DNSPacketSerializer.prototype.dnsPacket_ = null;


/**
 * Serialize the DNS packet.
 * @return {ArrayBuffer} Serialized DNS packet.
 */
ndebug.DNSPacketSerializer.prototype.serialize = function() {
  var dataSerializer = new ndebug.Serializer();
  var arrPacketSections = [ndebug.DNSUtil.PacketSection.QUESTION,
                           ndebug.DNSUtil.PacketSection.ANSWER,
                           ndebug.DNSUtil.PacketSection.AUTHORITY,
                           ndebug.DNSUtil.PacketSection.ADDITIONAL];

  dataSerializer.setShort(0).setShort(this.dnsPacket_.getFlags());

  arrPacketSections.forEach(function(packetSection) {
    dataSerializer.setShort(this.dnsPacket_.data_[packetSection].length);
  }.bind(this));

  arrPacketSections.forEach(function(packetSection) {
    this.dnsPacket_.data_[packetSection].forEach(function(dnsRecord) {
      this.serializeName(dnsRecord.name_, dataSerializer).
        setShort(dnsRecord.getType()).setShort(dnsRecord.getCl());
    }.bind(this));
  }.bind(this));

  return dataSerializer.getBuffer();
};


/**
 * Writes a DNS name to a specified data serializer.
 * If opt_ref is specified, will finish this name with a
 * suffix reference (i.e., 0xc0 <ref>). If not, then will terminate with a NULL
 * byte.
 *
 * @param {string} dnsName A DNS name such as "mail.google.com".
 * @param {ndebug.Serializer} dnsSerializer Data serializer being used to
 *                                          serialize a DNS packet.
 * @param {number} opt_ref Packet location of DNS name being referenced.
 *                            See Section 4.1.4 of RFC 1035.
 * @return {ndebug.Serializer} This instance of a Serializer.
 */
ndebug.DNSPacketSerializer.prototype.serializeName = function(dnsName,
                                                       dnsSerializer,
                                                       opt_ref) {
  var parts = dnsName.split('.');
  parts.forEach(function(part) {
    dnsSerializer.setByte(part.length);
    for (var i = 0; i < part.length; ++i) {
      dnsSerializer.setByte(part.charCodeAt(i));
    }
  }.bind(this));

  if (opt_ref) {
    dnsSerializer.setByte(0xc0).setByte(opt_ref);
  } else {
    dnsSerializer.setByte(0);
  }
  return dnsSerializer;
};
