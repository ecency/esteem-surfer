import marked from 'marked';

export const replaceAuthorNames = (input) => {
  let exp = /@(\w+)/ig;
  return input.replace(exp, "<a class='markdown-author-link' data-author='$1'>@$1</a>");
};

export const replaceTags = (input) => {
  let exp = /#(\w+)/ig;
  return input.replace(exp, "<a class='markdown-tag-link' data-tag='$1'>#$1</a>");
};


export const markDown2Html = (input) => {

  if (!input) {
    return '';
  }

  // Convert markdown to html
  let html = marked(input, {
    gfm: true,
    tables: true,
    smartLists: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartypants: false
  });

  const imgRegex = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim;
  const postRegex = /^https?:\/\/(.*)\/(.*)\/@(\w+)\/(.*)/;

  // Create temporary element to manipulate html
  let tempEl = document.createElement('div');
  tempEl.innerHTML = html;

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

        el.setAttribute('data-category', postMatch[2]);
        el.setAttribute('data-author', postMatch[3]);
        el.setAttribute('data-permlink', postMatch[4]);

        f = true;
      }
    }

    // TODO: If youtube video

    // TODO: If vimeo video

    // TODO: Else, open url on default OS browser

    // If nothing matched mark element as external link so it will be opened in external window
    if(!f){
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


  // Remove empty paragraphs
  /* i set marked option breaks to false. i think i dont need it any more. [NO! I need it!] [YES I DONT NEED IT] */
  /*
  let paragraphs = tempEl.querySelectorAll('p');
  paragraphs.forEach((p) => {

    // make a unique list from elements paragraph contains
    let subTagList = [];
    p.childNodes.forEach((c) => {
      if (c.tagName && subTagList.indexOf(c.tagName) === -1) {
        subTagList.push(c.tagName);
      }
    });

    // If paragraph contains only breaks (<br>) remove it
    if (subTagList.length === 1 && subTagList[0] === 'BR') {
      p.parentNode.removeChild(p);
    }
  });
  */


  html = tempEl.innerHTML;

  // Replace images
  // let r = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim;
  // text = text.replace(r, '<div class="post-img-holder"><img src="$1" /></div>');

  // Replace author names
  html = replaceAuthorNames(html);

  // Replace tags
  html = replaceTags(html);

  // console.log(JSON.stringify(html))
  return html;
};

export const markDown2HtmlFilter = ($sce) => {
  return (postBody) => {

    const html = markDown2Html(postBody);
    return $sce.trustAsHtml(html);
  }
};
