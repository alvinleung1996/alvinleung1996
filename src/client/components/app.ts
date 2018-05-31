import { LitElement, html } from '@polymer/lit-element';
import { installRouter } from 'pwa-helpers/router';

import store from '../store';
import { navigate } from '../actions/app';

import './toolbar';
import './shared-styles/shadows';
import '../utils/style-util';

class App extends LitElement {

  _render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <al-toolbar></al-toolbar>
      <div id="pages">
        <al-home-page></al-home-page>
      </div>
      <h1>Hello!</h1>
    `;
  }

  _firstRendered() {
    installRouter(location => store.dispatch(navigate(decodeURIComponent(location.pathname))));
  }
  
}

window.customElements.define('al-app', App);
