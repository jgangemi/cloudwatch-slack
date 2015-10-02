'use strict';
var assert = require('assert');
var cloudwatchSlack = require('../index');
var config = require('../config.json');
var http = require('http');
var message = require('./fixture/message.json');
var sinon = require('sinon');
var PassThrough = require('stream').PassThrough;

describe('cloudwatch-slack', function () {
    beforeEach(function () {
        this.request = sinon.stub(http, 'request');
    });

    afterEach(function () {
        http.request.restore();
    });

    describe('.handler', function () {
        it('should call context success if request succeeds', function (done) {
            var request = new PassThrough();

            this.request.callsArgWith(1, {
                statusCode: 200
            }).returns(request);

            cloudwatchSlack.handler(message, {
                succeed: function (result) {
                    assert.strictEqual(result, 'Message delivered to Slack.');
                    done();
                },
                fail: function (error) {
                    done(error);
                }
            });
        });

        it('should call context fail if request fails', function (done) {
            var request = new PassThrough();

            this.request.callsArgWith(1, {
                statusCode: 500
            }).returns(request);

            cloudwatchSlack.handler(message, {
                succeed: function (result) {
                    done(new Error(result));
                },
                fail: function (error) {
                    assert.strictEqual(error.message, 'Failed to deliver message to Slack with status code: 500.');
                    done();
                }
            });
        });

        it('should call context fail if request errors', function (done) {
            var expectedError = new Error('foo error');
            var request = new PassThrough();

            this.request.returns(request);

            cloudwatchSlack.handler(message, {
                succeed: function (result) {
                    done(new Error(result));
                },
                fail: function (error) {
                    assert.deepStrictEqual(error, expectedError);
                    done();
                }
            });

            request.emit('error', expectedError);
        });
    });

    describe('._payload', function () {
        it('should create a json payload from the message fixture', function () {
            assert.deepStrictEqual(cloudwatchSlack._payload(message), {
                username: config.name,
                icon_emoji: config.emoji,
                attachments: [
                    {
                        title: 'BillingAlarm',
                        fallback: 'Threshold Crossed: 1 datapoint (0.1) was greater than the threshold (0.0).',
                        text: 'Threshold Crossed: 1 datapoint (0.1) was greater than the threshold (0.0).',
                        fields: [
                            {
                                title: 'Region',
                                value: 'US - N. Virginia',
                                short: true
                            }, {
                                title: 'State',
                                value: 'ALARM',
                                short: true
                            }
                        ],
                        color: 'danger'
                    }
                ]
            });
        });
    });

    describe('._stateToColor', function () {
        it('should map OK to good', function () {
            assert.strictEqual(cloudwatchSlack._stateToColor('OK'), 'good');
        });

        it('should map ALARM to danger', function () {
            assert.strictEqual(cloudwatchSlack._stateToColor('ALARM'), 'danger');
        });

        it('should map anything else to warning', function () {
            assert.strictEqual(cloudwatchSlack._stateToColor('foo'), 'warning');
        });
    });
});
