export const insertText = (txtEl, before, after = '') => {
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


export const insertSpace = (txtEl) => {
  let pos = txtEl.value.length;

  txtEl.selectionStart = pos;
  txtEl.selectionEnd = pos;
  txtEl.focus();

  document.execCommand('insertText', false, ' ');

  pos = txtEl.value.length;
  txtEl.selectionStart = pos;
  txtEl.selectionEnd = pos;
};
