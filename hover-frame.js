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
        border-radius: 12px;
        box-sizing: border-box;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        background: transparent;
        box-shadow: 0 2px 8px rgba(0, 112, 243, 0.2);
      }
      .hover-container:hover {
        border: 6px solid #ff0080;
        box-shadow: 0 12px 48px rgba(255, 0, 128, 0.5), 
                    0 0 0 4px rgba(255, 0, 128, 0.2),
                    inset 0 0 20px rgba(255, 0, 128, 0.1);
        transform: scale(1.05) translateY(-4px);
        background: rgba(255, 0, 128, 0.03);
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
