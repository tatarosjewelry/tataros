const OWNER = "tatarosjewelry";
const REPO = "tataros";
const BRANCH = "main";
const PRODUCTS_PATH = "data/products.json";
const ALLOWED_ORIGIN = "https://tatarosjewelry.github.io";
const SESSION_SECONDS = 8 * 60 * 60;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  }});
}
function b64url(bytes) {
  let s = "";
  for (let i=0;i<bytes.length;i+=0x8000) s += String.fromCharCode(...bytes.subarray(i,i+0x8000));
  return btoa(s).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
}
function fromB64url(s) {
  s=s.replace(/-/g,"+").replace(/_/g,"/");
  return Uint8Array.from(atob(s+"=".repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
}
async function hmacKey(secret) {
  return crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]);
}
async function makeSession(secret) {
  const payload=b64url(new TextEncoder().encode(JSON.stringify({exp:Math.floor(Date.now()/1000)+SESSION_SECONDS})));
  const sig=new Uint8Array(await crypto.subtle.sign("HMAC",await hmacKey(secret),new TextEncoder().encode(payload)));
  return payload+"."+b64url(sig);
}
async function validSession(token,secret) {
  try {
    const [payload,signature,...rest]=String(token||"").split(".");
    if(!payload||!signature||rest.length) return false;
    const data=JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if(!Number.isInteger(data.exp)||data.exp<Math.floor(Date.now()/1000)) return false;
    return await crypto.subtle.verify("HMAC",await hmacKey(secret),fromB64url(signature),new TextEncoder().encode(payload));
  } catch { return false; }
}
function decodeBase64Utf8(value) {
  const binary=atob(value.replace(/\s/g,""));
  return new TextDecoder().decode(Uint8Array.from(binary,c=>c.charCodeAt(0)));
}
function encodeBase64Utf8(value) {
  const bytes=new TextEncoder().encode(value); let binary="";
  for(let i=0;i<bytes.length;i+=0x8000) binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
  return btoa(binary);
}
async function github(path,method,body,env) {
  const response=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,{
    method:method||"GET",
    headers:{Authorization:`Bearer ${env.GITHUB_TOKEN}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"Tataros-Product-Manager","Content-Type":"application/json"},
    body:body?JSON.stringify(body):undefined
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(result.message||`GitHub API error: ${response.status}`);
  return result;
}
async function readProducts(env) {
  const file=await github(PRODUCTS_PATH,"GET",null,env);
  const data=JSON.parse(decodeBase64Utf8(file.content));
  return {file,products:Array.isArray(data.products)?data.products:[]};
}
async function saveProducts(file,products,message,env) {
  return github(PRODUCTS_PATH,"PUT",{message,content:encodeBase64Utf8(JSON.stringify({products},null,2)+"\n"),sha:file.sha,branch:BRANCH},env);
}
async function saveImage(input,env) {
  if(!input.imageBase64) return null;
  const mime=input.mimeType||({jpeg:"image/jpeg",jpg:"image/jpeg",png:"image/png",webp:"image/webp"})[input.extension];
  const ext=({"image/jpeg":"jpg","image/png":"png","image/webp":"webp"})[mime];
  if(!ext) throw new Error("فرمت عکس باید JPG، PNG یا WEBP باشد.");
  const raw=String(input.imageBase64);
  if(raw.length>Math.ceil(MAX_IMAGE_BYTES*4/3)+8) throw new Error("حجم عکس باید کمتر از ۵ مگابایت باشد.");
  const path=`images/product-${Date.now()}-${crypto.randomUUID().slice(0,8)}.${ext}`;
  await github(path,"PUT",{message:`Add Tataros product image ${path.split("/").pop()}`,content:raw,branch:BRANCH},env);
  return `/tataros/${path}`;
}
function validate(input) {
  if(!input||typeof input.name!=="string"||!input.name.trim()||input.name.length>120) throw new Error("نام محصول را درست وارد کنید.");
  if(!["rings","gemstones","tasbih"].includes(input.category)) throw new Error("دسته‌بندی محصول معتبر نیست.");
  if(input.price&&!/^\d+$/.test(String(input.price).replace(/,/g,""))) throw new Error("قیمت باید فقط عدد باشد.");
  if(String(input.description||"").length>1000) throw new Error("توضیحات بیش از حد طولانی است.");
}
export default {
  async fetch(request,env) {
    if(request.method==="OPTIONS") return new Response(null,{status:204,headers:{
      "Access-Control-Allow-Origin":ALLOWED_ORIGIN,"Access-Control-Allow-Methods":"GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":"Content-Type, Authorization","Access-Control-Max-Age":"86400","Vary":"Origin"
    }});
    const url=new URL(request.url);
    if(url.origin!== "https://ancient-resonance-6fa3.tatarosjewelry.workers.dev") return json({error:"درخواست نامعتبر است."},403);
    if(url.pathname==="/login"&&request.method==="POST") {
      if(!env.ADMIN_PASSWORD) return json({error:"ADMIN_PASSWORD secret تنظیم نشده است."},500);
      const body=await request.json().catch(()=>({}));
      const supplied=String(body.password||"");
      if(supplied.length<1||supplied.length>256) return json({error:"رمز نادرست است."},401);
      const a=new TextEncoder().encode(supplied),b=new TextEncoder().encode(env.ADMIN_PASSWORD);
      let diff=a.length^b.length; for(let i=0;i<Math.max(a.length,b.length);i++) diff|=(a[i]||0)^(b[i]||0);
      if(diff!==0) return json({error:"رمز مدیر اشتباه است."},401);
      return json({success:true,token:await makeSession(env.ADMIN_PASSWORD),expiresIn:SESSION_SECONDS});
    }
    if(url.pathname!=="/products") return json({error:"مسیر درخواست پیدا نشد."},404);
    if(!env.GITHUB_TOKEN) return json({error:"GITHUB_TOKEN secret is missing."},500);
    try {
      if(request.method==="GET") { const {products}=await readProducts(env); return json({products}); }
      if(!env.ADMIN_PASSWORD) return json({error:"ADMIN_PASSWORD secret is missing."},500);
      const auth=request.headers.get("Authorization")||"";
      if(!auth.startsWith("Bearer ")||!await validSession(auth.slice(7),env.ADMIN_PASSWORD)) return json({error:"نشست مدیر معتبر نیست؛ دوباره وارد شو."},401);
      if(request.method==="POST") {
        const input=await request.json(); validate(input);
        const image=await saveImage(input,env); if(!image) throw new Error("لطفاً عکس محصول را انتخاب کنید.");
        const {file,products}=await readProducts(env);
        products.push({name:input.name.trim(),category:input.category,price:input.price?String(input.price).replace(/,/g,""):"",description:String(input.description||"").trim(),image});
        await saveProducts(file,products,`Add product: ${input.name.trim()}`,env);
        return json({success:true,products});
      }
      if(request.method==="PUT"||request.method==="DELETE") {
        const index=Number(url.searchParams.get("index"));
        if(!Number.isInteger(index)||index<0) return json({error:"شناسه محصول نامعتبر است."},400);
        const {file,products}=await readProducts(env);
        if(index>=products.length) return json({error:"محصول پیدا نشد."},404);
        if(request.method==="DELETE") {
          const removed=products.splice(index,1)[0];
          await saveProducts(file,products,`Delete product: ${removed.name||index}`,env);
          return json({success:true,products});
        }
        const input=await request.json(); validate(input);
        const image=await saveImage(input,env);
        products[index]={...products[index],name:input.name.trim(),category:input.category,price:input.price?String(input.price).replace(/,/g,""):"",description:String(input.description||"").trim(),image:image||products[index].image};
        await saveProducts(file,products,`Update product: ${input.name.trim()}`,env);
        return json({success:true,products});
      }
      return json({error:"روش درخواست پشتیبانی نمی‌شود."},405);
    } catch(error) { return json({error:error.message||"خطای ناشناخته"},500); }
  }
};
