/*
eslint-disable no-plusplus, camelcase, new-cap
*/

import getSlug from 'speakingurl';
import { diff_match_patch } from 'diff-match-patch';

const permlinkRnd = () => (Math.random() + 1).toString(16).substring(2);

export const createPermlink = (title, random = false) => {
  const slug = getSlug(title);
  let perm = slug.toString();

  if (random) {
    const rnd = permlinkRnd();
    perm = `${slug.toString()}-${rnd}est`;
  }

  // STEEMIT_MAX_PERMLINK_LENGTH
  if (perm.length > 255) {
    perm = perm.substring(perm.length - 255, perm.length);
  }

  // only letters numbers and dashes
  perm = perm.toLowerCase().replace(/[^a-z0-9-]+/g, '');

  if (perm.length === 0) {
    return permlinkRnd();
  }

  return perm;
};

export const createReplyPermlink = toAuthor => {
  const t = new Date(Date.now());

  const timeFormat = `${t.getFullYear().toString()}${(
    t.getMonth() + 1
  ).toString()}${t
    .getDate()
    .toString()}t${t
    .getHours()
    .toString()}${t
    .getMinutes()
    .toString()}${t.getSeconds().toString()}${t.getMilliseconds().toString()}z`;

  return `re-${toAuthor.replace(/\./g, '')}-${timeFormat}`;
};

export const makeOptions = (author, permlink, operationType) => {
  const a = {
    allow_curation_rewards: true,
    allow_votes: true,
    author,
    permlink,
    max_accepted_payout: '1000000.000 HBD',
    percent_steem_dollars: 10000,
    extensions: [
      [0, { beneficiaries: [{ account: 'esteemapp', weight: 300 }] }]
    ]
  };

  switch (operationType) {
    case 'sp':
      a.max_accepted_payout = '1000000.000 HBD';
      a.percent_steem_dollars = 0;
      break;
    case 'dp':
      a.max_accepted_payout = '0.000 HBD';
      a.percent_steem_dollars = 10000;
      break;
    default:
      a.max_accepted_payout = '1000000.000 HBD';
      a.percent_steem_dollars = 10000;
      break;
  }

  return a;
};

export const makeJsonMetadata = (meta, tags, appVer) =>
  Object.assign({}, meta, {
    tags,
    app: `esteem/${appVer}-surfer`,
    format: 'markdown+html',
    community: 'esteem.app'
  });

export const makeJsonMetadataForUpdate = (oldJson, meta, tags) => {
  const { meta: oldMeta } = oldJson;
  const mergedMeta = Object.assign({}, oldMeta, meta);

  return Object.assign({}, oldJson, mergedMeta, { tags });
};

export const makeJsonMetadataReply = (tags, appVer) => ({
  tags,
  app: `esteem/${appVer}-surfer`,
  format: 'markdown+html',
  community: 'esteem.app'
});

export const extractMetadata = body => {
  const urlReg = /(\b(https?|ftp):\/\/[A-Z0-9+&@#/%?=~_|!:,.;-]*[-A-Z0-9+&@#/%=~_|])/gim;
  const userReg = /(^|\s)(@[a-z][-.a-z\d]+[a-z\d])/gim;
  const imgReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gim;

  const out = {};

  const mUrls = body.match(urlReg);
  const mUsers = body.match(userReg);

  const matchedImages = [];
  const matchedLinks = [];
  const matchedUsers = [];

  if (mUrls) {
    for (let i = 0; i < mUrls.length; i++) {
      const ind = mUrls[i].match(imgReg);
      if (ind) {
        matchedImages.push(mUrls[i]);
      } else {
        matchedLinks.push(mUrls[i]);
      }
    }
  }

  if (matchedLinks.length) {
    out.links = matchedLinks;
  }
  if (matchedImages.length) {
    out.image = matchedImages;
  }

  if (mUsers) {
    for (let i = 0; i < mUsers.length; i++) {
      matchedUsers.push(mUsers[i].trim().substring(1));
    }
  }

  if (matchedUsers.length) {
    out.users = matchedUsers;
  }

  return out;
};

export const createPatch = (text1, text2) => {
  const dmp = new diff_match_patch();
  if (!text1 && text1 === '') return undefined;
  const patches = dmp.patch_make(text1, text2);
  const patch = dmp.patch_toText(patches);
  return patch;
};
