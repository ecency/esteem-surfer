/* eslint-disable */
import * as actions from './active-account';

describe('active account actions', () => {
  it('(1) loggedIn action creator', () => {
    expect(actions.loggedIn('foo')).toMatchSnapshot();
  });

  it('(2) loggedOut action creator', () => {
    expect(actions.loggedOut()).toMatchSnapshot();
  });

  it('(3) updated action creator', () => {
    expect(actions.updated('foo', { id: 12, name: 'foo' })).toMatchSnapshot();
  });
});
