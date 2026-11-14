// Copies the live web game into www/ for the native apps and swaps the two
// CDN files (PeerJS, Google Fonts) for local copies so the app works offline.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..'),app=path.join(__dirname,'..'),www=path.join(app,'www');
fs.rmSync(www,{recursive:true,force:true});fs.mkdirSync(path.join(www,'vendor','fonts'),{recursive:true});
for(const f of ['icon.png','cover.jpg','hats.png','privacy.html','support.html'])
  if(fs.existsSync(path.join(root,f)))fs.copyFileSync(path.join(root,f),path.join(www,f));
const nm=p=>path.join(app,'node_modules',p);
fs.copyFileSync(nm('peerjs/dist/peerjs.min.js'),path.join(www,'vendor','peerjs.min.js'));
const fonts=[['Bungee',400,'@fontsource/bungee/files/bungee-latin-400-normal.woff2'],
  ...[400,600,700].map(w=>['Chakra Petch',w,`@fontsource/chakra-petch/files/chakra-petch-latin-${w}-normal.woff2`])];
let css='';
for(const [fam,w,src] of fonts){const name=path.basename(src);fs.copyFileSync(nm(src),path.join(www,'vendor','fonts',name));
  css+=`@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(fonts/${name}) format('woff2')}\n`}
fs.writeFileSync(path.join(www,'vendor','fonts.css'),css);
// BOLT_SRC lets a store build use a saved copy of the game (for example the last released one).
let html=fs.readFileSync(process.env.BOLT_SRC?path.resolve(process.env.BOLT_SRC):path.join(root,'index.html'),'utf8');
const swap=(from,to)=>{if(!html.includes(from))throw new Error('index.html no longer contains '+from);html=html.replace(from,()=>to)};
swap(/href="https:\/\/fonts\.googleapis\.com\/css2[^"]*"/.exec(html)?.[0]||'fonts.googleapis.com','href="vendor/fonts.css"');
swap('src="https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js"','src="vendor/peerjs.min.js"');
html=html.replace('href="/icon.png"','href="icon.png"');
// Store builds: pictures are free in 1.0, so drop the "at launch" web price notes (paid extras must go through the stores' own purchases).
swap(`<p class="note" style="font-size:12px">Free while we're testing. At launch: $0.99 per picture.</p>`,'');
html=html.split(' Free while testing. At launch: $2.99 each, or packs of 5 for $9.99 and 10 for $14.99.').join('');
// The web Idea Box is Knox's beta line to Claude and Dad; store players get a plain "send us an idea" box (no beta labels, which store review rejects).
swap('💡 Send an idea to Claude (beta)','💡 Send us an idea');
html=html.split('Bolt Squad is in testing. Tell us what to add or fix.').join('Tell us what to add or fix.');
html=html.split('Tell Claude all about it:').join('Tell us all about it:');
html=html.split('It goes straight to Claude and Dad.').join('It goes straight to the Bolt Squad team.');
if(/\b(beta|in testing|Claude and Dad)\b/i.test(html.replace(/BETA_IDEAS|'beta-1'/g,'')))throw new Error('beta wording is left in the app build');
// Store apps: no free-text Idea Box (COPPA / Google Families). Shared photo faces are back in 1.1 as paid photo passes (below).
swap('const BETA_IDEAS=true;','const BETA_IDEAS=false;');
swap('</head>','<style>#openIdea,#endIdea,#idea{display:none!important}</style></head>');
// Store apps: the cloud backup leaves photo faces out (a shared one goes only to the review queue) (only coins, points and skins go up).
swap('const data=JSON.stringify(save);','const data=JSON.stringify(Object.assign({},save,{photos:[],photo:null,photoSel:-1}));');
swap('Your coins, points, skins and photos are backed up online.','Your coins, points and skins are backed up online. Photo faces stay on this device unless you share one.');
swap('Approved pictures can be edited again with new filters and stay approved. ','');
swap('Only you can see it unless a grown-up approves it.','Only you can see it. To show it to other players, a grown-up gets a photo pass and our team checks the picture first.');
// Store apps 1.1+: sharing a photo face costs a photo pass (Apple / Google in-app purchase, see photo-pass.js).
// Every shared picture still waits on review.html until Robert approves it; a denied picture gives the pass back.
// The purchase plugin (capacitor-plugin-cdv-purchase) is bundled into one script that sets window.CdvPurchase.
const iapLib=require('esbuild').buildSync({stdin:{contents:"import {CdvPurchase} from 'capacitor-plugin-cdv-purchase';window.CdvPurchase=CdvPurchase;",resolveDir:app},bundle:true,format:'iife',target:['chrome58','safari13'],minify:true,write:false}).outputFiles[0].text;
swap('</body>','<script>'+iapLib.split('</script').join('<\\/script')+'</script><script>'+fs.readFileSync(path.join(__dirname,'photo-pass.js'),'utf8')+'</script></body>');
swap(`st.textContent='A grown-up checks every picture before other players can see it.';btn.hidden=false;btn.textContent='Send for approval';return`,
  `st.textContent=BoltPay.status();btn.hidden=false;btn.textContent=BoltPay.button();return`);
swap(`$('#pubSend').onclick=async()=>{\n  if(!save.photo)return;`,`$('#pubSend').onclick=async()=>{\n  if(!save.photo)return;if(!(await BoltPay.take(()=>$('#pubSend').onclick())))return;`);
swap(`status:{stringValue:'pending'},reports:{integerValue:'0'},ver:{integerValue:String(ver)}};`,`status:{stringValue:'pending'},reports:{integerValue:'0'},ver:{integerValue:String(ver)},paid:{stringValue:BoltPay.tag()}};`);
swap(`catch(e){$('#pubStatus').textContent='Could not send. Wait a minute and try again.'}`,`catch(e){BoltPay.giveBack();$('#pubStatus').textContent='Could not send. Your photo pass is saved. Wait a minute and try again.'}`);
swap(`st.textContent='That picture was not approved. Try a different one.'`,`st.textContent=BoltPay.denied(save.faceVer)?'That picture was not approved, so your photo pass came back. Try a different one.':'That picture was not approved. Try a different one.'`);
// support@boltsquadgames.com has no mailbox, so "new picture to approve" emails go to Robert directly.
swap(`const NOTIFY_TO='support@boltsquadgames.com';`,`const NOTIFY_TO='robert@vilasi.co';`);
if(html.includes('const data=JSON.stringify(save);'))throw new Error('photos would still go into the cloud backup');
if(html.includes('At launch'))throw new Error('a price note is left in the app build');
// Store builds: slow phones draw the game at a lower resolution (see compat.js speed guard).
swap('dpr=Math.min(2,window.devicePixelRatio||1)','dpr=Math.min(window.__dprCap||2,window.devicePixelRatio||1)');
// Store builds: rewrite newer JS/CSS so older Android WebViews can run the game (Play rejected 1.0.1 as unresponsive).
html=require('./compat')(html);
fs.writeFileSync(path.join(www,'index.html'),html);
console.log('www/ ready');
