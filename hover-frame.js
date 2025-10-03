(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host { 
        display: block; 
        width: 100%; 
        height: 100%; 
        pointer-events: none;
      }
      .hover-frame {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 8px;
        border: 0 solid transparent;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        box-sizing: border-box;
      }
      .hover-frame:hover {
        border-width: 2px;
        border-color: #0070f3;
      }
      .hover-frame.scale:hover {
        transform: scale(1.02);
        z-index: 100;
      }
      .hover-frame.shadow-light:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .hover-frame.shadow-medium:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      }
      .hover-frame.shadow-strong:hover {
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      }
    </style>
    <div class="hover-frame" id="frame"></div>
  `;

  class HoverFrame extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      
      this._frame = this.shadowRoot.getElementById("frame");
      
      this._props = {
        borderColor: "#0070f3",
        borderWidth: 2,
        shadowIntensity: "medium",
        scaleEffect: true,
        backgroundColor: "transparent"
      };
    }

    connectedCallback() {
      this._updateStyles();
    }

    _updateStyles() {
      const frame = this._frame;
      
      frame.style.backgroundColor = this._props.backgroundColor;
      frame.style.setProperty('--border-color', this._props.borderColor);
      frame.style.borderColor = this._props.borderColor;
      frame.style.setProperty('--border-width', this._props.borderWidth + 'px');
      
      frame.classList.remove('shadow-light', 'shadow-medium', 'shadow-strong');
      if (this._props.shadowIntensity !== 'none') {
        frame.classList.add('shadow-' + this._props.shadowIntensity);
      }
      
      if (this._props.scaleEffect) {
        frame.classList.add('scale');
      } else {
        frame.classList.remove('scale');
      }
    }

    set borderColor(value) {
      this._props.borderColor = value || "#0070f3";
      if (this._frame) this._updateStyles();
    }

    set borderWidth(value) {
      this._props.borderWidth = parseInt(value) || 2;
      if (this._frame) this._updateStyles();
    }

    set shadowIntensity(value) {
      this._props.shadowIntensity = value || "medium";
      if (this._frame) this._updateStyles();
    }

    set scaleEffect(value) {
      this._props.scaleEffect = !!value;
      if (this._frame) this._updateStyles();
    }

    set backgroundColor(value) {
      this._props.backgroundColor = value || "transparent";
      if (this._frame) this._updateStyles();
    }

    get borderColor() { return this._props.borderColor; }
    get borderWidth() { return this._props.borderWidth; }
    get shadowIntensity() { return this._props.shadowIntensity; }
    get scaleEffect() { return this._props.scaleEffect; }
    get backgroundColor() { return this._props.backgroundColor; }
  }

  if (!customElements.get("com-custom-hover-frame")) {
    customElements.define("com-custom-hover-frame", HoverFrame);
  }
})();
