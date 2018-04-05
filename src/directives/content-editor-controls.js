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
        <button class="btn btn-default" ng-click="insertHeader()"><i class="fa fa-header"></i></button>
        <button class="btn btn-default" ng-click="insertBold()"><i class="fa fa-bold"></i></button>
        <button class="btn btn-default" ng-click="insertItalic()"><i class="fa fa-italic"></i></button>
        <button class="btn btn-default" ng-click="insertQuote()"><i class="fa fa-quote-right"></i></button>
        <button class="btn btn-default" ng-click="insertLink()"><i class="fa fa-link"></i></button>
        <button class="btn btn-default" ng-click="insertImage()"><i class="fa fa-image"></i></button>
        </div>`,
    controller: ($scope, $rootScope, $timeout) => {

      let el = null;
      let txtEl = null;

      $timeout(() => {
        el = document.querySelector($scope.targetElem);
        txtEl = el.querySelector('textarea');

        txtEl.focus();
      }, 500);


      $scope.insertSpace = () => {
        let pos = txtEl.value.length;

        txtEl.selectionStart = pos;
        txtEl.selectionEnd = pos;
        txtEl.focus();

        document.execCommand('insertText', false, ' ');

        pos = txtEl.value.length;
        txtEl.selectionStart = pos;
        txtEl.selectionEnd = pos;
      };

      $scope.insertText = (before, after = '') => {
        const startPos = txtEl.selectionStart;
        const endPos = txtEl.selectionEnd;
        const selText = txtEl.value.substring(startPos, endPos);

        let insertText = `${before}${selText}${after}`;

        const newStartPos = startPos + before.length;
        const newEndPos = newStartPos + selText.length;

        txtEl.focus();

        document.execCommand('insertText', false, insertText);

        txtEl.selectionStart = newStartPos;
        txtEl.selectionEnd = newEndPos;
      };

      $scope.insertHeader = () => {
        $scope.insertText('# ', '');
      };

      $scope.insertBold = () => {
        $scope.insertText('**', '**');
      };

      $scope.insertItalic = () => {
        $scope.insertText('*', '*');
      };

      $scope.insertQuote = () => {
        $scope.insertText('> ', '');
      };

      $scope.insertLink = () => {
        $scope.insertText('[', '](url)');
      };

      $scope.insertImage = (name = '', url = 'url') => {
        $scope.insertText(`![${name}`, `](${url})`);
      };
    }
  };
};
