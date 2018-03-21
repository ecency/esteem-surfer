export default ($scope, steemService) => {

  steemService.getState('/tags').then((resp) => {
    console.log(resp)
  })
};
