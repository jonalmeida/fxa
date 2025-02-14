/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  StripePlan,
  StripePrice,
  StripeProduct,
  StripePromotionCode,
  StripeSubscription,
} from './stripe.client.types';
import { PromotionCodeCouldNotBeAttachedError } from './stripe.error';
import { STRIPE_PRICE_METADATA, STRIPE_PRODUCT_METADATA } from './stripe.types';

export const checkSubscriptionPromotionCodes = (
  code: StripePromotionCode,
  price: StripePrice,
  product?: StripeProduct
) => {
  const validPromotionCodes: string[] = [];
  if (price.metadata && price.metadata[STRIPE_PRICE_METADATA.PROMOTION_CODES]) {
    validPromotionCodes.push(
      ...price.metadata[STRIPE_PRICE_METADATA.PROMOTION_CODES]
        .split(',')
        .map((c) => c.trim())
    );
  }
  if (
    product?.metadata &&
    product.metadata[STRIPE_PRODUCT_METADATA.PROMOTION_CODES]
  ) {
    validPromotionCodes.push(
      ...product.metadata[STRIPE_PRODUCT_METADATA.PROMOTION_CODES]
        .split(',')
        .map((c) => c.trim())
    );
  }
  if (!validPromotionCodes.includes(code.code)) {
    throw new PromotionCodeCouldNotBeAttachedError(
      "Promotion code restricted to a product that doesn't match the product on this subscription",
      undefined,
      {
        promotionId: code.id,
      }
    );
  }
  return true;
};

export const checkValidPromotionCode = (code: StripePromotionCode) => {
  const nowSecs = Date.now() / 1000;
  if (
    !code ||
    !code.active ||
    !code.coupon.valid ||
    (code.expires_at && code.expires_at < nowSecs)
  )
    throw new PromotionCodeCouldNotBeAttachedError(
      'Invalid promotion code',
      undefined,
      {
        promotionId: code.id,
      }
    );
  return true;
};

export const getSubscribedPrice = (subscription: StripeSubscription) => {
  const item = subscription.items.data.at(0);
  if (!item || subscription.items.data.length > 1)
    throw new PromotionCodeCouldNotBeAttachedError(
      'Unknown subscription price',
      undefined,
      {
        subscriptionId: subscription.id,
      }
    );
  return item.price;
};

/**
 * Returns array of customer subscription plans
 */
export const getSubscribedPlans = (subscriptions: StripeSubscription[]) => {
  return subscriptions
    .flatMap((sub) => sub.items.data)
    .map((item) => item.plan);
};

/**
 * Returns array of subscribed product IDs
 */
export const getSubscribedProductIds = (subscribedPlans: StripePlan[]) => {
  return subscribedPlans.length > 0
    ? subscribedPlans.map(({ product: productId }) => productId as string)
    : [];
};
