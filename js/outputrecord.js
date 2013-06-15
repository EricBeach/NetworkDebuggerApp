// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Encapsulate one output message from a test.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * Store a log output from a test along with a timestamp and log level.
 *
 * @param {ndebug.OutputRecord.DetailLevel} level Level of output record.
 * @param {string} message Message to be recorded.
 * @constructor
 */
ndebug.OutputRecord = function(level, message) {
  this.timestamp_ = (new Date()).getTime();
  this.level_ = level;
  this.message_ = message;
};


/**
 * Enum for the level of output log information corresponding with a message.
 * @enum {number}
 */
ndebug.OutputRecord.DetailLevel = {
  ERROR: 0,
  WARNING: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};


/**
 * Timestamp of message.
 * @type {number}
 * @private
 */
ndebug.OutputRecord.prototype.timestamp_ = null;


/**
 * Detail level of output message.
 * @type {ndebug.OutputRecord.DetailLevel}
 * @private
 */
ndebug.OutputRecord.prototype.level_ = null;


/**
 * Message to be recorded.
 * @type {string}
 * @private
 */
ndebug.OutputRecord.prototype.message_ = null;


/**
 * Return the timestamp of the record.
 * @return {number} Timestamp of record entry.
 */
ndebug.OutputRecord.prototype.getTimestamp = function() {
  return this.timestamp_;
};


/**
 * Return the log level for this record entry.
 * @return {ndebug.OutputRecord.DetailLevel} Level of log entry.
 */
ndebug.OutputRecord.prototype.getLevel = function() {
  return this.level_;
};


/**
 * Return log message.
 * @return {string} Log message.
 */
ndebug.OutputRecord.prototype.getMessage = function() {
  return this.message_;
};
