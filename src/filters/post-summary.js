import marked from 'marked';

export const postSummary = (postBody, length) => {
  if (!postBody) {
    return '';
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

  return text;
};

export const postSummaryFilter = ($sce) => {
  return (postBody, length = 200) => {
    return $sce.trustAsHtml(postSummary(postBody, length));
  }
};
