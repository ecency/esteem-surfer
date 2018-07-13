import {insertText} from '../helpers/editor-utils';

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
        <button class="btn btn-default" ng-click="insertBold()" tooltip-popup-delay="1000" tooltip-placement="right" uib-tooltip="{{ 'EDITOR_CONTROL_BOLD' | __ }}"><i class="fa fa-bold"></i></button>
        <button class="btn btn-default" ng-click="insertItalic()" tooltip-popup-delay="1000" tooltip-placement="right" uib-tooltip="{{ 'EDITOR_CONTROL_ITALIC' | __ }}"><i class="fa fa-italic"></i></button>
        <button class="btn btn-default" tooltip-popup-delay="1000" tooltip-placement="top" uib-tooltip="{{ 'EDITOR_CONTROL_HEADER' | __ }}"><i class="fa fa-header"></i><span class="sub-menu"><a class="btn btn-sm btn-default" ng-click="insertHeader(1)">h1</a><a class="btn btn-sm btn-default" ng-click="insertHeader(2)">h2</a><a class="btn btn-sm btn-default" ng-click="insertHeader(3)">h3</a><a class="btn btn-sm btn-default" ng-click="insertHeader(4)">h4</a></span></button>
        <button class="btn btn-default" ng-click="insertCode()" tooltip-popup-delay="1000" tooltip-placement="right" uib-tooltip="{{ 'EDITOR_CONTROL_CODE' | __ }}"><i class="fa fa-code"></i></button>
        <button class="btn btn-default" ng-click="insertQuote()" tooltip-popup-delay="1000" tooltip-placement="right" uib-tooltip="{{ 'EDITOR_CONTROL_QUOTE' | __ }}"><i class="fa fa-quote-right"></i></button>
        <button class="btn btn-default" ng-click="insertOlList()" tooltip-popup-delay="1000" tooltip-placement="right" uib-tooltip="{{ 'EDITOR_CONTROL_OL' | __ }}"><i class="fa fa-list-ol"></i></button>
        <button class="btn btn-default" ng-click="insertUlList()" tooltip-popup-delay="1000" tooltip-placement="right" uib-tooltip="{{ 'EDITOR_CONTROL_UL' | __ }}"><i class="fa fa-list-ul"></i></button>
        <button class="btn btn-default" ng-click="insertHr()" tooltip-popup-delay="1000" tooltip-placement="right" uib-tooltip="{{ 'EDITOR_CONTROL_HR' | __ }}"><i class="fa fa-minus"></i></button>
        <button class="btn btn-default" tooltip-popup-delay="1000" tooltip-placement="top" uib-tooltip="{{ 'EDITOR_CONTROL_IMAGE' | __ }}"><i class="fa fa-image"></i><span class="sub-menu"><a class="btn btn-sm btn-default" ng-click="uploadImage()">{{ 'EDITOR_CONTROL_IMAGE_UPLOAD' | __ }}</a><a class="btn btn-sm btn-default" login-required on-login-success="openGallery()">{{ 'EDITOR_CONTROL_IMAGE_GALLERY' | __ }}</a></span></button>
        <button class="btn btn-default" ng-click="insertLink()" tooltip-popup-delay="1000" tooltip-placement="right" uib-tooltip="{{ 'EDITOR_CONTROL_LINK' | __ }}"><i class="fa fa-link"></i></button>
        <button class="btn btn-default" ng-click="insertTable()" tooltip-popup-delay="1000" tooltip-placement="right" uib-tooltip="{{ 'EDITOR_CONTROL_TABLE' | __ }}"><i class="fa fa-table"></i></button>
        </div>`,
    controller: ($scope, $rootScope, $timeout, $uibModal) => {

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

      $scope.insertHeader = (n = 1) => {
        insertText(txtEl, '#'.repeat(n) + ' ', '');
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

      $scope.insertTable = () => {
        const t = "\n|\tColumn 1\t|\tColumn 2\t|\tColumn 3\t|\n" +
          "|\t------------\t|\t------------\t|\t------------\t|\n" +
          "|\t     Text     \t|\t     Text     \t|\t     Text     \t|\n";
        insertText(txtEl, t);
      };

      $scope.uploadImage = () => {
        document.querySelector('.content-editor .file-input').click()
      };

      $scope.openGallery = () => {
        $uibModal.open({
          templateUrl: 'templates/gallery-modal.html',
          controller: 'galleryModalCtrl',
          windowClass: 'gallery-modal',
          resolve: {
            afterClick: function () {
              return (src) => {
                const name = src.split('/').pop();
                $scope.insertImage(name, src);
              };
            }
          }
        }).result.then((data) => {
          // Success
        }, () => {
          // Cancel
        });
      };
    }
  };
};
