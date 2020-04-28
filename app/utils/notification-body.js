import formatMessage from './format-message';

export default data => {
  const { source } = data;

  switch (data.type) {
    case 'vote':
      return formatMessage('notification.voted', { source });
    case 'mention':
      return data.extra.is_post
        ? formatMessage('notification.mention-post', { source })
        : formatMessage('notification.mention-comment', { source });
    case 'follow':
      return formatMessage('notification.followed', { source });
    case 'reply':
      return formatMessage('notification.replied', { source });
    case 'reblog':
      return formatMessage('notification.reblogged', { source });
    default:
      return '';
  }
};

/*
norificationBody = (data) => {
    const { source } = data;

    switch (data.type) {
      case 'vote':
        return formatMessage('notification.voted', { source });
      case 'mention':
        return data.extra.is_post ?
          formatMessage('notification.mention-post', { source }) :
          formatMessage('notification.mention-comment', { source });
      case 'follow':
        return formatMessage('notification.followed', { source });
      case 'reply':
        return formatMessage('notification.replied', { source });
      case 'reblog':
        return formatMessage('notification.reblogged', { source });
      default:
        return '';
    }
  };
 */
