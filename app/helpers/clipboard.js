import { clipboard } from 'electron';

export default s => {
  clipboard.writeText(s);
};
