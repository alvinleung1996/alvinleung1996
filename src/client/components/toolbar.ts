import { LitElement, html } from '@polymer/lit-element';

import { shadow } from './shared-styles/shadows';
import { background } from './shared-styles/background';
import { cssVar } from '../utils/style-util';

class Toolbar extends LitElement {

  _render() {
    return html`
      <style>
        :host {
          display: block;
          position: fixed;
          top: 0px;
          left: 0px;
          right: 0px;
          height: 64px;
          background-color: ${cssVar(background.accent.color)};
          box-shadow: ${cssVar(shadow.z4.boxShadow)};
        }
      </style>
      <p>toolbar</p>
    `;
  }

}

window.customElements.define('al-toolbar', Toolbar);
