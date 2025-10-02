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

      .title   { margin-bottom:4px;  }
      .subtitle{ margin-bottom:12px; opacity:.8; }

      .value-primary   { font-weight:700; letter-spacing:-.03em; text-shadow:0 2px 12px rgba(0,0,0,.08); }
      .value-secondary { margin-top:6px; opacity:.85; }

      .unit { margin-top:6px; opacity:.75; }

      /* Defaults; overridden by properties at runtime */
      .title         { font-size:16px; color:#666; }
      .subtitle      { font-size:12px; color:#777; }
      .value-primary { font-size:58px; color:#222; }
      .value-secondary{font-size:18px; color:#333; }

      .hover-badge {
        position: absolute; bottom: 12px; right: 16px;
        padding: 4px 8px; border-radius: 999px;
        background: rgba(0,0,0,0.08); font-size: 12px;
        opacity: 0; transform: translateY(6px);
        transition: opacity .2s ease, transform .2s ease;
      }
      .liquid-glass-container:hover .hover-badge { opacity: 1; transform: translateY(0); }
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

  const TAG = "com-custom-liquid-glass-numeric";

  class LiquidGlassNumeric extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {
        // text
        title: "",                // default empty -> hidden
        subtitle: "",
        unit: "",
        showTitle: false,         // hide by default
        showSubtitle: false,
        // fonts
        titleFontSize: 16, titleColor: "#666",
        subtitleFontSize: 12, subtitleColor: "#777",
        primaryFontSize: 58, primaryColor: "#222",
        secondaryFontSize: 18, secondaryColor: "#333",
        // number format
        scale: "none",        // none|k|m|b
        decimals: 0,
        signStyle: "default", // default|plusminus|brackets
        showScaleText: true,
        showCurrencyUnit: false,
        // visibility
        showSecondary: false
      };
    }

    onCustomWidgetBeforeUpdate(changed) { this._props = { ...this._props, ...changed }; }

    onCustomWidgetAfterUpdate(changed) {
      if ("title" in changed || "subtitle" in changed || "unit" in changed ||
          "showTitle" in changed || "showSubtitle" in changed) {
        const t = this.shadowRoot.getElementById("titleText");
        const s = this.shadowRoot.getElementById("subtitleText");
        const u = this.shadowRoot.getElementById("unitText");

        t.innerText = this._props.title || "";
        s.innerText = this._props.subtitle || "";
        u.innerText = this._props.unit || "";

        t.style.display = (this._props.showTitle && this._props.title) ? "" : "none";
        s.style.display = (this._props.showSubtitle && this._props.subtitle) ? "" : "none";
        u.style.display = this._props.unit ? "" : "none";
      }

      if (
        "titleFontSize" in changed || "titleColor" in changed ||
        "subtitleFontSize" in changed || "subtitleColor" in changed ||
        "primaryFontSize" in changed || "primaryColor" in changed ||
        "secondaryFontSize" in changed || "secondaryColor" in changed
      ) {
        const st = this.shadowRoot;
        st.getElementById("titleText").style.cssText += `font-size:${this._props.titleFontSize}px; color:${this._props.titleColor};`;
        st.getElementById("subtitleText").style.cssText += `font-size:${this._props.subtitleFontSize}px; color:${this._props.subtitleColor};`;
        st.getElementById("valuePrimary").style.cssText += `font-size:${this._props.primaryFontSize}px; color:${this._props.primaryColor};`;
        st.getElementById("valueSecondary").style.cssText += `font-size:${this._props.secondaryFontSize}px; color:${this._props.secondaryColor};`;
      }

      if ("myDataBinding" in changed || "secondaryDataBinding" in changed ||
          "scale" in changed || "decimals" in changed || "signStyle" in changed ||
          "showScaleText" in changed || "showCurrencyUnit" in changed || "showSecondary" in changed) {
        this._updatePrimary();
        this._updateSecondary();
      }
    }

    _updatePrimary() {
      const el = this.shadowRoot.getElementById("valuePrimary");
      const badge = this.shadowRoot.getElementById("hoverBadge");
      const binding = this._props.myDataBinding;

      const raw = this._firstCell(binding);
      const formatted = this._formatNumber(raw);
      el.innerText = formatted.compact;
      el.title = formatted.full;
      badge.innerText = formatted.full;
    }

    _updateSecondary() {
      const el = this.shadowRoot.getElementById("valueSecondary");
      if (!this._props.showSecondary) { el.style.display = "none"; return; }

      const binding = this._props.secondaryDataBinding;
      const raw = this._firstCell(binding);
      const formatted = this._formatNumber(raw);
      el.style.display = "";
      el.innerText = formatted.compact;
      el.title = formatted.full;
    }

    _firstCell(binding) {
      if (!binding || !binding.data || !binding.data.length) return null;
      const row = binding.data[0];
      let cell = row.measures_0 ?? row[Object.keys(row)[0]];
      return this._extractCell(cell);
    }

    _extractCell(cell) {
      if (cell == null) return null;
      if (typeof cell === "number" || typeof cell === "string") return cell;
      if (typeof cell === "object") {
        return cell.formatted ?? cell.label ?? cell.text ?? cell.displayValue ?? cell.value ?? cell.raw ?? null;
      }
      return String(cell);
    }

    _formatNumber(v) {
      if (v == null || v === "") return { compact: "--", full: "" };

      let n = Number(v);
      if (!isFinite(n)) return { compact: String(v), full: String(v) };

      // sign handling
      const sign = n < 0 ? -1 : 1;
      const abs = Math.abs(n);

      // scale handling
      let divisor = 1, suffix = "";
      const scale = this._props.scale; // none|k|m|b
      if (scale === "k") { divisor = 1_000;      suffix = "k"; }
      if (scale === "m") { divisor = 1_000_000;  suffix = "m"; }
      if (scale === "b") { divisor = 1_000_000_000; suffix = "bn"; }

      const base = abs / divisor;
      const dp = Math.max(0, Math.min(6, Number(this._props.decimals) || 0));

      const full = new Intl.NumberFormat(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(n);
      let compact = new Intl.NumberFormat(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(sign * base);
      if (this._props.showScaleText && suffix) compact += suffix;

      if (this._props.showCurrencyUnit && this._props.unit) {
        compact += ` ${this._props.unit}`;
      }

      if (this._props.signStyle === "plusminus" && n > 0) compact = "+" + compact;
      if (this._props.signStyle === "brackets" && n < 0) compact = "(" + compact.replace("-", "") + ")";

      return { compact, full };
    }
  }

  if (!customElements.get(TAG)) customElements.define(TAG, LiquidGlassNumeric);
})();
