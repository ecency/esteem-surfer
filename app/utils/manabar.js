import { Client } from '@hivechain/dsteem';

const client = new Client();

export const votingPower = account => {
  const calc = client.rc.calculateVPMana(account);
  const { percentage } = calc;
  return percentage / 100;
};

export const rcPower = account => {
  const { rcAccount } = account;
  const calc = client.rc.calculateRCMana(rcAccount);
  const { percentage } = calc;
  return percentage / 100;
};
