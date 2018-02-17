// Styles
import "./stylesheets/app-light.scss";
import "./stylesheets/app-dark.scss";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

import electron from "electron";

// Disable zooming
// electron.webFrame.setZoomLevelLimits(1, 1);

require('./ng-app.js');


window.onload = () => {
  setTimeout(() => {
    document.body.style.visibility = 'visible';
  }, 300);
};
