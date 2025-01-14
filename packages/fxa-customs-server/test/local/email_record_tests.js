/* eslint-disable space-unary-ops */
/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test;
var emailRecord = require('../../lib/email_record');

let nowTimestamp;
function now() {
  return nowTimestamp || 1000; // old school
}

function simpleEmailRecord() {
  var limits = {
    rateLimitIntervalMs: 500,
    suspectIntervalMs: 700,
    blockIntervalMs: 800,
    disableIntervalMs: 900,
    maxEmails: 2,
    maxUnblockAttempts: 2,
    maxBadLoginsPerEmail: 2,
    maxPasswordResetOtpEmails: 2,
    passwordResetOtpEmailRequestWindowMs: 2000,
    passwordResetOtpEmailRateLimitIntervalMs: 5000,
    maxPasswordResetOtpVerificationRateLimit: 2,
    passwordResetOtpVerificationRateLimitWindowMs: 5000,
    maxPasswordResetOtpVerificationBlockLimit: 3,
    passwordResetOtpVerificationBlockWindowMs: 10000,
  };
  return new (emailRecord(limits, now))();
}

test('shouldBlock works', function (t) {
  var er = simpleEmailRecord();

  t.equal(er.shouldBlock(), false, 'record has never been blocked');
  er.rl = 500;
  t.equal(
    er.shouldBlock(),
    false,
    'blockedAt is older than rate-limit interval'
  );
  er.rl = 501;
  t.equal(
    er.shouldBlock(),
    true,
    'blockedAt is within the rate-limit interval'
  );
  delete er.rl;
  t.equal(er.shouldBlock(), false, 'record is no longer blocked');

  er.bk = 200;
  t.equal(er.shouldBlock(), false, 'blockedAt is older than block interval');
  er.bk = 201;
  t.equal(er.shouldBlock(), true, 'blockedAt is within the block interval');
  delete er.bk;
  t.equal(er.shouldBlock(), false);

  er.di = 100;
  t.equal(er.shouldBlock(), false);
  er.di = 101;
  t.equal(er.shouldBlock(), true);
  delete er.di;
  t.equal(er.shouldBlock(), false);

  t.end();
});

test('suspect', (t) => {
  const record = simpleEmailRecord();
  t.equal(record.isSuspected(), false);

  record.suspect();
  t.equal(record.isSuspected(), true);

  t.end();
});

test('block', (t) => {
  const record = simpleEmailRecord();
  t.equal(record.isBlocked(), false);

  record.block();
  t.equal(record.isBlocked(), true);

  t.end();
});

test('disable', (t) => {
  const record = simpleEmailRecord();
  t.equal(record.isDisabled(), false);

  record.disable();
  t.equal(record.isDisabled(), true);

  t.end();
});

test('addHit works', function (t) {
  var er = simpleEmailRecord();

  t.equal(er.xs.length, 0, 'record has never been emailed');
  er.addHit();
  t.equal(er.xs.length, 1, 'record has been emailed once');
  er.addHit();
  er.addHit();
  t.equal(er.xs.length, 3, 'record has been emailed three times');
  t.end();
});

test('rateLimit works', function (t) {
  var er = simpleEmailRecord();

  er.addHit();
  t.equal(er.shouldBlock(), false, 'record is not blocked');
  t.equal(er.xs.length, 1, 'record has been emailed once');
  er.rateLimit();
  t.equal(er.shouldBlock(), true, 'record is blocked');
  t.equal(er.xs.length, 0, 'record has an empty list of emails');
  t.end();
});

test('trimHits enforces the email limit', function (t) {
  var er = simpleEmailRecord();

  t.equal(er.xs.length, 0, 'record has nothing to trim');
  er.addHit();
  er.addHit();
  er.addHit();
  er.addHit();
  t.equal(er.xs.length, 4, 'record contains too many emails');
  er.trimHits(now());
  t.equal(er.xs.length, 3, 'record has trimmed excess emails');
  t.end();
});

test('trimHits evicts expired entries', function (t) {
  var er = simpleEmailRecord();

  t.equal(er.xs.length, 0, 'record has nothing to trim');
  er.trimHits(now());
  t.equal(er.xs.length, 0, 'trimming did not do anything');
  er.xs.push(400);
  er.xs.push(400);
  er.xs.push(now());
  t.equal(er.xs.length, 3, 'record contains expired and fresh emails');
  er.trimHits(now());
  t.equal(er.xs.length, 1, 'record has trimmed expired emails');
  t.end();
});

test('isOverEmailLimit works', function (t) {
  var er = simpleEmailRecord();

  t.equal(er.isOverEmailLimit(), false, 'record has never been emailed');
  er.addHit();
  t.equal(
    er.isOverEmailLimit(),
    false,
    'record has not reached the email limit'
  );
  er.addHit();
  er.addHit();
  t.equal(er.isOverEmailLimit(), true, 'record has reached the email limit');
  t.end();
});

test('retryAfter works', function (t) {
  var limits = {
    rateLimitIntervalMs: 5000,
    blockIntervalMs: 8000,
    maxEmails: 2,
  };
  var er = new (emailRecord(limits, function () {
    return 10000;
  }))();

  t.equal(er.retryAfter(), 0, 'unblocked records can be retried now');
  er.rl = 1000;
  t.equal(er.retryAfter(), 0, 'long expired blocks can be retried immediately');
  er.rl = 5000;
  t.equal(er.retryAfter(), 0, 'just expired blocks can be retried immediately');
  er.rl = 6000;
  t.equal(er.retryAfter(), 1, 'unexpired blocks can be retried in a bit');
  t.equal(er.retryAfter(10000), 6, 'optional rate limit interval');
  er.bk = 6000;
  t.equal(er.retryAfter(10000, 20000), 16, 'optional block interval');

  delete er.rl;
  delete er.bk;
  t.equal(er.retryAfter(), 0, 'unblocked records can be retried now');
  er.bk = 1000;
  t.equal(er.retryAfter(), 0, 'long expired blocks can be retried immediately');
  er.bk = 2000;
  t.equal(er.retryAfter(), 0, 'just expired blocks can be retried immediately');
  er.bk = 6000;
  t.equal(er.retryAfter(), 4, 'unexpired blocks can be retried in a bit'); // TODO?
  t.end();
});

test('passwordReset works', function (t) {
  var er = simpleEmailRecord();
  er.os = [990];
  er.ov = [999];
  t.equal(er.pr, undefined, 'password is not marked as reset yet');
  er.passwordReset();
  t.equal(er.pr, 1000, 'password is marked as reset now');
  t.equal(er.os.length, 0);
  t.equal(er.ov.length, 0);
  t.end();
});

test('unblock', function (t) {
  var er = simpleEmailRecord();
  er.addUnblock();
  t.ok(er.canUnblock(), 'unblock limit is not reached');
  er.addUnblock();
  t.ok(er.canUnblock(), 'unblock limit is still not reached');
  er.addUnblock();
  t.equal(er.canUnblock(), false, 'maxUnblockAttempts exceeded');
  t.end();
});

test('parse works', function (t) {
  var er = simpleEmailRecord();
  t.equal(er.shouldBlock(), false, 'original object is not blocked');
  t.equal(er.xs.length, 0, 'original object has no hits');
  var limits = {
    rateLimitIntervalMs: 50,
    blockIntervalMs: 50,
    maxEmails: 2,
  };
  var erCopy1 = emailRecord(limits, now).parse(er);
  t.equal(erCopy1.shouldBlock(), false, 'copied object is not blocked');
  t.equal(erCopy1.xs.length, 0, 'copied object has no hits');

  er.rateLimit();
  er.addHit();
  t.equal(er.shouldBlock(), true, 'original object is now blocked');
  t.equal(er.xs.length, 1, 'original object now has one hit');

  var erCopy2 = emailRecord(limits, now).parse(er);
  t.equal(erCopy2.shouldBlock(), true, 'copied object is blocked');
  t.equal(erCopy2.xs.length, 1, 'copied object has one hit');
  t.end();
});

test('update works', function (t) {
  var er = simpleEmailRecord();

  t.equal(er.update('bogusAction'), 0, 'bogus email actions does nothing');
  t.equal(er.update('accountCreate'), 0, 'email action in a clean account');
  er.addHit();
  er.addHit();
  er.addHit();
  t.equal(er.shouldBlock(), false, 'account is not blocked');
  t.equal(er.update('accountCreate'), 1, 'email action above the email limit');
  t.equal(er.shouldBlock(), true, 'account is now blocked');
  t.equal(er.update('accountCreate'), 1, 'email action in a blocked account');

  t.equal(er.ub.length, 0, 'no unblock attempts');
  er.update('bogus', true);
  t.equal(er.ub.length, 1, '1 unblock attempt');

  er.rl = 2000;
  t.equal(er.shouldBlock(), true, 'account is blocked due to rate limiting');
  t.equal(er.isBlocked(), false, 'account is not outright banned');
  t.equal(er.isRateLimited(), true, 'account is rate limited');
  t.equal(er.update('accountCreate'), 2, 'email action is blocked');
  t.equal(er.update('accountLogin'), 0, 'non-email action is not blocked');
  er.rl = 0;
  er.bk = 2000;
  t.equal(
    er.shouldBlock(),
    true,
    'account is blocked due to being outright blocked'
  );
  t.equal(er.isBlocked(), true, 'account is outright banned');
  t.equal(er.isRateLimited(), false, 'account is not rate limited');
  t.equal(er.update('accountCreate'), 2, 'email action is blocked');
  t.equal(er.update('accountLogin'), 2, 'non-email action is blocked');

  er = simpleEmailRecord();
  er.os = [];
  nowTimestamp = 1001;
  er.update('passwordForgotSendOtp');
  nowTimestamp = 1003;
  let res = er.update('passwordForgotSendOtp');
  t.equal(res === 0, true, 'account is not rate limited');
  nowTimestamp = 2001;
  res = er.update('passwordForgotSendOtp');
  t.equal(res > 0, true, 'account is rate limited');
  nowTimestamp = null;

  er = simpleEmailRecord();
  er.ov = [];
  nowTimestamp = 1001;
  er.update('passwordForgotVerifyOtp');
  nowTimestamp = 1003;
  res = er.update('passwordForgotVerifyOtp');
  t.equal(res === 0, true, 'account is not rate limited or blocked');
  nowTimestamp = 2001;
  const verifyOtpRateLimitRes = er.update('passwordForgotVerifyOtp');
  t.equal(verifyOtpRateLimitRes > 0, true, 'account is rate limited');
  nowTimestamp = 8001;
  const verifyOtpBlockLimitRes = er.update('passwordForgotVerifyOtp');
  t.equal(
    verifyOtpBlockLimitRes - verifyOtpRateLimitRes > 0,
    true,
    'account is blocked'
  );

  nowTimestamp = null;

  t.end();
});

test('getMinLifetimeMS works', function (t) {
  var limits = {
    rateLimitIntervalMs: 11,
    blockIntervalMs: 21,
    maxEmails: 2,
  };
  var er = new (emailRecord(limits, now))();
  t.equal(er.getMinLifetimeMS(), 21, 'lifetime >= block interval');
  limits = {
    rateLimitIntervalMs: 22,
    blockIntervalMs: 15,
    maxEmails: 2,
  };
  er = new (emailRecord(limits, now))();
  t.equal(er.getMinLifetimeMS(), 22, 'lifetime >= rate limit internal');
  t.end();
});

test('trimBadLogins enforces the bad login limit', (t) => {
  const record = simpleEmailRecord();

  t.equal(record.lf.length, 0, 'record has nothing to trim');
  record.addBadLogin();
  record.addBadLogin();
  record.addBadLogin();
  record.addBadLogin();
  t.equal(record.lf.length, 4, 'record contains too many bad logins');
  record.trimBadLogins(now());
  t.equal(record.lf.length, 3, 'record has trimmed excess bad logins');
  t.end();
});

test('trimBadLogins evicts expired entries', (t) => {
  var record = simpleEmailRecord();

  t.equal(record.lf.length, 0, 'record has nothing to trim');
  record.trimBadLogins(now());
  t.equal(record.lf.length, 0, 'trimming did not do anything');
  record.lf.push(400);
  record.lf.push(400);
  record.lf.push(now());
  t.equal(record.lf.length, 3, 'record contains expired and fresh logins');
  record.trimBadLogins(now());
  t.equal(record.lf.length, 1, 'record has trimmed expired bad logins');
  t.end();
});

test('isOverBadLogins works', (t) => {
  var record = simpleEmailRecord();

  t.equal(record.isOverBadLogins(), false, 'record has never seen bad logins');
  record.addBadLogin();
  t.equal(
    record.isOverBadLogins(),
    false,
    'record has not reached the bad login limit'
  );
  record.addBadLogin();
  record.addBadLogin();
  t.equal(
    record.isOverBadLogins(),
    true,
    'record has reached the bad login limit'
  );
  t.end();
});
