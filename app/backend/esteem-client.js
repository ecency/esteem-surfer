import axios from 'axios';
import { BACKEND_URL } from '../config';

export const getCurrencyRate = cur =>
  axios
    .get(`${BACKEND_URL}/api/currencyRate/${cur.toUpperCase()}/steem`)
    .then(resp => resp.data);

export const getNodes = () =>
  axios
    .get(`https://storage.googleapis.com/esteem/public_nodes.json`)
    .then(resp => resp.data.steemd);
