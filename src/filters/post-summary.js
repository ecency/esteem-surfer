import marked from 'marked';

export default ($sce) => {
  return (postBody, length = 200) => {

    if (postBody === undefined) {
      return $sce.trustAsHtml('');
    }

    // Convert markdown to html
    let text = marked(postBody, {
      gfm: true,
      tables: true,
      breaks: true,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    });

    // Remove html tags
    // Remove new lines
    // Remove urls
    text = text.replace(/(<([^>]+)>)/ig, '').replace(/\r?\n|\r/g, ' ').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');

    // Truncate
    text = text.substring(0, length);

    return $sce.trustAsHtml(text);
  }
}
