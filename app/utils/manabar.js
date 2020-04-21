import { Client } from '@esteemapp/dhive';
import defaults from '../constants/defaults';

const client = new Client(defaults.servers, { timeout: 3000 });

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
