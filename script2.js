// ================== Daten ==================
const MENU = [
  { id:"haupt", title:"Hauptgerichte", items:[
    { id:"pizza",  title:"Pizza Krabben",  desc:"mit Krabben und Peperoni", price: 9.90 },
    { id:"ramen",  title:"Ramen Classic",  desc:"Miso-Brühe, Ei, Pak Choi",  price:12.90 },
    { id:"udon",   title:"Udon Suppe",     desc:"mit Gemüse",               price:10.50 }
  ]},
  { id:"beilage", title:"Beilage", items:[
    { id:"edamame", title:"Edamame", desc:"mit Meersalz",   price:4.50 },
    { id:"kimchi",  title:"Kimchi",  desc:"leicht scharf",  price:4.90 }
  ]}
];

// ================== Utils ==================
const $  = (s,el=document)=>el.querySelector(s);
const €  = (n)=>n.toFixed(2).replace(".",",")+" €";
const getDish = (id)=>MENU.flatMap(g=>g.items).find(d=>d.id===id);

// ================== State ==================
const state = { items:{}, shipping:false };

// ================== Templates ==================
const dishCard = (it) => `
  <article class="dish">
    <div>
      <h4>${it.title}</h4>
      <p>${it.desc}</p>
      <p class="price">${€(it.price)}</p>
    </div>
    <button class="add" data-id="${it.id}" aria-label="${it.title} hinzufügen">+</button>
  </article>
`;
const sectionTpl = (g) => `
  <section class="section" id="${g.id}">
    <h3>${g.title}</h3>
    ${g.items.map(dishCard).join("")}
  </section>
`;
const cartRow = (id, it) => `
  <div class="row">
    <div class="t">${it.title}</div>
    <div class="qty">
      <button data-act="dec" data-id="${id}" aria-label="Menge verringern">−</button>
      <span>${it.qty}</span>
      <button data-act="inc" data-id="${id}" aria-label="Menge erhöhen">+</button>
    </div>
    <strong>${€(it.price*it.qty)}</strong>
    <button data-act="del" data-id="${id}" class="btn" aria-label="${it.title} entfernen">Löschen</button>
  </div>
`;

// ================== Render ==================
function renderCategories(){
  $("#catbar").innerHTML = MENU.map(g=>`<a href="#${g.id}">${g.title}</a>`).join("");
}
function renderMenu(){
  renderCategories();
  const root = $("#menuRoot");
  root.innerHTML = MENU.map(sectionTpl).join("");
  // Klicks auf Plus-Buttons
  root.addEventListener("click",(e)=>{
    const addBtn = e.target.closest(".add");
    if(addBtn) addItem(addBtn.dataset.id);
  });
}

function renderList(container){
  container.innerHTML = "";
  const ids = Object.keys(state.items);
  if(!ids.length){
    container.innerHTML = '<p style="color:#6b7280;margin:0">Warenkorb leer</p>';
    return;
  }
  ids.forEach(id=> container.insertAdjacentHTML("beforeend", cartRow(id, state.items[id])));
}

function totals(){
  const sub = Object.values(state.items).reduce((s,i)=>s + i.price*i.qty, 0);
  return { sub, total: sub + (state.shipping ? 2.5 : 0) };
}

function renderSummary(prefix){
  const { sub, total } = totals();
  $(prefix+"Subtotal").textContent = €(sub);
  $(prefix+"Total").textContent    = €(total);
  $(prefix+"OrderBtn").disabled    = Object.keys(state.items).length === 0;
  updateOpenCartButton();
}

function renderAll(){
  renderList($("#cartList"));
  renderList($("#mCartList"));
  renderSummary("#");
  renderSummary("#m");
}

function updateOpenCartButton(){
  const { total } = totals();
  const btn = $("#openDrawerBtn");
  btn.textContent = Object.keys(state.items).length ? `Warenkorb öffnen (${€(total)})` : 'Warenkorb öffnen';
}

// ================== Actions ==================
function addItem(id){
  const d = getDish(id); if(!d) return;
  const cur = state.items[id] || { title:d.title, price:d.price, qty:0 };
  cur.qty += 1; state.items[id] = cur; renderAll();
}
function changeQty(id,delta){
  const it = state.items[id]; if(!it) return;
  it.qty += delta; if(it.qty<=0) delete state.items[id]; renderAll();
}
function setShipping(on){
  state.shipping = on;
  $("#ship").checked = on; $("#mShip").checked = on;
  renderAll();
}
function showConfirm(idSel){
  const { total } = totals();
  const itemsText = Object.values(state.items).map(i=>`${i.title} x${i.qty}`).join(", ");
  const box = $(idSel);
  if(itemsText){
    box.textContent = `Danke! Bestellung: ${itemsText}. Gesamt: ${€(total)}.`;
    box.style.display = "block";
  }else{
    box.textContent = "";
    box.style.display = "none";
  }
}

// ================== Events ==================
document.addEventListener("click",(e)=>{
  const ctrl = e.target.closest("[data-act]");
  if(!ctrl) return;
  const { act, id } = ctrl.dataset;
  if(act==="inc") changeQty(id, +1);
  if(act==="dec") changeQty(id, -1);
  if(act==="del"){ delete state.items[id]; renderAll(); }
});

$("#ship").addEventListener("change", e=>setShipping(e.target.checked));
$("#mShip").addEventListener("change", e=>setShipping(e.target.checked));

$("#orderBtn").addEventListener("click", ()=>{
  showConfirm("#confirmMsg");
  state.items = {}; setShipping(false); renderAll();
});

$("#mOrderBtn").addEventListener("click", ()=>{
  showConfirm("#mConfirmMsg");
  state.items = {}; setShipping(false); renderAll();
  $("#drawer").close();
});

$("#openDrawerBtn").addEventListener("click", ()=>$("#drawer").showModal());

// Start
document.getElementById('y').textContent = new Date().getFullYear();
renderMenu();
renderAll();