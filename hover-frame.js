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
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        box-sizing: border-box;
      }
      .hover-frame.scale:hover {
        transform: scale(1.02);
        z-index: 100;
      }
      .hover-frame.shadow-none:hover {
        box-shadow: none;
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
      
      // Set background
      frame.style.backgroundColor = this._props.backgroundColor;
      
      // Set border on hover via CSS variable
      frame.style.setProperty('--border-color', this._props.borderColor);
      frame.style.setProperty('--border-width', this._props.borderWidth + 'px');
      frame.style.border = '0 solid transparent';
      
      // Add hover border style
      const style = this.shadowRoot.querySelector('style');
      if (!style.textContent.includes('.hover-frame:hover {')) {
        style.textContent += `
          .hover-frame:hover {
            border: var(--border-width) solid var(--border-color);
          }
        `;
      }
      
      // Apply shadow class
      frame.classList.remove('shadow-none', 'shadow-light', 'shadow-medium', 'shadow-strong');
      frame.classList.add('shadow-' + this._props.shadowIntensity);
      
      // Apply scale class
      if (this._props.scaleEffect) {
        frame.classList.add('scale');
      } else {
        frame.classList.remove('scale');
      }
    }

    // Property setters
    set borderColor(value) {
      this._props.borderColor = value || "#0070f3";
      this._updateStyles();
    }

    set borderWidth(value) {
      this._props.borderWidth = parseInt(value) || 2;
      this._updateStyles();
    }

    set shadowIntensity(value) {
      this._props.shadowIntensity = value || "medium";
      this._updateStyles();
    }

    set scaleEffect(value) {
      this._props.scaleEffect = !!value;
      this._updateStyles();
    }

    set backgroundColor(value) {
      this._props.backgroundColor = value || "transparent";
      this._updateStyles();
    }

    // Property getters
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