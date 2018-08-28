/* eslint-disable */
import { spy } from 'sinon';
import * as actions from '../../app/actions/trending-tags';

describe('actions', () => {
  it("should create 'fetch begin' action", () => {
    expect(actions.fetchBegin()).toMatchSnapshot();
  });

  it("should create 'fetch ok' action", () => {
    expect(actions.fetchOk(['life', 'kr', 'steemit', 'art'])).toMatchSnapshot();
  });

  it("should create 'fetch error' action", () => {
    expect(actions.fetchError()).toMatchSnapshot();
  });
});
