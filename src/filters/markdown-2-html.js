const Remarkable = require('remarkable');

const md = new Remarkable({html: true, breaks: true, linkify: true});

export const replaceAuthorNames = (input) => {
  return input.replace(
    /(^|[^a-zA-Z0-9_!#$%&*@＠\/]|(^|[^a-zA-Z0-9_+~.-\/]))[@＠]([a-z][-\.a-z\d]+[a-z\d])/gi,
    (match, preceeding1, preceeding2, user) => {
      const userLower = user.toLowerCase();
      const preceedings = (preceeding1 || '') + (preceeding2 || '');

      return `${preceedings}<a class="markdown-author-link" data-author="${userLower}">@${user}</a>`
    }
  );
};

export const replaceTags = (input) => {
  return input.replace(/(#[-a-z\d]+)/gi, tag => {
    if (/#[\d]+$/.test(tag)) return tag;
    const space = /^\s/.test(tag) ? tag[0] : '';
    const tag2 = tag.trim().substring(1);
    const tagLower = tag2.toLowerCase();
    return space + `<a class="markdown-tag-link" data-tag="${tagLower}">${tag.trim()}</a>`;
  });
};

export const markDown2Html = (input) => {
  if (!input) {
    return '';
  }

  let output = md.render(input);

  const imgRegex = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim;
  const postRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w\.\d-]+)\/(.*)/i;
  const youTubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]+)?/g;
  const vimeoRegex = /(https?:\/\/)?(www\.)?(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;

  // Create temporary element to manipulate html
  let tempEl = document.createElement('div');
  tempEl.innerHTML = output;

  // Manipulate link (a) elements
  let links = tempEl.querySelectorAll('a');
  links.forEach((el) => {
    const href = el.getAttribute('href');
    let f = false;

    // if href is an image url and innerHTML same with href then mark it as image
    // & => &amp; can break equality
    if (href.match(imgRegex) && href.trim().replace(/&amp;/g, '&') === el.innerHTML.trim().replace(/&amp;/g, '&')) {
      el.setAttribute('data-href', href);
      el.removeAttribute('href');

      el.className = 'markdown-img-link';
      el.innerHTML = `<img src="${href}">`;
      f = true;
    }

    // If a steem post
    if (!f) {
      let postMatch = href.match(postRegex);
      if (postMatch) {
        el.className = 'markdown-post-link';
        el.removeAttribute('href');

        el.setAttribute('data-tag', postMatch[2]);
        el.setAttribute('data-author', postMatch[3].replace('@', ''));
        el.setAttribute('data-permlink', postMatch[4]);

        f = true;
      }
    }

    // If a youtube video
    if (!f) {
      let match = href.match(youTubeRegex);
      if (match) {
        let e = youTubeRegex.exec(href);
        if (e[1]) {
          el.className = 'markdown-video-link markdown-video-link-youtube';
          el.removeAttribute('href');

          let vid = e[1];
          let embedSrc = 'https://www.youtube.com/embed/' + vid;
          el.innerHTML = `<iframe width='600' height='400' frameborder='0' allowfullscreen src='${embedSrc}'></iframe>`;
          f = true;
        }
      }
    }

    // TODO: If vimeo video


    // If nothing matched element as external link so it will be opened in external window
    if (!f) {
      el.className = 'markdown-external-link';

      el.setAttribute('data-href', href);
      el.removeAttribute('href');
    }
  });

  output = tempEl.innerHTML;

  // Replace author names
  output = replaceAuthorNames(output);

  // Replace tags
  output = replaceTags(output);

  // console.log(output)

  tempEl = document.createElement('div');
  tempEl.innerHTML = output;

  // Try to convert image links that are Remarkable could not converted.
  // Find text nodes not wrapper with a and node value matchs with image regex
  let pars = tempEl.querySelectorAll('*');
  pars.forEach((el) => {
    el.childNodes.forEach((n) => {
      if (n.nodeValue && n.nodeValue.trim() && ['P'].indexOf(n.parentNode.tagName) !== -1) {
        let href = n.nodeValue.trim();
        if (href.match(imgRegex)) {

          let replace = document.createElement('a');
          replace.setAttribute('data-href', href);

          replace.className = 'markdown-img-link';
          replace.innerHTML = `<img src="${n.nodeValue}">`;

          n.parentNode.insertBefore(replace, n);
          n.parentNode.removeChild(n);
        }
      }
    });
  });

  output = tempEl.innerHTML;


  return output;
};

export const markDown2HtmlFilter = ($sce) => {
  return (postBody) => {

    const html = markDown2Html(postBody);
    return $sce.trustAsHtml(html);
  }
};
