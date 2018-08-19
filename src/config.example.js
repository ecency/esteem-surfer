export const GH_TOKEN = 'your token here'; // github user token to check updates

export default (app) => {
  app.constant('API_END_POINT', 'SERVER_ADDRESS');
  app.constant('NWS_ADDRESS', 'SERVER_ADDRESS');
  app.constant('SEARCH_API_URL', 'SERVER_ADDRESS');
  app.constant('SEARCH_API_TOKEN', 'TOKEN');
  //please change SERVER_ADDRESS to backend API providers
}
