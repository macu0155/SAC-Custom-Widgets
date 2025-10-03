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
        transition: all 0.3s ease;
        background: transparent;
        box-shadow: 0 2px 8px rgba(0, 112, 243, 0.15);
      }
      .hover-container.active {
        border: 6px solid #ff0080;
        box-shadow: 0 12px 48px rgba(255, 0, 128, 0.6);
        transform: scale(1.05) translateY(-4px);
        background: rgba(255, 0, 128, 0.05);
      }
    </style>
    <div class="hover-container" id="frame"></div>
  `;

  class HoverFrame extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this._frame = this.shadowRoot.getElementById("frame");
    }

    connectedCallback() {
      this._frame.addEventListener('mouseenter', () => {
        this._frame.classList.add('active');
      });
      
      this._frame.addEventListener('mouseleave', () => {
        this._frame.classList.remove('active');
      });
    }
  }

  if (!customElements.get("com-custom-hover-frame")) {
    customElements.define("com-custom-hover-frame", HoverFrame);
  }
})();
