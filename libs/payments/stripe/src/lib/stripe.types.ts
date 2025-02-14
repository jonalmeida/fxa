/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum STRIPE_PRICE_METADATA {
  APP_STORE_PRODUCT_IDS = 'appStoreProductIds',
  PLAY_SKU_IDS = 'playSkuIds',
  PROMOTION_CODES = 'promotionCodes',
}

export enum STRIPE_PRODUCT_METADATA {
  PROMOTION_CODES = 'promotionCodes',
}

export enum SubplatInterval {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  HalfYearly = 'halfyearly',
  Yearly = 'yearly',
}

export interface TaxAddress {
  countryCode: string;
  postalCode: string;
}
