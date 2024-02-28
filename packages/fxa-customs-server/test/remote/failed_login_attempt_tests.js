/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var restifyClients = require('restify-clients');
var TestServer = require('../test_server');
var mcHelper = require('../memcache-helper');
const { randomEmail, randomIp } = require('../utils');

var TEST_EMAIL = randomEmail();
var TEST_IP = randomIp();

const config = require('../../lib/config').getProperties();
var testServer = new TestServer(config);

test('startup', async function (t) {
  await testServer.start();
  t.type(testServer.server, 'object', 'test server was started');
  t.end();
});

test('clear everything', function (t) {
  mcHelper.clearEverything(function (err) {
    t.notOk(err, 'no errors were returned');
    t.end();
  });
});

var client = restifyClients.createJsonClient({
  url: 'http://localhost:' + config.listen.port,
});

test('well-formed request', function (t) {
  client.post(
    '/failedLoginAttempt',
    { email: TEST_EMAIL, ip: TEST_IP },
    function (err, req, res, obj) {
      t.notOk(err, 'good request is successful');
      t.equal(res.statusCode, 200, 'good request returns a 200');
      t.ok(obj, 'got an obj, make jshint happy');
      t.end();
    }
  );
});

test('missing ip', function (t) {
  client.post(
    '/failedLoginAttempt',
    { email: TEST_EMAIL },
    function (err, req, res, obj) {
      t.equal(res.statusCode, 400, 'bad request returns a 400');
      t.type(obj.code, 'string', 'bad request returns an error code');
      t.type(obj.message, 'string', 'bad request returns an error message');
      t.end();
    }
  );
});

test('missing email and ip', function (t) {
  client.post('/failedLoginAttempt', {}, function (err, req, res, obj) {
    t.equal(res.statusCode, 400, 'bad request returns a 400');
    t.type(obj.code, 'string', 'bad request returns an error code');
    t.type(obj.message, 'string', 'bad request returns an error message');
    t.end();
  });
});

test('teardown', async function (t) {
  await testServer.stop();
  t.end();
});
