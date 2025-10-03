(function() {
    let template = document.createElement("template");
    template.innerHTML = `
        <style>
            :host {
                display: block;
                padding: 1em;
            }
            .property-group {
                margin-bottom: 1.5em;
            }
            .property-group h3 {
                margin-bottom: 0.5em;
                font-size: 14px;
                font-weight: 600;
                color: #333;
            }
            .property-row {
                display: flex;
                align-items: center;
                margin-bottom: 0.8em;
            }
            .property-row label {
                flex: 1;
                font-size: 13px;
                color: #666;
            }
            .property-row input[type="text"],
            .property-row input[type="number"] {
                flex: 2;
                padding: 4px 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 13px;
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
            
            this._shadowRoot.getElementById("title").addEventListener("change", this._onTitleChange.bind(this));
            this._shadowRoot.getElementById("subtitle").addEventListener("change", this._onSubtitleChange.bind(this));
            this._shadowRoot.getElementById("unit").addEventListener("change", this._onUnitChange.bind(this));
            this._shadowRoot.getElementById("showTitle").addEventListener("change", this._onShowTitleChange.bind(this));
            this._shadowRoot.getElementById("showSubtitle").addEventListener("change", this._onShowSubtitleChange.bind(this));
            this._shadowRoot.getElementById("showSecondary").addEventListener("change", this._onShowSecondaryChange.bind(this));
        }

        _onTitleChange(e) {
            this._firePropertiesChanged("title", e.target.value);
        }

        _onSubtitleChange(e) {
            this._firePropertiesChanged("subtitle", e.target.value);
        }

        _onUnitChange(e) {
            this._firePropertiesChanged("unit", e.target.value);
        }

        _onShowTitleChange(e) {
            this._firePropertiesChanged("showTitle", e.target.checked);
        }

        _onShowSubtitleChange(e) {
            this._firePropertiesChanged("showSubtitle", e.target.checked);
        }

        _onShowSecondaryChange(e) {
            this._firePropertiesChanged("showSecondary", e.target.checked);
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