export default () => {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      body: '=',
      placeHolder: '@'
    },
    link: ($scope, $element) => {

      const el = $element[0];
      const txtEl = el.querySelector('textarea');

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

      txtEl.addEventListener('dragenter', (e) => {
        e.stopPropagation();
        e.preventDefault();
        txtEl.classList.add('dragover');
      }, false);

      txtEl.addEventListener('dragleave', (e) => {
        e.stopPropagation();
        e.preventDefault();
        txtEl.classList.remove('dragover');
      }, false);


      txtEl.addEventListener('dragover', (e) => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }, false);


      txtEl.addEventListener('drop', (e) => {
        e.stopPropagation();
        e.preventDefault();
        txtEl.classList.remove('dragover');
        console.log(e.dataTransfer.files);
      }, false);

      txtEl.addEventListener('paste', (e) => {
        let f = false;
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          let item = e.clipboardData.items[i];
          console.log("Item: " + item.type);

          if (item.type.indexOf('image') !== -1) {
            console.log(item.getAsFile());
            f = true;
          }
        }

        if (f) {
          e.stopPropagation();
          e.preventDefault();
        }
      });

      document.getElementById('file-input').addEventListener('change', function (e) {
        console.log(e.target.files);
      });

    },
    templateUrl: 'templates/directives/content-editor.html',
    controller: ($scope, $rootScope) => {

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

      $scope.insertImage = () => {
        $scope.insertText('![', '](url)');
      };

      $scope.openFileInput = () => {
        document.getElementById('file-input').click();
      }
    }
  };
};
