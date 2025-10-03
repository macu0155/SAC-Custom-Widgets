(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host { display:block; width:100%; height:100%; }
      .liquid-glass-container{
        position: relative; width:100%; height:100%;
        background: rgba(255,255,255,0.75);
        backdrop-filter: blur(22px) saturate(180%);
        -webkit-backdrop-filter: blur(22px) saturate(180%);
        border-radius:18px; border:1px solid rgba(255,255,255,0.5);
        box-shadow: 0 0 28px rgba(255,255,255,0.3), inset 0 0 20px rgba(255,255,255,0.15), 0 8px 28px rgba(0,0,0,0.08);
        padding:24px; transition: all .4s cubic-bezier(.4,0,.2,1);
        display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;
      }
      .liquid-glass-container:hover{ transform: translateY(-4px) scale(1.01); box-shadow: 0 0 35px rgba(255,255,255,0.35), inset 0 0 25px rgba(255,255,255,0.18), 0 12px 36px rgba(0,0,0,0.12); }

      .title{ margin-bottom:4px; font-size:16px; color:#666; }
      .subtitle{ margin-bottom:12px; opacity:.8; font-size:12px; color:#777; }
      .value-primary{ font-weight:700; letter-spacing:-.03em; text-shadow:0 2px 12px rgba(0,0,0,.08); font-size:58px; color:#222; }
      .value-secondary{ margin-top:6px; opacity:.85; font-size:18px; color:#333; }
      .unit{ margin-top:6px; opacity:.75; }

      .hover-badge{ position:absolute; bottom:12px; right:16px; padding:4px 8px; border-radius:999px; background:rgba(0,0,0,0.08); font-size:12px; opacity:0; transform:translateY(6px); transition:opacity .2s, transform .2s; }
      .liquid-glass-container:hover .hover-badge{ opacity:1; transform:translateY(0); }

      /* settings button: bottom-left, high z-index */
      .gear{ position:absolute; left:12px; bottom:12px; z-index:9999;
             min-width:34px; height:28px; padding:0 8px; border-radius:18px;
             background:rgba(0,0,0,.08); display:flex; align-items:center; gap:6px;
             justify-content:center; cursor:pointer; user-select:none; }
      .gear:before{ content:"⚙"; font-size:14px; opacity:.85; }
      .gear span{ font-size:12px; color:#222; opacity:.85; }

      /* settings panel */
      .panel{ position:absolute; bottom:52px; left:12px; width:240px; background:#fff;
              border:1px solid rgba(0,0,0,.12); border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,.16);
              padding:10px; display:none; z-index:10000; }
      .panel h4{ margin:6px 0 8px 0; font-size:13px; color:#333; }
      .row{ display:flex; align-items:center; justify-content:space-between; margin:6px 0; font-size:12px; }
      .row select, .row input[type="number"], .row input[type="checkbox"]{ font-size:12px; }
      .panel .close{ position:absolute; top:6px; right:8px; cursor:pointer; font-size:14px; opacity:.6; }
      .panel .close:hover{ opacity:1; }
      .hint{ font-size:11px; color:#666; margin-top:6px; }
    </style>

    <div class="liquid-glass-container">
      <div class="gear" id="gear"><span>Settings</span></div>
      <div class="panel" id="panel">
        <div class="close" id="x">✕</div>
        <h4>Format</h4>
        <div class="row"><label>Decimals</label><input id="dec" type="number" min="0" max="6" value="0" style="width:56px"></div>
        <div class="row"><label>Scale</label>
          <select id="scale">
            <option value="none">none</option>
            <option value="k">k</option>
            <option value="m">m</option>
            <option value="b">b</option>
          </select>
        </div>
        <div class="row"><label>Sign</label>
          <select id="sign">
            <option value="default">default</option>
            <option value="plusminus">plusminus</option>
            <option value="brackets">brackets</option>
          </select>
        </div>
        <div class="row"><label><input id="scaleTxt" type="checkbox" checked> show scale text</label></div>
        <div class="row"><label><input id="unitTxt" type="checkbox"> show unit after value</label></div>
        <div class="hint">Tip: double-click the widget to open/close.</div>
      </div>

      <div class="title" id="titleText"></div>
      <div class="subtitle" id="subtitleText"></div>
      <div class="value-primary" id="valuePrimary">--</div>
      <div class="value-secondary" id="valueSecondary" style="display:none">--</div>
      <div class="unit" id="unitText"></div>
      <div class="hover-badge" id="hoverBadge"></div>
    </div>
  `;

  const TAG = "com-custom-lgn2-numeric";

  function uid(el){ return el.getAttribute("id") || (el._lgnKey ||= "lgn-"+Math.random().toString(36).slice(2)); }

  class LiquidGlassNumeric2 extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      
      // Initialize properties
      this._props = { 
        title:"", 
        subtitle:"", 
        unit:"", 
        showTitle:false, 
        showSubtitle:false, 
        showSecondary:false 
      };
      
      this._fmt = { 
        decimals:0, 
        scale:"none", 
        signStyle:"default", 
        showScaleText:true, 
        showCurrencyUnit:false 
      };

      const p = this.shadowRoot.getElementById("panel");
      const toggle = () => p.style.display = (p.style.display === "block" ? "none" : "block");
      this.shadowRoot.getElementById("gear").onclick = toggle;
      this.shadowRoot.getElementById("x").onclick = () => p.style.display = "none";
      this.shadowRoot.querySelector(".liquid-glass-container").ondblclick = toggle;

      const dec = this.shadowRoot.getElementById("dec");
      const sc  = this.shadowRoot.getElementById("scale");
      const sg  = this.shadowRoot.getElementById("sign");
      const st  = this.shadowRoot.getElementById("scaleTxt");
      const cu  = this.shadowRoot.getElementById("unitTxt");
      const apply = () => { 
        this._saveFmt(); 
        this._updatePrimary(); 
        this._updateSecondary(); 
      };
      dec.oninput = sc.onchange = sg.onchange = st.onchange = cu.onchange = apply;
    }

    connectedCallback(){ 
      this._loadFmt(); 
      this._syncPanel(); 
      this._updateDisplay();
    }

    // Property getters and setters for SAC
    get title() { return this._props.title; }
    set title(value) { 
      this._props.title = value;
      this._updateDisplay();
    }

    get subtitle() { return this._props.subtitle; }
    set subtitle(value) { 
      this._props.subtitle = value;
      this._updateDisplay();
    }

    get unit() { return this._props.unit; }
    set unit(value) { 
      this._props.unit = value;
      this._updateDisplay();
      this._updatePrimary();
      this._updateSecondary();
    }

    get showTitle() { return this._props.showTitle; }
    set showTitle(value) { 
      this._props.showTitle = value;
      this._updateDisplay();
    }

    get showSubtitle() { return this._props.showSubtitle; }
    set showSubtitle(value) { 
      this._props.showSubtitle = value;
      this._updateDisplay();
    }

    get showSecondary() { return this._props.showSecondary; }
    set showSecondary(value) { 
      this._props.showSecondary = value;
      this._updateDisplay();
      this._updateSecondary();
    }

    _updateDisplay() {
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

    _storageKey(){ return "lgn2:"+uid(this); }
    _saveFmt(){ localStorage.setItem(this._storageKey(), JSON.stringify(this._fmtFromPanel())); }
    _loadFmt(){ try{ const raw = localStorage.getItem(this._storageKey()); if(raw){ this._fmt = JSON.parse(raw); } }catch(e){} }
    
    _fmtFromPanel(){
      const dec = parseInt(this.shadowRoot.getElementById("dec").value || "0", 10);
      const sc  = this.shadowRoot.getElementById("scale").value;
      const sg  = this.shadowRoot.getElementById("sign").value;
      const st  = this.shadowRoot.getElementById("scaleTxt").checked;
      const cu  = this.shadowRoot.getElementById("unitTxt").checked;
      this._fmt = { decimals: Math.max(0, Math.min(6, dec)), scale: sc, signStyle: sg, showScaleText: st, showCurrencyUnit: cu };
      return this._fmt;
    }
    
    _syncPanel(){
      this.shadowRoot.getElementById("dec").value = this._fmt.decimals;
      this.shadowRoot.getElementById("scale").value = this._fmt.scale;
      this.shadowRoot.getElementById("sign").value = this._fmt.signStyle;
      this.shadowRoot.getElementById("scaleTxt").checked = !!this._fmt.showScaleText;
      this.shadowRoot.getElementById("unitTxt").checked = !!this._fmt.showCurrencyUnit;
    }

    // SAC data binding lifecycle methods
    onCustomWidgetBeforeUpdate(changed) { 
      this._props = { ...this._props, ...changed }; 
    }
    
    onCustomWidgetAfterUpdate(changed) {
      if ("title" in changed || "subtitle" in changed || "unit" in changed ||
          "showTitle" in changed || "showSubtitle" in changed) {
        this._updateDisplay();
      }
      if ("myDataBinding" in changed || "secondaryDataBinding" in changed || "showSecondary" in changed) {
        this._updatePrimary(); 
        this._updateSecondary();
      }
      if ("unit" in changed) { 
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
      if (typeof cell === "object") return cell.formatted ?? cell.displayValue ?? cell.text ?? cell.value ?? cell.raw ?? null;
      return String(cell);
    }

    _updatePrimary() {
      const el = this.shadowRoot.getElementById("valuePrimary");
      const badge = this.shadowRoot.getElementById("hoverBadge");
      const raw = this._firstCell(this._props.myDataBinding);
      const out = this._format(raw);
      el.textContent = out.compact; 
      el.title = out.full; 
      badge.textContent = out.full;
    }

    _updateSecondary() {
      const el = this.shadowRoot.getElementById("valueSecondary");
      if (!this._props.showSecondary) { 
        el.style.display = "none"; 
        return; 
      }
      const raw = this._firstCell(this._props.secondaryDataBinding);
      const out = this._format(raw);
      el.style.display = ""; 
      el.textContent = out.compact; 
      el.title = out.full;
    }

    _format(v) {
      if (v == null || v === "") return { compact:"--", full:"" };
      if (typeof v === "string" && isNaN(Number(v.replace(/[^0-9.-]/g,"")))) return { compact:v, full:v };
      const n = Number(v); 
      if (!isFinite(n)) return { compact:String(v), full:String(v) };

      let divisor=1, suffix="";
      if (this._fmt.scale==="k"){ divisor=1e3; suffix="k"; }
      if (this._fmt.scale==="m"){ divisor=1e6; suffix="m"; }
      if (this._fmt.scale==="b"){ divisor=1e9; suffix="bn"; }

      const dp = Math.max(0, Math.min(6, Number(this._fmt.decimals)||0));
      const nf = new Intl.NumberFormat(undefined,{ minimumFractionDigits:dp, maximumFractionDigits:dp });

      const full = nf.format(n);
      let compact = nf.format((n<0?-1:1) * (Math.abs(n)/divisor));
      if (this._fmt.showScaleText && suffix) compact += suffix;
      if (this._fmt.showCurrencyUnit && this._props.unit) compact += ` ${this._props.unit}`;
      if (this._fmt.signStyle==="plusminus" && n>0) compact = "+"+compact;
      if (this._fmt.signStyle==="brackets" && n<0) compact = "("+compact.replace("-","")+")";
      return { compact, full };
    }
  }

  if (!customElements.get(TAG)) customElements.define(TAG, LiquidGlassNumeric2);
})();
