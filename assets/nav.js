/* ============ MOBILE MENU ============ */
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
menuBtn.addEventListener('click', ()=>{ mobileMenu.classList.toggle('hidden'); });
document.querySelectorAll('.mobile-link').forEach(l=> l.addEventListener('click', ()=> mobileMenu.classList.add('hidden')));

/* ============ CUSTOM CURSOR ============ */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx=innerWidth/2,my=innerHeight/2, rx=mx, ry=my;
window.addEventListener('mousemove', e=>{
  mx=e.clientX; my=e.clientY;
  dot.style.left = mx+'px'; dot.style.top = my+'px';
});
(function animateCursor(){
  rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
  ring.style.left = rx+'px'; ring.style.top = ry+'px';
  requestAnimationFrame(animateCursor);
})();
// event delegation so this also covers buttons/links rendered later (product cards, etc.)
document.addEventListener('mouseover', e=>{
  if(e.target.closest('a, button')) document.body.classList.add('cursor-hover');
});
document.addEventListener('mouseout', e=>{
  if(e.target.closest('a, button') && !e.relatedTarget?.closest('a, button')) document.body.classList.remove('cursor-hover');
});

/* ============ GSAP SCROLL REVEALS (generic) ============ */
gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray('.reveal').forEach((el)=>{
  gsap.to(el, { opacity:1, y:0, duration:1, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 88%' } });
});

/* ============ PRELOADER ============ */
window.addEventListener('load', ()=>{
  setTimeout(()=> document.getElementById('preloader').classList.add('done'), 500);
});
