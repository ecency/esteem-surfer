import {insertText, insertSpace} from '../helpers/editor-utils';

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
      elemId: '@',
      placeHolder: '@'
    },
    link: ($scope, $element) => {

      const el = $element[0];
      const txtEl = el.querySelector('textarea');
      const bgEl = el.querySelector('#bg-text');
      $scope.txtEl = txtEl;

      txtEl.focus();

      // for highlighting support
      const shouldMirrorToBg = window.getComputedStyle(bgEl).display !== 'none';

      const getTxtElVal = () => {
        return txtEl.value + "\n";
      };

      const replaceAll = (txt, replace, with_this) => {
        return txt.replace(new RegExp(replace, 'g'), with_this);
      };

      const syncScroll = () => {
        bgEl.scrollTop = txtEl.scrollTop;
      };

      txtEl.addEventListener('keyup', function (e) {
        if (!shouldMirrorToBg) {
          return;
        }
        bgEl.innerHTML = getTxtElVal();
        syncScroll();
      });

      txtEl.addEventListener('click', function (e) {
        if (!shouldMirrorToBg) {
          return;
        }
        bgEl.innerHTML = getTxtElVal();
      });

      txtEl.addEventListener('blur', function (e) {
        if (!shouldMirrorToBg) {
          return;
        }
        bgEl.innerHTML = getTxtElVal();
      });

      txtEl.addEventListener('select', function (e) {
        /* disabled
        const startPos = txtEl.selectionStart;
        const finishPos = txtEl.selectionEnd;

        const selectedText = txtEl.value.substring(startPos, finishPos);

        if (selectedText.trim().length < 2) {
          return;
        }

        bgEl.innerHTML = replaceAll(getTxtElVal(), selectedText, '<span class="marked">' + selectedText + '</span>');
        */
      });

      txtEl.addEventListener('scroll', function (e) {
        syncScroll();
      });

      // Keyboard shortcuts
      txtEl.addEventListener('keydown', function (e) {
        // Shortcut for **bold**
        if (e.keyCode === 66 && (e.ctrlKey || e.metaKey)) {
          insertText(txtEl, '**', '**');
          e.preventDefault();
        }

        // Shortcut for *italic*
        if (e.keyCode === 73 && (e.ctrlKey || e.metaKey)) {
          insertText(txtEl, '*', '*');
          e.preventDefault();
        }
      });

      // Uploading (drag & drop )
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

        // when text copied from ms word, it adds screen shot of selected text to clipboard.
        // check if data in clipboard is long string and skip upload.
        // (i think no one uses more than 50 chars for a image file)
        const txtData = e.clipboardData.getData('text/plain');
        if (txtData.length >= 50) {
          return
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
    template: `<div class="content-editor" id="{{ elemId }}">
      <pre id="bg-text"></pre>
      <textarea id="main-text" ng-disabled="processing" class="form-control" ng-model="body" placeholder="{{ placeHolder }}"></textarea>
      <div class="image-upload-panel" ng-if="uploadingImage">
        <span class="image-file-name">Uploading {{ uploadingImage }}</span>
        <span class="progress-text" ng-if="uploadingImageProg > 0 && uploadingImageProg < 100">{{ uploadingImageProg }}%</span>
        <span class="processing-text" ng-if="uploadingImageProg === 100"><small>processing...</small></span>
      </div>
      <input class="file-input" id="file-input" type="file" accept="image/*" multiple>
    </div>`,
    controller: ($scope, $rootScope, $timeout, eSteemService, activeUsername) => {

      $scope.insertImage = (name = '', url = 'url') => {
        insertText($scope.txtEl, `![${name}`, `](${url})`);
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
            insertSpace($scope.txtEl);
          });
        }
      };

      $scope.openFileInput = () => {
        document.getElementById('file-input').click();
      };

      $scope.cancelClicked = () => {
        $scope.cancelFn();
      };

      $scope.submitClicked = () => {
        $scope.submitFn()($scope.body);
      }
    }
  };
};
