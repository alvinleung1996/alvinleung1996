import { LitElement, html } from '@polymer/lit-element';

class HomePage extends LitElement {

  _render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <p>Home Page</p>
    `;
  }
}

window.customElements.define('al-home-page', HomePage);
