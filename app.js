(() => {
  const cfg = window.APP_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const STORE = "invoicesnap:data", PRO = "invoicesnap:pro";
  const today = () => new Date().toISOString().slice(0, 10);
  const plusDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };

  const blank = () => ({
    fromName: "", fromInfo: "", toName: "", toInfo: "",
    number: "INV-" + String(Date.now()).slice(-5), currency: "USD",
    date: today(), due: plusDays(14), tax: 0, discount: 0, notes: "", logo: "",
    items: [{ desc: "", qty: 1, price: 0 }]
  });

  let data;
  try { data = { ...blank(), ...JSON.parse(store.get(STORE) || "{}") }; } catch { data = blank(); }

  // Pro unlock via ?pro=CODE (Stripe redirect) or manual code entry
  const params = new URLSearchParams(location.search);
  if (cfg.unlockCode && params.get("pro") === cfg.unlockCode) {
    store.set(PRO, "1");
    history.replaceState(null, "", location.pathname);
  }
  const isPro = () => store.get(PRO) === "1";

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => {
    try { return new Intl.NumberFormat(undefined, { style: "currency", currency: data.currency }).format(n || 0); }
    catch { return (n || 0).toFixed(2); }
  };
  const save = () => store.set(STORE, JSON.stringify(data));

  function totals() {
    const sub = data.items.reduce((s, i) => s + (+i.qty || 0) * (+i.price || 0), 0);
    const disc = Math.min(+data.discount || 0, sub);
    const tax = (sub - disc) * (+data.tax || 0) / 100;
    return { sub, disc, tax, total: sub - disc + tax };
  }

  function renderItems() {
    const box = $("#items");
    box.innerHTML = "";
    data.items.forEach((it, idx) => {
      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML = `
        <input placeholder="Description" value="${esc(it.desc)}" data-k="desc">
        <input type="number" min="0" step="any" value="${esc(it.qty)}" data-k="qty" title="Qty">
        <input type="number" min="0" step="0.01" value="${esc(it.price)}" data-k="price" title="Price">
        <button title="Remove">×</button>`;
      row.querySelectorAll("input").forEach((inp) =>
        inp.addEventListener("input", () => { it[inp.dataset.k] = inp.value; update(); }));
      row.querySelector("button").onclick = () => {
        data.items.splice(idx, 1);
        if (!data.items.length) data.items.push({ desc: "", qty: 1, price: 0 });
        renderItems(); update();
      };
      box.appendChild(row);
    });
  }

  function renderPreview() {
    const t = totals();
    const rows = data.items.filter((i) => i.desc || +i.price).map((i) => `
      <tr><td>${esc(i.desc)}</td><td class="num">${esc(i.qty)}</td>
      <td class="num">${money(+i.price)}</td><td class="num">${money((+i.qty || 0) * (+i.price || 0))}</td></tr>`).join("");
    $("#invoice").innerHTML = `
      <div class="inv-head">
        <div>${isPro() && data.logo ? `<img src="${esc(data.logo)}" alt="logo">` : ""}
          <p class="inv-title">INVOICE</p></div>
        <div class="meta"><strong>${esc(data.number)}</strong><br>
          Date: ${esc(data.date)}<br>Due: ${esc(data.due)}</div>
      </div>
      <div class="parties">
        <div><h4>From</h4><strong>${esc(data.fromName) || "Your business"}</strong>\n${esc(data.fromInfo)}</div>
        <div><h4>Bill to</h4><strong>${esc(data.toName) || "Client"}</strong>\n${esc(data.toInfo)}</div>
      </div>
      <table><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="4" style="color:#9ca3af">Add items on the left…</td></tr>`}</tbody></table>
      <div class="totals">
        <div><span>Subtotal</span><span>${money(t.sub)}</span></div>
        ${t.disc ? `<div><span>Discount</span><span>−${money(t.disc)}</span></div>` : ""}
        ${+data.tax ? `<div><span>Tax (${esc(data.tax)}%)</span><span>${money(t.tax)}</span></div>` : ""}
        <div class="grand"><span>Total</span><span>${money(t.total)}</span></div>
      </div>
      ${data.notes ? `<div class="notes">${esc(data.notes)}</div>` : ""}
      ${isPro() ? "" : `<div class="footer-brand">Made with ${esc(cfg.appName || "InvoiceSnap")}</div>`}`;
  }

  function update() { save(); renderPreview(); }

  function bindFields() {
    document.querySelectorAll("[data-f]").forEach((el) => {
      el.value = data[el.dataset.f] ?? "";
      el.addEventListener("input", () => { data[el.dataset.f] = el.value; update(); });
    });
  }

  function setupMonetization() {
    $("#appName").textContent = cfg.appName || "InvoiceSnap";
    if (cfg.tipLink) { $("#tipBtn").href = cfg.tipLink; $("#tipBtn").hidden = false; }
    $("#proPrice").textContent = cfg.proPrice || "";
    $("#proBtn").textContent = isPro() ? "✓ Pro" : "Go Pro";
    if (cfg.stripePaymentLink) $("#buyBtn").href = cfg.stripePaymentLink;
    else $("#buyBtn").onclick = (e) => { e.preventDefault(); alert("Set stripePaymentLink in config.js to start selling Pro."); };

    if (!isPro() && cfg.adsensePublisherId) {
      const slot = $("#adSlot");
      slot.hidden = false;
      slot.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${esc(cfg.adsensePublisherId)}"
        data-ad-slot="${esc(cfg.adsenseSlotId)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      const s = document.createElement("script");
      s.async = true; s.crossOrigin = "anonymous";
      s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(cfg.adsensePublisherId);
      document.head.appendChild(s);
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }

  // Events
  $("#addItem").onclick = () => { data.items.push({ desc: "", qty: 1, price: 0 }); renderItems(); update(); };
  $("#printBtn").onclick = () => window.print();
  $("#newBtn").onclick = () => {
    if (!confirm("Start a new invoice? Your details will be kept.")) return;
    const keep = { fromName: data.fromName, fromInfo: data.fromInfo, logo: data.logo, currency: data.currency, notes: data.notes };
    data = { ...blank(), ...keep };
    bindFields(); renderItems(); update();
  };
  $("#proBtn").onclick = () => $("#proDialog").showModal();
  $("#codeBtn").onclick = () => {
    if (cfg.unlockCode && $("#codeInput").value.trim() === cfg.unlockCode) {
      store.set(PRO, "1"); location.reload();
    } else $("#codeMsg").textContent = "Invalid code.";
  };
  $("#logoInput").onchange = (e) => {
    if (!isPro()) { e.target.value = ""; $("#proDialog").showModal(); return; }
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { data.logo = r.result; update(); };
    r.readAsDataURL(f);
  };

  setupMonetization();
  bindFields();
  renderItems();
  renderPreview();
})();
