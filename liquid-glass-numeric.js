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
      <div cla
