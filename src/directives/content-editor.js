const checkFile = (filename) => {
  filename = filename.toLowerCase();
  return ['jpg', 'jpeg', 'gif', 'png'].some((el) => {
    return filename.endsWith(el);
  })
};

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
        e.dataTransfer.dropEffect = txtEl.disabled ? 'none' : 'copy';
      }, false);

      txtEl.addEventListener('drop', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (txtEl.disabled) {
          return;
        }

        txtEl.classList.remove('dragover');
        const files = [];
        for (const f of  e.dataTransfer.files) {
          if (checkFile(f.name)) {
            files.push(f)
          }
        }

        $scope.uploadFiles(files);
      }, false);

      txtEl.addEventListener('paste', (e) => {
        if (txtEl.disabled) {
          return;
        }

        let files = [];
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          let item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const l = item.getAsFile();
            if (l) {
              files.push(l);
            }
          }
        }

        if (files.length > 0) {
          e.stopPropagation();
          e.preventDefault();
        }

        $scope.uploadFiles(files);
      });

      document.getElementById('file-input').addEventListener('change', function (e) {
        let files = [];
        for (const f of e.target.files) {
          if (checkFile(f.name)) {
            files.push(f)
          }
        }

        $scope.uploadFiles(files);
      });

    },
    templateUrl: 'templates/directives/content-editor.html',
    controller: ($scope, $rootScope, $timeout, eSteemService, activeUsername) => {

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


      $scope.processing = false;
      $scope.uploadingImage = null;
      $scope.uploadingImageProg = 0;

      $scope.uploadFiles = async (files) => {
        // console.log("upload files");

        let uploadedFiles = [];
        $scope.processing = true;

        for (let f of files) {
          $scope.uploadingImage = f.name;

          await eSteemService.uploadImage(f, (e) => {
            if (e.lengthComputable) {
              let perc = parseInt((e.loaded / e.total) * 100);
              if (perc > 100) {
                perc = 100;
              }
              $scope.uploadingImageProg = perc;
            }
          }).then((resp) => {
            uploadedFiles.push(resp.data.url);
          }).catch(() => {
            $rootScope.showError(`Could not upload image: ${f.name}`);
          });
        }

        $scope.uploadingImage = null;
        $scope.uploadingImageProg = 0;
        $scope.processing = false;
        $scope.$applyAsync();

        for (let u of uploadedFiles) {
          eSteemService.addMyImage(activeUsername(), u).then((resp) => {
            // console.log(resp)
          }).catch((e) => {
            // console.log(e)
          });

          $timeout(() => {
            let s = u.split('/');
            $scope.insertImage(s[s.length - 1], u);
            $scope.insertSpace();
          });
        }
      };

      $scope.openFileInput = () => {
        document.getElementById('file-input').click();
      }
    }
  };
};
