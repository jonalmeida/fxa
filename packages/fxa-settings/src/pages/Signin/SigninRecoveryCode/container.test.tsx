/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ReachRouterModule from '@reach/router';
import * as ReactUtils from 'fxa-react/lib/utils';
import * as CacheModule from '../../../lib/cache';
import * as SigninRecoveryCodeModule from './index';

import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninRecoveryCodeContainer from './container';
import { createMockWebIntegration } from '../../../lib/integrations/mocks';
import { MozServices } from '../../../lib/types';
import { Integration } from '../../../models';
import {
  MOCK_STORED_ACCOUNT,
  MOCK_RECOVERY_CODE,
  mockLoadingSpinnerModule,
} from '../../mocks';
import { SigninRecoveryCodeProps } from './interfaces';
import { mockGqlError, mockSigninLocationState } from '../mocks';
import { mockConsumeRecoveryCodeUseMutation } from './mocks';
import { waitFor } from '@testing-library/react';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

let integration: Integration;
function mockWebIntegration() {
  integration = createMockWebIntegration() as Integration;
}

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    loginBackupCode: {
      view: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
    },
    isDone: jest.fn(),
  },
}));

jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: jest.fn(),
  };
});

let currentSigninRecoveryCodeProps: SigninRecoveryCodeProps | undefined;
function mockSigninRecoveryCodeModule() {
  currentSigninRecoveryCodeProps = undefined;
  jest
    .spyOn(SigninRecoveryCodeModule, 'default')
    .mockImplementation((props) => {
      currentSigninRecoveryCodeProps = props;
      return <div>signin recovery code mock</div>;
    });
}

function mockCache(opts: any = {}, isEmpty = false) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(
    isEmpty
      ? undefined
      : {
          sessionToken: '123',
          ...(opts || {}),
        }
  );
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

const mockLocation = (pathname: string, mockLocationState: Object) => {
  return {
    ...global.window.location,
    pathname,
    state: mockLocationState,
  };
};

function mockReachRouter(
  mockNavigate = jest.fn(),
  pathname = '',
  mockLocationState = {}
) {
  mockNavigate.mockReset();
  jest.spyOn(ReachRouterModule, 'useNavigate').mockReturnValue(mockNavigate);
  jest
    .spyOn(ReachRouterModule, 'useLocation')
    .mockImplementation(() => mockLocation(pathname, mockLocationState));
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  mockSigninRecoveryCodeModule();
  mockLoadingSpinnerModule();
  //   mockUseValidateModule();
  mockReactUtilsModule();
  mockCache();
  mockReachRouter(undefined, 'signin_recovery_code', mockSigninLocationState);
  mockWebIntegration();
}

function render(mocks: Array<MockedResponse>) {
  loadDevMessages();
  loadErrorMessages();

  renderWithLocalizationProvider(
    <MockedProvider mocks={mocks} addTypename={false}>
      <LocationProvider>
        <SigninRecoveryCodeContainer
          {...{
            integration,
            serviceName: MozServices.Default,
          }}
        />
      </LocationProvider>
    </MockedProvider>
  );
}

describe('SigninRecoveryCode container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });
  describe('initial state', () => {
    it('redirects if page is reached without location state', async () => {
      mockReachRouter(undefined, 'signin_recovery_code');
      mockCache({}, true);
      await render([]);
      expect(ReactUtils.hardNavigate).toBeCalledWith('/', {}, true);
    });

    it('redirects if there is no sessionToken', async () => {
      mockReachRouter(undefined, 'signin_recovery_code');
      mockCache({ sessionToken: '' });
      await render([]);
      expect(ReactUtils.hardNavigate).toBeCalledWith('/', {}, true);
    });

    it('retrieves the session token from local storage if no location state', async () => {
      mockReachRouter(undefined, 'signin_recovery_code', {});
      mockCache(MOCK_STORED_ACCOUNT);
      await render([]);
      expect(ReactUtils.hardNavigate).not.toBeCalledWith('/', {}, true);
    });
  });

  describe('submitRecoveryCode', () => {
    it('successful', async () => {
      await render([mockConsumeRecoveryCodeUseMutation()]);
      expect(currentSigninRecoveryCodeProps).toBeDefined();
      await waitFor(async () => {
        const response =
          await currentSigninRecoveryCodeProps?.submitRecoveryCode(
            MOCK_RECOVERY_CODE
          );
        expect(response?.data?.consumeRecoveryCode).toEqual({
          remaining: 3,
        });
      });
    });

    it('handles errors', async () => {
      await render([
        {
          ...mockConsumeRecoveryCodeUseMutation(),
          error: mockGqlError(AuthUiErrors.INVALID_RECOVERY_CODE),
        },
      ]);
      expect(currentSigninRecoveryCodeProps).toBeDefined();
      await waitFor(async () => {
        const response =
          await currentSigninRecoveryCodeProps?.submitRecoveryCode(
            MOCK_RECOVERY_CODE
          );

        expect(response?.data?.consumeRecoveryCode).toBeUndefined();
        expect(response?.error?.errno).toEqual(
          AuthUiErrors.INVALID_RECOVERY_CODE.errno
        );
      });
    });
  });
});
