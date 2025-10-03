(function() {
    let template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
            }
            .property-group {
                margin-bottom: 1.5em;
            }
            .property-group h3 {
                margin: 0 0 0.5em 0;
                font-size: 13px;
                font-weight: 600;
                color: #333;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 0.5em;
            }
            .property-row {
                display: flex;
                align-items: center;
                margin-bottom: 0.6em;
                padding: 0.3em 0;
            }
            .property-row label {
                flex: 1;
                font-size: 12px;
                color: #666;
            }
            .property-row input[type="text"] {
                flex: 2;
                padding: 4px 8px;
                border: 1px solid #ccc;
                border-radius: 3px;
                font-size: 12px;
            }
            .property-row input[type="checkbox"] {
                margin-left: auto;
            }
        </style>
        
        <div class="property-group">
            <h3>Display Settings</h3>
            <div class="property-row">
                <label for="title">Title</label>
                <input type="text" id="title" placeholder="Enter title">
            </div>
            <div class="property-row">
                <label for="subtitle">Subtitle</label>
                <input type="text" id="subtitle" placeholder="Enter subtitle">
            </div>
            <div class="property-row">
                <label for="unit">Unit</label>
                <input type="text" id="unit" placeholder="e.g., USD, %">
            </div>
        </div>
        
        <div class="property-group">
            <h3>Visibility Options</h3>
            <div class="property-row">
                <label for="showTitle">Show Title</label>
                <input type="checkbox" id="showTitle">
            </div>
            <div class="property-row">
                <label for="showSubtitle">Show Subtitle</label>
                <input type="checkbox" id="showSubtitle">
            </div>
            <div class="property-row">
                <label for="showSecondary">Show Secondary Value</label>
                <input type="checkbox" id="showSecondary">
            </div>
        </div>
    `;

    class LiquidGlassNumeric2APS extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(template.content.cloneNode(true));
            
            // Property change listeners
            this._shadowRoot.getElementById("title").addEventListener("input", (e) => {
                this._firePropertiesChanged("title", e.target.value);
            });
            
            this._shadowRoot.getElementById("subtitle").addEventListener("input", (e) => {
                this._firePropertiesChanged("subtitle", e.target.value);
            });
            
            this._shadowRoot.getElementById("unit").addEventListener("input", (e) => {
                this._firePropertiesChanged("unit", e.target.value);
            });
            
            this._shadowRoot.getElementById("showTitle").addEventListener("change", (e) => {
                this._firePropertiesChanged("showTitle", e.target.checked);
            });
            
            this._shadowRoot.getElementById("showSubtitle").addEventListener("change", (e) => {
                this._firePropertiesChanged("showSubtitle", e.target.checked);
            });
            
            this._shadowRoot.getElementById("showSecondary").addEventListener("change", (e) => {
                this._firePropertiesChanged("showSecondary", e.target.checked);
            });
        }

        _firePropertiesChanged(property, value) {
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        [property]: value
                    }
                }
            }));
        }

        // Property setters called by SAC
        set title(value) {
            this._shadowRoot.getElementById("title").value = value || "";
        }

        set subtitle(value) {
            this._shadowRoot.getElementById("subtitle").value = value || "";
        }

        set unit(value) {
            this._shadowRoot.getElementById("unit").value = value || "";
        }

        set showTitle(value) {
            this._shadowRoot.getElementById("showTitle").checked = !!value;
        }

        set showSubtitle(value) {
            this._shadowRoot.getElementById("showSubtitle").checked = !!value;
        }

        set showSecondary(value) {
            this._shadowRoot.getElementById("showSecondary").checked = !!value;
        }
    }

    customElements.define("com-custom-lgn2-numeric-aps", LiquidGlassNumeric2APS);
})();
