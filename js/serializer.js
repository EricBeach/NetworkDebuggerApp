// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Serialize data for binary transfer.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * Serializer writes an object data to an ArrayBuffer.
 * @constructor
 */
ndebug.Serializer = function() {
  this.loc_ = 0;
  this.view_ = new Uint8Array(new ArrayBuffer(512));
};


/**
 * Unit8Array to store bytes of serialized data.
 * @type {Unit8Array}
 * @private
 */
ndebug.Serializer.prototype.view_ = null;


/**
 * Current working location in the ArrayBuffer.
 * @type {number}
 * @private
 */
ndebug.Serializer.prototype.loc_ = null;


/**
 * Currently serialized data as ArrayBuffer.
 * @type {Unit8Array}
 * @private
 */
ndebug.Serializer.prototype.buffer_ = null;


/**
 * Add a byte of data to the ArrayBuffer.
 * @param {number} b Byte of binary data to add to the ArrayBuffer.
 * @return {ndebug.Serializer} This instance of a Serializer.
 */
ndebug.Serializer.prototype.setByte = function(b) {
  this.view_[this.loc_] = b;
  ++this.loc_;
  this.buffer_ = this.view_.buffer.slice(0, this.loc_);
  return this;
};


/**
 * Add two bytes of data to an ArrayBuffer.
 * @param {number} b Two bytes of binary data to add to the ArrayBuffer.
 * @return {ndebug.Serializer} This instance of a Serializer.
 */
ndebug.Serializer.prototype.setShort = function(b) {
  return this.setByte((b >> 8) & 0xff).setByte(b & 0xff);
};


/**
 * Return serialized ArrayBuffer representation of an object.
 * @return {ArrayBuffer} ArrayBuffer representation of an object.
 */
ndebug.Serializer.prototype.getBuffer = function() {
  return this.buffer_;
};
