/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * This file is generated by kysely-codegen. Merge edits as needed.
 */
import type { ColumnType } from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | null | number | string;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export enum CartState {
  START = 'start',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAIL = 'fail',
}

export enum CartErrorReasonId {
  Unknown = 'unknown',
}

export interface AccountCustomers {
  uid: Buffer;
  stripeCustomerId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface AccountResetTokens {
  tokenId: Buffer;
  tokenData: Buffer;
  uid: Buffer;
  createdAt: number;
}

export interface Accounts {
  uid: Buffer;
  normalizedEmail: string;
  email: string;
  emailCode: Buffer;
  emailVerified: Generated<number>;
  kA: Buffer;
  wrapWrapKb: Buffer;
  wrapWrapKbVersion2: Buffer | null;
  authSalt: Buffer;
  verifyHash: Buffer;
  verifyHashVersion2: Buffer | null;
  verifierVersion: number;
  verifierSetAt: number;
  createdAt: number;
  locale: string | null;
  lockedAt: number | null;
  profileChangedAt: number | null;
  keysChangedAt: number | null;
  ecosystemAnonId: string | null;
  disabledAt: number | null;
  metricsOptOutAt: number | null;
  clientSalt: string | null;
}

export interface Carts {
  id: Buffer;
  uid: Buffer | null;
  state: CartState;
  errorReasonId: CartErrorReasonId | null;
  offeringConfigId: string;
  interval: string;
  experiment: string | null;
  taxAddress: Json | null;
  createdAt: number;
  updatedAt: number;
  couponCode: string | null;
  stripeCustomerId: string | null;
  email: string | null;
  amount: number;
  version: number;
}

export interface DeviceCommandIdentifiers {
  commandId: Generated<number>;
  commandName: string;
}

export interface DeviceCommands {
  uid: Buffer;
  deviceId: Buffer;
  commandId: number;
  commandData: string | null;
}

export interface Devices {
  uid: Buffer;
  id: Buffer;
  sessionTokenId: Buffer | null;
  name: string | null;
  nameUtf8: string | null;
  type: string | null;
  createdAt: number | null;
  callbackURL: string | null;
  callbackPublicKey: string | null;
  callbackAuthKey: string | null;
  callbackIsExpired: Generated<number>;
  refreshTokenId: Buffer | null;
}

export interface EmailBounces {
  email: string;
  bounceType: number;
  bounceSubType: number;
  createdAt: number;
  emailTypeId: number | null;
  diagnosticCode: Generated<string | null>;
}

export interface Emails {
  id: Generated<number>;
  normalizedEmail: string;
  email: string;
  uid: Buffer;
  emailCode: Buffer;
  isVerified: Generated<number>;
  isPrimary: ColumnType<boolean, number, number>;
  verifiedAt: number | null;
  createdAt: number;
}

export interface EmailTypes {
  id: Generated<number>;
  emailType: string;
}

export interface KeyFetchTokens {
  tokenId: Buffer;
  authKey: Buffer;
  uid: Buffer;
  keyBundle: Buffer;
  createdAt: number;
}

export interface LinkedAccounts {
  uid: Buffer;
  id: string;
  providerId: number;
  authAt: number | null;
  enabled: number;
}

export interface PasswordChangeTokens {
  tokenId: Buffer;
  tokenData: Buffer;
  uid: Buffer;
  createdAt: number;
}

export interface PasswordForgotTokens {
  tokenId: Buffer;
  tokenData: Buffer;
  uid: Buffer;
  passCode: Buffer;
  createdAt: number;
  tries: number;
}

export interface PaypalCustomers {
  uid: Buffer;
  billingAgreementId: string;
  status: string;
  createdAt: number;
  endedAt: number | null;
}

export interface RecoveryCodes {
  id: Generated<number>;
  uid: Buffer;
  codeHash: Buffer | null;
  salt: Buffer | null;
}

export interface RecoveryKeys {
  uid: Buffer;
  recoveryData: string | null;
  recoveryKeyIdHash: Buffer;
  createdAt: number;
  verifiedAt: number | null;
  enabled: Generated<number | null>;
  hint: string | null;
}

export interface SecurityEventNames {
  id: Generated<number>;
  name: string;
}

export interface SecurityEvents {
  id: Generated<number>;
  uid: Buffer;
  nameId: number;
  verified: number | null;
  ipAddrHmac: Buffer;
  createdAt: number;
  tokenVerificationId: Buffer | null;
}

export interface SentEmails {
  id: Generated<number>;
  uid: Buffer;
  emailTypeId: number;
  params: Json | null;
  sentAt: number;
}

export interface SessionTokens {
  tokenId: Buffer;
  tokenData: Buffer;
  uid: Buffer;
  createdAt: number;
  uaBrowser: string | null;
  uaBrowserVersion: string | null;
  uaOS: string | null;
  uaOSVersion: string | null;
  uaDeviceType: string | null;
  lastAccessTime: Generated<number>;
  uaFormFactor: string | null;
  authAt: number | null;
  verificationMethod: number | null;
  verifiedAt: number | null;
  mustVerify: Generated<number | null>;
}

export interface SigninCodes {
  hash: Buffer;
  uid: Buffer;
  createdAt: number;
  flowId: Buffer | null;
}

export interface Totp {
  id: Generated<number>;
  uid: Buffer;
  sharedSecret: string;
  epoch: number;
  createdAt: number;
  verified: Generated<number | null>;
  enabled: Generated<number | null>;
}

export interface UnblockCodes {
  uid: Buffer;
  unblockCodeHash: Buffer;
  createdAt: number;
}

export interface UnverifiedTokens {
  tokenId: Buffer;
  tokenVerificationId: Buffer;
  uid: Buffer;
  mustVerify: Generated<number>;
  tokenVerificationCodeHash: Buffer | null;
  tokenVerificationCodeExpiresAt: number | null;
}

export interface VerificationReminders {
  uid: Buffer;
  type: string;
  createdAt: number;
}

export interface DB {
  accountCustomers: AccountCustomers;
  accountResetTokens: AccountResetTokens;
  accounts: Accounts;
  carts: Carts;
  deviceCommandIdentifiers: DeviceCommandIdentifiers;
  deviceCommands: DeviceCommands;
  devices: Devices;
  emailBounces: EmailBounces;
  emails: Emails;
  emailTypes: EmailTypes;
  keyFetchTokens: KeyFetchTokens;
  linkedAccounts: LinkedAccounts;
  passwordChangeTokens: PasswordChangeTokens;
  passwordForgotTokens: PasswordForgotTokens;
  paypalCustomers: PaypalCustomers;
  recoveryCodes: RecoveryCodes;
  recoveryKeys: RecoveryKeys;
  securityEventNames: SecurityEventNames;
  securityEvents: SecurityEvents;
  sentEmails: SentEmails;
  sessionTokens: SessionTokens;
  signinCodes: SigninCodes;
  totp: Totp;
  unblockCodes: UnblockCodes;
  unverifiedTokens: UnverifiedTokens;
  verificationReminders: VerificationReminders;
}
