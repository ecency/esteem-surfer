export default ($uibModal) => {
  return {
    restrict: 'A',
    scope: {
      itemSize: '<',
    },
    link: (scope, element, attrs) => {
      element.bind('click', function () {
        const image = element[0].style.backgroundImage.slice(4, -1).replace(/"/g, "");
        $uibModal.open({
          template: '<div class="profile-image"><img ng-src="{{ img }}"></div>',
          controller: ($scope, imageUrl) => {
            $scope.img = imageUrl
          },
          windowClass: 'profile-photo-modal',
          resolve: {
            imageUrl: function () {
              return image;
            }
          }
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      });
    }
  }
}
