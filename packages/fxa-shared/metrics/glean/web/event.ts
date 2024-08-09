/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// AUTOGENERATED BY glean_parser v14.5.1. DO NOT EDIT. DO NOT COMMIT.

import BooleanMetricType from '@mozilla/glean/private/metrics/boolean';
import StringMetricType from '@mozilla/glean/private/metrics/string';

/**
 * The name of the event
 *
 * Generated from `event.name`.
 */
export const name = new StringMetricType({
  category: 'event',
  name: 'name',
  sendInPings: ['accounts-events'],
  lifetime: 'ping',
  disabled: false,
});

/**
 * additional context-dependent (on event.name) info, e.g. the cause of an error
 *
 * Generated from `event.reason`.
 */
export const reason = new StringMetricType({
  category: 'event',
  name: 'reason',
  sendInPings: ['accounts-events'],
  lifetime: 'ping',
  disabled: false,
});

/**
 * boolean, additional context-dependent (on event.name) info related to third
 * party auth links
 *
 * Generated from `event.third_party_links`.
 */
export const thirdPartyLinks = new BooleanMetricType({
  category: 'event',
  name: 'third_party_links',
  sendInPings: ['accounts-events'],
  lifetime: 'ping',
  disabled: false,
});
