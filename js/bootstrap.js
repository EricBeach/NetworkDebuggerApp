// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Bootstrap the network debugging application.
 *
 * @author ebeach@google.com (Eric Beach)
 */


/**
 * Bootstrap the network debugger app.
 *
 * @constructor
 */
ndebug.Bootstrap = function() {
  this.addDomEventListeners();
};

/**
 * Add event listeners to the GUI.
 */
ndebug.Bootstrap.prototype.addDomEventListeners = function() {
  // add listeners for running general diagnostics
  document.getElementById('runDiagnosticsBtn').addEventListener('click',
      ndebug.AppGuiManager.runDiagnostics, false);
  document.getElementById('advancedOptionsToggleBtn').addEventListener('click',
      ndebug.AppGuiManager.toggleAdvancedOptions, false);

  // add listeners for loading, quitting, or running test configurations
  document.getElementById('loadTestConfigBtn').addEventListener('click',
      ndebug.AppGuiManager.showLoadTestConfigurationsGui, false);
  document.getElementById('quitConfigLoadScreenBtn').addEventListener('click',
      ndebug.AppGuiManager.hideLoadTestConfigurationsGui, false);
  document.getElementById('runLoadedTests').addEventListener('click',
      ndebug.AppGuiManager.processInputTestConfigurations, false);

  // add listeners to console control
  document.getElementById('consoleClearBtn')
      .addEventListener('click',
                        ndebug.AppGuiManager.consoleClearBtnClicked, false);
  document.getElementById('consoleCopyBtn')
      .addEventListener('click',
                        ndebug.AppGuiManager.consoleCopyBtnClicked, false);
};



// function for callback and display of DNS results
//TODO: clean up and place inside object
function finishedDnsFnc(completedDnsQueryManager) {
  var analyzer = new ndebug.DNSResponsePacketAnalyzer(completedDnsQueryManager);
  analyzer.defaultPrintResponse();
  var analyzedQueryManager = analyzer.getDnsQueryManager();
  var finishedOutputRecordManager =
    analyzer.getDnsQueryManager().getOutputRecordManager();
  var finishedOutputRecords = finishedOutputRecordManager.getOutputRecords();

  for (var n = 0; n < finishedOutputRecords.length; n++) {
    ndebug.AppGuiManager.printOutputToScreenConsole(
               finishedOutputRecords[n].getMessage(),
               finishedOutputRecords[n].getLevel(),
               finishedOutputRecords[n].getTimestamp());
  }
}

// TODO: clean up and place inside object
function basicDiagnostics() {
  // hosts to query Google Public DNS

  for (var i = 0; i < ndebug.Util.hostnamesToTest.length; i++) {
    var outputRecordManager = new ndebug.OutputRecordManager();
    var gDnsQuery = new ndebug.DNSQueryManager(
        ndebug.Util.hostnamesToTest[i],
        ndebug.DNSUtil.RecordNumber.A,
        '8.8.8.8',
        finishedDnsFnc,
        outputRecordManager);
    gDnsQuery.sendRequest();
  }
}

//TODO: clean up and place inside object
function l3DnsBtnClick() {
   var inputHelper = new ndebug.DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
     var outputRecordManager = new ndebug.OutputRecordManager();
     var gDnsQuery = new ndebug.DNSQueryManager(
         inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '209.244.0.3',
         finishedDnsFnc,
         outputRecordManager);
     gDnsQuery.sendRequest();
   }
}

//TODO: clean up and place inside object
function oDnsBtnClick() {
   var inputHelper = new ndebug.DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
     var outputRecordManager = new ndebug.OutputRecordManager();
     var gDnsQuery = new ndebug.DNSQueryManager(
         inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '208.67.222.222',
         finishedDnsFnc,
         outputRecordManager);
     gDnsQuery.sendRequest();
   }
}

//TODO: clean up and place inside object
function gDnsBtnClick() {
   var inputHelper = new ndebug.DNSInputHelper();
   if (inputHelper.isValidHostnameEntered()) {
     var outputRecordManager = new ndebug.OutputRecordManager();
     var gDnsQuery = new ndebug.DNSQueryManager(
         inputHelper.getHostnameEntered(),
         inputHelper.getRecordType(),
         '8.8.8.8',
         finishedDnsFnc,
         outputRecordManager);
     gDnsQuery.sendRequest();
   }
}

//TODO: clean up and place inside object
function whoAmIDnsBtnClick() {
  var outputRecordManager = new ndebug.OutputRecordManager();
    var gDnsQuery = new ndebug.DNSQueryManager('o-o.myaddr.google.com',
        ndebug.DNSUtil.RecordNumber.TXT,
            '8.8.8.8',
            finishedDnsFnc,
            outputRecordManager);
        gDnsQuery.sendRequest();
}

//TODO: clean up and place inside object
function customDnsBtnClick() {
    var inputHelper = new ndebug.DNSInputHelper();
    if (inputHelper.isValidHostnameEntered() &&
            inputHelper.isValidCustomResolverIpEntered()) {
      var outputRecordManager = new ndebug.OutputRecordManager();
      var gDnsQuery = new ndebug.DNSQueryManager(
          inputHelper.getHostnameEntered(),
          inputHelper.getRecordType(),
          inputHelper.getCustomResolverIp(),
          finishedDnsFnc,
          outputRecordManager);
      gDnsQuery.sendRequest();
    }
}

//TODO: clean up and place inside object
function printFinishedTelnetOutput(outputRecordManager) {
  var nicOutputRecords = outputRecordManager.getOutputRecords();
  for (var j = 0; j < nicOutputRecords.length; j++) {
    ndebug.AppGuiManager.printOutputToScreenConsole(
               nicOutputRecords[j].getMessage(),
               nicOutputRecords[j].getLevel(),
               nicOutputRecords[j].getTimestamp());
  }
}

//TODO: clean up and place inside object
function gHttpBtnClick() {
  var outputRecordManager = new ndebug.OutputRecordManager();
  var objTelnet = new ndebug.Telnet('www.google.com', 80, outputRecordManager);
   objTelnet.
      setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: www.google.com\r\n\r\n');
   objTelnet.setCompletedCallbackFnc(printFinishedTelnetOutput);
   objTelnet.createSocket();
}

//TODO: clean up and place inside object
function mHttpBtnClick() {
  var outputRecordManager = new ndebug.OutputRecordManager();
  var objTelnet = new ndebug.Telnet('mail.google.com',
                                    80,
                                    outputRecordManager);
   objTelnet.
      setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: mail.google.com\r\n\r\n');
   objTelnet.setCompletedCallbackFnc(printFinishedTelnetOutput);
   objTelnet.createSocket();
}

//TODO: clean up and place inside object
function dHttpBtnClick() {
  var outputRecordManager = new ndebug.OutputRecordManager();
  var objTelnet = new ndebug.Telnet('drive.google.com',
                                    80,
                                    outputRecordManager);
   objTelnet.
     setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: drive.google.com\r\n\r\n');
   objTelnet.setCompletedCallbackFnc(printFinishedTelnetOutput);
   objTelnet.createSocket();
}

//TODO: clean up and place inside object
function networkInterfaceInformationBtnClick() {
  function printOutput(outputRecordManager) {
    var nicOutputRecords = outputRecordManager.getOutputRecords();
    for (var j = 0; j < nicOutputRecords.length; j++) {
      ndebug.AppGuiManager.printOutputToScreenConsole(
                 nicOutputRecords[j].getMessage(),
                 nicOutputRecords[j].getLevel(),
                 nicOutputRecords[j].getTimestamp());
    }
  }

  var outputRecordManager = new ndebug.OutputRecordManager();
  var nicInfo = new ndebug.NetworkInterfaceInformation(outputRecordManager,
                                                printOutput);
  nicInfo.getNicInformation();
}

document.addEventListener('DOMContentLoaded', function () {
  var bootstrap = new ndebug.Bootstrap();
});
