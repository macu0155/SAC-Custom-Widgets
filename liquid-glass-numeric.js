(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host { display:block; width:100%; height:100%; }
      .liquid-glass-container{
        position: relative;
        width:100%; height:100%;
        background: rgba(255,255,255,0.75);
        backdrop-filter: blur(22px) saturate(180%);
        -webkit-backdrop-filter: blur(22px) saturate(180%);
        border-radius:18px;
        border:1px solid rgba(255,255,255,0.5);
        box-shadow: 0 0 28px rgba(255,255,255,0.3),
                    inset 0 0 20px rgba(255,255,255,0.15),
                    0 8px 28px rgba(0,0,0,0.08);
        padding:24px;
        transition: all .4s cubic-bezier(.4,0,.2,1);
        display:flex; flex-direction:column; justify-content:center; align-items:center;
        text-align:center;
      }
      .liquid-glass-container:hover{
        transform: translateY(-4px) scale(1.01);
        box-shadow: 0 0 35px rgba(255,255,255,0.35),
                    inset 0 0 25px rgba(255,255,255,0.18),
                    0 12px 36px rgba(0,0,0,0.12);
      }

      .title   { margin-bottom:4px; font-size:16px; color:#666; }
      .subtitle{ margin-bottom:12px; opacity:.8; font-size:12px; color:#777; }

      .value-primary   { font-weight:700; letter-spacing:-.03em; text-shadow:0 2px 12px rgba(0,0,0,.08); }
      .value-secondary { margin-top:6px; opacity:.85; font-size:18px; color:#333; }

      .unit { margin-top:6px; opacity:.75; }
      .hover-badge { position:absolute; bottom:12px; right:16px; padding:4px 8px; border-radius:999px;
                     background:rgba(0,0,0,0.08); font-size:12px; opacity:0; transform:translateY(6px);
                     transition:opacity .2s ease, transform .2s ease; }
      .liquid-glass-container:hover .hover-badge { opacity:1; transform:translateY(0); }
    </style>

    <div class="liquid-glass-container">
      <div class="title" id="titleText"></div>
      <div class="subtitle" id="subtitleText"></div>
      <div class="value-primary" id="valuePrimary">--</div>
      <div class="value-secondary" id="valueSecondary" style="display:none">--</div>
      <div class="unit" id="unitText"></div>
      <div class="hover-badge" id="hoverBadge"></div>
    </div>
  `;

  // Tag currently installed in your tenant
  const TAG = "com-custom-lgn2-numeric";

  class LiquidGlassNumeric2 extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {
        title: "", subtitle: "", unit: "",
        showTitle: false, showSubtitle: false, showSecondary: false,
        // new formatting knobs
        decimals: 0,            // 0..6
        scale: "none",          // "none" | "k" | "m" | "b"
        signStyle: "default",   // "default" | "plusminus" | "brackets"
        showScaleText: true,
        showCurrencyUnit: false
      };
    }

    onCustomWidgetBeforeUpdate(changed) { this._props = { ...this._props, ...changed }; }

    onCustomWidgetAfterUpdate(changed) {
      if ("title" in changed || "subtitle" in changed || "unit" in changed ||
          "showTitle" in changed || "showSubtitle" in changed) {
        const t = this.shadowRoot.getElementById("titleText");
        const s = this.shadowRoot.getElementById("subtitleText");
        const u = this.shadowRoot.getElementById("unitText");
        t.textContent = this._props.title || "";
        s.textContent = this._props.subtitle || "";
        u.textContent = this._props.unit || "";
        t.style.display = (this._props.showTitle && this._props.title) ? "" : "none";
        s.style.display = (this._props.showSubtitle && this._props.subtitle) ? "" : "none";
        u.style.display = this._props.unit ? "" : "none";
      }

      if ("myDataBinding" in changed || "secondaryDataBinding" in changed ||
          "showSecondary" in changed ||
          "decimals" in changed || "scale" in changed || "signStyle" in changed ||
          "showScaleText" in changed || "showCurrencyUnit" in changed) {
        this._updatePrimary();
        this._updateSecondary();
      }
    }

    _firstCell(binding) {
      if (!binding || !binding.data || !binding.data.length) return null;
      const row = binding.data[0];
      const cell = row.measures_0 ?? row[Object.keys(row)[0]];
      if (cell == null) return null;
      if (typeof cell === "number" || typeof cell === "string") return cell;
      if (typeof cell === "object") {
        // Prefer formatted display if SAC provided one
        return cell.formatted ?? cell.displayValue ?? cell.text ?? cell.value ?? cell.raw ?? null;
      }
      return String(cell);
    }

    _updatePrimary() {
      const el = this.shadowRoot.getElementById("valuePrimary");
      const badge = this.shadowRoot.getElementById("hoverBadge");
      const raw = this._firstCell(this._props.myDataBinding);
      const out = this._formatWithProps(raw);
      el.textContent = out.compact;
      el.title = out.full;
      badge.textContent = out.full;
    }

    _updateSecondary() {
      const el = this.shadowRoot.getElementById("valueSecondary");
      if (!this._props.showSecondary) { el.style.display = "none"; return; }
      const raw = this._firstCell(this._props.secondaryDataBinding);
      const out = this._formatWithProps(raw);
      el.style.display = "";
      el.textContent = out.compact;
      el.title = out.full;
    }

    _formatWithProps(v) {
      if (v == null || v === "") return { compact: "--", full: "" };

      // If SAC already gave a formatted string, use it directly.
      if (typeof v === "string" && isNaN(Number(v.replace(/[^0-9.-]/g, "")))) {
        return { compact: v, full: v };
      }

      const n = Number(v);
      if (!isFinite(n)) return { compact: String(v), full: String(v) };

      let divisor = 1, suffix = "";
      if (this._props.scale === "k") { divisor = 1e3;  suffix = "k"; }
      if (this._props.scale === "m") { divisor = 1e6;  suffix = "m"; }
      if (this._props.scale === "b") { divisor = 1e9;  suffix = "bn"; }

      const dp = Math.max(0, Math.min(6, Number(this._props.decimals) || 0));
      const nf = new Intl.NumberFormat(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });

      const full = nf.format(n);
      let compact = nf.format((n < 0 ? -1 : 1) * (Math.abs(n) / divisor));
      if (this._props.showScaleText && suffix) compact += suffix;
      if (this._props.showCurrencyUnit && this._props.unit) compact += ` ${this._props.unit}`;
      if (this._props.signStyle === "plusminus" && n > 0) compact = "+" + compact;
      if (this._props.signStyle === "brackets" && n < 0) compact = "(" + compact.replace("-", "") + ")";

      return { compact, full };
    }
  }

  if (!customElements.get(TAG)) customElements.define(TAG, LiquidGlassNumeric2);
})();
