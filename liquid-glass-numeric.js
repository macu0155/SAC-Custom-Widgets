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
            
            .debug {
                font-size: 10px;
                color: #999;
                margin-top: 8px;
                max-width: 100%;
                overflow: auto;
                white-space: pre-wrap;
            }
        </style>
        
        <div class="liquid-glass-container">
            <div class="title" id="titleText">Orders</div>
            <div class="value" id="valueText">--</div>
            <div class="unit" id="unitText">in Million</div>
            <div class="debug" id="debugText"></div>
        </div>
    `;

    class LiquidGlassNumericV5 extends HTMLElement {
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
            // Update title
            if ("title" in changedProperties) {
                this.shadowRoot.getElementById("titleText").innerText = changedProperties["title"];
            }
            
            // Update unit
            if ("unit" in changedProperties) {
                this.shadowRoot.getElementById("unitText").innerText = changedProperties["unit"];
            }
            
            // Handle data binding
            if ("myDataBinding" in changedProperties) {
                const data = changedProperties["myDataBinding"];
                
                // Show what we received
                this.shadowRoot.getElementById("debugText").innerText = 
                    "Data: " + JSON.stringify(data, null, 2);
                
                this._parseData(data);
            }
        }

        _parseData(dataBinding) {
            if (!dataBinding) {
                this.shadowRoot.getElementById("valueText").innerText = "No data";
                return;
            }

            let value = null;

            // Try to extract the value
            try {
                // Check various possible structures
                if (dataBinding.data) {
                    const data = dataBinding.data;
                    
                    if (Array.isArray(data) && data.length > 0) {
                        const row = data[0];
                        
                        // Try different property names
                        value = row.Quantity || 
                                row.value || 
                                row.raw ||
                                row.formattedValue ||
                                row["@MeasureDimension"] ||
                                Object.values(row)[0];
                    }
                } else if (typeof dataBinding === 'object') {
                    // Maybe the value is directly in the binding
                    value = dataBinding.value || 
                            dataBinding.raw ||
                            dataBinding.formattedValue;
                }
            } catch (e) {
                this.shadowRoot.getElementById("valueText").innerText = "Error: " + e.message;
                return;
            }

            // Format and display
            if (value !== null && value !== undefined) {
                const formatted = this._formatValue(value);
                this.shadowRoot.getElementById("valueText").innerText = formatted;
            } else {
                this.shadowRoot.getElementById("valueText").innerText = "No value found";
            }
        }

        _formatValue(value) {
            if (typeof value === 'string') {
                return value;
            }
            
            const num = parseFloat(value);
            if (isNaN(num)) {
                return String(value);
            }
            
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + "m";
            } else if (num >= 1000) {
                return (num / 1000).toFixed(1) + "k";
            }
            
            return num.toLocaleString();
        }
    }

    customElements.define("com-custom-liquid-glass-numeric-v5", LiquidGlassNumericV5);
})();
