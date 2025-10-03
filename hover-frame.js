(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host { 
        display: block; 
        width: 100%; 
        height: 100%; 
      }
      .hover-container {
        position: relative;
        width: 100%;
        height: 100%;
        border: 3px solid #0070f3;
        border-radius: 8px;
        box-sizing: border-box;
        transition: all 0.3s ease;
        background: transparent;
      }
      .hover-container:hover {
        border-color: #0052cc;
        box-shadow: 0 4px 16px rgba(0, 112, 243, 0.3);
        transform: scale(1.01);
      }
    </style>
    <div class="hover-container"></div>
  `;

  class HoverFrame extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }

  if (!customElements.get("com-custom-hover-frame")) {
    customElements.define("com-custom-hover-frame", HoverFrame);
  }
})();
