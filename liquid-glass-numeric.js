(function() {
    let template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            
            .liquid-glass-container {
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.75);
                backdrop-filter: blur(22px) saturate(180%);
                -webkit-backdrop-filter: blur(22px) saturate(180%);
                border-radius: 18px;
                border: 1px solid rgba(255, 255, 255, 0.5);
                box-shadow: 
                    0 0 28px rgba(255, 255, 255, 0.3),
                    inset 0 0 20px rgba(255, 255, 255, 0.15),
                    0 8px 28px rgba(0, 0, 0, 0.08);
                padding: 24px;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            
            .liquid-glass-container:hover {
                transform: translateY(-4px) scale(1.01);
                box-shadow: 
                    0 0 35px rgba(255, 255, 255, 0.35),
                    inset 0 0 25px rgba(255, 255, 255, 0.18),
                    0 12px 36px rgba(0, 0, 0, 0.12);
            }
            
            .title {
                font-size: 16px;
                color: #666;
                margin-bottom: 8px;
                font-weight: 600;
            }
            
            .value {
                font-size: 58px;
                font-weight: 700;
                color: #222;
                letter-spacing: -0.03em;
                text-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
            }
            
            .unit {
                font-size: 14px;
                color: #999;
                margin-top: 4px;
            }
        </style>
        
        <div class="liquid-glass-container">
            <div class="title" id="titleText">Title</div>
            <div class="value" id="valueText">0</div>
            <div class="unit" id="unitText">Unit</div>
        </div>
    `;

    class LiquidGlassNumeric extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({mode: "open"});
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            
            this._props = {};
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            this._props = { ...this._props, ...changedProperties };
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            if ("title" in changedProperties) {
                this.shadowRoot.getElementById("titleText").innerText = changedProperties["title"];
            }
            if ("value" in changedProperties) {
                this.shadowRoot.getElementById("valueText").innerText = changedProperties["value"];
            }
            if ("unit" in changedProperties) {
                this.shadowRoot.getElementById("unitText").innerText = changedProperties["unit"];
            }
        }
    }

    customElements.define("com-custom-liquid-glass-numeric", LiquidGlassNumeric);
})();