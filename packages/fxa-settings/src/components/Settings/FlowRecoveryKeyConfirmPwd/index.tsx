/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useAccount, useFtlMsgResolver } from '../../../models';
import { useForm } from 'react-hook-form';
import base32Encode from 'base32-encode';
import { logViewEvent } from '../../../lib/metrics';
import {
  AuthUiErrorNos,
  AuthUiErrors,
  composeAuthUiErrorTranslationId,
} from '../../../lib/auth-errors/auth-errors';
import InputPassword from '../../InputPassword';
import { LockImage } from '../../images';
import Banner, { BannerType } from '../../Banner';

type FormData = {
  password: string;
};

export type FlowRecoveryKeyConfirmPwdProps = {
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateBackward: () => void;
  navigateForward: () => void;
  setFormattedRecoveryKey: React.Dispatch<React.SetStateAction<string>>;
  viewName: string;
};

export const FlowRecoveryKeyConfirmPwd = ({
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateBackward,
  navigateForward,
  setFormattedRecoveryKey,
  viewName,
}: FlowRecoveryKeyConfirmPwdProps) => {
  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();

  const [errorText, setErrorText] = useState<string>();
  const [bannerText, setBannerText] = useState<string>();

  const { formState, getValues, handleSubmit, register } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      password: '',
    },
  });

  const createRecoveryKey = useCallback(async () => {
    const password = getValues('password');
    logViewEvent(`flow.${viewName}`, 'confirm-password.submit');
    try {
      const recoveryKey = await account.createRecoveryKey(password);
      setFormattedRecoveryKey(
        base32Encode(recoveryKey.buffer, 'Crockford').match(/.{4}/g)!.join(' ')
      );
      logViewEvent(`flow.${viewName}`, 'confirm-password.success');
      navigateForward();
    } catch (e) {
      let localizedError;

      if (e.errno === AuthUiErrors.THROTTLED.errno && e.retryAfterLocalized) {
        localizedError = ftlMsgResolver.getMsg(
          composeAuthUiErrorTranslationId(e),
          AuthUiErrorNos[e.errno].message,
          { retryAfter: e.retryAfterLocalized }
        );
      } else {
        localizedError = ftlMsgResolver.getMsg(
          composeAuthUiErrorTranslationId(e),
          e.message
        );
      }
      if (e.errno === AuthUiErrors.INCORRECT_PASSWORD.errno) {
        setErrorText(localizedError);
      } else {
        setBannerText(localizedError);
      }
      logViewEvent(`flow.${viewName}`, 'confirm-password.fail');
    }
  }, [
    account,
    ftlMsgResolver,
    getValues,
    navigateForward,
    setBannerText,
    setErrorText,
    setFormattedRecoveryKey,
    viewName,
  ]);

  return (
    <FlowContainer
      title={localizedPageTitle}
      onBackButtonClick={navigateBackward}
      {...{ localizedBackButtonTitle }}
    >
      <div className="w-full flex flex-col gap-4">
        <ProgressBar currentStep={2} numberOfSteps={4} />
        {bannerText && (
          <Banner type={BannerType.error}>
            <p className="w-full text-center">{bannerText}</p>
          </Banner>
        )}
        <LockImage className="mx-auto my-4" />

        <FtlMsg id="flow-recovery-key-confirm-pwd-heading">
          <h2 className="font-bold text-xl">
            Enter your password again to get started
          </h2>
        </FtlMsg>

        <form
          onSubmit={handleSubmit(({ password }) => {
            createRecoveryKey();
          })}
        >
          <FtlMsg
            id="flow-recovery-key-confirm-pwd-input-label"
            attrs={{ label: true }}
          >
            <InputPassword
              name="password"
              label="Enter your password"
              onChange={() => {
                errorText && setErrorText(undefined);
                bannerText && setBannerText(undefined);
              }}
              inputRef={register({
                required: true,
              })}
              {...{ errorText }}
            />
          </FtlMsg>
          <FtlMsg id="flow-recovery-key-confirm-pwd-submit-button">
            <button
              className="cta-primary cta-xl w-full mt-4"
              type="submit"
              disabled={!formState.isDirty || !!formState.errors.password}
            >
              Create account recovery key
            </button>
          </FtlMsg>
        </form>
      </div>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyConfirmPwd;