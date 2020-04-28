/* eslint-disable */

import notificationBody from './notification-body';

describe('Notification Body', () => {
  it('(1) Vote', () => {
    const input = {
      type: 'vote',
      source: 'foo'
    };

    expect(notificationBody(input)).toMatchSnapshot();
  });

  it('(2) Mention - post', () => {
    const input = {
      type: 'mention',
      source: 'bar',
      extra: {
        is_post: true
      }
    };

    expect(notificationBody(input)).toMatchSnapshot();
  });

  it('(3) Mention - comment', () => {
    const input = {
      type: 'mention',
      source: 'bar',
      extra: {}
    };

    expect(notificationBody(input)).toMatchSnapshot();
  });

  it('(4) Follow', () => {
    const input = {
      type: 'follow',
      source: 'bar'
    };

    expect(notificationBody(input)).toMatchSnapshot();
  });

  it('(5) Reply', () => {
    const input = {
      type: 'reply',
      source: 'bar'
    };

    expect(notificationBody(input)).toMatchSnapshot();
  });

  it('(6) Reblog', () => {
    const input = {
      type: 'reblog',
      source: 'bar'
    };

    expect(notificationBody(input)).toMatchSnapshot();
  });
});
