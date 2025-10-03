class HoverFrame extends HTMLElement {
  constructor () {
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
    this._raf = false;
    this._onMouseMove = this._onMouseMove.bind(this);

    const sr = this.attachShadow({ mode: "open" });
    sr.innerHTML = `
      <style>
        :host { position: relative; display: block; width: 100%; height: 100%; box-sizing: border-box; pointer-events: none; }
        .frame { position: absolute; inset: 0; box-sizing: border-box; border-style: solid; border-width: var(--bw,4px); border-color: var(--bc,#B4BAC5); border-radius: var(--br,12px); pointer-events: none; transition: border-color 120ms ease, box-shadow 120ms ease; }
        .frame.hover { border-color: var(--hbc,#2F7ED8); box-shadow: 0 0 0 2px var(--hbc,#2F7ED8) inset; }
        .popover { position: absolute; left: 50%; transform: translate(-50%,-100%); padding: 6px 8px; border-radius: 8px; background: rgba(0,0,0,.75); color: #fff; font: 12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 120ms ease, transform 120ms ease; }
        .popover.show { opacity: 1; }
      </style>
      <div class="frame"></div>
      <div class="popover" aria-hidden="true"></div>
    `;
    this.$frame = sr.querySelector(".frame");
    this.$popover = sr.querySelector(".popover");
  }

  connectedCallback () {
    window.addEventListener("mousemove", this._onMouseMove, { passive: true });
    this._applyProps();
  }
  disconnectedCallback () {
    window.removeEventListener("mousemove", this._onMouseMove);
  }

  // SAC lifecycle hooks
  onCustomWidgetBeforeUpdate (changedProps) { Object.assign(this._props, changedProps); }
  onCustomWidgetAfterUpdate () { this._applyProps(); }
  onCustomWidgetResize (width, height) { /* no-op */ }

  _applyProps () {
    const p = this._props;
    this.$frame.style.setProperty("--bw", `${p.borderWidth}px`);
    this.$frame.style.setProperty("--br", `${p.cornerRadius}px`);
    this.$frame.style.setProperty("--bc", p.borderColor);
    this.$frame.style.setProperty("--hbc", p.hoverBorderColor);
    this.$frame.style.inset = `${p.inset}px`;
    this.$popover.textContent = p.popoverText || "";
    const off = Math.max(0, p.popoverOffset);
    this.$popover.style.top = `${(p.inset || 0) - off}px`;
  }

  _onMouseMove (e) {
    if (this._raf) return;
    this._raf = true;
    requestAnimationFrame(() => {
      this._raf = false;
      const rect = this.getBoundingClientRect();
      const inset = this._props.inset || 0;
      const x = e.clientX, y = e.clientY;
      const inside = x >= rect.left + inset && x <= rect.right - inset && y >= rect.top + inset && y <= rect.bottom - inset;
      if (inside !== this._hover) {
        this._hover = inside;
        this.$frame.classList.toggle("hover", this._hover);
        if (this._props.popoverText) this.$popover.classList.toggle("show", this._hover);
      }
    });
  }
}
customElements.define("hover-frame", HoverFrame);



