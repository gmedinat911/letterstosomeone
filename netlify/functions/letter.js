const {createHash,randomBytes,timingSafeEqual}=require('node:crypto');
const WINDOW=15*60*1000,COOKIE='wood_session',STATE='wood:state';
const headers={'Cache-Control':'no-store, private, max-age=0','Content-Type':'application/json; charset=utf-8','X-Robots-Tag':'noindex, nofollow, noarchive','Referrer-Policy':'no-referrer'};
const json=(statusCode,data,extra={})=>({statusCode,headers:{...headers,...extra},body:JSON.stringify(data)});
const hash=s=>createHash('sha256').update(String(s)).digest('hex');
const equal=(a,b)=>{const x=Buffer.from(hash(a),'hex'),y=Buffer.from(hash(b),'hex');return timingSafeEqual(x,y)};
const cookies=s=>Object.fromEntries((s||'').split(';').map(v=>v.trim().split('=').map(decodeURIComponent)).filter(v=>v.length===2));
async function redis(cmd){const u=process.env.UPSTASH_REDIS_REST_URL,t=process.env.UPSTASH_REDIS_REST_TOKEN;if(!u||!t)throw Error();const r=await fetch(u,{method:'POST',headers:{Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify(cmd)});const j=await r.json();if(!r.ok||j.error)throw Error();return j.result}
async function state(){const raw=await redis(['GET',STATE]);return raw?JSON.parse(raw):{allowedReads:1,usedReads:0,revoked:false,active:null}}
async function save(s){await redis(['SET',STATE,JSON.stringify(s)])}
exports.handler=async event=>{if(event.httpMethod!=='POST')return json(405,{status:'invalid'});const key=process.env.LETTER_ACCESS_KEY,letter=process.env.LETTER_BODY_BASE64;if(!key||!letter)return json(503,{status:'not_configured'});let b;try{b=JSON.parse(event.body||'{}')}catch{return json(400,{status:'invalid'})}if(b.action!=='open'||typeof b.key!=='string'||!equal(b.key,key))return json(404,{status:'unavailable'});
try{let s=await state();if(s.revoked)return json(403,{status:'revoked'});const now=Date.now(),c=cookies(event.headers.cookie||event.headers.Cookie)[COOKIE],ch=c?hash(c):null;
if(s.active&&now<s.active.expiresAt){if(ch!==s.active.session)return json(409,{status:'active_elsewhere'});return json(200,{status:'open',expiresAt:s.active.expiresAt,letter:Buffer.from(letter,'base64').toString('utf8')})}
if(s.active&&now>=s.active.expiresAt){s.active=null;await save(s)}
if(s.usedReads>=s.allowedReads)return json(410,{status:'expired'});
const token=randomBytes(32).toString('hex');s.usedReads++;s.active={session:hash(token),expiresAt:now+WINDOW};await save(s);
return json(200,{status:'open',expiresAt:s.active.expiresAt,letter:Buffer.from(letter,'base64').toString('utf8')},{'Set-Cookie':COOKIE+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=900'})}catch{return json(503,{status:'unavailable'})}};