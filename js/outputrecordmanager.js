// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Capture and store output from tests.
 *
 * @author ebeach@google.com (Eric Beach)
 */



/**
 * Receive output messages from one test and record it along with an associated
 * timestamp. Each test should have its own instance of an OutputRecordManager.
 *
 * @constructor
 */
ndebug.OutputRecordManager = function() {
  this.outputEntries_ = new Array();
};


/**
 * Store instances of OutputRecord.
 * @type Array.<ndebug.OutputRecord>
 * @private
 */
ndebug.OutputRecordManager.prototype.outputEntries_ = null;


/**
 * Push a message to the record.
 * @param {ndebug.OutputRecord.DetailLevel} level Level of log information.
 * @param {string} msg Message to be recorded.
 */
ndebug.OutputRecordManager.prototype.pushEntry = function(level, msg) {
  var record = new ndebug.OutputRecord(level, msg);
  this.outputEntries_.push(record);
};


/**
 * Return set of output entries.
 * @return {Array.<ndebug.OutputRecord>} Set of output entries with log records.
 */
ndebug.OutputRecordManager.prototype.getOutputRecords = function() {
  return this.outputEntries_;
};
