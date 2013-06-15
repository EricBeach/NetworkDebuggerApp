// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Obtain information about the computer's network interfaces.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * Capture information about currently running network interfaces.
 * @param {ndebug.OutputRecordManager} outputRecordManager Manage output logs.
 * @param {function(ndebug.OutputRecordManager)} completedCallbackFnc Function
 *                                          to call when NIC information is
 *                                          populated.
 * @constructor
 */
ndebug.NetworkInterfaceInformation = function(outputRecordManager,
                                              completedCallbackFnc) {
  this.outputRecordManager_ = outputRecordManager;
  this.completedCallbackFnc_ = completedCallbackFnc;
};


/**
 * Function to call upon completion of population of network interface info.
 * @type {function(ndebug.OutputRecordManager)}
 * @private
 */
ndebug.NetworkInterfaceInformation.prototype.completedCallbackFnc_ = null;


/**
 * Record output diagnostic information.
 * @type {ndebug.OutputRecordManager}
 * @private
 */
ndebug.NetworkInterfaceInformation.prototype.outputRecordManager_ = null;


/**
 * Print NIC information to output record manager.
 */
ndebug.NetworkInterfaceInformation.prototype.getNicInformation = function() {
  var receiveNicInfo = function(info) {
    var strNicInfo = 'There are ' + info.length +
       ' network interfaces on this machine.\r\n';

    for (var i = 0; i < info.length; i++) {
      strNicInfo += 'Interface ' + (i + 1) + ' has address ' +
        info[i].address + ' and name ' + info[i].name + '\r\n';
    }
    strNicInfo = strNicInfo.substring(0, strNicInfo.length - 2);

    this.outputRecordManager_.pushEntry(ndebug.OutputRecord.DetailLevel.INFO,
        strNicInfo);
    this.completedCallbackFnc_(this.outputRecordManager_);
  };

  chrome.socket.getNetworkList(receiveNicInfo.bind(this));
};
