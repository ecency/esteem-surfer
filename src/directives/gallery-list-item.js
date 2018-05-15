export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      image: '<'
    },
    link: (scope, element, attrs) => {
      scope.removeDirective = function () {
        scope.$destroy();
        element.parent().remove();
      };
    },
    template: `
      <div class="gallery-list-item">
      <div class="image-controls">
        <div class="pull-left">
          <button class="btn btn-default btn-xs" ng-click="copy(image)"><i class="fa fa-clipboard"></i></button>
        </div>
        <div class="pull-right">
          <button class="btn btn-danger btn-xs" ng-click="deleteClicked(image)">
            <i class="fa fa-times" ng-if="!deleting"></i><i class="fa fa-spin fa-spinner fa-circle-o-notch" ng-show="deleting"></i> 
          </button>
        </div>
       </div>
       <img src="{{ image.url }}">
    </div>
    `,
    controller: ($scope, $rootScope, $location, $filter, $window, eSteemService, activeUsername) => {

      $scope.copy = (image) => {
        const i = document.createElement('input');
        i.setAttribute('type', 'text');
        i.value = image.url;
        document.body.appendChild(i);
        i.select();
        document.execCommand('Copy');
        document.body.removeChild(i);
      };

      $scope.deleteClicked = (image) => {
        if ($window.confirm($filter('translate')('ARE_YOU_SURE'))) {
          $scope.deleting = true;
          eSteemService.removeImage(image._id, activeUsername()).then((resp) => {
            $scope.removeDirective();
          }).catch((e) => {
            $rootScope.showError('Could not deleted image!');
          }).then(() => {
            $scope.deleting = false;
          });
        }
      }
    }
  };
};
