(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      :host { display:block; width:100%; height:100%; }
      .wrap{
        position: relative; width:100%; height:100%;
        background: rgba(255,255,255,0.75);
        backdrop-filter: blur(22px) saturate(180%);
        -webkit-backdrop-filter: blur(22px) saturate(180%);
        border-radius:18px; border:1px solid rgba(255,255,255,0.5);
        box-shadow: 0 0 28px rgba(255,255,255,0.3), inset 0 0 20px rgba(255,255,255,0.15), 0 8px 28px rgba(0,0,0,0.08);
        padding:24px; transition: all .4s cubic-bezier(.4,0,.2,1);
        display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;
      }
      .wrap:hover{ transform: translateY(-4px) scale(1.01); box-shadow: 0 0 35px rgba(255,255,255,0.35), inset 0 0 25px rgba(255,255,255,0.18), 0 12px 36px rgba(0,0,0,0.12); }
      .title{ margin-bottom:4px; }
      .subtitle{ margin-bottom:12px; opacity:.8; }
      .primary{ font-weight:700; letter-spacing:-.03em; text-shadow:0 2px 12px rgba(0,0,0,.08); }
      .secondary{ margin-top:6px; opacity:.85; }
      .unit{ margin-top:6px; opacity:.75; }
      .hover{ position:absolute; bottom:12px; right:16px; padding:4px 8px; border-radius:999px; background:rgba(0,0,0,0.08); font-size:12px; opacity:0; transform:translateY(6px); transition:opacity .2s, transform .2s; }
      .wrap:hover .hover{ opacity:1; transform:translateY(0); }
    </style>
    <div class="wrap">
      <div class="title" id="t"></div>
      <div class="subtitle" id="st"></div>
      <div class="primary" id="p">--</div>
      <div class="secondary" id="s" style="display:none">--</div>
      <div class="unit" id="u"></div>
      <div class="hover" id="h"></div>
    </div>
  `;

  // NEW tag to force SAC to rebuild property panel
  const TAG = "com-custom-lgn3-numeric";

  class LGN3 extends HTMLElement {
    constructor(){
      super();
      this.attachShadow({mode:"open"});
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {
        title:"", subtitle:"", unit:"",
        showTitle:false, showSubtitle:false, showSecondary:false,
        primaryFontSize:58, primaryColor:"#222",
        secondaryFontSize:18, secondaryColor:"#333",
        titleFontSize:16, titleColor:"#666",
        subtitleFontSize:12, subtitleColor:"#777",
        decimals:0, scale:"none", signStyle:"default", showScaleText:true, showCurrencyUnit:false
      };
    }

    onCustomWidgetBeforeUpdate(changed){ this._props = {...this._props, ...changed}; }

    onCustomWidgetAfterUpdate(changed){
      // text + visibility
      if ("title" in changed || "subtitle" in changed || "unit" in changed ||
          "showTitle" in changed || "showSubtitle" in changed){
        const t=this.shadowRoot.getElementById("t"), st=this.shadowRoot.getElementById("st"), u=this.shadowRoot.getElementById("u");
        t.textContent = this._props.title || ""; t.style.display = (this._props.showTitle && this._props.title) ? "" : "none";
        st.textContent = this._props.subtitle || ""; st.style.display = (this._props.showSubtitle && this._props.subtitle) ? "" : "none";
        u.textContent = this._props.unit || ""; u.style.display = this._props.unit ? "" : "none";
      }

      // fonts/colors
      if ("primaryFontSize" in changed || "primaryColor" in changed ||
          "secondaryFontSize" in changed || "secondaryColor" in changed ||
          "titleFontSize" in changed || "titleColor" in changed ||
          "subtitleFontSize" in changed || "subtitleColor" in changed){
        const st=this.shadowRoot;
        st.getElementById("p").style.cssText += `font-size:${this._props.primaryFontSize}px;color:${this._props.primaryColor};`;
        st.getElementById("s").style.cssText += `font-size:${this._props.secondaryFontSize}px;color:${this._props.secondaryColor};`;
        st.getElementById("t").style.cssText += `font-size:${this._props.titleFontSize}px;color:${this._props.titleColor};`;
        st.getElementById("st").style.cssText += `font-size:${this._props.subtitleFontSize}px;color:${this._props.subtitleColor};`;
      }

      // value updates
      if ("myDataBinding" in changed || "secondaryDataBinding" in changed ||
          "decimals" in changed || "scale" in changed || "signStyle" in changed ||
          "showScaleText" in changed || "showCurrencyUnit" in changed || "showSecondary" in changed){
        this._updatePrimary();
        this._updateSecondary();
      }
    }

    _first(binding){
      if(!binding || !binding.data || !binding.data.length) return null;
      const row = binding.data[0];
      const cell = row.measures_0 ?? row[Object.keys(row)[0]];
      if (cell == null) return null;
      if (typeof cell === "number" || typeof cell === "string") return cell;
      if (typeof cell === "object") return cell.formatted ?? cell.displayValue ?? cell.text ?? cell.value ?? cell.raw ?? null;
      return String(cell);
    }

    _updatePrimary(){
      const el=this.shadowRoot.getElementById("p"), hover=this.shadowRoot.getElementById("h");
      const raw=this._first(this._props.myDataBinding);
      const f=this._format(raw);
      el.textContent=f.compact; el.title=f.full; hover.textContent=f.full;
    }

    _updateSecondary(){
      const el=this.shadowRoot.getElementById("s");
      if(!this._props.showSecondary){ el.style.display="none"; return; }
      const raw=this._first(this._props.secondaryDataBinding);
      const f=this._format(raw);
      el.style.display=""; el.textContent=f.compact; el.title=f.full;
    }

    _format(v){
      if(v==null || v==="") return {compact:"--", full:""};
      if(typeof v==="string" && isNaN(Number(v.replace(/[^0-9.-]/g,"")))) return {compact:v, full:v}; // SAC formatted
      const n = Number(v); if(!isFinite(n)) return {compact:String(v), full:String(v)};

      let divisor=1, suffix="";
      if(this._props.scale==="k"){divisor=1e3; suffix="k";}
      if(this._props.scale==="m"){divisor=1e6; suffix="m";}
      if(this._props.scale==="b"){divisor=1e9; suffix="bn";}
      const dp = Math.max(0, Math.min(6, Number(this._props.decimals)||0));
      const nf = new Intl.NumberFormat(undefined,{minimumFractionDigits:dp, maximumFractionDigits:dp});
      const full = nf.format(n);
      let compact = nf.format((n<0?-1:1)*Math.abs(n)/divisor);
      if(this._props.showScaleText && suffix) compact += suffix;
      if(this._props.showCurrencyUnit && this._props.unit) compact += ` ${this._props.unit}`;
      if(this._props.signStyle==="plusminus" && n>0) compact = "+"+compact;
      if(this._props.signStyle==="brackets" && n<0) compact = "("+compact.replace("-","")+")";
      return {compact, full};
    }
  }

  if(!customElements.get(TAG)) customElements.define(TAG, LGN3);
})();
