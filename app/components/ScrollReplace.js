// @flow
import React from 'react';

type Props = {
  history: {},
  location: {},
  selector: string
};

const setPathPos = (path: string, pos: number): void => {
  if (window.scrollDb === undefined) {
    window.scrollDb = {};
  }

  window.scrollDb[path] = pos;
};

const getPathPos = (path: string): number | undefined => {
  if (window.scrollDb) {
    return window.scrollDb[path];
  }

  return undefined;
};

export default class ScrollReplace extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.detectScroll = this.detectScroll.bind(this);
    this.saveTimer = null;
  }

  componentDidMount(): void {
    const { selector } = this.props;
    const el = document.querySelector(selector);
    if (el) {
      this.el = el;
      this.el.addEventListener('scroll', this.detectScroll);
    }
  }

  componentWillReceiveProps(nextProps: {}): void {
    if (!this.el) {
      return;
    }

    const { location: actual } = this.props;
    const { location: next } = nextProps;

    if (next !== actual) {
      const { history } = this.props;
      let pos = 0;
      if (history.action === 'POP') {
        pos = getPathPos(next.pathname) || 0;
      }

      this.el.scrollTop = pos;
    }
  }

  componentWillUnmount(): void {
    if (this.el) {
      this.el.removeEventListener('scroll', this.detectScroll);
    }
  }

  detectScroll(): void {
    const { location } = this.props;
    const pos = this.el.scrollTop;

    const save = () => {
      setPathPos(location.pathname, pos);
      // console.log(`${pathname} saved ${pos}`)
    };

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(save, 300);
  }

  render(): null {
    return null;
  }
}
