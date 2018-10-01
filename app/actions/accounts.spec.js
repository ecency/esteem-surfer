/* eslint-disable */
import * as actions from './accounts';

describe('accounts actions', () => {
  it('(1) accountAdded action creator', () => {
    expect(actions.accountAdded('foo')).toMatchSnapshot();
  });

  it('(1) accountAddedSc action creator', () => {
    expect(actions.accountAddedSc('foo')).toMatchSnapshot();
  });

  it('(2) accountDeleted action creator', () => {
    expect(actions.accountDeleted('foo')).toMatchSnapshot();
  });
});
