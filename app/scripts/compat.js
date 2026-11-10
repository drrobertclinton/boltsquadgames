// Store builds: make the game run on older Android phones and slower devices.
// Google Play review tests on a range of devices, some with an older Android System WebView.
// The web game uses newer JavaScript (?. ?? replaceAll) and CSS (inset, dvh, min()/max()),
// which an older WebView cannot read: the screens lose their size (no scrolling) and every
// button stops working. Here we rewrite the JS and CSS for Chrome 58+ and add a speed guard.
const esbuild=require('esbuild');
const TARGET=['chrome58'];
module.exports=function compat(html){
  let nStyle=0,nScript=0;
  // inset (Chrome 87+) -> top/right/bottom/left, everywhere: style blocks, style="" and JS strings.
  html=html.replace(/(^|[;{\s"'`])inset:\s*([^;}"'`!]+?)(\s*!important)?(?=[;}"'`])/gm,(m,pre,v,imp)=>{
    const a=v.trim().split(/\s+/);if(a.length>4||!a.length)return m;
    const [t,r=t,b=t,l=r]=a;imp=imp||'';
    return `${pre}top:${t}${imp};right:${r}${imp};bottom:${b}${imp};left:${l}${imp}`});
  html=html.replace(/<style>([\s\S]*?)<\/style>/g,(m,css)=>{nStyle++;
    // dvh is newer than vh: put a vh line first so old WebViews still get a size.
    css=css.replace(/(max-height|min-height|height):([^;{}]*dvh[^;{}]*)/g,(d,p,v)=>`${p}:${v.replace(/dvh/g,'vh')};${p}:${v}`);
    // min()/max()/clamp() (Chrome 79+): put a plain value first for older WebViews.
    css=css.replace(/([;{]\s*)([a-z-]+):\s*(min|max|clamp)\(([^()]*)\)\s*(?=[;}])/g,(m,pre,p,fn,args)=>{
      const a=args.split(',').map(x=>x.trim());const fb=fn==='clamp'?a[1]:a[0];
      if(!fb||/[()]/.test(fb))return m;return `${pre}${p}:${fb};${p}:${fn}(${args})`});
    const out=esbuild.transformSync(css,{loader:'css',target:TARGET,minify:false}).code;
    return '<style>'+out+'</style>'});
  html=html.replace(/<script>([\s\S]*?)<\/script>/g,(m,js)=>{nScript++;
    const out=esbuild.transformSync(js,{loader:'js',target:TARGET,format:undefined,minifyWhitespace:false}).code;
    if(out.includes('</script'))throw new Error('script text contains </script');
    return '<script>'+out+'</script>'});
  if(!nStyle||!nScript)throw new Error('compat: no inline style or script found');
  const guard=`<script>
/* Older WebViews: small polyfills the game uses. */
if(!String.prototype.replaceAll)String.prototype.replaceAll=function(a,b){return typeof a==='string'?this.split(a).join(typeof b==='function'?b(a):b):this.replace(a,b)};
if(!Array.prototype.flat)Array.prototype.flat=function(d){d=d===undefined?1:d;return this.reduce(function(r,x){return r.concat(Array.isArray(x)&&d>0?x.flat(d-1):x)},[])};
if(!Object.fromEntries)Object.fromEntries=function(it){var o={};Array.from(it).forEach(function(e){o[e[0]]=e[1]});return o};
/* Speed guard: if frames are slow, draw the game at a lower resolution so touch stays responsive. */
window.__dprCap=2;
(function(){var last=0,t0=0,n=0,slow=0;function tick(t){if(last&&t-last<1000){n++;if(t-last>40)slow++}last=t;if(!t0)t0=t;if(t-t0>2000){if(n>=8&&slow>n/2&&window.__dprCap>1){window.__dprCap=window.__dprCap>1.5?1.5:1;try{resize()}catch(e){}}t0=t;n=0;slow=0}requestAnimationFrame(tick)}requestAnimationFrame(tick)})();
</script>`;
  html=html.replace('<head>','<head>'+guard);
  return html;
};
