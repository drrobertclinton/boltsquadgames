// Photo passes: the store apps' paid "share my photo face" option.
// A player pays (through Apple or Google in-app purchase) for a photo pass, then sends a picture.
// Every picture still waits in the review page until Robert approves it. If he denies it, the pass comes back.
// A grown-up gate (a math question plus a consent box) comes before every purchase, and the store's
// own payment sheet (or Ask to Buy / Family Link) is the parent's OK for the upload (COPPA).
// build-www.js inlines this file into the app's index.html. It is never loaded on the website.
(function(){
  var IDS={'com.vilasi.boltsquad.photo1':1,'com.vilasi.boltsquad.photo5':5,'com.vilasi.boltsquad.photo10':10};
  var KEY='bsPhotoPasses';
  var S;try{S=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  S=S&&typeof S==='object'?S:{n:0,seen:{},back:{},tags:[]};S.seen=S.seen||{};S.back=S.back||{};S.tags=S.tags||[];
  function keep(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
  var store=null,platform=null,ready=false,waiting=false,lastTag='',onBought=null;
  function price(id,fallback){try{var p=store&&store.get(id,platform);var pr=p&&p.pricing;return pr&&pr.price||fallback}catch(e){return fallback}}
  function grant(t){
    if(!t||!t.transactionId||S.seen[t.transactionId])return false;
    var n=0;(t.products||[]).forEach(function(p){n+=IDS[p.id]||0});if(!n)return false;
    S.seen[t.transactionId]=1;S.n+=n;S.tags.push((t.platform===CdvPurchase.Platform.APPLE_APPSTORE?'apple:':'google:')+t.transactionId);keep();return true;
  }
  function setup(){
    if(!window.CdvPurchase||!CdvPurchase.store)return;
    store=CdvPurchase.store;var P=CdvPurchase.Platform,T=CdvPurchase.ProductType;
    platform=/android/i.test(navigator.userAgent)?P.GOOGLE_PLAY:P.APPLE_APPSTORE;
    store.register(Object.keys(IDS).map(function(id){return{id:id,type:T.CONSUMABLE,platform:platform}}));
    store.when()
      .pending(function(){waiting=true;try{refreshPub()}catch(e){}})
      .approved(function(t){waiting=false;var got=grant(t);t.finish();if(got){try{toast('Photo pass ready! Sending your picture...',2.5)}catch(e){}var f=onBought;onBought=null;if(f)f();else try{refreshPub()}catch(e){}}})
      .productUpdated(function(){try{refreshPub()}catch(e){}});
    store.error(function(err){if(err&&err.code===CdvPurchase.ErrorCode.PAYMENT_CANCELLED)return;try{toast('The store said: '+(err&&err.message||'something went wrong')+'. No money was taken.',3.5)}catch(e){}});
    store.initialize([platform]).then(function(){ready=true;try{refreshPub()}catch(e){}});
  }
  if(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform())setTimeout(setup,0);else document.addEventListener('deviceready',setup,false);

  // Grown-up gate: a multiplication question kids under 9 can't guess, then a plain-words consent box.
  function gate(){return new Promise(function(done){
    var a=6+Math.floor(Math.random()*4),b=6+Math.floor(Math.random()*4);
    var o=document.createElement('div');o.id='passGate';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Grown-ups only');
    o.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(2,10,18,.88);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto';
    var tiers=[['com.vilasi.boltsquad.photo1','1 photo pass',price('com.vilasi.boltsquad.photo1','$2.99')],['com.vilasi.boltsquad.photo5','5 photo passes',price('com.vilasi.boltsquad.photo5','$9.99')],['com.vilasi.boltsquad.photo10','10 photo passes',price('com.vilasi.boltsquad.photo10','$14.99')]];
    o.innerHTML='<div style="background:#0c2840;border:2px solid #24506b;border-radius:16px;max-width:420px;width:100%;padding:18px;display:grid;gap:12px;color:#e8f4f8">'+
      '<h3 style="margin:0;font-family:Bungee,sans-serif;color:#ffd166">Grown-ups only</h3>'+
      '<div id="pgQ"><p class="note" style="margin:0 0 8px">To keep going, what is '+a+' × '+b+'?</p><input id="pgA" inputmode="numeric" autocomplete="off" aria-label="Answer" style="font:inherit;font-size:18px;padding:10px;border-radius:10px;border:2px solid #24506b;background:#081a2a;color:#e8f4f8;width:120px"> <button class="big" id="pgGo">Next</button><p class="note" id="pgErr" style="color:#ff4d6d;margin:6px 0 0" hidden>Not quite. Ask a grown-up.</p></div>'+
      '<div id="pgC" hidden><p class="note" style="margin:0">A photo pass lets your child show one picture on their robot\'s face to other players. Here is what happens:</p>'+
      '<ul class="note" style="margin:6px 0;padding-left:18px;display:grid;gap:4px"><li>The picture is sent to the Bolt Squad team (stored in Google Firebase).</li><li>A grown-up on our team checks every picture. Pets, toys, drawings and things are fine. Pictures of people\'s faces, words, or anything not right for kids are denied.</li><li>Other players see it only after it is approved. If it is denied, the pass comes back.</li><li>Email robert@vilasi.co any time to delete it.</li></ul>'+
      '<label class="note" style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" id="pgOk"> I am the parent or guardian and I agree.</label>'+
      '<div id="pgTiers" style="display:grid;gap:8px"></div></div>'+
      '<button class="big ghost" id="pgNo">Cancel</button></div>';
    document.body.appendChild(o);
    var q=function(s){return o.querySelector(s)};
    var close=function(v){o.remove();done(v)};
    q('#pgNo').onclick=function(){close(null)};
    q('#pgGo').onclick=function(){if(+q('#pgA').value===a*b){q('#pgQ').hidden=true;q('#pgC').hidden=false}else{q('#pgErr').hidden=false;q('#pgA').value=''}};
    q('#pgA').onkeydown=function(e){if(e.key==='Enter')q('#pgGo').click()};
    tiers.forEach(function(t){var b2=document.createElement('button');b2.className='big';b2.textContent=t[1]+' · '+t[2];b2.disabled=true;b2.onclick=function(){close(t[0])};q('#pgTiers').appendChild(b2)});
    q('#pgOk').onchange=function(){o.querySelectorAll('#pgTiers button').forEach(function(x){x.disabled=!q('#pgOk').checked})};
    setTimeout(function(){try{q('#pgA').focus()}catch(e){}},50);
  })}

  window.BoltPay={
    count:function(){return S.n},
    tag:function(){return lastTag},
    status:function(){
      var base='A grown-up on our team checks every picture before other players can see it. ';
      if(waiting)return base+'Waiting for a grown-up to OK the purchase.';
      if(S.n>0)return base+'You have '+S.n+' photo pass'+(S.n>1?'es':'')+'.';
      if(!store)return base+'Photo passes are not available right now.';
      return base+'Photo pass: '+price('com.vilasi.boltsquad.photo1','$2.99')+' each, 5 for '+price('com.vilasi.boltsquad.photo5','$9.99')+', 10 for '+price('com.vilasi.boltsquad.photo10','$14.99')+'.';
    },
    button:function(){return S.n>0?'Send for approval (uses 1 pass)':'Get a photo pass'},
    // Returns true when a pass was used for this send. Otherwise starts a purchase (the send runs again once it is paid).
    take:async function(resend){
      if(S.n>0){S.n--;lastTag=S.tags.shift()||'paid';keep();return true}
      if(!store||!ready){try{toast('The store is not ready yet. Check your internet and try again.',3)}catch(e){}return false}
      var id=await gate();if(!id)return false;
      var p=store.get(id,platform),offer=p&&p.getOffer();
      if(!offer){try{toast('That photo pass is not for sale right now.',3)}catch(e){}return false}
      onBought=resend||null;
      var err=await offer.order();if(err)onBought=null;
      return false;
    },
    // The send failed after a pass was used: put it back.
    giveBack:function(){S.n++;if(lastTag)S.tags.unshift(lastTag);lastTag='';keep()},
    // Robert denied the picture sent with version `ver`: the pass comes back once.
    denied:function(ver){var k=String(ver||'');if(!k||S.back[k])return false;S.back[k]=1;S.n++;keep();return true}
  };
})();
