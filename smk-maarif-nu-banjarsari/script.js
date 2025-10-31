// script.js - shared JS for multi-page site
document.addEventListener('DOMContentLoaded', function(){
  // back to top
  const toTop = document.getElementById('toTop');
  if(toTop){
    window.addEventListener('scroll', ()=> { if(window.scrollY>400) toTop.classList.add('show'); else toTop.classList.remove('show'); });
    toTop.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
  }

  // reveal sections on scroll
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }}); },{threshold:0.12});
  reveals.forEach(r=>io.observe(r));

  // simple carousel if present
  const slides = document.querySelectorAll('.slides');
  slides.forEach(slidesEl=>{
    const total = slidesEl.children.length;
    if(total<=1) return;
    let idx=0;
    slidesEl.style.width = `${total*100}%`;
    Array.from(slidesEl.children).forEach(c => c.style.width='100%');
    setInterval(()=>{ idx=(idx+1)%total; slidesEl.style.transform = `translateX(${-100*idx}%)`; },4500);
  });
});

/* ---------- IndexedDB for PPDB ---------- */
const DB = (function(){
  const dbName = 'smk-ppdb-v1', version = 1;
  let db;
  function open(){ return new Promise((res,rej)=>{ const r=indexedDB.open(dbName,version); r.onupgradeneeded = e => { db = e.target.result; if(!db.objectStoreNames.contains('applications')) db.createObjectStore('applications',{keyPath:'id',autoIncrement:true}); if(!db.objectStoreNames.contains('files')) db.createObjectStore('files',{keyPath:'id',autoIncrement:true}); }; r.onsuccess = e => { db = e.target.result; res(db); }; r.onerror = e => rej(e.target.error); });}
  function addApp(app){ return new Promise((res,rej)=>{ const t=db.transaction(['applications'],'readwrite'); const s=t.objectStore('applications'); const r=s.add(app); r.onsuccess = e => res(e.target.result); r.onerror = e => rej(e.target.error); });}
  function addFile(rec){ return new Promise((res,rej)=>{ const t=db.transaction(['files'],'readwrite'); const s=t.objectStore('files'); const r=s.add(rec); r.onsuccess = e => res(e.target.result); r.onerror = e => rej(e.target.error); });}
  function getAllApps(){ return new Promise((res,rej)=>{ const t=db.transaction(['applications'],'readonly'); const s=t.objectStore('applications'); const r=s.getAll(); r.onsuccess = e => res(e.target.result); r.onerror = e => rej(e.target.error); });}
  function getAllFiles(){ return new Promise((res,rej)=>{ const t=db.transaction(['files'],'readonly'); const s=t.objectStore('files'); const r=s.getAll(); r.onsuccess = e => res(e.target.result); r.onerror = e => rej(e.target.error); });}
  function deleteApp(id){ return new Promise((res,rej)=>{ const t=db.transaction(['applications','files'],'readwrite'); const a=t.objectStore('applications'); const f=t.objectStore('files'); a.delete(Number(id)); const g=f.getAll(); g.onsuccess = e => { e.target.result.forEach(file=>{ if(file.applicationId==id) f.delete(file.id); }); }; t.oncomplete = ()=>res(); t.onerror = e => rej(e.target.error); });}
  return {open,addApp,addFile,getAllApps,getAllFiles,deleteApp};
})();