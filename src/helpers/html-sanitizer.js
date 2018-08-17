export const sanitizeNode = (node) => {

  const ALLOWED_TAGS = [
    'A', 'STRONG', 'B', 'I', 'EM', 'CODE', 'PRE', 'BLOCKQUOTE', 'SUP', 'SUB',
    'H2', 'H1', 'H3', 'H4', 'H5', 'H6',
    'DIV', 'P', 'IFRAME', 'CENTER',
    'UL', 'OL', 'LI',
    'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH',
    'HR', 'BR', 'IMG', 'DEL', 'INS'
  ];

  const ALLOWED_ATTRS = [
    'data-permlink', 'data-tag', 'data-author', 'data-href',
    'class', 'src', 'alt', 'title', 'width', 'height', 'border',
    'frameborder', 'allowfullscreen', 'mozallowfullscreen', 'webkitallowfullscreen'
  ];

  const allElems = node.querySelectorAll('*');
  allElems.forEach((el) => {

    if (ALLOWED_TAGS.indexOf(el.tagName) === -1) {
      el.outerHTML = `<span>${el.textContent.replace('>', '&gt;').replace('<', '&lt;')}</span>`;
    }

    for (let attr of el.attributes) {
      if (ALLOWED_ATTRS.indexOf(attr.name) === -1 || attr.value.toLowerCase().indexOf('javascript:') !== -1) {
        el.removeAttribute(attr.name)
      }
    }
  });

  return node;
};
