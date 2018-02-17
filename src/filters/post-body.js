import marked from 'marked';

export default ($sce) => {
  return (postBody) => {

    if (postBody === undefined) {
      return $sce.trustAsHtml('');
    }

    // Convert markdown to html
    let text = marked(postBody, {
      gfm: true,
      tables: true,
      smartLists: true,
      breaks: true,
      pedantic: false,
      sanitize: false,
      smartypants: false
    });

    // Create temporary element to manipulate html
    let tempEl = document.createElement('div');
    tempEl.innerHTML = text;

    // Manipulate link (a) elements
    let links = tempEl.querySelectorAll('a');
    links.forEach((el) => {
      let href = el.getAttribute('href');

      // If an image ! href must be equal to innerText
      if (href.match(/(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim) && href === el.innerHTML) {
        el.setAttribute('data-href', href);
        el.removeAttribute('href');
        el.className = 'post-img-holder';
        el.innerHTML = `<img src="${href}">`;
      }

      // If a post
      let postMatch = href.match(/^https?:\/\/(.*)\/(.*)\/@(\w+)\/(.*)/);
      if (postMatch) {
        el.className = 'post-link';
        el.removeAttribute('href');

        el.setAttribute('data-category', postMatch[2]);
        el.setAttribute('data-author', postMatch[3]);
        el.setAttribute('data-permlink', postMatch[4]);
      }

      // TODO: If youtube video

      // TODO: If vimeo video

      // TODO: Else, open url on default OS browser
    });


    // Manipulate images which are not wrapped with another element
    let images = tempEl.querySelectorAll('p>img');
    images.forEach((el) => {
      let src = el.getAttribute('src');

      // wrap img with parent element
      let wrapper = document.createElement('a');
      wrapper.className = 'post-img-holder';
      wrapper.setAttribute('data-href', src);
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
    });


    // Remove empty paragraphs
    let paragraphs = tempEl.querySelectorAll('p');
    paragraphs.forEach((p) => {
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


    text = tempEl.innerHTML;

    // Replace images
    // let r = /(https?:\/\/.*\.(?:tiff?|jpe?g|gif|png|svg|ico))(.*)/gim;
    // text = text.replace(r, '<div class="post-img-holder"><img src="$1" /></div>');

    // Replace usernames
    //  let exp = /(^|\s)@(\w+)/gim;
    //  text = text.replace(exp, "$1<a class='to-user' href='/users/$2'>@$2</a>");

    return $sce.trustAsHtml(text);
  }
}
