// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Manage the GUI for the app.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * Abstract class to help manage GUI.
 */
ndebug.AppGuiManager = function() {};


/**
 * Run diagnostics currently selected by user.
 */
ndebug.AppGuiManager.runDiagnostics = function() {
  // Step 1: Determine Which Telnet Tests to Run
  if (document.getElementById('google-com-http-telnet').checked == true)
    gHttpBtnClick();

  if (document.getElementById('mail-google-com-http-telnet').checked == true)
    mHttpBtnClick();

  if (document.getElementById('drive-google-com-http-telnet').checked == true)
    dHttpBtnClick();

  // Step 2: Determine Which DNS Tests to Run
  if (document.getElementById('g-dns').checked == true)
    gDnsBtnClick();

  if (document.getElementById('o-dns').checked == true)
    oDnsBtnClick();

  if (document.getElementById('l3-dns').checked == true)
    l3DnsBtnClick();

  if (document.getElementById('whoAmIDnsBtn').checked == true)
    whoAmIDnsBtnClick();

  if (document.getElementById('customDnsBtn').checked == true)
    customDnsBtnClick();

  // Step 3: Determine Which Additional Tests to Run
  if (document.getElementById('network-interface-information').checked == true)
    networkInterfaceInformationBtnClick();

};


/**
 * Toggle the GUI from basic mode to advanced options (and back).
 */
ndebug.AppGuiManager.toggleAdvancedOptions = function() {
  var toggleBtn = document.getElementById('advancedOptionsToggleBtn');
  if (toggleBtn.innerHTML == 'Customize Diagnostics' ||
      document.getElementById('overlay-window-frame').className ==
        'center-container display-full') {
    ndebug.AppGuiManager.hideLoadTestConfigurationsGui();
    document.getElementById('test-detailed-options').className =
      'center-container display-full';
    toggleBtn.innerHTML = 'Basic Mode';
  } else {
    document.getElementById('test-detailed-options').className =
      'center-container display-none';
    toggleBtn.innerHTML = 'Customize Diagnostics';
  }
};


/**
 * Clear the output console.
 */
ndebug.AppGuiManager.consoleClearBtnClicked = function() {
  document.getElementById('console').value = '';
};


/**
 * Copy the contents of the output console to the clipboard.
 */
ndebug.AppGuiManager.consoleCopyBtnClicked = function() {
  document.getElementById('console').select();
  document.execCommand('Copy');
};


/**
 * Show the GUI to load test configurations.
 */
ndebug.AppGuiManager.showLoadTestConfigurationsGui = function() {
  document.getElementById('overlay-window-frame').className =
    'center-container display-full';
  document.getElementById('test-config-input').focus();
  document.getElementById('page-contents').className = 'display-none';
};


/**
 * Hide the GUI to load test configurations.
 */
ndebug.AppGuiManager.hideLoadTestConfigurationsGui = function() {
  document.getElementById('overlay-window-frame').className = 'display-none';
  document.getElementById('page-contents').className =
    'center-container display-full';
};


/**
 * Display information about error parsing configuration.
 * @param {string} error Text of parse error to display to user.
 */
ndebug.AppGuiManager.displayParseError = function(error) {
  document.getElementById('test-config-error').innerHTML = error;
  document.getElementById('test-config-error').className = 'display-full';
};


/**
 * Process inputed test configurations.
 */
ndebug.AppGuiManager.processInputTestConfigurations = function() {
  document.getElementById('test-config-error').className = 'display-none';
  var rawInputText = document.getElementById('test-config-input').value;
  var parser = new ndebug.TestConfigParser(rawInputText);
  parser.setErrorCallbackFnc(ndebug.AppGuiManager.displayParseError);
  parser.parseInput();
};


/**
 * Print output to page console.
 * @param {string} outStr Message to print to the console.
 * @param {ndebug.OutputRecord.DetailLevel} logLevel Level of detail of log.
 * @param {number} timestamp Timestamp of log entry.
 */
ndebug.AppGuiManager.printOutputToScreenConsole = function(outStr,
                                                    logLevel,
                                                    timestamp) {
  ndebug.AppGuiManager.hideLoadTestConfigurationsGui();
  var outputBoxClass = document.getElementById('test-output-area').className;
  if (document.getElementById('test-output-area').className !=
        'center-container display-full') {
    document.getElementById('test-output-area').className =
      'center-container display-full';
  }

  if (arguments.length == 3) {
    var now = new Date(timestamp);
  } else {
    var now = new Date();
  }

  var strDate = now.getUTCFullYear() + '-' + (now.getUTCMonth() + 1) + '-' +
      now.getUTCDate() + ' ' + now.getUTCHours() + ':' + now.getUTCMinutes() +
      ':' + now.getUTCSeconds() + '.' + now.getUTCMilliseconds() + ' UTC';

   var strToAppend = strDate + '\r\n' + outStr + '\r\n\r\n';
   document.getElementById('console').value += strToAppend;
};
