/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import React, { ReactElement } from 'react';
import { RemoteMetadata as DeviceInfoBlockProps } from '../../lib/types';

// Remote metadata is obtained from pairing channel
// Some of this data may align with the account.ts model but the keys are slightly different (e.g., `state` vs `region`)

export const DeviceInfoBlock = ({
  deviceName,
  browserName,
  genericOSName,
  ipAddress,
  city,
  region,
  country,
}: DeviceInfoBlockProps) => {
  const LocalizedLocation = () => {
    if (city && region && country) {
      return (
        <FtlMsg
          id="device-info-block-location-city-region-country"
          vars={{ city, region, country }}
        >{`${city}, ${region}, ${country} (estimated)`}</FtlMsg>
      );
    }
    if (region && country) {
      return (
        <FtlMsg
          id="device-info-block-location-region-country"
          vars={{ region, country }}
        >{`${region}, ${country} (estimated)`}</FtlMsg>
      );
    }
    if (city && country) {
      return (
        <FtlMsg
          id="device-info-block-location-city-country"
          vars={{ city, country }}
        >{`${city}, ${country} (estimated)`}</FtlMsg>
      );
    }
    if (country) {
      return (
        <FtlMsg
          id="device-info-block-location-country"
          vars={{ country }}
        >{`${country} (estimated)`}</FtlMsg>
      );
    }
    return (
      <FtlMsg id="device-info-block-location-unknown">Location unknown</FtlMsg>
    );
  };

  return (
    <div className="mt-9">
      {deviceName && <h2 className="mb-5 text-base">{deviceName}</h2>}
      <FtlMsg id="device-info-browser-os" vars={{ browserName, genericOSName }}>
        <p className="text-xs">{`${browserName} on ${genericOSName}`}</p>
      </FtlMsg>
      <p className="text-xs">
        <LocalizedLocation />
      </p>
      <FtlMsg id="device-info-ip-address" vars={{ ipAddress }}>
        <p className="text-xs">{`IP address: ${ipAddress}`}</p>
      </FtlMsg>
    </div>
  );
};

export default DeviceInfoBlock;
