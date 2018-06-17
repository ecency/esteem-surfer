export default ($sce) => {
  // Temporary filter to figure out different language entries from eSteem mobile app's locale files
  return (s) => {
    switch (s) {
      case 'CUSTOM_SERVER':
        return 'Custom server address';
      case 'INVALID_SERVER_ADDRESS':
        return 'Invalid server address';
      case 'SERVER_FAILED':
        return 'Server failed';
      case 'SERVER_TIME_ERR':
        return 'Server does not seem alive ';
      case 'DEFAULT_SETTINGS':
        return 'Default Settings';
      case 'NO_COMMENTS_YET':
        return 'No comments yet';
      case 'COMMENTS_PAGE':
        return 'Page';
      case 'COMMENT_SORT_ORDER':
        return 'Sort Order';
      case 'COMMENT_SORT_ORDER_TRENDING':
        return 'Trending';
      case 'COMMENT_SORT_ORDER_AUTHOR_REPUTATION':
        return 'Reputation';
      case 'COMMENT_SORT_ORDER_VOTES':
        return 'Votes';
      case 'COMMENT_SORT_ORDER_CREATED':
        return 'Age';
      case 'TOKEN_EXCHANGE':
        return 'Token Exchange';
      case 'DISCOVER':
        return 'Discover';
      case 'VOTING_POWER':
        return 'Voting Power';
      case 'POST_COUNT':
        return 'Post Count';
      case 'RESTEEMED':
        return 'resteemed';
      case 'RESTEEMED_BY':
        return 'resteemed by';
      case 'GO_BACK':
        return 'Back';
      case 'PLATFORM_NAME':
        return 'Steem';
      case 'PLATFORM_POWER':
        return 'Steem Power';
      case 'PLATFORM_DOLLAR':
        return 'Steem Dollar';
      case 'PLATFORM_L_UNIT':
        return 'STEEM';
      case 'PLATFORM_P_UNIT':
        return 'SP';
      case 'PLATFORM_D_UNIT':
        return 'SBD';
      case 'NO_DATA':
        return 'No Data';
      case 'LOGIN_PUBLIC_KEY_ERROR':
        return 'You need a private password or key (not a public key)';
      case 'LOGIN_SUCCESS':
        return 'Logged In';
      case 'ACCOUNTS':
        return 'Accounts';
      case 'ACCOUNT':
        return 'Account';
      case 'LOGIN_AS':
        return 'Login As';
      case 'EMPTY_LIST':
        return 'Nothing here...';
      case 'SEARCH_BOOKMARKS':
        return 'Search in bookmarks...';
      case 'FILTER_TAGS':
        return 'Filter Tags';
      case 'SEARCH_RESULTS':
        return 'Results';
      case 'SEARCH_RESULTS_USER':
        return 'Users';
      case 'SCHEDULE_SUBMITTED':
        return 'Post scheduled';
      case 'EDITOR_MAX_TAGS_ERR':
        return 'Maximum 5 tags';
      case 'EDITOR_MAX_TAG_LENGTH_ERR':
        return 'Maximum tag length is 24 characters';
      case 'EDITOR_MAX_DASH_ERR':
        return 'Use only one dash';
      case 'EDITOR_SEPARATOR_ERR':
        return 'Use spaces to separate tags';
      case 'EDITOR_LOWERCASE_ERR':
        return 'Use only lowercase letters';
      case 'EDITOR_CHARS_ERR':
        return 'Use only lowercase letters, digits and one dash';
      case 'EDITOR_START_CHARS_ERR':
        return 'Must start with a letter';
      case 'EDITOR_END_CHARS_ERR':
        return 'Must end with a letter or number';
      case 'EDITOR_CLEAR':
        return 'Clear';
      case 'EDITOR_REMOVE_POSTING_PERM':
        return 'Remove Posting Permission';
      case 'EDITOR_GRANT_POSTING_PERM':
        return 'Grant Posting Permission';
      case 'EDITOR_SELECT_DATE':
        return 'Select date';
      case 'UPDATE':
        return 'Update';
      case 'POST_UPDATED':
        return 'Post is updated!';
      case 'EDITOR_TAG_PLACEHOLDER':
        return 'Tags. Max 5. Separate with space. The first tag is your main category.';
      case 'EDITOR_BODY_PLACEHOLDER':
        return 'Post Content';
      case 'EDITOR_TITLE_PLACEHOLDER':
        return 'Title';
      case 'EDITOR_CONTROL_BOLD':
        return 'Bold';
      case 'EDITOR_CONTROL_ITALIC':
        return 'Italic';
      case 'EDITOR_CONTROL_HEADER':
        return 'Header';
      case 'EDITOR_CONTROL_CODE':
        return 'Code';
      case 'EDITOR_CONTROL_QUOTE':
        return 'Quote';
      case 'EDITOR_CONTROL_OL':
        return 'Ordered List';
      case 'EDITOR_CONTROL_UL':
        return 'Unordered List';
      case 'EDITOR_CONTROL_HR':
        return 'Horizontal Rule';
      case 'EDITOR_CONTROL_IMAGE':
        return 'Image';
      case 'EDITOR_CONTROL_IMAGE_UPLOAD':
        return 'Upload';
      case 'EDITOR_CONTROL_IMAGE_GALLERY':
        return 'Gallery';
      case 'EDITOR_CONTROL_LINK':
        return 'Link';
      case 'SAVE':
        return 'Save';
      case 'REFRESH':
        return 'Refresh';
      case 'BALANCE':
        return 'Balance';
      case 'ACTIVE_KEY_REQUIRED_TRANSFER':
        return 'Active key could not found for selected account. Please make sure logged in with proper credentials.';
      case 'WRONG_AMOUNT_VALUE':
        return 'Wrong amount value';
      case 'AMOUNT_PRECISION_ERR':
        return 'Use only 3 digits of precision';
      case 'INSUFFICIENT_FUNDS':
        return 'Insufficient funds';
      case 'SAVINGS':
        return 'Savings';
      case 'PROFILE_SAVINGS_DESC':
        return 'Balance subject to 3 day withdraw waiting period.';
      case 'PROFILE_IMAGE_URL':
        return 'Profile picture url';
      case 'COVER_IMAGE_URL':
        return 'Cover image url';
      case 'ACCOUNT_PROFILE_UPDATED':
        return 'Profile updated!';
      case 'WITHDRAW_FROM_SAVINGS':
        return 'Withdraw from Savings';
      case 'DESTINATION_ACCOUNTS':
        return 'Destination Account(s)';
      case 'ADD_WITHDRAW_ACCOUNT':
        return 'Add Withdraw Account';
      case 'PERCENTAGE':
        return 'Percentage';
      case 'PERCENTAGE_DESC':
        return 'Percentage of Power Down to this account.';
      case 'AUTOMATICALLY_POWER_UP':
        return 'Automatically power up the target account';
      case 'DRAG_SLIDER':
        return 'Drag the slider to adjust the amount';
      case 'INCOMING_FUNDS':
        return 'Incoming Funds';
      case 'START_POWER_DOWN':
        return 'Begin Power Down';
      case 'STOP_POWER_DOWN':
        return 'Stop';
      case 'ESTIMATED_WEEKLY':
        return 'Estimated Weekly';
      case 'ESCROW_ACTIONS':
        return 'Escrow Actions';
      case 'ESCROW_ID':
        return 'Escrow ID';
      case 'ESCROW_NOT_FOUND':
        return 'Escrow not found';
      case 'FAQ':
        return 'FAQ';
      case 'VIA':
        return 'via';
      case 'WELCOME_NEXT':
        return 'Next';
      case 'WELCOME_PREV':
        return 'Prev';
      case 'WELCOME_START':
        return 'Start!';
      case 'PIN_CREATE':
        return 'Create pin code';
      case 'PIN_CREATE_TEXT':
        return $sce.trustAsHtml('Set pin code to encrypt your data and enable extra layer of security!<br>You will be promoted to enter pin code for crucial transactions as well as on every launch.');
      case 'PIN_CREATE_DESC':
        return '4 character pin code';
      case 'PIN_ENTER':
        return 'Enter Pin Code';
      case 'PIN_ENTER_DESC':
        return 'Enter pin code to continue';
      case 'PIN_ERROR_LAST_CHANCE':
        return ' This is your last chance';
      case 'PIN_INVALIDATE':
        return 'Invalidate Pin Code';
      case 'PIN_INVALIDATED':
        return 'Pin code invalidated';
      case 'ACTIVITIES':
        return 'Activities';
      case 'ACTIVITIES_VOTES':
        return 'Votes';
      case 'ACTIVITIES_REPLIES':
        return 'Replies';
      case 'ACTIVITIES_MENTIONS':
        return 'Mentions';
      case 'ACTIVITIES_FOLLOWS':
        return 'Follows';
      case 'ACTIVITIES_REBLOGS':
        return 'Reblogs';
      case 'ACTIVITIES_LEADEROARD':
        return 'Leaderboard';
      case 'ACTIVITIES_FOLLOWING':
        return 'following';
      case 'ACTIVITIES_UNFOLLOWED':
        return 'unfollowed';
      case 'FAVORITES':
        return 'Favorites';
      case 'FAVORITES_ADD':
        return 'Add to favorites';
      case 'FAVORITES_REMOVE':
        return 'Remove from favorites';
      case 'SEARCH_FAVORITES':
        return 'Search in favorites';
      case 'NEW_VERSION_ALERT_TEXT':
        return 'New version available';
      case 'NEW_VERSION_DOWNLOAD':
        return 'Download';
      case 'NEW_VERSION_DISMISS':
        return 'Dismiss';
      case 'NEW_VERSION_RESTART':
        return 'Restart';
      case 'LOAD_MORE':
        return 'Load more';
      case 'TOGGLE_NIGHT_MODE':
        return 'Toggle Night Mode';
      case 'POST_RELOAD':
        return 'Reload';
      case 'POST_REPLY':
        return 'Reply';
      case 'OK':
        return 'OK';
      case 'POST_MENU_REBLOG':
        return 'Reblog';
      case 'POST_MENU_EXTERNAL':
        return 'Open in browser';
      case 'POST_MENU_COPY':
        return 'Copy address';
      case 'POST_MENU_COPIED':
        return 'Copied to clipboard';
      case 'POST_MENU_SHARE':
        return 'Share';
      case 'POST_MENU_FLAG':
        return 'Flag';
      case 'TRANSFER_BAD_ACTOR_ERR':
        return 'Use caution sending to this account. Please double check your spelling for possible phishing.';
      case 'COMMENT_POST_INFO':
        return 'You are viewing a single comment\'s thread from:';
      case 'COMMENT_POST_VIEW_ROOT':
        return 'View the full context';
      case 'COMMENT_POST_VIEW_PARENT':
        return 'View the direct parent';
      case 'TOGGLE_LIST_STYLE':
        return 'Toggle Card View';
      case 'TOGGLE_READ_MODE':
        return 'Toggle Read Mode';
      case 'DELEGATE':
        return 'Delegate';
      case 'VOTERS_INFO_VOTER':
        return 'Voter';
      case 'VOTERS_INFO_REWARD':
        return 'Reward';
      case 'VOTERS_INFO_PERCENT':
        return 'Percent';
      case 'VOTERS_INFO_TIME':
        return 'Time';
      case 'VOTES_IN_24':
        return 'Number of votes last 24 hours';
      case 'CONNECT2MOBILE':
        return 'Connect to Mobile';
      case 'CONNECT2MOBILE_POSTING':
        return 'POSTING';
      case 'CONNECT2MOBILE_POSTING_DESC':
        return 'The posting key is used for posting and voting. It should be different from the active and owner keys.';
      case 'CONNECT2MOBILE_ACTIVE':
        return 'ACTIVE';
      case 'CONNECT2MOBILE_ACTIVE_DESC':
        return 'The active key is used to make transfers and place orders in the internal market.';
      case 'CONNECT2MOBILE_OWNER':
        return 'OWNER';
      case 'CONNECT2MOBILE_OWNER_DESC':
        return 'The owner key is the master key for the account and is required to change the other keys.';
      case 'CONNECT2MOBILE_MEMO':
        return 'MEMO';
      case 'CONNECT2MOBILE_MEMO_DESC':
        return 'The memo key is used to create and read memos.';
      case 'CONNECT2MOBILE_DOWNLOAD':
        return 'Download eSteem Mobile';
      default:
        return s;
    }
  }
}
