/* YazFit service worker — offline cache + notification focus */
'use strict';
const CACHE='yazfit-v1';
const ASSETS=[
  './','./index.html','./styles.css','./data.js','./engine.js',
  './app-views.js','./app-core.js','./manifest.json',
  './icons/icon.svg','./icons/icon-maskable.svg','./assets/hero-bg.jpg','./assets/yazfit-hero.jpg'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(ASSETS.map(a=>c.add(a)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window'}).then(cs=>{
    const c=cs[0];if(c)return c.focus();
    return self.clients.openWindow('./index.html');
  }));
});
