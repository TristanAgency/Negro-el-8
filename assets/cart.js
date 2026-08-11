/* ============ CART STATE ============ */
let cart = [];

/* ============ CART PERSISTENCE (localStorage) ============ */
const CART_STORAGE_KEY = 'negroel8_cart';
function saveCart(){
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch(e){}
}
function loadCart(){
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if(raw){ const parsed = JSON.parse(raw); if(Array.isArray(parsed)) cart = parsed; }
  } catch(e){ cart = []; }
}
loadCart();

/* ============ ORDER LOG (Google Sheets) ============ */
/* Pegá acá la URL que te da Google Apps Script al implementar (termina en /exec) */
const ORDER_LOG_URL = 'https://script.google.com/macros/s/AKfycbxvAg5gqMRbx0H2d61lJ-hX2hJZlw4h5vIcM6NUdfNp0y4GdIDVq3FHNGnIIQQ-B4L6KQ/exec';

function logOrderToSheet(data){
  if(!ORDER_LOG_URL || ORDER_LOG_URL.includes('PASTE_')) return;
  fetch(ORDER_LOG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data)
  }).catch(()=>{});
}

/* ============ SHARED PRODUCT CARD ============ */
function buildProductCard(p, extraClass){
  const discount = p.oldPrice ? Math.round(100-(p.price/p.oldPrice*100)) : null;
  const card = document.createElement('div');
  card.className = `frost-card glass frost-edge rounded-3xl p-6 relative ${extraClass||''}`;
  card.innerHTML = `
    ${discount ? `<span class="absolute top-4 left-4 bg-red text-white text-xs font-bold px-2.5 py-1 rounded-full mono z-10">-${discount}%</span>` : ''}
    ${p.temp!=='—' ? `<span class="absolute top-4 right-4 badge-cold text-xs px-2.5 py-1 rounded-full mono z-10">❄ ${p.temp}</span>` : ''}
    <div class="relative z-10">
      <div class="h-36 flex items-center justify-center mb-4">
        ${p.img
          ? `<img src="${p.img}" alt="${p.name}" class="h-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,.5)] floaty-product" style="animation-delay:-${(p.id%6)*0.5}s" loading="lazy" />`
          : `<div class="bottle-visual ${p.type}" style="--c:${p.color}"><span class="label-text">${p.type==='whisky' ? 'WHISKY' : p.type==='snack' ? 'SNACK' : 'BEER'}</span></div>`}
      </div>
      <h4 class="font-semibold mb-1 text-sm leading-snug">${p.name}</h4>
      <p class="text-silver text-xs mb-4">${p.cat}</p>
      <div class="flex items-center justify-between">
        <div class="flex items-baseline gap-2">
          <span class="mono font-bold text-lg">$${p.price}</span>
          ${p.oldPrice ? `<span class="mono text-xs text-silver line-through">$${p.oldPrice}</span>` : ''}
        </div>
        <button class="add-btn btn-elastic w-10 h-10 rounded-xl bg-gradient-to-r from-red to-redDark text-white font-bold kbd-focus" data-id="${p.id}">+</button>
      </div>
    </div>
  `;
  card.querySelector('.add-btn').addEventListener('click', ()=>{
    const btn = card.querySelector('.add-btn');
    addToCart(p.id);
    gsap.fromTo(btn, {scale:1}, {scale:1.3, duration:.15, yoyo:true, repeat:1, ease:'power1.inOut'});
  });
  return card;
}

/* bottle-visual fallback styles (used when a product has no photo) */
const style = document.createElement('style');
style.textContent = `
.bottle-visual{ position:relative; width:60px; height:130px; margin:0 auto; animation:floaty 5s ease-in-out infinite; }
.bottle-visual.whisky{ border-radius:8px 8px 14px 14px; background:linear-gradient(160deg, color-mix(in srgb, var(--c) 80%, white 20%), var(--c) 60%, black 130%); box-shadow:0 20px 40px -12px rgba(0,0,0,.6), inset -6px 0 12px rgba(0,0,0,.3), inset 6px 0 10px rgba(255,255,255,.12); }
.bottle-visual.whisky::before{ content:''; position:absolute; top:-22px; left:18px; width:24px; height:26px; background:linear-gradient(var(--c), black); border-radius:4px 4px 0 0; }
.bottle-visual.whisky::after{ content:''; position:absolute; top:-30px; left:20px; width:20px; height:10px; background:#D4AF37; border-radius:3px; }
.bottle-visual.beer{ border-radius:10px 10px 30px 30px; background:linear-gradient(160deg, color-mix(in srgb, var(--c) 75%, white 25%), var(--c) 55%, black 140%); box-shadow:0 20px 40px -12px rgba(0,0,0,.6), inset -6px 0 12px rgba(0,0,0,.3), inset 6px 0 10px rgba(255,255,255,.12); }
.bottle-visual.beer::before{ content:''; position:absolute; top:-26px; left:20px; width:20px; height:28px; background:linear-gradient(var(--c), black); border-radius:6px 6px 2px 2px; }
.bottle-visual.beer::after{ content:''; position:absolute; top:-32px; left:22px; width:16px; height:8px; background:#c9c9c9; border-radius:2px; }
.bottle-visual.snack{ width:60px; height:78px; border-radius:45% 45% 12% 12% / 55% 55% 8% 8%; background:linear-gradient(160deg, color-mix(in srgb, var(--c) 80%, white 20%), var(--c) 55%, color-mix(in srgb, var(--c) 65%, black 35%)); box-shadow:0 16px 30px -10px rgba(0,0,0,.55), inset -5px 0 10px rgba(0,0,0,.25), inset 5px 0 8px rgba(255,255,255,.14); }
.bottle-visual.snack::before{ content:''; position:absolute; top:-4px; left:6px; right:6px; height:10px; background:color-mix(in srgb, var(--c) 55%, black 45%); border-radius:6px 6px 2px 2px; }
.label-text{ position:absolute; top:52%; left:50%; transform:translate(-50%,-50%); background:rgba(255,255,255,.94); color:#1a1a1a; font-size:9px; font-weight:800; letter-spacing:.05em; padding:3px 8px; border-radius:3px; }
`;
document.head.appendChild(style);

/* ============ CART LOGIC ============ */
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsEl = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartFooterEl = document.getElementById('cart-footer');
const cartSuccessEl = document.getElementById('cart-success');
const cartSuccessMsgEl = document.getElementById('cart-success-msg');
const orderPickupBtn = document.getElementById('order-type-pickup');
const orderDeliveryBtn = document.getElementById('order-type-delivery');
const orderAddressWrap = document.getElementById('order-address-wrap');
const orderPhoneInput = document.getElementById('order-phone');
const orderAddressInput = document.getElementById('order-address');

/* ============ CHECKOUT: order type (pickup / delivery) ============ */
let orderType = 'pickup';
function setOrderType(type){
  orderType = type;
  orderPickupBtn.classList.toggle('active', type==='pickup');
  orderDeliveryBtn.classList.toggle('active', type==='delivery');
  orderAddressWrap.classList.toggle('hidden', type==='pickup');
}
orderPickupBtn.addEventListener('click', ()=> setOrderType('pickup'));
orderDeliveryBtn.addEventListener('click', ()=> setOrderType('delivery'));

function addToCart(id){
  const product = PRODUCTS.find(p=>p.id===id);
  const existing = cart.find(i=>i.id===id);
  if(existing){ existing.qty++; } else { cart.push({...product, qty:1}); }
  renderCart();
  showToast(`${product.name} agregado`);
}
function changeQty(id, delta){
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) cart = cart.filter(i=>i.id!==id);
  renderCart();
}
function renderCart(){
  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  cartCountEl.textContent = totalQty;
  cartCountEl.style.display = totalQty>0 ? 'flex' : 'none';
  if(cart.length===0){
    cartItemsEl.innerHTML = `<div class="text-silver text-sm text-center mt-16">Tu carrito está vacío.<br>Agregá algo bien frío 🧊</div>`;
  } else {
    cartItemsEl.innerHTML = cart.map(i=>`
      <div class="glass frost-edge rounded-2xl p-4 flex items-center gap-4">
        <div class="w-12 h-16 rounded-lg flex-shrink-0" style="background:linear-gradient(160deg, ${i.color}, black); box-shadow:inset -3px 0 6px rgba(0,0,0,.3)"></div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate">${i.name}</p>
          <p class="mono text-xs text-silver">$${i.price} c/u</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="qty-btn w-7 h-7 rounded-lg glass flex items-center justify-center" onclick="changeQty(${i.id},-1)">-</button>
          <span class="mono w-5 text-center">${i.qty}</span>
          <button class="qty-btn w-7 h-7 rounded-lg glass flex items-center justify-center" onclick="changeQty(${i.id},1)">+</button>
        </div>
      </div>
    `).join('');
  }
  const subtotal = cart.reduce((s,i)=>s+i.qty*i.price,0);
  cartSubtotalEl.textContent = `$${subtotal}`;
  saveCart();
}
window.changeQty = changeQty;
renderCart();

function openCart(){ cartDrawer.classList.add('open'); cartOverlay.classList.add('open'); }
function closeCart(){
  cartDrawer.classList.remove('open'); cartOverlay.classList.remove('open');
  if(!cartSuccessEl.classList.contains('hidden')){
    setTimeout(()=>{
      cartSuccessEl.classList.add('hidden');
      cartFooterEl.classList.remove('hidden');
      cartItemsEl.classList.remove('hidden');
      orderPhoneInput.value = '';
      orderAddressInput.value = '';
      setOrderType('pickup');
    }, 450);
  }
}
document.getElementById('cart-btn').addEventListener('click', openCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
document.getElementById('cart-clear').addEventListener('click', ()=>{
  if(cart.length===0) return;
  cart = [];
  renderCart();
  showToast('Carrito vaciado');
});
document.getElementById('cart-success-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.getElementById('checkout-btn').addEventListener('click', ()=>{
  if(cart.length===0){ showToast('Agregá productos antes de pedir'); return; }
  const phone = orderPhoneInput.value.trim();
  const phoneDigits = phone.replace(/\D/g,'');
  if(phoneDigits.length<6){ showToast('Ingresá un teléfono de contacto válido'); orderPhoneInput.focus(); return; }
  const address = orderAddressInput.value.trim();
  if(orderType==='delivery' && !address){ showToast('Ingresá tu dirección de entrega'); orderAddressInput.focus(); return; }

  const lines = cart.map(i=>`• ${i.qty}x ${i.name} — $${i.qty*i.price}`).join('%0A');
  const subtotal = cart.reduce((s,i)=>s+i.qty*i.price,0);
  const deliveryBlock = orderType==='delivery'
    ? `%0A🛵 Entrega: Delivery%0A📍 Dirección: ${encodeURIComponent(address)}`
    : `%0A🏪 Entrega: Retiro en el local`;
  const msg = `Hola! Quiero hacer un pedido en Negro el 8:%0A${lines}%0A%0ATotal: $${subtotal}${deliveryBlock}%0A📞 Teléfono: ${encodeURIComponent(phone)}`;
  window.open(`https://wa.me/59899123456?text=${msg}`, '_blank');

  logOrderToSheet({
    fecha: new Date().toLocaleString('es-UY'),
    tipoEntrega: orderType==='delivery' ? 'Delivery' : 'Retiro en el local',
    telefono: phone,
    direccion: orderType==='delivery' ? address : '',
    productos: cart.map(i=>`${i.qty}x ${i.name}`).join(', '),
    total: subtotal
  });

  cartSuccessMsgEl.textContent = orderType==='delivery'
    ? 'Tu pedido te va a estar llegando a la brevedad. ¡Gracias por elegirnos!'
    : 'Tu pedido va a estar esperándote en el local para cuando pases a retirarlo.';
  cartItemsEl.classList.add('hidden');
  cartFooterEl.classList.add('hidden');
  cartSuccessEl.classList.remove('hidden');

  cart = [];
  renderCart();
});

let toastTimer;
function showToast(msg){
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), 2200);
}
