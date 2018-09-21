import Remarkable from 'remarkable';
import he from 'he';

const md = new Remarkable({ html: true, breaks: true, linkify: false });

export default (entryBody, length) => {
  if (!entryBody) {
    return '';
  }

  // Convert markdown to html
  let text = md.render(entryBody);

  text = text
    .replace(/(<([^>]+)>)/gi, '') // Remove html tags
    .replace(/\r?\n|\r/g, ' ') // Remove new lines
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Remove urls
    .trim()
    .replace(/ +(?= )/g, ''); // Remove all multiple spaces

  if (length) {
    // Truncate
    text = text.substring(0, length);
  }

  text = he.decode(text); // decode html entities

  return text;
};
