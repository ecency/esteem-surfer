import axios from 'axios';
import {BACKEND_URL} from '../config';

export const getCurrencyRate = cur =>
  axios
    .get(`${BACKEND_URL}/api/currencyRate/${cur.toUpperCase()}/steem`)
    .then(resp => resp.data);

export const getNodes = () =>
  axios
    .get(`https://storage.googleapis.com/esteem/public_nodes.json`)
    .then(resp => resp.data.steemd);

export const getActiveVotes = user =>
  axios.get(`${BACKEND_URL}/api/votes/${user}`).then(resp => resp.data);


export const getTopPosts = user => axios.get(`${BACKEND_URL}/api/top-posts/${user}`).then(resp => resp.data);

export const getMarketData = () => axios.get(`${BACKEND_URL}/api/market-data/`).then(resp => resp.data);

export const uploadImage = (file) => {
  const fData = new FormData();
  fData.append('postimage', file);


  return axios.post('https://img.esteem.ws/backend.php', fData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getImages = (user) => axios.get(`${BACKEND_URL}/api/images/${user}`).then(resp => resp.data);

export const addMyImage = (user, url) => axios.post(`${BACKEND_URL}/api/image`, {username: user, image_url: url});

export const removeImage = (id, user) => axios.delete(`${BACKEND_URL}/api/images/${user}/${id}`);

export const getDrafts = (user) => axios.get(`${BACKEND_URL}/api/drafts/${user}`).then(resp => resp.data);

export const removeDraft = (id, user) => axios.delete(`${BACKEND_URL}/api/drafts/${user}/${id}`);

export const addDraft = (user, title, body, tags) => axios.post(`${BACKEND_URL}/api/draft`, {
  username: user,
  title,
  body,
  tags
}).then(resp => resp.data);

export const updateDraft = (user, id, title, body, tags) => axios.put(`${BACKEND_URL}/api/drafts/${user}/${id}`, {
  title,
  body,
  tags
});

