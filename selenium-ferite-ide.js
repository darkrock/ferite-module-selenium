/**
 * Format for Selenium Remote Control ferite client.
 * Adapted from the PHP Selenium Remote Control client.
 * Thanks to Sonic.
 */

load('remoteControl.js');

this.name = "ferite-rc";

function testMethodName(testName) {
	return "test" + capitalize(testName);
}

function assertTrue(expression) {
	return "Test.assertTrue(" + expression.toString() + ", __FILE__, __LINE__);";
}

function assertFalse(expression) {
	return "Test.assertFalse(" + expression.toString() + ", __FILE__, __LINE__);";
}

function verify(statement) {
	return 
	"monitor {\n" +
	indent(1) + statement + "\n" +
	"} handle ( error ) {\n" +
	indent(1) + "Test.verificationErrors[] = error.str;\n" +
	"}";
}

function verifyTrue(expression) {
	return verify(assertTrue(expression));
}

function verifyFalse(expression) {
	return verify(assertFalse(expression));
}

function joinExpression(expression) {
	return "Array.join(" + expression.toString() + ",',')";
}

function assignToVariable(type, variable, expression) {
    return "void " + variable + " = " + expression.toString();
}
function waitFor(expression) {
	return 
	"for( number second = 0; ; second++ ){\n" +
	indent(1) + 'if( second >= 60 ) Test.fail("Timeout waiting for expression: ' + expression.toString() + '");\n' +
	indent(1) + "monitor {\n" +
		indent(2) + (expression.setup ? expression.setup() + " " : "") +
		indent(2) + "if (" + expression.toString() + ") break;\n" +
	indent(1) + '} handle ( error ) { Test.fail("Unable to wait for expression: ' + expression.toString() + '; error: ${error.str}")}\n' +
	indent(1) + 'Sys.sleep(1);\n' +
	"}\n";
}

function assertOrVerifyFailure(line, isAssert) {
	var message = '"Expected failure"';
	var failStatement = isAssert ? 
		"Test.fail(" + message  + ");" :
		"Test.verificationErrors[] = " + message + ");";
	return 
	"monitor { \n" +
		line + "\n" +
		failStatement + "\n" +
	"} handle ( error ) {\n" + 
	indent(1) + "message = '';\n" +
	"}\n";
};

Equals.prototype.toString = function() {
	return this.e1.toString() + " == " + this.e2.toString();
};

Equals.prototype.assert = function() {
	return "Test.assertEquals(" + this.e1.toString() + ", " + this.e2.toString() + ", __FILE__, __LINE__);";
};

Equals.prototype.verify = function() {
	return verify(this.assert());
};

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " != " + this.e2.toString();
};

NotEquals.prototype.assert = function() {
	return "Test.assertNotEquals(" + this.e1.toString() + ", " + this.e2.toString() + ", __FILE__, __LINE__);";
};

NotEquals.prototype.verify = function() {
	return verify(this.assert());
};

RegexpMatch.prototype.toString = function() {
	return "Regexp.match('" + this.pattern.replace(/\//g, "\\/") + "'," + this.expression + ");";
};

RegexpNotMatch.prototype.toString = function() {
	return "Regexp.match('" + this.pattern.replace(/\//g, "\\/") + "'," + this.expression + ");";
};

function pause(milliseconds) {
	return "Sys.sleep(" + (parseInt(milliseconds) / 1000) + ");";
};

function echo(message) {
	return "Console.println(" + xlateArgument(message) + ' . "\\n");';
};

function statement(expression) {
	return expression.toString() + ';';
};

function array(value) {
	var str = '[';
	for (var i = 0; i < value.length; i++) {
		str += string(value[i]);
		if (i < value.length - 1) str += ", ";
	}
	str += ']';
	return str;
};

function nonBreakingSpace() {
	return "\"\\xa0\"";
};

CallSelenium.prototype.toString = function() {
	var result = '';
	if (this.negative) {
		result += '!';
	}
	if (options.receiver) {
		result += options.receiver + '.';
	}
	result += this.message;
	result += '(';
	for (var i = 0; i < this.args.length; i++) {
		result += this.args[i];
		if (i < this.args.length - 1) {
			result += ', ';
		}
	}
	result += ')';
	return result;
};

function formatComment(comment) {
	return comment.comment.replace(/.+/mg, function(str) {
		return "// " + str;
	});
}

this.options = {
	receiver: "selenium",
	environment: "*firefox",
	header: 
		'Test.suite("{set-suite-name}").record( "{set-test-name}", "{set-test-description}", 0 ) using ( verbose ) {\n',
	footer:
		'};\n',
	indent: "2",
	initialIndents: '2'
};


this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />' +
	'<description>Environment</description>' +
	'<textbox id="options_environment" />';
