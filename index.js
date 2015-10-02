'use strict';
var http = require('https');
var querystring = require('querystring');
var config = require('./config.json');

module.exports.handler = handler;
module.exports._payload = payload;
module.exports._stateToColor = stateToColor;

function handler(event, context) {
    var postData = querystring.stringify({
        payload: JSON.stringify(payload(event))
    });

    var options = {
        hostname: config.hostname,
        port: 443,
        path: config.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    var req = http.request(options, function (res) {
        if (res.statusCode === 200) {
            context.succeed('Message delivered to Slack.');
        } else {
            context.fail(new Error('Failed to deliver message to Slack with status code: ' + res.statusCode + '.'));
        }
    });

    req.on('error', function (err) {
        context.fail(err);
    });

    req.write(postData);
    req.end();
}

function payload(event) {
    var message = JSON.parse(event.Records[0].Sns.Message);

    return {
        username: config.name,
        icon_emoji: config.emoji,
        attachments: [
            {
                title: message.AlarmName,
                fallback: message.NewStateReason,
                text: message.NewStateReason,
                fields: [
                    {
                        title: 'Region',
                        value: message.Region,
                        short: true
                    },
                    {
                        title: 'State',
                        value: message.NewStateValue,
                        short: true
                    }
                ],
                color: stateToColor(message.NewStateValue)
            }
        ]
    };
}

function stateToColor(state) {
    if (state === 'OK') {
        return 'good';
    } else if (state === 'ALARM') {
        return 'danger';
    }

    return 'warning';
}
