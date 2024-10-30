/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';

import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import ResetPasswordConfirmed from '.';
import { MozServices } from '../../../lib/types';
import {
  Integration,
  isOAuthIntegration,
  useAuthClient,
  useSensitiveDataClient,
} from '../../../models';
import {
  FinishOAuthFlowHandlerResult,
  useFinishOAuthFlowHandler,
} from '../../../lib/oauth/hooks';
import OAuthDataError from '../../../components/OAuthDataError';
import { hardNavigate } from 'fxa-react/lib/utils';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { AuthError } from '../../../lib/oauth';
import { useState } from 'react';
import GleanMetrics from '../../../lib/glean';
import firefox from '../../../lib/channels/firefox';

interface FinishWithOAuthResult {
  (result: FinishOAuthFlowHandlerResult): void;
}

const ResetPasswordConfirmedContainer = ({
  integration,
  serviceName,
}: {
  integration: Integration;
  serviceName: MozServices;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );
  const location = useLocation();
  const navigateWithQuery = useNavigateWithQuery();
  const sensitiveDataClient = useSensitiveDataClient();
  const [errorMessage, setErrorMessage] = useState('');

  const { email, uid, sessionToken, keyFetchToken, unwrapBKey, verified } =
    sensitiveDataClient.getData('accountResetData');

  const handleOAuthRedirectError = (error: AuthError) => {
    if (
      error.errno === AuthUiErrors.TOTP_REQUIRED.errno ||
      error.errno === AuthUiErrors.INSUFFICIENT_ACR_VALUES.errno
    ) {
      navigateWithQuery(`/inline_totp_setup`, {
        state: {
          email,
          uid,
          sessionToken,
          verified,
          keyFetchToken,
          unwrapBKey,
        },
      });
    } else {
      GleanMetrics.login.error({ event: { reason: error.message } });
      setErrorMessage(error.message);
    }
  };

  const getOauthRedirect = async () => {
    return await finishOAuthFlowHandler(
      uid,
      sessionToken,
      keyFetchToken,
      unwrapBKey
    );
  };

  const validateOauthFlow = async (result: FinishWithOAuthResult) => {
    if (isOAuthIntegration(integration)) {
      const { error, redirect, code, state } = await getOauthRedirect();
      if (error) {
        handleOAuthRedirectError(error);
        return;
      }

      result({ error, redirect, code, state });
    }
  };

  const continueWithVerifiedSession = async () => {
    validateOauthFlow(({ redirect }) => {
      if (redirect) {
        hardNavigate(redirect);
        return;
      }
    });
    navigateWithQuery(`/settings`);
  };

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  validateOauthFlow(({ error, redirect, code, state }) => {
    // To keep the type-system happy; error is already handled.
    if (error) {
      return;
    }

    if (integration.isSync()) {
      firefox.fxaOAuthLogin({
        action: 'signin',
        code,
        redirect,
        state,
      });
    }
  });

  if (!verified) {
    hardNavigate(`/${location.search}`);
    return;
  }

  return (
    <ResetPasswordConfirmed
      continueHandler={continueWithVerifiedSession}
      {...{ errorMessage, serviceName }}
    />
  );
};

export default ResetPasswordConfirmedContainer;
