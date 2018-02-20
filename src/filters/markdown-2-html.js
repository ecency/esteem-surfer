import marked from 'marked';

export const replaceAuthorNames = (input) => {
  let exp = /(^|\s|[\(])(@)([a-z][-\.a-z\d]+[a-z\d])/gim;
  return input.replace(exp, "$1<a class='markdown-author-link' data-author='$3'>@$3</a>");
};

export const replaceTags = (input) => {
  let exp = /#([a-zA-Z0-9-]{2,})/gi;
  return input.replace(exp, "<a class='markdown-tag-link' data-tag='$1'>#$1</a>");
};


export const markDown2Html = (input) => {

 // console.log(input)

  if (!input) {
    return '';
  }

  // Convert markdown to html
  let output = marked(input, {
    gfm: true,
    tables: true,
    smartLists: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartypants: false
  });

  const imgRegex = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim;
  const postRegex = /^https?:\/\/(.*)\/(.*)\/(@[\w\.\d-]+)\/(.*)/i;

  // Create temporary element to manipulate html
  let tempEl = document.createElement('div');
  tempEl.innerHTML = output;

  // Manipulate link (a) elements
  let links = tempEl.querySelectorAll('a');
  links.forEach((el) => {
    const href = el.getAttribute('href');
    let f = false;

    // if href is an image url and innerHTML same with href then mark it as image
    if (href.match(imgRegex) && href === el.innerHTML) {
      el.setAttribute('data-href', href);
      el.removeAttribute('href');

      el.className = 'markdown-img-holder';
      el.innerHTML = `<img ng-src="${href}">`;
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

    // TODO: If youtube video

    // TODO: If vimeo video

    // TODO: Else, open url on default OS browser

    // If nothing matched mark element as external link so it will be opened in external window
    if (!f) {
      el.className = 'markdown-external-link';

      el.setAttribute('data-href', href);
      el.removeAttribute('href');
    }
  });


  // Manipulate images which are not wrapped with another element
  let images = tempEl.querySelectorAll('p>img');
  images.forEach((el) => {
    let src = el.getAttribute('src');

    // wrap img with parent element
    let wrapper = document.createElement('a');
    wrapper.className = 'markdown-img-holder';
    wrapper.setAttribute('data-href', src);
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  });

  output = tempEl.innerHTML;

  // Replace author names
  output = replaceAuthorNames(output);

  // Replace tags
  output = replaceTags(output);

  // console.log(output)

  return output;
};

export const markDown2HtmlFilter = ($sce) => {
  return (postBody) => {

    const html = markDown2Html(postBody);
    return $sce.trustAsHtml(html);
  }
};
