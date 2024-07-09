/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// AUTOGENERATED BY glean_parser v14.1.2. DO NOT EDIT. DO NOT COMMIT.

import EventMetricType from '@mozilla/glean/private/metrics/event';

/**
 * Click on "Create" or "Change" button on account settings page to add a recovery
 * key to the account
 *
 * Generated from `account_pref.recovery_key_submit`.
 */
export const recoveryKeySubmit = new EventMetricType(
  {
    category: 'account_pref',
    name: 'recovery_key_submit',
    sendInPings: ['events'],
    lifetime: 'ping',
    disabled: false,
  },
  []
);
