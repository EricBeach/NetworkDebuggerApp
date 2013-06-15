// Copyright 2013. All Rights Reserved.

/**
 * @fileoverview Manage the GUI for the app.
 *
 * @author ebeach@google.com (Eric Beach)
 */



/*
<tests>
<test type="dns|telnet|nicinfo">
...
</test>
<test type="dns">
<hostname></hostname>
<recordtype></recordtype>
<resolver></resolver>
</test>
<test type="telnet">
<host></host>
<port></port>
</test>
</tests>
*/

/**
 * Parse XML formatted test configuration information and execute tests.
 * @param {string} xmlStrToParse XML formatted string containing info about
 *                               tests to parse.
 * @constructor
 */
ndebug.TestConfigParser = function(xmlStrToParse) {
  this.xmlStr_ = xmlStrToParse;
  this.xmlParser_ = new DOMParser();
};


/**
 * @type {string}
 * @private
 */
ndebug.TestConfigParser.prototype.xmlStr_ = null;


/**
 * Function to call upon encountering an error parsing test configuration file.
 *   Provide a blank default function for safety.
 * @type {function(string)}
 * @private
 */
ndebug.TestConfigParser.prototype.fncParseErrorCallback_ = function() {};


/**
 * Set a function to be called upon parse error.
 * @param {function(string)} fnc Function to call upon parse error.
 */
ndebug.TestConfigParser.prototype.setErrorCallbackFnc = function(fnc) {
  this.fncParseErrorCallback_ = fnc;
};


/**
 * @type {DOMParser}
 * @private
 */
ndebug.TestConfigParser.prototype.xmlParser_ = null;


/**
 * Parse string into tests and execute them.
 * @return {null} Null value to break execution flow upon error.
 */
ndebug.TestConfigParser.prototype.parseInput = function() {
  var doc = this.xmlParser_.parseFromString(
      this.xmlStr_, 'application/xml');

  // determine whether the string parsed successfully
  if (doc.getElementsByTagName('parsererror').length == 1) {
    this.fncParseErrorCallback_('error - invalid XML file');
    return null;
  }

  // check for the presence of one <tests> element
  if (doc.getElementsByTagName('tests').length != 1) {
    this.fncParseErrorCallback_('error -- there should be exactly one <tests>');
    return null;
  }

  // check for the presence of at least one <test> element
  if (doc.getElementsByTagName('test').length < 1) {
    this.fncParseErrorCallback_('error -- there should be at least one <test>');
    return null;
  }

  // check that <tests> is parent element
  if (doc.firstChild.localName != 'tests') {
    this.fncParseErrorCallback_('error -- first element needs to be <tests>');
    return null;
  }

  // check that all children of <tests> are <test> nodes
  var parentNode = doc.getElementById('parent-tests');
  var numChildren = parentNode.childNodes.length;
  var testToParse = parentNode.firstChild;
  for (var i = 0; i < numChildren; i++) {
    if (testToParse.attributes.length != 1) {
      this.fncParseErrorCallback_('error - invalid number of attributes');
      return null;
    }

    var currentTestType = testToParse.getAttribute('type');
    switch (currentTestType) {
      case 'dns':
        this.parseDnsTestConfig(testToParse);
        break;
      case 'telnet':
        this.parseTelnetTestConfig(testToParse);
        break;
      default:
        this.fncParseErrorCallback_('error - invalid test type');
        return null;
        break;
    }
    testToParse = testToParse.nextSibling;
  }
  return null;
};


/**
 * Parse a DNS test, validating input and, if appropriate, executing test.
 * @param {DOMElement} test DNS query parameters for a DNS test.
 */
ndebug.TestConfigParser.prototype.parseDnsTestConfig = function(test) {
  if (test.childNodes.length != 3) {
    this.fncParseErrorCallback_('error - not proper field count');
  }

  if (test.getElementsByTagName('recordtype').length != 1) {
    this.fncParseErrorCallback_('error - no DNS record type');
  }

  if (test.getElementsByTagName('hostname').length != 1) {
    this.fncParseErrorCallback_('error - no DNS hostname');
  }

  if (test.getElementsByTagName('resolver').length != 1) {
    this.fncParseErrorCallback_('error - no DNS resolver');
  }

  var recordTypeName = test.getElementsByTagName('recordtype')[0].textContent;
  var hostname = test.getElementsByTagName('hostname')[0].textContent;
  var resolver = test.getElementsByTagName('resolver')[0].textContent;

  var outputRecordManager = new ndebug.OutputRecordManager();
  var gDnsQuery = new ndebug.DNSQueryManager(hostname,
      ndebug.DNSUtil.getRecordTypeNumByRecordTypeName(recordTypeName),
      resolver,
      finishedDnsFnc,
      outputRecordManager);
  gDnsQuery.sendRequest();
};


/**
 * Parse a Telnet test, validating input and, if appropriate, executing test.
 * @param {DOMElement} test Telnet query parameters for a Telnet test.
 */
ndebug.TestConfigParser.prototype.parseTelnetTestConfig = function(test) {
  if (test.childNodes.length != 2) {
    this.fncParseErrorCallback_('error - invalid number of telnet parameters');
  }

  if (test.getElementsByTagName('host').length != 1) {
    this.fncParseErrorCallback_('error - no host specified');
  }

  if (test.getElementsByTagName('port').length != 1) {
    this.fncParseErrorCallback_('error - no port specified');
  }

  var host = test.getElementsByTagName('host')[0].textContent;
  var port = Number(test.getElementsByTagName('port')[0].textContent);
  var outputRecordManager = new ndebug.OutputRecordManager();
  var objTelnet = new ndebug.Telnet(host, port, outputRecordManager);
  objTelnet.
      setPlainTextDataToSend('GET / HTTP/1.1\r\nHost: ' +
          host + '\r\n\r\n');
  objTelnet.setCompletedCallbackFnc(printFinishedTelnetOutput);
  objTelnet.createSocket();
};
