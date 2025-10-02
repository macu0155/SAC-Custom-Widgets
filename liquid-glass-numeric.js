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
      }
      .liquid-glass-container:hover{
        transform: translateY(-4px) scale(1.01);
        box-shadow: 0 0 35px rgba(255,255,255,0.35),
                    inset 0 0 25px rgba(255,255,255,0.18),
                    0 12px 36px rgba(0,0,0,0.12);
      }
      .title{ font-size:16px; color:#666; margin-bottom:8px; font-weight:600; }
      .value{ font-size:58px; font-weight:700; color:#222; letter-spacing:-.03em; text-shadow:0 2px 12px rgba(0,0,0,.08); }
      .unit{ font-size:14px; color:#999; margin-top:4px; }

      /* Hover badge for full value */
      .hover-badge {
        position: absolute;
        bottom: 12px;
        right: 16px;
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(0,0,0,0.08);
        font-size: 12px;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity .2s ease, transform .2s ease;
      }
      .liquid-glass-container:hover .hover-badge {
        opacity: 1;
        transform: translateY(0);
      }
    </style>

    <div class="liquid-glass-container">
      <div class="title" id="titleText">Metric</div>
      <div class="value" id="valueText">--</div>
      <div class="unit" id="unitText"></div>
      <div class="hover-badge" id="hoverBadge"></div>
    </div>
  `;

  class LiquidGlassNumeric extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {};
    }

    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = { ...this._props, ...changedProperties };
    }

    onCustomWidgetAfterUpdate(changedProperties) {
      if ("title" in changedProperties) {
        this.shadowRoot.getElementById("titleText").innerText = changedProperties.title ?? "Metric";
      }
      if ("unit" in changedProperties) {
        this.shadowRoot.getElementById("unitText").innerText = changedProperties.unit ?? "";
      }
      if ("myDataBinding" in changedProperties) {
        this._updateFromData(changedProperties.myDataBinding);
      }
    }

    _updateFromData(binding) {
      const valEl = this.shadowRoot.getElementById("valueText");
      const badge = this.shadowRoot.getElementById("hoverBadge");

      if (!binding || !binding.data || binding.data.length === 0) {
        valEl.innerText = "--";
        if (badge) badge.innerText = "";
        valEl.title = "";
        return;
      }

      const row = binding.data[0];

      // Prefer standard measure key, else first numeric-looking field, else first field.
      let rawCell = row.measures_0;
      if (rawCell == null) {
        const keys = Object.keys(row);
        rawCell = keys.map(k => row[k]).find(v => {
          const r = this._extractCell(v);
          return r != null && isFinite(Number(r));
        }) ?? row[keys[0]];
      }

      const extracted = this._extractCell(rawCell);         // unwrap {raw, formatted} etc.
      valEl.innerText = this._formatValue(extracted);       // compact k/m
      const full = this._formatFull(extracted);             // full number for tooltip/badge
      if (badge) badge.innerText = full;
      valEl.title = full;
    }

    _extractCell(cell) {
      if (cell == null) return null;
      if (typeof cell === "number" || typeof cell === "string") return cell;
      if (typeof cell === "object") {
        // Try display-first, then raw numeric fallbacks
        return cell.formatted ?? cell.label ?? cell.text ?? cell.displayValue ?? cell.value ?? cell.raw ?? null;
      }
      return String(cell);
    }

    _formatValue(v) {
      if (v == null) return "--";
      const n = Number(v);
      if (!isFinite(n)) return String(v);
      if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "m";
      if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "k";
      return n.toFixed(0);
    }

    _formatFull(v) {
      if (v == null) return "";
      const n = Number(v);
      return isFinite(n) ? n.toLocaleString() : String(v);
    }
  }

  // Guard: only define once in the page
  const TAG = "com-custom-liquid-glass-numeric";
  if (!customElements.get(TAG)) {
    customElements.define(TAG, LiquidGlassNumeric);
  }
})();
