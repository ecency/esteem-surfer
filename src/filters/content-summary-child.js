const Remarkable = require('remarkable');

const md = new Remarkable({html: true, breaks: true, linkify: false});


export const contentSummaryChild = (input, length) => {
  if (!input) {
    return '';
  }

  // Remove blockquotes (lines starting with >...)
  input = input.replace(/^>.*$/m, '');

  // Convert markdown to html
  let text = md.render(input);

  text = text
    .replace(/(<([^>]+)>)/ig, '') // Remove html tags
    .replace(/\r?\n|\r/g, ' ') // Remove new lines
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Remove urls
    .trim()
    .replace(/ +(?= )/g, ''); // Remove all multiple spaces

  if (length) {
    // Truncate
    text = text.substring(0, length);
  }

  return text;
};

export const contentSummaryChildFilter = ($sce) => {
  return (postBody, length = 200) => {
    return $sce.trustAsHtml(contentSummaryChild(postBody, length));
  }
};
