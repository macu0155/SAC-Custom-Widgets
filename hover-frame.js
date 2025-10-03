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
        border: 2px solid rgba(0, 112, 243, 0.3);
        border-radius: 10px;
        box-sizing: border-box;
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        background: transparent;
      }
      .hover-container:hover {
        border: 4px solid #0070f3;
        box-shadow: 0 8px 32px rgba(0, 112, 243, 0.4), 
                    0 0 0 2px rgba(0, 112, 243, 0.1);
        transform: scale(1.03) translateY(-2px);
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
