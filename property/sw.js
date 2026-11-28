// MRC Properties – offline cache. Page: network first (gets updates), fallback cache. Libraries & icons: cache first.
const C='mrc-v52';
const PRE=['./','index.html','icon-180.png','icon-512.png','manifest.json',
 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js'];
const add=(c,u)=>c.add(new Request(u,{mode:u.startsWith('http')?'no-cors':'same-origin'})).catch(()=>{});
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(PRE.map(u=>add(c,u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||/supabase\.co$/.test(u.hostname))return; // live data always goes to the server
  const page=r.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/property/');
  if(page){e.respondWith(fetch(r.url,{cache:'no-store',credentials:'same-origin'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put('index.html',cp))}return res})
    .catch(()=>caches.match('index.html',{ignoreSearch:true}).then(h=>h||caches.match('./',{ignoreSearch:true})).then(h=>h||fetch(r))));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).catch(()=>null).then(h=>h||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})));
});
