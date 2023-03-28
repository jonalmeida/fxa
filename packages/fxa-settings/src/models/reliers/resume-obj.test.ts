/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import { ResumeObj } from './resume-obj';

describe('models/reliers/resume-obj', function () {
  let data: ModelDataStore;
  let model: ResumeObj;

  beforeEach(function () {
    data = new GenericData({});
    model = new ResumeObj(data);
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  // TODO: Model Test Coverage
});
