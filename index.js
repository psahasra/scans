var async = require('async');
var fs = require('fs');
var path = require('path');

//var argv = require('optimist').usage('Usage: $node index.js -keyid [access_key_ID] -secret [aws_secret] -region [region] -session_token [sessionToken]').demand(['keyid']).argv;
// OPTION 1: Configure AWS credentials through hard-coded key and secret
var AWSConfig = {
     accessKeyId: 'AKIAI3OZ7TVJ3OQ4AM4Q',
     secretAccessKey: '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',
	 sessionToken: '',
     region: 'us-west-2'
};

/*var AWSConfig = {
     accessKeyId: argv.keyid,
     secretAccessKey: argv.secret,
     sessionToken: argv.session_token,
     region: argv.region
};
*/
// OPTION 2: Import an AWS config file containing credentials
// var AWSConfig = require(__dirname + '/credentials.json');

// OPTION 3: Set AWS credentials in environment variables

var plugins = [
    'iam/rootAccountSecurity.js',
    'iam/usersMfaEnabled.js',
    'iam/passwordPolicy.js',
    'iam/accessKeys.js',
    'iam/sshKeys.js',
    'iam/groupSecurity.js',
    'cloudtrail/cloudtrailEnabled.js',
    'cloudtrail/cloudtrailBucketDelete.js',
    'ec2/accountLimits.js',
    'ec2/certificateExpiry.js',
    'ec2/insecureCiphers.js',
    'vpc/detectClassic.js',
    'ec2/securityGroups.js',
    's3/s3Buckets.js',
    'route53/domainSecurity.js',
    'rds/databaseSecurity.js'
];

console.log('CATEGORY\t\tPLUGIN\tTEST\tRESOURCE\tREGION\tSTATUS\tMESSAGE');

var table = '<html><title> AWS Infrastructure security test report</title><body><table border="1" bgcolor="#a3a3a3" id="issues">';
var cell1 = '<tr bgcolor="#000099"><strong><th><font face="verdana" color="white">CATEGORY</font></th><th><font face="verdana" color="white">PLUGIN</font></th><th><font face="verdana" color="white">TEST</font></th><th><font face="verdana" color="white">RESOURCE</font></th><th><font face="verdana" color="white">REGION</font></th><th><font face="verdana" color="white">STATUS</font></th><th><font face="verdana" color="white">MESSAGE DESCRIPTION</font></th></tr>';
table = table + cell1;
var cellRow = '';
var name = 'result.html';
async.eachSeries(plugins, function(pluginPath, callback){
    var plugin = require(__dirname + '/plugins/' + pluginPath);

    plugin.run(AWSConfig, function(err, result){
        //console.log(JSON.stringify(result, null, 2));
        for (i in result.tests) {
            for (j in result.tests[i].results) {
                var statusWord;
                if (result.tests[i].results[j].status === 0) {
                    statusWord = 'OK';
                } else if (result.tests[i].results[j].status === 1) {
                    statusWord = 'WARN';
                } else if (result.tests[i].results[j].status === 2) {
                    statusWord = 'FAIL';
                } else {
                    statusWord = 'UNKNOWN';
                }

                console.log(result.category + '\t\t' + result.title + '\t' + result.tests[i].title + '\t' + (result.tests[i].results[j].resource || 'N/A') + '\t' + (result.tests[i].results[j].region || 'Global') + '\t' + statusWord + '\t' + result.tests[i].results[j].message);
                table = table + '<tr bgcolor="#e6ffe6">' + cellRow;
                cellRow = '<td>' + result.category + '</td>' + '<td>' +  result.title + '</td>' + '<td>' + result.tests[i].title + '</td>' + '<td>' + (result.tests[i].results[j].resource || 'N/A') + '</td>' + '<td>' + (result.tests[i].results[j].region || 'Global') + '</td>' + '<td>' + statusWord + '</td>'  + '<td>' + result.tests[i].results[j].message + '</td>';
                table = table + '\n' + '</tr>'
            }
        }
        callback(err);
             
        
    });
    
}, function(err, data){
    if (err) {
        return console.log(err);
    } else {
        table = table + '\n' + '</table></body></html>';
        fs.writeFile(name, table, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("The scan results were saved to " + name);
        }
    });
    }
});

