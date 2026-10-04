// CricketPulse backend: zero dependencies, needs Node 22+.  Run: node server.js
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {DatabaseSync}=require('node:sqlite');
const PORT=process.env.PORT||3000,ORIGIN=process.env.ALLOWED_ORIGIN||'*';
const db=new DatabaseSync(process.env.DB_PATH||path.join(__dirname,'cricketpulse.db'));
db.exec(`create table if not exists users(id integer primary key,name text,email text unique,salt text,hash text,team text default '',type text default '',xp integer default 0,msgs integer default 0,seed integer default 0);
create table if not exists sessions(token text primary key,uid integer,ts integer);
create table if not exists preds(id integer primary key,uid integer,pick text,out text,ok integer,ts integer);
create table if not exists chat(id integer primary key,uid integer,name text,text text,ts integer);`);
if(!db.prepare('select 1 from users where seed=1').get()){ // demo fans so boards are not empty
 [['CricketQueen',640],['SixerFan',520],['BoundaryBoss',410],['WicketWatcher',380],['SpinStar',255]].forEach(([n,x])=>db.prepare('insert into users(name,email,xp,seed) values(?,?,?,1)').run(n,n+'@demo.local',x));
 [['CricketQueen','What a shot!'],['SixerFan','India Women are on fire today!'],['BoundaryBoss','That was a stunning catch!'],['SpinStar','The spin bowling has been incredible!']].forEach(([n,t],i)=>db.prepare('insert into chat(uid,name,text,ts) values(0,?,?,?)').run(n,t,Date.now()-(4-i)*60000));
}
const TYPES=['Power Player','Tactician','Team Spirit','Underdog Fan'],OUTS=['0','0','0','1','1','1','2','4','6','W'],PICKS=['0','1','2','4','6','W'];
const hash=(pw,salt)=>crypto.scryptSync(pw,salt,32).toString('hex');
const pub=u=>({name:u.name,email:u.email,team:u.team,type:u.type,xp:u.xp,msgs:u.msgs,
 preds:db.prepare('select pick p,out o,ok from preds where uid=? order by id desc limit 50').all(u.id).reverse().map(r=>({p:r.p,o:r.o,ok:!!r.ok}))});
const authed=req=>{const t=(req.headers.authorization||'').replace('Bearer ','');const s=t&&db.prepare('select uid from sessions where token=?').get(t);return s?db.prepare('select * from users where id=?').get(s.uid):null};
const newSession=uid=>{const t=crypto.randomBytes(24).toString('hex');db.prepare('insert into sessions values(?,?,?)').run(t,uid,Date.now());return t};
const hits=new Map();const limited=ip=>{const n=Date.now(),a=(hits.get(ip)||[]).filter(t=>n-t<60000);a.push(n);hits.set(ip,a);return a.length>60};
const send=(res,code,obj)=>{res.writeHead(code,{'Content-Type':'application/json','Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,PUT,OPTIONS'});res.end(JSON.stringify(obj))};
const body=req=>new Promise(r=>{let d='';req.on('data',c=>{d+=c;if(d.length>10000)req.destroy()});req.on('end',()=>{try{r(JSON.parse(d||'{}'))}catch(e){r({})}})});
const clean=(s,n)=>String(s||'').replace(/[<>]/g,'').trim().slice(0,n);
http.createServer(async(req,res)=>{
 const url=req.url.split('?')[0],ip=req.socket.remoteAddress;
 if(req.method=='OPTIONS')return send(res,204,{});
 if(req.method=='GET'&&(url=='/'||url=='/index.html')){try{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(fs.readFileSync(path.join(__dirname,'index.html')))}catch(e){return send(res,404,{error:'index.html not found'})}}
 if(!url.startsWith('/api/'))return send(res,404,{error:'Not found'});
 if(limited(ip))return send(res,429,{error:'Too many requests, slow down.'});
 try{
  if(url=='/api/health')return send(res,200,{ok:true});
  if(url=='/api/signup'&&req.method=='POST'){const b=await body(req),name=clean(b.name,30),email=clean(b.email,80).toLowerCase(),pw=String(b.password||'');
   if(!name||!/^\S+@\S+\.\S+$/.test(email)||pw.length<6)return send(res,400,{error:'Enter a name, valid email and a password of 6+ characters.'});
   if(db.prepare('select 1 from users where email=?').get(email))return send(res,409,{error:'That email is already registered. Try logging in.'});
   const salt=crypto.randomBytes(16).toString('hex'),r=db.prepare('insert into users(name,email,salt,hash) values(?,?,?,?)').run(name,email,salt,hash(pw,salt));
   return send(res,200,{token:newSession(Number(r.lastInsertRowid)),user:pub(db.prepare('select * from users where id=?').get(r.lastInsertRowid))})}
  if(url=='/api/login'&&req.method=='POST'){const b=await body(req),u=db.prepare('select * from users where email=?').get(clean(b.email,80).toLowerCase());
   if(!u||!u.salt||!crypto.timingSafeEqual(Buffer.from(hash(String(b.password||''),u.salt)),Buffer.from(u.hash)))return send(res,401,{error:'Wrong email or password.'});
   return send(res,200,{token:newSession(u.id),user:pub(u)})}
  if(url=='/api/leaderboard'){const me=authed(req);return send(res,200,{users:db.prepare('select id,name,xp from users order by xp desc limit 20').all().map(u=>({name:u.name,xp:u.xp,me:!!me&&me.id==u.id}))})}
  if(url=='/api/chat'&&req.method=='GET')return send(res,200,{messages:db.prepare('select name,text,ts from chat order by id desc limit 50').all().reverse()});
  const u=authed(req);if(!u)return send(res,401,{error:'Please log in.'});
  if(url=='/api/me'&&req.method=='GET')return send(res,200,pub(u));
  if(url=='/api/me'&&req.method=='PUT'){const b=await body(req),team=clean(b.team,8),type=TYPES.includes(b.type)?b.type:u.type,bonus=!u.type&&type?50:0;
   db.prepare('update users set team=?,type=?,xp=xp+? where id=?').run(team,type,bonus,u.id);return send(res,200,pub(db.prepare('select * from users where id=?').get(u.id)))}
  if(url=='/api/predict'&&req.method=='POST'){const b=await body(req);if(!PICKS.includes(b.pick))return send(res,400,{error:'Pick a valid outcome.'});
   const o=OUTS[crypto.randomInt(OUTS.length)],ok=o==b.pick;db.prepare('insert into preds(uid,pick,out,ok,ts) values(?,?,?,?,?)').run(u.id,b.pick,o,ok?1:0,Date.now());
   db.prepare('update users set xp=xp+? where id=?').run(ok?25:5,u.id);return send(res,200,{p:b.pick,o,ok,user:pub(db.prepare('select * from users where id=?').get(u.id))})}
  if(url=='/api/chat'&&req.method=='POST'){const t=clean((await body(req)).text,140);if(!t)return send(res,400,{error:'Message is empty.'});
   db.prepare('insert into chat(uid,name,text,ts) values(?,?,?,?)').run(u.id,u.name,t,Date.now());db.prepare('update users set msgs=msgs+1,xp=xp+5 where id=?').run(u.id);
   return send(res,200,{user:pub(db.prepare('select * from users where id=?').get(u.id))})}
  if(url=='/api/logout'){db.prepare('delete from sessions where uid=?').run(u.id);return send(res,200,{ok:true})}
  send(res,404,{error:'Not found'});
 }catch(e){console.error(e);send(res,500,{error:'Server error.'})}
}).listen(PORT,()=>console.log('CricketPulse running on http://localhost:'+PORT));
