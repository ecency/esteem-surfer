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
  return input.replace(/(^|\s|>)(#[-a-z\d]+)/gi, tag => {
    if (/#[\d]+$/.test(tag)) return tag; // do not allow only numbers (like #1)
    const preceding = /^\s|>/.test(tag) ? tag[0] : ''; // space or closing tag (>)
    tag = tag.replace('>', ''); // remove closing tag
    const tag2 = tag.trim().substring(1);
    const tagLower = tag2.toLowerCase();
    return preceding + `<a class="markdown-tag-link" data-tag="${tagLower}">${tag.trim()}</a>`;
  });
};

export const markDown2Html = (input) => {
  if (!input) {
    return '';
  }

  // Start replacing user names
  let output = replaceAuthorNames(input);

  // Replace tags
  output = replaceTags(output);

  output = md.render(output);

  const imgRegex = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim;
  const postRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w\.\d-]+)\/(.*)/i;
  const youTubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n<]+)(?:[^ \n<]+)?/g;
  const vimeoRegex = /(https?:\/\/)?(www\.)?(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
  const dTubeRegex = /(https?:\/\/d.tube.#!\/v\/)(\w+)\/(\w+)/g;

  // Create temporary element to manipulate html
  let tempEl = document.createElement('div');
  tempEl.innerHTML = output;

  // Manipulate link (a) elements
  const links = tempEl.querySelectorAll('a');
  links.forEach((el) => {
    const href = el.getAttribute('href');

    // Continue if href has no value
    if (!href) {
      return;
    }

    // Don't touch user and hashtag links
    if (['markdown-author-link', 'markdown-tag-link'].indexOf(el.className) !== -1) {
      return;
    }

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
      const postMatch = href.match(postRegex);
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
      const match = href.match(youTubeRegex);
      if (match) {
        const e = youTubeRegex.exec(href);
        if (e[1]) {
          el.className = 'markdown-video-link markdown-video-link-youtube';
          el.removeAttribute('href');

          const vid = e[1];
          const embedSrc = 'https://www.youtube.com/embed/' + vid;
          el.innerHTML = `<iframe frameborder='0' allowfullscreen src='${embedSrc}'></iframe>`;
          f = true;
        }
      }
    }

    // If vimeo video
    if (!f) {
      const match = href.match(vimeoRegex);
      if (match && href === el.innerText) {
        const e = vimeoRegex.exec(href);
        if (e[3]) {
          el.className = 'markdown-video-link markdown-video-link-vimeo';
          el.removeAttribute('href');

          const embedSrc = `https://player.vimeo.com/video/${e[3]}`;
          el.innerHTML = `<iframe frameborder='0' allowfullscreen src='${embedSrc}'></iframe>`;
          f = true;
        }
      }
    }

    // If a d.tube video
    if (!f) {
      const match = href.match(dTubeRegex);
      if (match) {
        // Only d.tube links contains an image
        const imgEls = el.querySelectorAll('img');
        if (el.innerText === href || imgEls.length === 1) {
          const e = dTubeRegex.exec(href);
          // e[2] = username, e[3] object id
          if (e[2] && e[3]) {
            el.className = 'markdown-video-link markdown-video-link-dtube';
            el.removeAttribute('href');

            const embedSrc = `https://emb.d.tube/#!/${e[2]}/${e[3]}`;
            el.innerHTML = `<iframe frameborder='0' allowfullscreen src='${embedSrc}'></iframe>`;
            f = true;
          }
        }
      }
    }

    // If nothing matched element as external link so it will be opened in external window
    if (!f) {
      el.className = 'markdown-external-link';

      el.setAttribute('data-href', href);
      el.removeAttribute('href');
    }
  });

  output = tempEl.innerHTML;

  // console.log(output)

  tempEl = document.createElement('div');
  tempEl.innerHTML = output;

  // Try to convert image links that are Remarkable could not converted.
  // Find text nodes not wrapper with a and node value matchs with image regex
  const pars = tempEl.querySelectorAll('*');
  pars.forEach((el) => {
    el.childNodes.forEach((n) => {
      if (n.nodeValue && n.nodeValue.trim() && ['P', 'DIV', 'CENTER', 'STRONG'].indexOf(n.parentNode.tagName) !== -1) {
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
