// ---- THREE.JS 3D BACKGROUND ----
(function(){
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const count = 1800;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  for(let i = 0; i < count; i++){
    pos[i*3]   = (Math.random()-0.5)*120;
    pos[i*3+1] = (Math.random()-0.5)*120;
    pos[i*3+2] = (Math.random()-0.5)*80;
    const t = Math.random();
    if(t < 0.4){col[i*3]=1;col[i*3+1]=0.71;col[i*3+2]=0.15;}
    else if(t < 0.7){col[i*3]=1;col[i*3+1]=0.27;col[i*3+2]=0;}
    else{col[i*3]=1;col[i*3+1]=0.18;col[i*3+2]=0.42;}
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({size:.18, vertexColors:true, transparent:true, opacity:.75, sizeAttenuation:true});
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  const boxes = [];
  for(let i = 0; i < 6; i++){
    const s = 2 + Math.random()*3;
    const wg = new THREE.BoxGeometry(s,s,s);
    const wm = new THREE.MeshBasicMaterial({color:i%2===0?0xFFB627:0xFF4500, wireframe:true, transparent:true, opacity:.08+Math.random()*.07});
    const box = new THREE.Mesh(wg, wm);
    box.position.set((Math.random()-0.5)*40, (Math.random()-0.5)*30, (Math.random()-0.5)*20);
    box.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
    box.userData = {sx:0.003+Math.random()*.004, sy:0.002+Math.random()*.003, sz:0.001+Math.random()*.003};
    boxes.push(box);
    scene.add(box);
  }

  const gridMat = new THREE.LineBasicMaterial({color:0xFFB627, transparent:true, opacity:.04});
  for(let i=-10;i<=10;i++){
    const xg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i*5,-50,0),new THREE.Vector3(i*5,50,0)]);
    const yg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-50,i*5,0),new THREE.Vector3(50,i*5,0)]);
    scene.add(new THREE.Line(xg, gridMat));
    scene.add(new THREE.Line(yg, gridMat));
  }

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX/window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY/window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let t = 0;
  function animate(){
    requestAnimationFrame(animate);
    t += 0.005;
    pts.rotation.y += 0.0004;
    pts.rotation.x += 0.0002;
    boxes.forEach(b => {
      b.rotation.x += b.userData.sx;
      b.rotation.y += b.userData.sy;
      b.rotation.z += b.userData.sz;
      b.position.y += Math.sin(t + b.userData.sx*100)*0.008;
    });
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.03;
    camera.position.y += (mouseY * 3 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();
})();

// ---- NAV ----
const nav = document.getElementById('nav');
const btt = document.getElementById('btt');
window.addEventListener('scroll', () => {
  nav.classList.toggle('solid', scrollY > 60);
  btt.classList.toggle('show', scrollY > 400);
});

// ---- HAMBURGER ----
document.getElementById('hbg').addEventListener('click', function(){
  document.getElementById('navL').classList.toggle('on');
});
document.querySelectorAll('#navL a').forEach(a=>a.addEventListener('click',()=>document.getElementById('navL').classList.remove('on')));

// ---- SCROLL REVEAL (rv + ps-from-left + ps-from-right) ----
const ro = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)} });
},{threshold:.1});
document.querySelectorAll('.rv, .ps-from-left, .ps-from-right').forEach(el=>ro.observe(el));

// ---- COUNT UP ----
function countUp(el){
  const t=parseInt(el.dataset.t), d=1800, s=performance.now();
  const step=n=>{
    const p=Math.min((n-s)/d,1), ease=1-Math.pow(1-p,3);
    el.textContent=Math.floor(ease*t);
    if(p<1)requestAnimationFrame(step); else el.textContent=t;
  };
  requestAnimationFrame(step);
}
const so=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('.cu').forEach(countUp);so.unobserve(e.target)}});
},{threshold:.5});
const hs=document.querySelector('.hero-stats');
if(hs)so.observe(hs);

// ---- GENERIC SLIDER (used for Portfolio + Testimonials) ----
// Works for any number of sliders as long as each instance has its own
// unique track / dots / prev / next element IDs.
function initSlider(opts){
  const track = document.getElementById(opts.track);
  const dotsWrap = document.getElementById(opts.dots);
  if(!track || !dotsWrap) return;
  const slides = track.querySelectorAll(opts.slideClass);
  const total = slides.length;
  if(!total) return;
  let current = 0;
  let autoTimer;

  dotsWrap.innerHTML = ''; // avoid duplicate dots if init runs twice
  slides.forEach((_,i)=>{
    const d = document.createElement('button');
    d.className = 'pf-dot' + (i===0?' on':'');
    d.addEventListener('click',()=>goTo(i));
    dotsWrap.appendChild(d);
  });

  function updateDots(){
    dotsWrap.querySelectorAll('.pf-dot').forEach((d,i)=>d.classList.toggle('on',i===current));
  }

  function goTo(idx){
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
    resetAuto();
  }

  const prevBtn = document.getElementById(opts.prev);
  const nextBtn = document.getElementById(opts.next);
  if(prevBtn) prevBtn.addEventListener('click',()=>goTo(current-1));
  if(nextBtn) nextBtn.addEventListener('click',()=>goTo(current+1));

  let startX=0;
  track.addEventListener('touchstart', e=>{startX=e.touches[0].clientX},{passive:true});
  track.addEventListener('touchend', e=>{
    const diff = startX - e.changedTouches[0].clientX;
    if(Math.abs(diff)>50) goTo(diff>0 ? current+1 : current-1);
  },{passive:true});

  function resetAuto(){ clearInterval(autoTimer); autoTimer=setInterval(()=>goTo(current+1),opts.interval||4500); }
  resetAuto();
}

// Testimonials slider (index.html)
initSlider({track:'tmTrack', dots:'tmDots', prev:'tmPrev', next:'tmNext', slideClass:'.tm-slide', interval:5500});

// Portfolio sliders (portfolio.html) — each block needs unique IDs.
// Add more lines here the same way if you add more slider sections.
initSlider({track:'pfTrack1', dots:'pfDots1', prev:'pfPrev1', next:'pfNext1', slideClass:'.pf-slide', interval:4500});
initSlider({track:'pfTrack2', dots:'pfDots2', prev:'pfPrev2', next:'pfNext2', slideClass:'.pf-slide', interval:4500});
initSlider({track:'pfTrack3', dots:'pfDots3', prev:'pfPrev3', next:'pfNext3', slideClass:'.pf-slide', interval:4500});
initSlider({track:'pfTrack4', dots:'pfDots4', prev:'pfPrev4', next:'pfNext4', slideClass:'.pf-slide', interval:4500});
initSlider({track:'pfTrack5', dots:'pfDots5', prev:'pfPrev5', next:'pfNext5', slideClass:'.pf-slide', interval:4500});
initSlider({track:'pfTrack6', dots:'pfDots6', prev:'pfPrev6', next:'pfNext6', slideClass:'.pf-slide', interval:4500});
initSlider({track:'pfTrack7', dots:'pfDots7', prev:'pfPrev7', next:'pfNext7', slideClass:'.pf-slide', interval:4500});
initSlider({track:'pfTrack8', dots:'pfDots8', prev:'pfPrev8', next:'pfNext8', slideClass:'.pf-slide', interval:4500});
initSlider({track:'pfTrack9', dots:'pfDots9', prev:'pfPrev9', next:'pfNext9', slideClass:'.pf-slide', interval:4500});
initSlider({track:'pfTrack10', dots:'pfDots10', prev:'pfPrev10', next:'pfNext10', slideClass:'.pf-slide', interval:4500});

// ---- PORTFOLIO FILTER ----
document.querySelectorAll('.pf-btn').forEach(b=>{
  b.addEventListener('click',function(){
    document.querySelectorAll('.pf-btn').forEach(x=>x.classList.remove('on'));
    this.classList.add('on');
  });
});

// ---- SMOOTH SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',function(e){
    const tgt=document.querySelector(this.getAttribute('href'));
    if(tgt){e.preventDefault();window.scrollTo({top:tgt.offsetTop-76,behavior:'smooth'})}
  });
});