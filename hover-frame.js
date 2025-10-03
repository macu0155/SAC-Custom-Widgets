class HoverFrame extends HTMLElement {
  static get observedAttributes() {
    return ["bordercolor","hoverbordercolor","borderwidth","cornerradius","inset","popovertext","popoveroffset"];
  }

  constructor() {
    super();
    this._props = {
      borderColor: "#B4BAC5",
      hoverBorderColor: "#2F7ED8",
      borderWidth: 4,
      cornerRadius: 12,
      inset: 0,
      popoverText: "",
      popoverOffset: 8
    };

    this._hover = false;
    this._rafScheduled = false;
    this._onMouseMove = this._onMouseMove.bind(this);

    const sr = this.attachShadow({ mode: "open" });
    sr.innerHTML = `
      <style>
        :host {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          /* never block the chart; all hit-testing is global */
          pointer-events: none;
        }
        .frame {
          position: absolute;
          inset: 0;
          box-sizing: border-box;
          border-style: solid;
          border-width: var(--bw, 4px);
          border-color: var(--bc, #B4BAC5);
          border-radius: var(--br, 12px);
          /* we still don't capture events */
          pointer-events: none;
          transition: border-color 120ms ease-in-out, box-shadow 120ms ease-in-out;
        }
        .frame.hover {
          border-color: var(--hbc, #2F7ED8);
          box-shadow: 0 0 0 2px var(--hbc, #2F7ED8) inset;
        }
        .popover {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translate(-50%, -100%);
          padding: 6px 8px;
          border-radius: 8px;
          background: rgba(0,0,0,0.75);
          color: #fff;
          font: 12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 120ms ease-in-out, transform 120ms ease-in-out;
        }
        .popover.show {
          opacity: 1;
        }
      </style>
      <div class="frame"></div>
      <div class="popover" aria-hidden="true"></div>
    `;

    this.$frame = sr.querySelector(".frame");
    this.$popover = sr.querySelector(".popover");
  }

  connectedCallback() {
    window.addEventListener("mousemove", this._onMouseMove, { passive: true });
    this._applyProps();
  }

  disconnectedCallback() {
    window.removeEventListener("mousemove", this._onMouseMove);
  }

  attributeChangedCallback(name, _old, value) {
    switch (name) {
      case "bordercolor": this._props.borderColor = value || this._props.borderColor; break;
      case "hoverbordercolor": this._props.hoverBorderColor = value || this._props.hoverBorderColor; break;
      case "borderwidth": this._props.borderWidth = this._toNumber(value, this._props.borderWidth); break;
      case "cornerradius": this._props.cornerRadius = this._toNumber(value, this._props.cornerRadius); break;
      case "inset": this._props.inset = this._toNumber(value, this._props.inset); break;
      case "popovertext": this._props.popoverText = value ?? ""; break;
      case "popoveroffset": this._props.popoverOffset = this._toNumber(value, this._props.popoverOffset); break;
    }
    this._applyProps();
  }

  // SAC builder maps properties via setProperty
  setProperty(name, value) {
    const map = {
      borderColor: "bordercolor",
      hoverBorderColor: "hoverbordercolor",
      borderWidth: "borderwidth",
      cornerRadius: "cornerradius",
      inset: "inset",
      popoverText: "popovertext",
      popoverOffset: "popoveroffset"
    };
    const attr = map[name] || name;
    this.setAttribute(attr, value);
  }

  _applyProps() {
    const p = this._props;
    // visual vars
    this.$frame.style.setProperty("--bw", `${p.borderWidth}px`);
    this.$frame.style.setProperty("--br", `${p.cornerRadius}px`);
    this.$frame.style.setProperty("--bc", p.borderColor);
    this.$frame.style.setProperty("--hbc", p.hoverBorderColor);

    // inset the frame if requested
    this.$frame.style.inset = `${p.inset}px`;

    // popover content and baseline position
    this.$popover.textContent = p.popoverText || "";
    const off = Math.max(0, p.popoverOffset);
    this.$popover.style.top = `${p.inset - off}px`;
  }

  _toNumber(v, d) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  }

  _onMouseMove(e) {
    if (this._rafScheduled) return;
    this._rafScheduled = true;
    requestAnimationFrame(() => {
      this._rafScheduled = false;

      const rect = this.getBoundingClientRect();
      // include inset in the hitbox
      const inset = this._props.inset || 0;
      const x = e.clientX;
      const y = e.clientY;
      const inside =
        x >= rect.left + inset &&
        x <= rect.right - inset &&
        y >= rect.top + inset &&
        y <= rect.bottom - inset;

      if (inside !== this._hover) {
        this._hover = inside;
        this.$frame.classList.toggle("hover", this._hover);

        if (this._props.popoverText && this._props.popoverText.length) {
          if (this._hover) {
            this.$popover.classList.add("show");
          } else {
            this.$popover.classList.remove("show");
          }
        }
      }
    });
  }
}

customElements.define("hover-frame", HoverFrame);

// SAC widget glue (optional; SAC calls these if present)
(function () {
  if (!window.sap || !window.sap.bi || !window.sap.bi.wt) return;
  // Nothing needed for data binding; this is a style-only widget.
})();
