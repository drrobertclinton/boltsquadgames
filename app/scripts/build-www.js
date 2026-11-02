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
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const swap=(from,to)=>{if(!html.includes(from))throw new Error('index.html no longer contains '+from);html=html.replace(from,to)};
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
// Store 1.0 keeps photo faces on the device only: no uploading kids' pictures for sharing (COPPA / Google Families).
// Store apps: no face uploads and no free-text Idea Box (COPPA / Google Families).
swap('const BETA_IDEAS=true;','const BETA_IDEAS=false;');
swap('</head>','<style>#pubBox,#openIdea,#endIdea,#idea{display:none!important}</style></head>');
if(html.includes('At launch'))throw new Error('a price note is left in the app build');
fs.writeFileSync(path.join(www,'index.html'),html);
console.log('www/ ready');
