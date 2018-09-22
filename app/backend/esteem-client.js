import axios from 'axios';
import {BACKEND_URL} from '../config';


export const getCurrencyRate = (cur) => (
  axios.get(`${BACKEND_URL}/api/currencyRate/${ cur.toUpperCase() }/steem`)
);

export const foo = '';