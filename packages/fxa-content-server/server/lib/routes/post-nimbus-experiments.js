/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../configuration');
const joi = require('joi');
const {
  overrideJoiMessages,
} = require('fxa-shared/sentry/joi-message-overrides');

const BODY_SCHEMA = {
  client_id: joi.string().required(),
  context: joi.object().required(),
};

module.exports = function (options = {}) {
  return {
    method: 'post',
    path: '/nimbus-experiments',
    validate: {
      body: overrideJoiMessages(BODY_SCHEMA),
    },
    process: async function (req, res) {
      const body = JSON.stringify({
        client_id: req.body.client_id,
        context: req.body.context,
      });

      // const options = {
      //   hostname: config.getProperties().nimbus , // Use the service name
      //   port: 8001,
      //   path: '/v1/features/',
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // };
      const url = `${config.getProperties().nimbus.host}/v1/features/`;
      console.log(`JONATHANN nimbus url: ${url}`);

      const resp = await fetch(
        `${config.getProperties().nimbus.host}/v1/features/`,
        {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const features = await resp.text();
      console.log('JONATHANN feature ${features}', features);
      // TODO: add error handling.
      res.end(features);
    },
  };
};
