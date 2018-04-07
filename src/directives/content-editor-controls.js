import {insertText} from '../editor-utils';

export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      targetElem: '@'
    },
    link: ($scope, $element) => {

    },
    template: `<div class="content-editor-controls">
        <button class="btn btn-default" ng-click="insertBold()"><i class="fa fa-bold"></i></button>
        <button class="btn btn-default" ng-click="insertItalic()"><i class="fa fa-italic"></i></button>
        <button class="btn btn-default" ng-click="insertHeader()"><i class="fa fa-header"></i></button>
        <button class="btn btn-default" ng-click="insertCode()"><i class="fa fa-code"></i></button>
        <button class="btn btn-default" ng-click="insertQuote()"><i class="fa fa-quote-right"></i></button>
        <button class="btn btn-default" ng-click="insertOlList()"><i class="fa fa-list-ol"></i></button>
        <button class="btn btn-default" ng-click="insertUlList()"><i class="fa fa-list-ul"></i></button>
        <button class="btn btn-default" ng-click="insertHr()"><i class="fa fa-minus"></i></button>
        <button class="btn btn-default" ng-click="insertImage()"><i class="fa fa-image"></i></button>
        <button class="btn btn-default" ng-click="insertLink()"><i class="fa fa-link"></i></button>
        </div>`,
    controller: ($scope, $rootScope, $timeout) => {

      let el = null;
      let txtEl = null;

      $timeout(() => {
        el = document.querySelector($scope.targetElem);
        txtEl = el.querySelector('textarea');

        txtEl.focus();
      }, 500);

      $scope.insertBold = () => {
        insertText(txtEl, '**', '**');
      };

      $scope.insertItalic = () => {
        insertText(txtEl, '*', '*');
      };

      $scope.insertHeader = () => {
        insertText(txtEl, '# ', '');
      };

      $scope.insertCode = () => {
        insertText(txtEl, '<code>', '</code>');
      };

      $scope.insertQuote = () => {
        insertText(txtEl, '> ', '');
      };

      $scope.insertOlList = () => {
        insertText(txtEl, "1. item1\n2. item2\n3. item3", '');
      };

      $scope.insertUlList = () => {
        insertText(txtEl, "* item1\n* item2\n* item3", '');
      };

      $scope.insertHr = () => {
        insertText(txtEl, '<hr>', '');
      };

      $scope.insertImage = (name = '', url = 'url') => {
        insertText(txtEl, `![${name}`, `](${url})`);
      };

      $scope.insertLink = () => {
        insertText(txtEl, '[', '](url)');
      };
    }
  };
};
