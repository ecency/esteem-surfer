/* eslint-disable */
import { spy } from 'sinon';
import * as actions from './accounts';

describe('accounts actions', () => {
  it('(1) accountAdded action creator', () => {
    expect(actions.accountAdded('foo')).toMatchSnapshot();
  });

  it('(2) accountDeleted action creator', () => {
    expect(actions.accountDeleted('foo')).toMatchSnapshot();
  });

  it('(3) accountActivated action creator', () => {
    expect(actions.accountActivated('foo')).toMatchSnapshot();
  });
});
