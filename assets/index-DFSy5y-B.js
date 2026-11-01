(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const h of a.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&s(h)}).observe(document,{childList:!0,subtree:!0});function e(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(o){if(o.ep)return;o.ep=!0;const a=e(o);fetch(o.href,a)}})();const Su="https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg",Eu="https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png",ho={name:"New York (JFK/EWR)",lat:40.7128,lng:-74.006},Tu="wa_auth_user";function kc(){try{return JSON.parse(localStorage.getItem(Tu))}catch{return null}}const bu=/^[A-Za-z0-9À-ÖØ-öø-ÿ0-9 '’\-,.()&/]+/;function sl(r){if(!r)return r;const t=r.match(bu);return(t?t[0].trim():r).replace(/[\s,-]+$/,"")||r}const Hc="wa_static_atlas",ol=850;function al(r,t,e,s){const a=Math.PI/180,h=(e-r)*a,c=(s-t)*a,d=Math.sin(h/2)**2+Math.cos(r*a)*Math.cos(e*a)*Math.sin(c/2)**2;return 2*6371*Math.asin(Math.sqrt(d))}const uo=()=>{try{return JSON.parse(localStorage.getItem(Hc))||[]}catch{return[]}},ll=r=>localStorage.setItem(Hc,JSON.stringify(r));function wu(...r){let t=2166136261;const e=r.join("|");for(let s=0;s<e.length;s++)t^=e.charCodeAt(s),t=Math.imul(t,16777619);return t>>>0}const cl={status:"not_configured",message:"This is the static GitHub Pages demo — live web-search data needs the full backend (Vercel deployment or local server). See the README for how to run it."},Au={health:async()=>({status:"ok",static:!0,live:{live_data_agent:!1,places_google:!1}}),atlas:async()=>uo(),addToAtlas:async r=>{const e={id:`${(r.name||"place").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||"place"}-${wu(r.name,r.lat).toString(16).slice(0,4)}`,name:r.name,country:r.country||"",lat:r.lat,lng:r.lng,airport:r.airport||"",days:r.days||4,budgetLow:r.budgetLow||100,budgetHigh:r.budgetHigh||200,tagline:r.tagline||"",custom:!0},s=uo();return s.push(e),ll(s),e},removeFromAtlas:async r=>(ll(uo().filter(t=>t.id!==r)),{removed:r}),flights:async()=>({...cl,origin:"JFK"}),bestTime:async(r,t,e,s)=>{try{const o=new Date().getFullYear()-1,a=o-4,h=new URLSearchParams({latitude:e,longitude:s,start_date:`${a}-01-01`,end_date:`${o}-12-31`,daily:"temperature_2m_mean,precipitation_sum",timezone:"auto"}),c=await fetch(`https://archive-api.open-meteo.com/v1/archive?${h}`);if(!c.ok)throw new Error(String(c.status));const{daily:d}=await c.json(),f=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],p=Array.from({length:12},()=>[]),_=Array(12).fill(0);d.time.forEach((M,S)=>{const x=+M.slice(5,7)-1;d.temperature_2m_mean[S]!=null&&p[x].push(d.temperature_2m_mean[S]),d.precipitation_sum[S]!=null&&(_[x]+=d.precipitation_sum[S])});const v=f.map((M,S)=>{const x=p[S].reduce((b,D)=>b+D,0)/p[S].length,m=_[S]/5,P=Math.max(0,Math.min(100,100-Math.abs(x-22)*3.2-m*.18));return{month:S+1,month_name:M,avg_temp_c:Math.round(x*10)/10,rain_mm:Math.round(m),comfort_score:Math.round(P*10)/10}}),y=[...v].sort((M,S)=>S.comfort_score-M.comfort_score);return{status:"ok",destination:r,source:"open-meteo-era5",months:v,best_months:y.slice(0,3).map(M=>M.month_name),avoid_months:y.slice(-2).map(M=>M.month_name)}}catch{return{status:"error",message:"Climate data is unavailable at the moment."}}},tradeoff:async()=>({...cl}),planRoute:async(r,t=!1)=>{let e=r;if(t&&r.length>2){const a=[...r];e=[];let h=[40.7128,-74.006];for(;a.length;){let c=0,d=1/0;a.forEach((p,_)=>{const v=al(h[0],h[1],p.lat,p.lng);v<d&&(d=v,c=_)});const f=a.splice(c,1)[0];e.push(f),h=[f.lat,f.lng]}}const s=[];let o=0;for(let a=0;a<e.length-1;a++){const h=e[a],c=e[a+1],d=al(h.lat,h.lng,c.lat,c.lng);o+=d,s.push({from_name:h.name,to_name:c.name,distance_km:Math.round(d*10)/10,est_flight_hours:Math.round(d/ol*10)/10})}return{stops:e,legs:s,total_distance_km:Math.round(o*10)/10,total_flight_hours:Math.round(o/ol*10)/10,optimized:!!t}},places:async(r,t,e="",s=4e4)=>{const a=new URLSearchParams({q:e||"tourist attraction",format:"jsonv2",limit:"10","accept-language":"en",viewbox:`${t-1.2},${r+1.2},${t+1.2},${r-1.2}`,bounded:"1"}),d=(await(await fetch(`https://nominatim.openstreetmap.org/search?${a}`)).json()).map(f=>({name:sl((f.display_name||"").split(",")[0]),lat:+f.lat,lng:+f.lon,category:f.type,address:f.display_name,source:"nominatim"}));return{query:e,results:d,source:d.length?"nominatim":"unavailable"}},geocode:async r=>{const t=new URLSearchParams({q:r,format:"jsonv2",limit:"8",addressdetails:"1","accept-language":"en"}),o=(await(await fetch(`https://nominatim.openstreetmap.org/search?${t}`)).json()).map(a=>{var h;return{name:sl((a.display_name||"").split(",")[0]),lat:+a.lat,lng:+a.lon,category:a.type,address:a.display_name,country:(h=a.address)==null?void 0:h.country,source:"nominatim"}});return{query:r,results:o,source:o.length?"nominatim":"unavailable"}}},Hn=Au;/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ra="160",Lu=0,hl=1,Pu=2,Gc=1,Ru=2,Bn=3,ni=0,je=1,An=2,Qn=0,tr=1,ul=2,dl=3,fl=4,Cu=5,xi=100,Iu=101,Du=102,pl=103,ml=104,Uu=200,Nu=201,Ou=202,Fu=203,Xo=204,Zo=205,Bu=206,zu=207,ku=208,Hu=209,Gu=210,Vu=211,Wu=212,Xu=213,Zu=214,qu=0,Yu=1,ju=2,Ps=3,Ku=4,$u=5,Ju=6,Qu=7,sa=0,td=1,ed=2,ti=0,nd=1,id=2,rd=3,sd=4,od=5,ad=6,Vc=300,nr=301,ir=302,qo=303,Yo=304,Os=306,jo=1e3,yn=1001,Ko=1002,Ye=1003,_l=1004,fo=1005,un=1006,ld=1007,Rr=1008,ei=1009,cd=1010,hd=1011,oa=1012,Wc=1013,$n=1014,Jn=1015,Cr=1016,Xc=1017,Zc=1018,Mi=1020,ud=1021,Mn=1023,dd=1024,fd=1025,Si=1026,rr=1027,pd=1028,qc=1029,md=1030,Yc=1031,jc=1033,po=33776,mo=33777,_o=33778,go=33779,gl=35840,vl=35841,xl=35842,yl=35843,Kc=36196,Ml=37492,Sl=37496,El=37808,Tl=37809,bl=37810,wl=37811,Al=37812,Ll=37813,Pl=37814,Rl=37815,Cl=37816,Il=37817,Dl=37818,Ul=37819,Nl=37820,Ol=37821,vo=36492,Fl=36494,Bl=36495,_d=36283,zl=36284,kl=36285,Hl=36286,$c=3e3,Ei=3001,gd=3200,vd=3201,Jc=0,xd=1,fn="",ze="srgb",Gn="srgb-linear",aa="display-p3",Fs="display-p3-linear",Rs="linear",ve="srgb",Cs="rec709",Is="p3",Di=7680,Gl=519,yd=512,Md=513,Sd=514,Qc=515,Ed=516,Td=517,bd=518,wd=519,Vl=35044,Wl="300 es",$o=1035,kn=2e3,Ds=2001;class or{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const s=this._listeners;s[t]===void 0&&(s[t]=[]),s[t].indexOf(e)===-1&&s[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const s=this._listeners;return s[t]!==void 0&&s[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const o=this._listeners[t];if(o!==void 0){const a=o.indexOf(e);a!==-1&&o.splice(a,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const s=this._listeners[t.type];if(s!==void 0){t.target=this;const o=s.slice(0);for(let a=0,h=o.length;a<h;a++)o[a].call(this,t);t.target=null}}}const Ge=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Xl=1234567;const Ar=Math.PI/180,Ir=180/Math.PI;function ar(){const r=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,s=Math.random()*4294967295|0;return(Ge[r&255]+Ge[r>>8&255]+Ge[r>>16&255]+Ge[r>>24&255]+"-"+Ge[t&255]+Ge[t>>8&255]+"-"+Ge[t>>16&15|64]+Ge[t>>24&255]+"-"+Ge[e&63|128]+Ge[e>>8&255]+"-"+Ge[e>>16&255]+Ge[e>>24&255]+Ge[s&255]+Ge[s>>8&255]+Ge[s>>16&255]+Ge[s>>24&255]).toLowerCase()}function We(r,t,e){return Math.max(t,Math.min(e,r))}function la(r,t){return(r%t+t)%t}function Ad(r,t,e,s,o){return s+(r-t)*(o-s)/(e-t)}function Ld(r,t,e){return r!==t?(e-r)/(t-r):0}function Lr(r,t,e){return(1-e)*r+e*t}function Pd(r,t,e,s){return Lr(r,t,1-Math.exp(-e*s))}function Rd(r,t=1){return t-Math.abs(la(r,t*2)-t)}function Cd(r,t,e){return r<=t?0:r>=e?1:(r=(r-t)/(e-t),r*r*(3-2*r))}function Id(r,t,e){return r<=t?0:r>=e?1:(r=(r-t)/(e-t),r*r*r*(r*(r*6-15)+10))}function Dd(r,t){return r+Math.floor(Math.random()*(t-r+1))}function Ud(r,t){return r+Math.random()*(t-r)}function Nd(r){return r*(.5-Math.random())}function Od(r){r!==void 0&&(Xl=r);let t=Xl+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Fd(r){return r*Ar}function Bd(r){return r*Ir}function Jo(r){return(r&r-1)===0&&r!==0}function zd(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function Us(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function kd(r,t,e,s,o){const a=Math.cos,h=Math.sin,c=a(e/2),d=h(e/2),f=a((t+s)/2),p=h((t+s)/2),_=a((t-s)/2),v=h((t-s)/2),y=a((s-t)/2),M=h((s-t)/2);switch(o){case"XYX":r.set(c*p,d*_,d*v,c*f);break;case"YZY":r.set(d*v,c*p,d*_,c*f);break;case"ZXZ":r.set(d*_,d*v,c*p,c*f);break;case"XZX":r.set(c*p,d*M,d*y,c*f);break;case"YXY":r.set(d*y,c*p,d*M,c*f);break;case"ZYZ":r.set(d*M,d*y,c*p,c*f);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+o)}}function ji(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function Ze(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const Qo={DEG2RAD:Ar,RAD2DEG:Ir,generateUUID:ar,clamp:We,euclideanModulo:la,mapLinear:Ad,inverseLerp:Ld,lerp:Lr,damp:Pd,pingpong:Rd,smoothstep:Cd,smootherstep:Id,randInt:Dd,randFloat:Ud,randFloatSpread:Nd,seededRandom:Od,degToRad:Fd,radToDeg:Bd,isPowerOfTwo:Jo,ceilPowerOfTwo:zd,floorPowerOfTwo:Us,setQuaternionFromProperEuler:kd,normalize:Ze,denormalize:ji};class ie{constructor(t=0,e=0){ie.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,s=this.y,o=t.elements;return this.x=o[0]*e+o[3]*s+o[6],this.y=o[1]*e+o[4]*s+o[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(t,Math.min(e,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const s=this.dot(t)/e;return Math.acos(We(s,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,s=this.y-t.y;return e*e+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,s){return this.x=t.x+(e.x-t.x)*s,this.y=t.y+(e.y-t.y)*s,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const s=Math.cos(e),o=Math.sin(e),a=this.x-t.x,h=this.y-t.y;return this.x=a*s-h*o+t.x,this.y=a*o+h*s+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ne{constructor(t,e,s,o,a,h,c,d,f){ne.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,s,o,a,h,c,d,f)}set(t,e,s,o,a,h,c,d,f){const p=this.elements;return p[0]=t,p[1]=o,p[2]=c,p[3]=e,p[4]=a,p[5]=d,p[6]=s,p[7]=h,p[8]=f,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,s=t.elements;return e[0]=s[0],e[1]=s[1],e[2]=s[2],e[3]=s[3],e[4]=s[4],e[5]=s[5],e[6]=s[6],e[7]=s[7],e[8]=s[8],this}extractBasis(t,e,s){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),s.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const s=t.elements,o=e.elements,a=this.elements,h=s[0],c=s[3],d=s[6],f=s[1],p=s[4],_=s[7],v=s[2],y=s[5],M=s[8],S=o[0],x=o[3],m=o[6],P=o[1],b=o[4],D=o[7],B=o[2],C=o[5],U=o[8];return a[0]=h*S+c*P+d*B,a[3]=h*x+c*b+d*C,a[6]=h*m+c*D+d*U,a[1]=f*S+p*P+_*B,a[4]=f*x+p*b+_*C,a[7]=f*m+p*D+_*U,a[2]=v*S+y*P+M*B,a[5]=v*x+y*b+M*C,a[8]=v*m+y*D+M*U,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],s=t[1],o=t[2],a=t[3],h=t[4],c=t[5],d=t[6],f=t[7],p=t[8];return e*h*p-e*c*f-s*a*p+s*c*d+o*a*f-o*h*d}invert(){const t=this.elements,e=t[0],s=t[1],o=t[2],a=t[3],h=t[4],c=t[5],d=t[6],f=t[7],p=t[8],_=p*h-c*f,v=c*d-p*a,y=f*a-h*d,M=e*_+s*v+o*y;if(M===0)return this.set(0,0,0,0,0,0,0,0,0);const S=1/M;return t[0]=_*S,t[1]=(o*f-p*s)*S,t[2]=(c*s-o*h)*S,t[3]=v*S,t[4]=(p*e-o*d)*S,t[5]=(o*a-c*e)*S,t[6]=y*S,t[7]=(s*d-f*e)*S,t[8]=(h*e-s*a)*S,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,s,o,a,h,c){const d=Math.cos(a),f=Math.sin(a);return this.set(s*d,s*f,-s*(d*h+f*c)+h+t,-o*f,o*d,-o*(-f*h+d*c)+c+e,0,0,1),this}scale(t,e){return this.premultiply(xo.makeScale(t,e)),this}rotate(t){return this.premultiply(xo.makeRotation(-t)),this}translate(t,e){return this.premultiply(xo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),s=Math.sin(t);return this.set(e,-s,0,s,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,s=t.elements;for(let o=0;o<9;o++)if(e[o]!==s[o])return!1;return!0}fromArray(t,e=0){for(let s=0;s<9;s++)this.elements[s]=t[s+e];return this}toArray(t=[],e=0){const s=this.elements;return t[e]=s[0],t[e+1]=s[1],t[e+2]=s[2],t[e+3]=s[3],t[e+4]=s[4],t[e+5]=s[5],t[e+6]=s[6],t[e+7]=s[7],t[e+8]=s[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const xo=new ne;function th(r){for(let t=r.length-1;t>=0;--t)if(r[t]>=65535)return!0;return!1}function Dr(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function Hd(){const r=Dr("canvas");return r.style.display="block",r}const Zl={};function Pr(r){r in Zl||(Zl[r]=!0,console.warn(r))}const ql=new ne().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Yl=new ne().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),ns={[Gn]:{transfer:Rs,primaries:Cs,toReference:r=>r,fromReference:r=>r},[ze]:{transfer:ve,primaries:Cs,toReference:r=>r.convertSRGBToLinear(),fromReference:r=>r.convertLinearToSRGB()},[Fs]:{transfer:Rs,primaries:Is,toReference:r=>r.applyMatrix3(Yl),fromReference:r=>r.applyMatrix3(ql)},[aa]:{transfer:ve,primaries:Is,toReference:r=>r.convertSRGBToLinear().applyMatrix3(Yl),fromReference:r=>r.applyMatrix3(ql).convertLinearToSRGB()}},Gd=new Set([Gn,Fs]),pe={enabled:!0,_workingColorSpace:Gn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(r){if(!Gd.has(r))throw new Error(`Unsupported working color space, "${r}".`);this._workingColorSpace=r},convert:function(r,t,e){if(this.enabled===!1||t===e||!t||!e)return r;const s=ns[t].toReference,o=ns[e].fromReference;return o(s(r))},fromWorkingColorSpace:function(r,t){return this.convert(r,this._workingColorSpace,t)},toWorkingColorSpace:function(r,t){return this.convert(r,t,this._workingColorSpace)},getPrimaries:function(r){return ns[r].primaries},getTransfer:function(r){return r===fn?Rs:ns[r].transfer}};function er(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function yo(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let Ui;class eh{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Ui===void 0&&(Ui=Dr("canvas")),Ui.width=t.width,Ui.height=t.height;const s=Ui.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),e=Ui}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Dr("canvas");e.width=t.width,e.height=t.height;const s=e.getContext("2d");s.drawImage(t,0,0,t.width,t.height);const o=s.getImageData(0,0,t.width,t.height),a=o.data;for(let h=0;h<a.length;h++)a[h]=er(a[h]/255)*255;return s.putImageData(o,0,0),e}else if(t.data){const e=t.data.slice(0);for(let s=0;s<e.length;s++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[s]=Math.floor(er(e[s]/255)*255):e[s]=er(e[s]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Vd=0;class nh{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Vd++}),this.uuid=ar(),this.data=t,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const s={uuid:this.uuid,url:""},o=this.data;if(o!==null){let a;if(Array.isArray(o)){a=[];for(let h=0,c=o.length;h<c;h++)o[h].isDataTexture?a.push(Mo(o[h].image)):a.push(Mo(o[h]))}else a=Mo(o);s.url=a}return e||(t.images[this.uuid]=s),s}}function Mo(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?eh.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Wd=0;class $e extends or{constructor(t=$e.DEFAULT_IMAGE,e=$e.DEFAULT_MAPPING,s=yn,o=yn,a=un,h=Rr,c=Mn,d=ei,f=$e.DEFAULT_ANISOTROPY,p=fn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Wd++}),this.uuid=ar(),this.name="",this.source=new nh(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=s,this.wrapT=o,this.magFilter=a,this.minFilter=h,this.anisotropy=f,this.format=c,this.internalFormat=null,this.type=d,this.offset=new ie(0,0),this.repeat=new ie(1,1),this.center=new ie(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ne,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof p=="string"?this.colorSpace=p:(Pr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=p===Ei?ze:fn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const s={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(s.userData=this.userData),e||(t.textures[this.uuid]=s),s}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Vc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case jo:t.x=t.x-Math.floor(t.x);break;case yn:t.x=t.x<0?0:1;break;case Ko:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case jo:t.y=t.y-Math.floor(t.y);break;case yn:t.y=t.y<0?0:1;break;case Ko:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Pr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===ze?Ei:$c}set encoding(t){Pr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=t===Ei?ze:fn}}$e.DEFAULT_IMAGE=null;$e.DEFAULT_MAPPING=Vc;$e.DEFAULT_ANISOTROPY=1;class De{constructor(t=0,e=0,s=0,o=1){De.prototype.isVector4=!0,this.x=t,this.y=e,this.z=s,this.w=o}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,s,o){return this.x=t,this.y=e,this.z=s,this.w=o,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,s=this.y,o=this.z,a=this.w,h=t.elements;return this.x=h[0]*e+h[4]*s+h[8]*o+h[12]*a,this.y=h[1]*e+h[5]*s+h[9]*o+h[13]*a,this.z=h[2]*e+h[6]*s+h[10]*o+h[14]*a,this.w=h[3]*e+h[7]*s+h[11]*o+h[15]*a,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,s,o,a;const d=t.elements,f=d[0],p=d[4],_=d[8],v=d[1],y=d[5],M=d[9],S=d[2],x=d[6],m=d[10];if(Math.abs(p-v)<.01&&Math.abs(_-S)<.01&&Math.abs(M-x)<.01){if(Math.abs(p+v)<.1&&Math.abs(_+S)<.1&&Math.abs(M+x)<.1&&Math.abs(f+y+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const b=(f+1)/2,D=(y+1)/2,B=(m+1)/2,C=(p+v)/4,U=(_+S)/4,et=(M+x)/4;return b>D&&b>B?b<.01?(s=0,o=.707106781,a=.707106781):(s=Math.sqrt(b),o=C/s,a=U/s):D>B?D<.01?(s=.707106781,o=0,a=.707106781):(o=Math.sqrt(D),s=C/o,a=et/o):B<.01?(s=.707106781,o=.707106781,a=0):(a=Math.sqrt(B),s=U/a,o=et/a),this.set(s,o,a,e),this}let P=Math.sqrt((x-M)*(x-M)+(_-S)*(_-S)+(v-p)*(v-p));return Math.abs(P)<.001&&(P=1),this.x=(x-M)/P,this.y=(_-S)/P,this.z=(v-p)/P,this.w=Math.acos((f+y+m-1)/2),this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(t,Math.min(e,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,s){return this.x=t.x+(e.x-t.x)*s,this.y=t.y+(e.y-t.y)*s,this.z=t.z+(e.z-t.z)*s,this.w=t.w+(e.w-t.w)*s,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Xd extends or{constructor(t=1,e=1,s={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new De(0,0,t,e),this.scissorTest=!1,this.viewport=new De(0,0,t,e);const o={width:t,height:e,depth:1};s.encoding!==void 0&&(Pr("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),s.colorSpace=s.encoding===Ei?ze:fn),s=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:un,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},s),this.texture=new $e(o,s.mapping,s.wrapS,s.wrapT,s.magFilter,s.minFilter,s.format,s.type,s.anisotropy,s.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=s.generateMipmaps,this.texture.internalFormat=s.internalFormat,this.depthBuffer=s.depthBuffer,this.stencilBuffer=s.stencilBuffer,this.depthTexture=s.depthTexture,this.samples=s.samples}setSize(t,e,s=1){(this.width!==t||this.height!==e||this.depth!==s)&&(this.width=t,this.height=e,this.depth=s,this.texture.image.width=t,this.texture.image.height=e,this.texture.image.depth=s,this.dispose()),this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.texture=t.texture.clone(),this.texture.isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new nh(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ti extends Xd{constructor(t=1,e=1,s={}){super(t,e,s),this.isWebGLRenderTarget=!0}}class ih extends $e{constructor(t=null,e=1,s=1,o=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:s,depth:o},this.magFilter=Ye,this.minFilter=Ye,this.wrapR=yn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Zd extends $e{constructor(t=null,e=1,s=1,o=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:s,depth:o},this.magFilter=Ye,this.minFilter=Ye,this.wrapR=yn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Or{constructor(t=0,e=0,s=0,o=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=s,this._w=o}static slerpFlat(t,e,s,o,a,h,c){let d=s[o+0],f=s[o+1],p=s[o+2],_=s[o+3];const v=a[h+0],y=a[h+1],M=a[h+2],S=a[h+3];if(c===0){t[e+0]=d,t[e+1]=f,t[e+2]=p,t[e+3]=_;return}if(c===1){t[e+0]=v,t[e+1]=y,t[e+2]=M,t[e+3]=S;return}if(_!==S||d!==v||f!==y||p!==M){let x=1-c;const m=d*v+f*y+p*M+_*S,P=m>=0?1:-1,b=1-m*m;if(b>Number.EPSILON){const B=Math.sqrt(b),C=Math.atan2(B,m*P);x=Math.sin(x*C)/B,c=Math.sin(c*C)/B}const D=c*P;if(d=d*x+v*D,f=f*x+y*D,p=p*x+M*D,_=_*x+S*D,x===1-c){const B=1/Math.sqrt(d*d+f*f+p*p+_*_);d*=B,f*=B,p*=B,_*=B}}t[e]=d,t[e+1]=f,t[e+2]=p,t[e+3]=_}static multiplyQuaternionsFlat(t,e,s,o,a,h){const c=s[o],d=s[o+1],f=s[o+2],p=s[o+3],_=a[h],v=a[h+1],y=a[h+2],M=a[h+3];return t[e]=c*M+p*_+d*y-f*v,t[e+1]=d*M+p*v+f*_-c*y,t[e+2]=f*M+p*y+c*v-d*_,t[e+3]=p*M-c*_-d*v-f*y,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,s,o){return this._x=t,this._y=e,this._z=s,this._w=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const s=t._x,o=t._y,a=t._z,h=t._order,c=Math.cos,d=Math.sin,f=c(s/2),p=c(o/2),_=c(a/2),v=d(s/2),y=d(o/2),M=d(a/2);switch(h){case"XYZ":this._x=v*p*_+f*y*M,this._y=f*y*_-v*p*M,this._z=f*p*M+v*y*_,this._w=f*p*_-v*y*M;break;case"YXZ":this._x=v*p*_+f*y*M,this._y=f*y*_-v*p*M,this._z=f*p*M-v*y*_,this._w=f*p*_+v*y*M;break;case"ZXY":this._x=v*p*_-f*y*M,this._y=f*y*_+v*p*M,this._z=f*p*M+v*y*_,this._w=f*p*_-v*y*M;break;case"ZYX":this._x=v*p*_-f*y*M,this._y=f*y*_+v*p*M,this._z=f*p*M-v*y*_,this._w=f*p*_+v*y*M;break;case"YZX":this._x=v*p*_+f*y*M,this._y=f*y*_+v*p*M,this._z=f*p*M-v*y*_,this._w=f*p*_-v*y*M;break;case"XZY":this._x=v*p*_-f*y*M,this._y=f*y*_-v*p*M,this._z=f*p*M+v*y*_,this._w=f*p*_+v*y*M;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+h)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const s=e/2,o=Math.sin(s);return this._x=t.x*o,this._y=t.y*o,this._z=t.z*o,this._w=Math.cos(s),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,s=e[0],o=e[4],a=e[8],h=e[1],c=e[5],d=e[9],f=e[2],p=e[6],_=e[10],v=s+c+_;if(v>0){const y=.5/Math.sqrt(v+1);this._w=.25/y,this._x=(p-d)*y,this._y=(a-f)*y,this._z=(h-o)*y}else if(s>c&&s>_){const y=2*Math.sqrt(1+s-c-_);this._w=(p-d)/y,this._x=.25*y,this._y=(o+h)/y,this._z=(a+f)/y}else if(c>_){const y=2*Math.sqrt(1+c-s-_);this._w=(a-f)/y,this._x=(o+h)/y,this._y=.25*y,this._z=(d+p)/y}else{const y=2*Math.sqrt(1+_-s-c);this._w=(h-o)/y,this._x=(a+f)/y,this._y=(d+p)/y,this._z=.25*y}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let s=t.dot(e)+1;return s<Number.EPSILON?(s=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=s):(this._x=0,this._y=-t.z,this._z=t.y,this._w=s)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=s),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(We(this.dot(t),-1,1)))}rotateTowards(t,e){const s=this.angleTo(t);if(s===0)return this;const o=Math.min(1,e/s);return this.slerp(t,o),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const s=t._x,o=t._y,a=t._z,h=t._w,c=e._x,d=e._y,f=e._z,p=e._w;return this._x=s*p+h*c+o*f-a*d,this._y=o*p+h*d+a*c-s*f,this._z=a*p+h*f+s*d-o*c,this._w=h*p-s*c-o*d-a*f,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const s=this._x,o=this._y,a=this._z,h=this._w;let c=h*t._w+s*t._x+o*t._y+a*t._z;if(c<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,c=-c):this.copy(t),c>=1)return this._w=h,this._x=s,this._y=o,this._z=a,this;const d=1-c*c;if(d<=Number.EPSILON){const y=1-e;return this._w=y*h+e*this._w,this._x=y*s+e*this._x,this._y=y*o+e*this._y,this._z=y*a+e*this._z,this.normalize(),this}const f=Math.sqrt(d),p=Math.atan2(f,c),_=Math.sin((1-e)*p)/f,v=Math.sin(e*p)/f;return this._w=h*_+this._w*v,this._x=s*_+this._x*v,this._y=o*_+this._y*v,this._z=a*_+this._z*v,this._onChangeCallback(),this}slerpQuaternions(t,e,s){return this.copy(t).slerp(e,s)}random(){const t=Math.random(),e=Math.sqrt(1-t),s=Math.sqrt(t),o=2*Math.PI*Math.random(),a=2*Math.PI*Math.random();return this.set(e*Math.cos(o),s*Math.sin(a),s*Math.cos(a),e*Math.sin(o))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class G{constructor(t=0,e=0,s=0){G.prototype.isVector3=!0,this.x=t,this.y=e,this.z=s}set(t,e,s){return s===void 0&&(s=this.z),this.x=t,this.y=e,this.z=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(jl.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(jl.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,s=this.y,o=this.z,a=t.elements;return this.x=a[0]*e+a[3]*s+a[6]*o,this.y=a[1]*e+a[4]*s+a[7]*o,this.z=a[2]*e+a[5]*s+a[8]*o,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,s=this.y,o=this.z,a=t.elements,h=1/(a[3]*e+a[7]*s+a[11]*o+a[15]);return this.x=(a[0]*e+a[4]*s+a[8]*o+a[12])*h,this.y=(a[1]*e+a[5]*s+a[9]*o+a[13])*h,this.z=(a[2]*e+a[6]*s+a[10]*o+a[14])*h,this}applyQuaternion(t){const e=this.x,s=this.y,o=this.z,a=t.x,h=t.y,c=t.z,d=t.w,f=2*(h*o-c*s),p=2*(c*e-a*o),_=2*(a*s-h*e);return this.x=e+d*f+h*_-c*p,this.y=s+d*p+c*f-a*_,this.z=o+d*_+a*p-h*f,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,s=this.y,o=this.z,a=t.elements;return this.x=a[0]*e+a[4]*s+a[8]*o,this.y=a[1]*e+a[5]*s+a[9]*o,this.z=a[2]*e+a[6]*s+a[10]*o,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const s=this.length();return this.divideScalar(s||1).multiplyScalar(Math.max(t,Math.min(e,s)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,s){return this.x=t.x+(e.x-t.x)*s,this.y=t.y+(e.y-t.y)*s,this.z=t.z+(e.z-t.z)*s,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const s=t.x,o=t.y,a=t.z,h=e.x,c=e.y,d=e.z;return this.x=o*d-a*c,this.y=a*h-s*d,this.z=s*c-o*h,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const s=t.dot(this)/e;return this.copy(t).multiplyScalar(s)}projectOnPlane(t){return So.copy(this).projectOnVector(t),this.sub(So)}reflect(t){return this.sub(So.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const s=this.dot(t)/e;return Math.acos(We(s,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,s=this.y-t.y,o=this.z-t.z;return e*e+s*s+o*o}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,s){const o=Math.sin(e)*t;return this.x=o*Math.sin(s),this.y=Math.cos(e)*t,this.z=o*Math.cos(s),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,s){return this.x=t*Math.sin(e),this.y=s,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),s=this.setFromMatrixColumn(t,1).length(),o=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=s,this.z=o,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=(Math.random()-.5)*2,e=Math.random()*Math.PI*2,s=Math.sqrt(1-t**2);return this.x=s*Math.cos(e),this.y=s*Math.sin(e),this.z=t,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const So=new G,jl=new Or;class Fr{constructor(t=new G(1/0,1/0,1/0),e=new G(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,s=t.length;e<s;e+=3)this.expandByPoint(_n.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,s=t.count;e<s;e++)this.expandByPoint(_n.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,s=t.length;e<s;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const s=_n.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(s),this.max.copy(t).add(s),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const s=t.geometry;if(s!==void 0){const a=s.getAttribute("position");if(e===!0&&a!==void 0&&t.isInstancedMesh!==!0)for(let h=0,c=a.count;h<c;h++)t.isMesh===!0?t.getVertexPosition(h,_n):_n.fromBufferAttribute(a,h),_n.applyMatrix4(t.matrixWorld),this.expandByPoint(_n);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),is.copy(t.boundingBox)):(s.boundingBox===null&&s.computeBoundingBox(),is.copy(s.boundingBox)),is.applyMatrix4(t.matrixWorld),this.union(is)}const o=t.children;for(let a=0,h=o.length;a<h;a++)this.expandByObject(o[a],e);return this}containsPoint(t){return!(t.x<this.min.x||t.x>this.max.x||t.y<this.min.y||t.y>this.max.y||t.z<this.min.z||t.z>this.max.z)}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return!(t.max.x<this.min.x||t.min.x>this.max.x||t.max.y<this.min.y||t.min.y>this.max.y||t.max.z<this.min.z||t.min.z>this.max.z)}intersectsSphere(t){return this.clampPoint(t.center,_n),_n.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,s;return t.normal.x>0?(e=t.normal.x*this.min.x,s=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,s=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,s+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,s+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,s+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,s+=t.normal.z*this.min.z),e<=-t.constant&&s>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Er),rs.subVectors(this.max,Er),Ni.subVectors(t.a,Er),Oi.subVectors(t.b,Er),Fi.subVectors(t.c,Er),Zn.subVectors(Oi,Ni),qn.subVectors(Fi,Oi),fi.subVectors(Ni,Fi);let e=[0,-Zn.z,Zn.y,0,-qn.z,qn.y,0,-fi.z,fi.y,Zn.z,0,-Zn.x,qn.z,0,-qn.x,fi.z,0,-fi.x,-Zn.y,Zn.x,0,-qn.y,qn.x,0,-fi.y,fi.x,0];return!Eo(e,Ni,Oi,Fi,rs)||(e=[1,0,0,0,1,0,0,0,1],!Eo(e,Ni,Oi,Fi,rs))?!1:(ss.crossVectors(Zn,qn),e=[ss.x,ss.y,ss.z],Eo(e,Ni,Oi,Fi,rs))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,_n).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(_n).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Dn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Dn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Dn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Dn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Dn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Dn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Dn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Dn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Dn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const Dn=[new G,new G,new G,new G,new G,new G,new G,new G],_n=new G,is=new Fr,Ni=new G,Oi=new G,Fi=new G,Zn=new G,qn=new G,fi=new G,Er=new G,rs=new G,ss=new G,pi=new G;function Eo(r,t,e,s,o){for(let a=0,h=r.length-3;a<=h;a+=3){pi.fromArray(r,a);const c=o.x*Math.abs(pi.x)+o.y*Math.abs(pi.y)+o.z*Math.abs(pi.z),d=t.dot(pi),f=e.dot(pi),p=s.dot(pi);if(Math.max(-Math.max(d,f,p),Math.min(d,f,p))>c)return!1}return!0}const qd=new Fr,Tr=new G,To=new G;class Br{constructor(t=new G,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const s=this.center;e!==void 0?s.copy(e):qd.setFromPoints(t).getCenter(s);let o=0;for(let a=0,h=t.length;a<h;a++)o=Math.max(o,s.distanceToSquared(t[a]));return this.radius=Math.sqrt(o),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const s=this.center.distanceToSquared(t);return e.copy(t),s>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Tr.subVectors(t,this.center);const e=Tr.lengthSq();if(e>this.radius*this.radius){const s=Math.sqrt(e),o=(s-this.radius)*.5;this.center.addScaledVector(Tr,o/s),this.radius+=o}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(To.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Tr.copy(t.center).add(To)),this.expandByPoint(Tr.copy(t.center).sub(To))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Un=new G,bo=new G,os=new G,Yn=new G,wo=new G,as=new G,Ao=new G;class Bs{constructor(t=new G,e=new G(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Un)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const s=e.dot(this.direction);return s<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,s)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Un.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Un.copy(this.origin).addScaledVector(this.direction,e),Un.distanceToSquared(t))}distanceSqToSegment(t,e,s,o){bo.copy(t).add(e).multiplyScalar(.5),os.copy(e).sub(t).normalize(),Yn.copy(this.origin).sub(bo);const a=t.distanceTo(e)*.5,h=-this.direction.dot(os),c=Yn.dot(this.direction),d=-Yn.dot(os),f=Yn.lengthSq(),p=Math.abs(1-h*h);let _,v,y,M;if(p>0)if(_=h*d-c,v=h*c-d,M=a*p,_>=0)if(v>=-M)if(v<=M){const S=1/p;_*=S,v*=S,y=_*(_+h*v+2*c)+v*(h*_+v+2*d)+f}else v=a,_=Math.max(0,-(h*v+c)),y=-_*_+v*(v+2*d)+f;else v=-a,_=Math.max(0,-(h*v+c)),y=-_*_+v*(v+2*d)+f;else v<=-M?(_=Math.max(0,-(-h*a+c)),v=_>0?-a:Math.min(Math.max(-a,-d),a),y=-_*_+v*(v+2*d)+f):v<=M?(_=0,v=Math.min(Math.max(-a,-d),a),y=v*(v+2*d)+f):(_=Math.max(0,-(h*a+c)),v=_>0?a:Math.min(Math.max(-a,-d),a),y=-_*_+v*(v+2*d)+f);else v=h>0?-a:a,_=Math.max(0,-(h*v+c)),y=-_*_+v*(v+2*d)+f;return s&&s.copy(this.origin).addScaledVector(this.direction,_),o&&o.copy(bo).addScaledVector(os,v),y}intersectSphere(t,e){Un.subVectors(t.center,this.origin);const s=Un.dot(this.direction),o=Un.dot(Un)-s*s,a=t.radius*t.radius;if(o>a)return null;const h=Math.sqrt(a-o),c=s-h,d=s+h;return d<0?null:c<0?this.at(d,e):this.at(c,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const s=-(this.origin.dot(t.normal)+t.constant)/e;return s>=0?s:null}intersectPlane(t,e){const s=this.distanceToPlane(t);return s===null?null:this.at(s,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let s,o,a,h,c,d;const f=1/this.direction.x,p=1/this.direction.y,_=1/this.direction.z,v=this.origin;return f>=0?(s=(t.min.x-v.x)*f,o=(t.max.x-v.x)*f):(s=(t.max.x-v.x)*f,o=(t.min.x-v.x)*f),p>=0?(a=(t.min.y-v.y)*p,h=(t.max.y-v.y)*p):(a=(t.max.y-v.y)*p,h=(t.min.y-v.y)*p),s>h||a>o||((a>s||isNaN(s))&&(s=a),(h<o||isNaN(o))&&(o=h),_>=0?(c=(t.min.z-v.z)*_,d=(t.max.z-v.z)*_):(c=(t.max.z-v.z)*_,d=(t.min.z-v.z)*_),s>d||c>o)||((c>s||s!==s)&&(s=c),(d<o||o!==o)&&(o=d),o<0)?null:this.at(s>=0?s:o,e)}intersectsBox(t){return this.intersectBox(t,Un)!==null}intersectTriangle(t,e,s,o,a){wo.subVectors(e,t),as.subVectors(s,t),Ao.crossVectors(wo,as);let h=this.direction.dot(Ao),c;if(h>0){if(o)return null;c=1}else if(h<0)c=-1,h=-h;else return null;Yn.subVectors(this.origin,t);const d=c*this.direction.dot(as.crossVectors(Yn,as));if(d<0)return null;const f=c*this.direction.dot(wo.cross(Yn));if(f<0||d+f>h)return null;const p=-c*Yn.dot(Ao);return p<0?null:this.at(p/h,a)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Se{constructor(t,e,s,o,a,h,c,d,f,p,_,v,y,M,S,x){Se.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,s,o,a,h,c,d,f,p,_,v,y,M,S,x)}set(t,e,s,o,a,h,c,d,f,p,_,v,y,M,S,x){const m=this.elements;return m[0]=t,m[4]=e,m[8]=s,m[12]=o,m[1]=a,m[5]=h,m[9]=c,m[13]=d,m[2]=f,m[6]=p,m[10]=_,m[14]=v,m[3]=y,m[7]=M,m[11]=S,m[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Se().fromArray(this.elements)}copy(t){const e=this.elements,s=t.elements;return e[0]=s[0],e[1]=s[1],e[2]=s[2],e[3]=s[3],e[4]=s[4],e[5]=s[5],e[6]=s[6],e[7]=s[7],e[8]=s[8],e[9]=s[9],e[10]=s[10],e[11]=s[11],e[12]=s[12],e[13]=s[13],e[14]=s[14],e[15]=s[15],this}copyPosition(t){const e=this.elements,s=t.elements;return e[12]=s[12],e[13]=s[13],e[14]=s[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,s){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),s.setFromMatrixColumn(this,2),this}makeBasis(t,e,s){return this.set(t.x,e.x,s.x,0,t.y,e.y,s.y,0,t.z,e.z,s.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,s=t.elements,o=1/Bi.setFromMatrixColumn(t,0).length(),a=1/Bi.setFromMatrixColumn(t,1).length(),h=1/Bi.setFromMatrixColumn(t,2).length();return e[0]=s[0]*o,e[1]=s[1]*o,e[2]=s[2]*o,e[3]=0,e[4]=s[4]*a,e[5]=s[5]*a,e[6]=s[6]*a,e[7]=0,e[8]=s[8]*h,e[9]=s[9]*h,e[10]=s[10]*h,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,s=t.x,o=t.y,a=t.z,h=Math.cos(s),c=Math.sin(s),d=Math.cos(o),f=Math.sin(o),p=Math.cos(a),_=Math.sin(a);if(t.order==="XYZ"){const v=h*p,y=h*_,M=c*p,S=c*_;e[0]=d*p,e[4]=-d*_,e[8]=f,e[1]=y+M*f,e[5]=v-S*f,e[9]=-c*d,e[2]=S-v*f,e[6]=M+y*f,e[10]=h*d}else if(t.order==="YXZ"){const v=d*p,y=d*_,M=f*p,S=f*_;e[0]=v+S*c,e[4]=M*c-y,e[8]=h*f,e[1]=h*_,e[5]=h*p,e[9]=-c,e[2]=y*c-M,e[6]=S+v*c,e[10]=h*d}else if(t.order==="ZXY"){const v=d*p,y=d*_,M=f*p,S=f*_;e[0]=v-S*c,e[4]=-h*_,e[8]=M+y*c,e[1]=y+M*c,e[5]=h*p,e[9]=S-v*c,e[2]=-h*f,e[6]=c,e[10]=h*d}else if(t.order==="ZYX"){const v=h*p,y=h*_,M=c*p,S=c*_;e[0]=d*p,e[4]=M*f-y,e[8]=v*f+S,e[1]=d*_,e[5]=S*f+v,e[9]=y*f-M,e[2]=-f,e[6]=c*d,e[10]=h*d}else if(t.order==="YZX"){const v=h*d,y=h*f,M=c*d,S=c*f;e[0]=d*p,e[4]=S-v*_,e[8]=M*_+y,e[1]=_,e[5]=h*p,e[9]=-c*p,e[2]=-f*p,e[6]=y*_+M,e[10]=v-S*_}else if(t.order==="XZY"){const v=h*d,y=h*f,M=c*d,S=c*f;e[0]=d*p,e[4]=-_,e[8]=f*p,e[1]=v*_+S,e[5]=h*p,e[9]=y*_-M,e[2]=M*_-y,e[6]=c*p,e[10]=S*_+v}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Yd,t,jd)}lookAt(t,e,s){const o=this.elements;return Qe.subVectors(t,e),Qe.lengthSq()===0&&(Qe.z=1),Qe.normalize(),jn.crossVectors(s,Qe),jn.lengthSq()===0&&(Math.abs(s.z)===1?Qe.x+=1e-4:Qe.z+=1e-4,Qe.normalize(),jn.crossVectors(s,Qe)),jn.normalize(),ls.crossVectors(Qe,jn),o[0]=jn.x,o[4]=ls.x,o[8]=Qe.x,o[1]=jn.y,o[5]=ls.y,o[9]=Qe.y,o[2]=jn.z,o[6]=ls.z,o[10]=Qe.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const s=t.elements,o=e.elements,a=this.elements,h=s[0],c=s[4],d=s[8],f=s[12],p=s[1],_=s[5],v=s[9],y=s[13],M=s[2],S=s[6],x=s[10],m=s[14],P=s[3],b=s[7],D=s[11],B=s[15],C=o[0],U=o[4],et=o[8],w=o[12],I=o[1],J=o[5],it=o[9],lt=o[13],F=o[2],$=o[6],Q=o[10],st=o[14],X=o[3],V=o[7],z=o[11],nt=o[15];return a[0]=h*C+c*I+d*F+f*X,a[4]=h*U+c*J+d*$+f*V,a[8]=h*et+c*it+d*Q+f*z,a[12]=h*w+c*lt+d*st+f*nt,a[1]=p*C+_*I+v*F+y*X,a[5]=p*U+_*J+v*$+y*V,a[9]=p*et+_*it+v*Q+y*z,a[13]=p*w+_*lt+v*st+y*nt,a[2]=M*C+S*I+x*F+m*X,a[6]=M*U+S*J+x*$+m*V,a[10]=M*et+S*it+x*Q+m*z,a[14]=M*w+S*lt+x*st+m*nt,a[3]=P*C+b*I+D*F+B*X,a[7]=P*U+b*J+D*$+B*V,a[11]=P*et+b*it+D*Q+B*z,a[15]=P*w+b*lt+D*st+B*nt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],s=t[4],o=t[8],a=t[12],h=t[1],c=t[5],d=t[9],f=t[13],p=t[2],_=t[6],v=t[10],y=t[14],M=t[3],S=t[7],x=t[11],m=t[15];return M*(+a*d*_-o*f*_-a*c*v+s*f*v+o*c*y-s*d*y)+S*(+e*d*y-e*f*v+a*h*v-o*h*y+o*f*p-a*d*p)+x*(+e*f*_-e*c*y-a*h*_+s*h*y+a*c*p-s*f*p)+m*(-o*c*p-e*d*_+e*c*v+o*h*_-s*h*v+s*d*p)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,s){const o=this.elements;return t.isVector3?(o[12]=t.x,o[13]=t.y,o[14]=t.z):(o[12]=t,o[13]=e,o[14]=s),this}invert(){const t=this.elements,e=t[0],s=t[1],o=t[2],a=t[3],h=t[4],c=t[5],d=t[6],f=t[7],p=t[8],_=t[9],v=t[10],y=t[11],M=t[12],S=t[13],x=t[14],m=t[15],P=_*x*f-S*v*f+S*d*y-c*x*y-_*d*m+c*v*m,b=M*v*f-p*x*f-M*d*y+h*x*y+p*d*m-h*v*m,D=p*S*f-M*_*f+M*c*y-h*S*y-p*c*m+h*_*m,B=M*_*d-p*S*d-M*c*v+h*S*v+p*c*x-h*_*x,C=e*P+s*b+o*D+a*B;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const U=1/C;return t[0]=P*U,t[1]=(S*v*a-_*x*a-S*o*y+s*x*y+_*o*m-s*v*m)*U,t[2]=(c*x*a-S*d*a+S*o*f-s*x*f-c*o*m+s*d*m)*U,t[3]=(_*d*a-c*v*a-_*o*f+s*v*f+c*o*y-s*d*y)*U,t[4]=b*U,t[5]=(p*x*a-M*v*a+M*o*y-e*x*y-p*o*m+e*v*m)*U,t[6]=(M*d*a-h*x*a-M*o*f+e*x*f+h*o*m-e*d*m)*U,t[7]=(h*v*a-p*d*a+p*o*f-e*v*f-h*o*y+e*d*y)*U,t[8]=D*U,t[9]=(M*_*a-p*S*a-M*s*y+e*S*y+p*s*m-e*_*m)*U,t[10]=(h*S*a-M*c*a+M*s*f-e*S*f-h*s*m+e*c*m)*U,t[11]=(p*c*a-h*_*a-p*s*f+e*_*f+h*s*y-e*c*y)*U,t[12]=B*U,t[13]=(p*S*o-M*_*o+M*s*v-e*S*v-p*s*x+e*_*x)*U,t[14]=(M*c*o-h*S*o-M*s*d+e*S*d+h*s*x-e*c*x)*U,t[15]=(h*_*o-p*c*o+p*s*d-e*_*d-h*s*v+e*c*v)*U,this}scale(t){const e=this.elements,s=t.x,o=t.y,a=t.z;return e[0]*=s,e[4]*=o,e[8]*=a,e[1]*=s,e[5]*=o,e[9]*=a,e[2]*=s,e[6]*=o,e[10]*=a,e[3]*=s,e[7]*=o,e[11]*=a,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],s=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],o=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,s,o))}makeTranslation(t,e,s){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,s,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),s=Math.sin(t);return this.set(1,0,0,0,0,e,-s,0,0,s,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),s=Math.sin(t);return this.set(e,0,s,0,0,1,0,0,-s,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),s=Math.sin(t);return this.set(e,-s,0,0,s,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const s=Math.cos(e),o=Math.sin(e),a=1-s,h=t.x,c=t.y,d=t.z,f=a*h,p=a*c;return this.set(f*h+s,f*c-o*d,f*d+o*c,0,f*c+o*d,p*c+s,p*d-o*h,0,f*d-o*c,p*d+o*h,a*d*d+s,0,0,0,0,1),this}makeScale(t,e,s){return this.set(t,0,0,0,0,e,0,0,0,0,s,0,0,0,0,1),this}makeShear(t,e,s,o,a,h){return this.set(1,s,a,0,t,1,h,0,e,o,1,0,0,0,0,1),this}compose(t,e,s){const o=this.elements,a=e._x,h=e._y,c=e._z,d=e._w,f=a+a,p=h+h,_=c+c,v=a*f,y=a*p,M=a*_,S=h*p,x=h*_,m=c*_,P=d*f,b=d*p,D=d*_,B=s.x,C=s.y,U=s.z;return o[0]=(1-(S+m))*B,o[1]=(y+D)*B,o[2]=(M-b)*B,o[3]=0,o[4]=(y-D)*C,o[5]=(1-(v+m))*C,o[6]=(x+P)*C,o[7]=0,o[8]=(M+b)*U,o[9]=(x-P)*U,o[10]=(1-(v+S))*U,o[11]=0,o[12]=t.x,o[13]=t.y,o[14]=t.z,o[15]=1,this}decompose(t,e,s){const o=this.elements;let a=Bi.set(o[0],o[1],o[2]).length();const h=Bi.set(o[4],o[5],o[6]).length(),c=Bi.set(o[8],o[9],o[10]).length();this.determinant()<0&&(a=-a),t.x=o[12],t.y=o[13],t.z=o[14],gn.copy(this);const f=1/a,p=1/h,_=1/c;return gn.elements[0]*=f,gn.elements[1]*=f,gn.elements[2]*=f,gn.elements[4]*=p,gn.elements[5]*=p,gn.elements[6]*=p,gn.elements[8]*=_,gn.elements[9]*=_,gn.elements[10]*=_,e.setFromRotationMatrix(gn),s.x=a,s.y=h,s.z=c,this}makePerspective(t,e,s,o,a,h,c=kn){const d=this.elements,f=2*a/(e-t),p=2*a/(s-o),_=(e+t)/(e-t),v=(s+o)/(s-o);let y,M;if(c===kn)y=-(h+a)/(h-a),M=-2*h*a/(h-a);else if(c===Ds)y=-h/(h-a),M=-h*a/(h-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+c);return d[0]=f,d[4]=0,d[8]=_,d[12]=0,d[1]=0,d[5]=p,d[9]=v,d[13]=0,d[2]=0,d[6]=0,d[10]=y,d[14]=M,d[3]=0,d[7]=0,d[11]=-1,d[15]=0,this}makeOrthographic(t,e,s,o,a,h,c=kn){const d=this.elements,f=1/(e-t),p=1/(s-o),_=1/(h-a),v=(e+t)*f,y=(s+o)*p;let M,S;if(c===kn)M=(h+a)*_,S=-2*_;else if(c===Ds)M=a*_,S=-1*_;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+c);return d[0]=2*f,d[4]=0,d[8]=0,d[12]=-v,d[1]=0,d[5]=2*p,d[9]=0,d[13]=-y,d[2]=0,d[6]=0,d[10]=S,d[14]=-M,d[3]=0,d[7]=0,d[11]=0,d[15]=1,this}equals(t){const e=this.elements,s=t.elements;for(let o=0;o<16;o++)if(e[o]!==s[o])return!1;return!0}fromArray(t,e=0){for(let s=0;s<16;s++)this.elements[s]=t[s+e];return this}toArray(t=[],e=0){const s=this.elements;return t[e]=s[0],t[e+1]=s[1],t[e+2]=s[2],t[e+3]=s[3],t[e+4]=s[4],t[e+5]=s[5],t[e+6]=s[6],t[e+7]=s[7],t[e+8]=s[8],t[e+9]=s[9],t[e+10]=s[10],t[e+11]=s[11],t[e+12]=s[12],t[e+13]=s[13],t[e+14]=s[14],t[e+15]=s[15],t}}const Bi=new G,gn=new Se,Yd=new G(0,0,0),jd=new G(1,1,1),jn=new G,ls=new G,Qe=new G,Kl=new Se,$l=new Or;class zs{constructor(t=0,e=0,s=0,o=zs.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=s,this._order=o}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,s,o=this._order){return this._x=t,this._y=e,this._z=s,this._order=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,s=!0){const o=t.elements,a=o[0],h=o[4],c=o[8],d=o[1],f=o[5],p=o[9],_=o[2],v=o[6],y=o[10];switch(e){case"XYZ":this._y=Math.asin(We(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-p,y),this._z=Math.atan2(-h,a)):(this._x=Math.atan2(v,f),this._z=0);break;case"YXZ":this._x=Math.asin(-We(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(c,y),this._z=Math.atan2(d,f)):(this._y=Math.atan2(-_,a),this._z=0);break;case"ZXY":this._x=Math.asin(We(v,-1,1)),Math.abs(v)<.9999999?(this._y=Math.atan2(-_,y),this._z=Math.atan2(-h,f)):(this._y=0,this._z=Math.atan2(d,a));break;case"ZYX":this._y=Math.asin(-We(_,-1,1)),Math.abs(_)<.9999999?(this._x=Math.atan2(v,y),this._z=Math.atan2(d,a)):(this._x=0,this._z=Math.atan2(-h,f));break;case"YZX":this._z=Math.asin(We(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-p,f),this._y=Math.atan2(-_,a)):(this._x=0,this._y=Math.atan2(c,y));break;case"XZY":this._z=Math.asin(-We(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(v,f),this._y=Math.atan2(c,a)):(this._x=Math.atan2(-p,y),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,s===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,s){return Kl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Kl,e,s)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return $l.setFromEuler(this),this.setFromQuaternion($l,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}zs.DEFAULT_ORDER="XYZ";class ca{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Kd=0;const Jl=new G,zi=new Or,Nn=new Se,cs=new G,br=new G,$d=new G,Jd=new Or,Ql=new G(1,0,0),tc=new G(0,1,0),ec=new G(0,0,1),Qd={type:"added"},tf={type:"removed"};class Ue extends or{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Kd++}),this.uuid=ar(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ue.DEFAULT_UP.clone();const t=new G,e=new zs,s=new Or,o=new G(1,1,1);function a(){s.setFromEuler(e,!1)}function h(){e.setFromQuaternion(s,void 0,!1)}e._onChange(a),s._onChange(h),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:s},scale:{configurable:!0,enumerable:!0,value:o},modelViewMatrix:{value:new Se},normalMatrix:{value:new ne}}),this.matrix=new Se,this.matrixWorld=new Se,this.matrixAutoUpdate=Ue.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ue.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ca,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return zi.setFromAxisAngle(t,e),this.quaternion.multiply(zi),this}rotateOnWorldAxis(t,e){return zi.setFromAxisAngle(t,e),this.quaternion.premultiply(zi),this}rotateX(t){return this.rotateOnAxis(Ql,t)}rotateY(t){return this.rotateOnAxis(tc,t)}rotateZ(t){return this.rotateOnAxis(ec,t)}translateOnAxis(t,e){return Jl.copy(t).applyQuaternion(this.quaternion),this.position.add(Jl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Ql,t)}translateY(t){return this.translateOnAxis(tc,t)}translateZ(t){return this.translateOnAxis(ec,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Nn.copy(this.matrixWorld).invert())}lookAt(t,e,s){t.isVector3?cs.copy(t):cs.set(t,e,s);const o=this.parent;this.updateWorldMatrix(!0,!1),br.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Nn.lookAt(br,cs,this.up):Nn.lookAt(cs,br,this.up),this.quaternion.setFromRotationMatrix(Nn),o&&(Nn.extractRotation(o.matrixWorld),zi.setFromRotationMatrix(Nn),this.quaternion.premultiply(zi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.parent!==null&&t.parent.remove(t),t.parent=this,this.children.push(t),t.dispatchEvent(Qd)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let s=0;s<arguments.length;s++)this.remove(arguments[s]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(tf)),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Nn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Nn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Nn),this.add(t),t.updateWorldMatrix(!1,!0),this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let s=0,o=this.children.length;s<o;s++){const h=this.children[s].getObjectByProperty(t,e);if(h!==void 0)return h}}getObjectsByProperty(t,e,s=[]){this[t]===e&&s.push(this);const o=this.children;for(let a=0,h=o.length;a<h;a++)o[a].getObjectsByProperty(t,e,s);return s}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(br,t,$d),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(br,Jd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let s=0,o=e.length;s<o;s++)e[s].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let s=0,o=e.length;s<o;s++)e[s].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let s=0,o=e.length;s<o;s++){const a=e[s];(a.matrixWorldAutoUpdate===!0||t===!0)&&a.updateMatrixWorld(t)}}updateWorldMatrix(t,e){const s=this.parent;if(t===!0&&s!==null&&s.matrixWorldAutoUpdate===!0&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),e===!0){const o=this.children;for(let a=0,h=o.length;a<h;a++){const c=o[a];c.matrixWorldAutoUpdate===!0&&c.updateWorldMatrix(!1,!0)}}}toJSON(t){const e=t===void 0||typeof t=="string",s={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},s.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const o={};o.uuid=this.uuid,o.type=this.type,this.name!==""&&(o.name=this.name),this.castShadow===!0&&(o.castShadow=!0),this.receiveShadow===!0&&(o.receiveShadow=!0),this.visible===!1&&(o.visible=!1),this.frustumCulled===!1&&(o.frustumCulled=!1),this.renderOrder!==0&&(o.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(o.userData=this.userData),o.layers=this.layers.mask,o.matrix=this.matrix.toArray(),o.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(o.matrixAutoUpdate=!1),this.isInstancedMesh&&(o.type="InstancedMesh",o.count=this.count,o.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(o.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(o.type="BatchedMesh",o.perObjectFrustumCulled=this.perObjectFrustumCulled,o.sortObjects=this.sortObjects,o.drawRanges=this._drawRanges,o.reservedRanges=this._reservedRanges,o.visibility=this._visibility,o.active=this._active,o.bounds=this._bounds.map(c=>({boxInitialized:c.boxInitialized,boxMin:c.box.min.toArray(),boxMax:c.box.max.toArray(),sphereInitialized:c.sphereInitialized,sphereRadius:c.sphere.radius,sphereCenter:c.sphere.center.toArray()})),o.maxGeometryCount=this._maxGeometryCount,o.maxVertexCount=this._maxVertexCount,o.maxIndexCount=this._maxIndexCount,o.geometryInitialized=this._geometryInitialized,o.geometryCount=this._geometryCount,o.matricesTexture=this._matricesTexture.toJSON(t),this.boundingSphere!==null&&(o.boundingSphere={center:o.boundingSphere.center.toArray(),radius:o.boundingSphere.radius}),this.boundingBox!==null&&(o.boundingBox={min:o.boundingBox.min.toArray(),max:o.boundingBox.max.toArray()}));function a(c,d){return c[d.uuid]===void 0&&(c[d.uuid]=d.toJSON(t)),d.uuid}if(this.isScene)this.background&&(this.background.isColor?o.background=this.background.toJSON():this.background.isTexture&&(o.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(o.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){o.geometry=a(t.geometries,this.geometry);const c=this.geometry.parameters;if(c!==void 0&&c.shapes!==void 0){const d=c.shapes;if(Array.isArray(d))for(let f=0,p=d.length;f<p;f++){const _=d[f];a(t.shapes,_)}else a(t.shapes,d)}}if(this.isSkinnedMesh&&(o.bindMode=this.bindMode,o.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(t.skeletons,this.skeleton),o.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const c=[];for(let d=0,f=this.material.length;d<f;d++)c.push(a(t.materials,this.material[d]));o.material=c}else o.material=a(t.materials,this.material);if(this.children.length>0){o.children=[];for(let c=0;c<this.children.length;c++)o.children.push(this.children[c].toJSON(t).object)}if(this.animations.length>0){o.animations=[];for(let c=0;c<this.animations.length;c++){const d=this.animations[c];o.animations.push(a(t.animations,d))}}if(e){const c=h(t.geometries),d=h(t.materials),f=h(t.textures),p=h(t.images),_=h(t.shapes),v=h(t.skeletons),y=h(t.animations),M=h(t.nodes);c.length>0&&(s.geometries=c),d.length>0&&(s.materials=d),f.length>0&&(s.textures=f),p.length>0&&(s.images=p),_.length>0&&(s.shapes=_),v.length>0&&(s.skeletons=v),y.length>0&&(s.animations=y),M.length>0&&(s.nodes=M)}return s.object=o,s;function h(c){const d=[];for(const f in c){const p=c[f];delete p.metadata,d.push(p)}return d}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let s=0;s<t.children.length;s++){const o=t.children[s];this.add(o.clone())}return this}}Ue.DEFAULT_UP=new G(0,1,0);Ue.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ue.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const vn=new G,On=new G,Lo=new G,Fn=new G,ki=new G,Hi=new G,nc=new G,Po=new G,Ro=new G,Co=new G;let hs=!1;class xn{constructor(t=new G,e=new G,s=new G){this.a=t,this.b=e,this.c=s}static getNormal(t,e,s,o){o.subVectors(s,e),vn.subVectors(t,e),o.cross(vn);const a=o.lengthSq();return a>0?o.multiplyScalar(1/Math.sqrt(a)):o.set(0,0,0)}static getBarycoord(t,e,s,o,a){vn.subVectors(o,e),On.subVectors(s,e),Lo.subVectors(t,e);const h=vn.dot(vn),c=vn.dot(On),d=vn.dot(Lo),f=On.dot(On),p=On.dot(Lo),_=h*f-c*c;if(_===0)return a.set(0,0,0),null;const v=1/_,y=(f*d-c*p)*v,M=(h*p-c*d)*v;return a.set(1-y-M,M,y)}static containsPoint(t,e,s,o){return this.getBarycoord(t,e,s,o,Fn)===null?!1:Fn.x>=0&&Fn.y>=0&&Fn.x+Fn.y<=1}static getUV(t,e,s,o,a,h,c,d){return hs===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),hs=!0),this.getInterpolation(t,e,s,o,a,h,c,d)}static getInterpolation(t,e,s,o,a,h,c,d){return this.getBarycoord(t,e,s,o,Fn)===null?(d.x=0,d.y=0,"z"in d&&(d.z=0),"w"in d&&(d.w=0),null):(d.setScalar(0),d.addScaledVector(a,Fn.x),d.addScaledVector(h,Fn.y),d.addScaledVector(c,Fn.z),d)}static isFrontFacing(t,e,s,o){return vn.subVectors(s,e),On.subVectors(t,e),vn.cross(On).dot(o)<0}set(t,e,s){return this.a.copy(t),this.b.copy(e),this.c.copy(s),this}setFromPointsAndIndices(t,e,s,o){return this.a.copy(t[e]),this.b.copy(t[s]),this.c.copy(t[o]),this}setFromAttributeAndIndices(t,e,s,o){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,s),this.c.fromBufferAttribute(t,o),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return vn.subVectors(this.c,this.b),On.subVectors(this.a,this.b),vn.cross(On).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return xn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return xn.getBarycoord(t,this.a,this.b,this.c,e)}getUV(t,e,s,o,a){return hs===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),hs=!0),xn.getInterpolation(t,this.a,this.b,this.c,e,s,o,a)}getInterpolation(t,e,s,o,a){return xn.getInterpolation(t,this.a,this.b,this.c,e,s,o,a)}containsPoint(t){return xn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return xn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const s=this.a,o=this.b,a=this.c;let h,c;ki.subVectors(o,s),Hi.subVectors(a,s),Po.subVectors(t,s);const d=ki.dot(Po),f=Hi.dot(Po);if(d<=0&&f<=0)return e.copy(s);Ro.subVectors(t,o);const p=ki.dot(Ro),_=Hi.dot(Ro);if(p>=0&&_<=p)return e.copy(o);const v=d*_-p*f;if(v<=0&&d>=0&&p<=0)return h=d/(d-p),e.copy(s).addScaledVector(ki,h);Co.subVectors(t,a);const y=ki.dot(Co),M=Hi.dot(Co);if(M>=0&&y<=M)return e.copy(a);const S=y*f-d*M;if(S<=0&&f>=0&&M<=0)return c=f/(f-M),e.copy(s).addScaledVector(Hi,c);const x=p*M-y*_;if(x<=0&&_-p>=0&&y-M>=0)return nc.subVectors(a,o),c=(_-p)/(_-p+(y-M)),e.copy(o).addScaledVector(nc,c);const m=1/(x+S+v);return h=S*m,c=v*m,e.copy(s).addScaledVector(ki,h).addScaledVector(Hi,c)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const rh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Kn={h:0,s:0,l:0},us={h:0,s:0,l:0};function Io(r,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?r+(t-r)*6*e:e<1/2?t:e<2/3?r+(t-r)*6*(2/3-e):r}class le{constructor(t,e,s){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,s)}set(t,e,s){if(e===void 0&&s===void 0){const o=t;o&&o.isColor?this.copy(o):typeof o=="number"?this.setHex(o):typeof o=="string"&&this.setStyle(o)}else this.setRGB(t,e,s);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=ze){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,pe.toWorkingColorSpace(this,e),this}setRGB(t,e,s,o=pe.workingColorSpace){return this.r=t,this.g=e,this.b=s,pe.toWorkingColorSpace(this,o),this}setHSL(t,e,s,o=pe.workingColorSpace){if(t=la(t,1),e=We(e,0,1),s=We(s,0,1),e===0)this.r=this.g=this.b=s;else{const a=s<=.5?s*(1+e):s+e-s*e,h=2*s-a;this.r=Io(h,a,t+1/3),this.g=Io(h,a,t),this.b=Io(h,a,t-1/3)}return pe.toWorkingColorSpace(this,o),this}setStyle(t,e=ze){function s(a){a!==void 0&&parseFloat(a)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let o;if(o=/^(\w+)\(([^\)]*)\)/.exec(t)){let a;const h=o[1],c=o[2];switch(h){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c))return s(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,e);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c))return s(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,e);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(c))return s(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(o=/^\#([A-Fa-f\d]+)$/.exec(t)){const a=o[1],h=a.length;if(h===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,e);if(h===6)return this.setHex(parseInt(a,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=ze){const s=rh[t.toLowerCase()];return s!==void 0?this.setHex(s,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=er(t.r),this.g=er(t.g),this.b=er(t.b),this}copyLinearToSRGB(t){return this.r=yo(t.r),this.g=yo(t.g),this.b=yo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ze){return pe.fromWorkingColorSpace(Ve.copy(this),t),Math.round(We(Ve.r*255,0,255))*65536+Math.round(We(Ve.g*255,0,255))*256+Math.round(We(Ve.b*255,0,255))}getHexString(t=ze){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=pe.workingColorSpace){pe.fromWorkingColorSpace(Ve.copy(this),e);const s=Ve.r,o=Ve.g,a=Ve.b,h=Math.max(s,o,a),c=Math.min(s,o,a);let d,f;const p=(c+h)/2;if(c===h)d=0,f=0;else{const _=h-c;switch(f=p<=.5?_/(h+c):_/(2-h-c),h){case s:d=(o-a)/_+(o<a?6:0);break;case o:d=(a-s)/_+2;break;case a:d=(s-o)/_+4;break}d/=6}return t.h=d,t.s=f,t.l=p,t}getRGB(t,e=pe.workingColorSpace){return pe.fromWorkingColorSpace(Ve.copy(this),e),t.r=Ve.r,t.g=Ve.g,t.b=Ve.b,t}getStyle(t=ze){pe.fromWorkingColorSpace(Ve.copy(this),t);const e=Ve.r,s=Ve.g,o=Ve.b;return t!==ze?`color(${t} ${e.toFixed(3)} ${s.toFixed(3)} ${o.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(s*255)},${Math.round(o*255)})`}offsetHSL(t,e,s){return this.getHSL(Kn),this.setHSL(Kn.h+t,Kn.s+e,Kn.l+s)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,s){return this.r=t.r+(e.r-t.r)*s,this.g=t.g+(e.g-t.g)*s,this.b=t.b+(e.b-t.b)*s,this}lerpHSL(t,e){this.getHSL(Kn),t.getHSL(us);const s=Lr(Kn.h,us.h,e),o=Lr(Kn.s,us.s,e),a=Lr(Kn.l,us.l,e);return this.setHSL(s,o,a),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,s=this.g,o=this.b,a=t.elements;return this.r=a[0]*e+a[3]*s+a[6]*o,this.g=a[1]*e+a[4]*s+a[7]*o,this.b=a[2]*e+a[5]*s+a[8]*o,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ve=new le;le.NAMES=rh;let ef=0;class wi extends or{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ef++}),this.uuid=ar(),this.name="",this.type="Material",this.blending=tr,this.side=ni,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Xo,this.blendDst=Zo,this.blendEquation=xi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new le(0,0,0),this.blendAlpha=0,this.depthFunc=Ps,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Gl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Di,this.stencilZFail=Di,this.stencilZPass=Di,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const s=t[e];if(s===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const o=this[e];if(o===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}o&&o.isColor?o.set(s):o&&o.isVector3&&s&&s.isVector3?o.copy(s):this[e]=s}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const s={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.color&&this.color.isColor&&(s.color=this.color.getHex()),this.roughness!==void 0&&(s.roughness=this.roughness),this.metalness!==void 0&&(s.metalness=this.metalness),this.sheen!==void 0&&(s.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(s.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(s.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(s.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(s.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(s.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(s.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(s.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(s.shininess=this.shininess),this.clearcoat!==void 0&&(s.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(s.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(s.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(s.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(s.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,s.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(s.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(s.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(s.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(s.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(s.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(s.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(s.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(s.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(s.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(s.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(s.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(s.lightMap=this.lightMap.toJSON(t).uuid,s.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(s.aoMap=this.aoMap.toJSON(t).uuid,s.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(s.bumpMap=this.bumpMap.toJSON(t).uuid,s.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(s.normalMap=this.normalMap.toJSON(t).uuid,s.normalMapType=this.normalMapType,s.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(s.displacementMap=this.displacementMap.toJSON(t).uuid,s.displacementScale=this.displacementScale,s.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(s.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(s.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(s.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(s.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(s.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(s.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(s.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(s.combine=this.combine)),this.envMapIntensity!==void 0&&(s.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(s.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(s.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(s.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(s.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(s.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(s.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(s.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(s.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(s.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(s.size=this.size),this.shadowSide!==null&&(s.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(s.sizeAttenuation=this.sizeAttenuation),this.blending!==tr&&(s.blending=this.blending),this.side!==ni&&(s.side=this.side),this.vertexColors===!0&&(s.vertexColors=!0),this.opacity<1&&(s.opacity=this.opacity),this.transparent===!0&&(s.transparent=!0),this.blendSrc!==Xo&&(s.blendSrc=this.blendSrc),this.blendDst!==Zo&&(s.blendDst=this.blendDst),this.blendEquation!==xi&&(s.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(s.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(s.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(s.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(s.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(s.blendAlpha=this.blendAlpha),this.depthFunc!==Ps&&(s.depthFunc=this.depthFunc),this.depthTest===!1&&(s.depthTest=this.depthTest),this.depthWrite===!1&&(s.depthWrite=this.depthWrite),this.colorWrite===!1&&(s.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(s.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Gl&&(s.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(s.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(s.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Di&&(s.stencilFail=this.stencilFail),this.stencilZFail!==Di&&(s.stencilZFail=this.stencilZFail),this.stencilZPass!==Di&&(s.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(s.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(s.rotation=this.rotation),this.polygonOffset===!0&&(s.polygonOffset=!0),this.polygonOffsetFactor!==0&&(s.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(s.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(s.linewidth=this.linewidth),this.dashSize!==void 0&&(s.dashSize=this.dashSize),this.gapSize!==void 0&&(s.gapSize=this.gapSize),this.scale!==void 0&&(s.scale=this.scale),this.dithering===!0&&(s.dithering=!0),this.alphaTest>0&&(s.alphaTest=this.alphaTest),this.alphaHash===!0&&(s.alphaHash=!0),this.alphaToCoverage===!0&&(s.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(s.premultipliedAlpha=!0),this.forceSinglePass===!0&&(s.forceSinglePass=!0),this.wireframe===!0&&(s.wireframe=!0),this.wireframeLinewidth>1&&(s.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(s.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(s.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(s.flatShading=!0),this.visible===!1&&(s.visible=!1),this.toneMapped===!1&&(s.toneMapped=!1),this.fog===!1&&(s.fog=!1),Object.keys(this.userData).length>0&&(s.userData=this.userData);function o(a){const h=[];for(const c in a){const d=a[c];delete d.metadata,h.push(d)}return h}if(e){const a=o(t.textures),h=o(t.images);a.length>0&&(s.textures=a),h.length>0&&(s.images=h)}return s}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let s=null;if(e!==null){const o=e.length;s=new Array(o);for(let a=0;a!==o;++a)s[a]=e[a].clone()}return this.clippingPlanes=s,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}class Ur extends wi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=sa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const we=new G,ds=new ie;class Sn{constructor(t,e,s=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=s,this.usage=Vl,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Jn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,s){t*=this.itemSize,s*=e.itemSize;for(let o=0,a=this.itemSize;o<a;o++)this.array[t+o]=e.array[s+o];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,s=this.count;e<s;e++)ds.fromBufferAttribute(this,e),ds.applyMatrix3(t),this.setXY(e,ds.x,ds.y);else if(this.itemSize===3)for(let e=0,s=this.count;e<s;e++)we.fromBufferAttribute(this,e),we.applyMatrix3(t),this.setXYZ(e,we.x,we.y,we.z);return this}applyMatrix4(t){for(let e=0,s=this.count;e<s;e++)we.fromBufferAttribute(this,e),we.applyMatrix4(t),this.setXYZ(e,we.x,we.y,we.z);return this}applyNormalMatrix(t){for(let e=0,s=this.count;e<s;e++)we.fromBufferAttribute(this,e),we.applyNormalMatrix(t),this.setXYZ(e,we.x,we.y,we.z);return this}transformDirection(t){for(let e=0,s=this.count;e<s;e++)we.fromBufferAttribute(this,e),we.transformDirection(t),this.setXYZ(e,we.x,we.y,we.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let s=this.array[t*this.itemSize+e];return this.normalized&&(s=ji(s,this.array)),s}setComponent(t,e,s){return this.normalized&&(s=Ze(s,this.array)),this.array[t*this.itemSize+e]=s,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ji(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ze(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ji(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ze(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ji(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ze(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ji(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ze(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,s){return t*=this.itemSize,this.normalized&&(e=Ze(e,this.array),s=Ze(s,this.array)),this.array[t+0]=e,this.array[t+1]=s,this}setXYZ(t,e,s,o){return t*=this.itemSize,this.normalized&&(e=Ze(e,this.array),s=Ze(s,this.array),o=Ze(o,this.array)),this.array[t+0]=e,this.array[t+1]=s,this.array[t+2]=o,this}setXYZW(t,e,s,o,a){return t*=this.itemSize,this.normalized&&(e=Ze(e,this.array),s=Ze(s,this.array),o=Ze(o,this.array),a=Ze(a,this.array)),this.array[t+0]=e,this.array[t+1]=s,this.array[t+2]=o,this.array[t+3]=a,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Vl&&(t.usage=this.usage),t}}class sh extends Sn{constructor(t,e,s){super(new Uint16Array(t),e,s)}}class oh extends Sn{constructor(t,e,s){super(new Uint32Array(t),e,s)}}class ke extends Sn{constructor(t,e,s){super(new Float32Array(t),e,s)}}let nf=0;const hn=new Se,Do=new Ue,Gi=new G,tn=new Fr,wr=new Fr,Ie=new G;class Je extends or{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:nf++}),this.uuid=ar(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(th(t)?oh:sh)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,s=0){this.groups.push({start:t,count:e,materialIndex:s})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const s=this.attributes.normal;if(s!==void 0){const a=new ne().getNormalMatrix(t);s.applyNormalMatrix(a),s.needsUpdate=!0}const o=this.attributes.tangent;return o!==void 0&&(o.transformDirection(t),o.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return hn.makeRotationFromQuaternion(t),this.applyMatrix4(hn),this}rotateX(t){return hn.makeRotationX(t),this.applyMatrix4(hn),this}rotateY(t){return hn.makeRotationY(t),this.applyMatrix4(hn),this}rotateZ(t){return hn.makeRotationZ(t),this.applyMatrix4(hn),this}translate(t,e,s){return hn.makeTranslation(t,e,s),this.applyMatrix4(hn),this}scale(t,e,s){return hn.makeScale(t,e,s),this.applyMatrix4(hn),this}lookAt(t){return Do.lookAt(t),Do.updateMatrix(),this.applyMatrix4(Do.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gi).negate(),this.translate(Gi.x,Gi.y,Gi.z),this}setFromPoints(t){const e=[];for(let s=0,o=t.length;s<o;s++){const a=t[s];e.push(a.x,a.y,a.z||0)}return this.setAttribute("position",new ke(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fr);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new G(-1/0,-1/0,-1/0),new G(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let s=0,o=e.length;s<o;s++){const a=e[s];tn.setFromBufferAttribute(a),this.morphTargetsRelative?(Ie.addVectors(this.boundingBox.min,tn.min),this.boundingBox.expandByPoint(Ie),Ie.addVectors(this.boundingBox.max,tn.max),this.boundingBox.expandByPoint(Ie)):(this.boundingBox.expandByPoint(tn.min),this.boundingBox.expandByPoint(tn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Br);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new G,1/0);return}if(t){const s=this.boundingSphere.center;if(tn.setFromBufferAttribute(t),e)for(let a=0,h=e.length;a<h;a++){const c=e[a];wr.setFromBufferAttribute(c),this.morphTargetsRelative?(Ie.addVectors(tn.min,wr.min),tn.expandByPoint(Ie),Ie.addVectors(tn.max,wr.max),tn.expandByPoint(Ie)):(tn.expandByPoint(wr.min),tn.expandByPoint(wr.max))}tn.getCenter(s);let o=0;for(let a=0,h=t.count;a<h;a++)Ie.fromBufferAttribute(t,a),o=Math.max(o,s.distanceToSquared(Ie));if(e)for(let a=0,h=e.length;a<h;a++){const c=e[a],d=this.morphTargetsRelative;for(let f=0,p=c.count;f<p;f++)Ie.fromBufferAttribute(c,f),d&&(Gi.fromBufferAttribute(t,f),Ie.add(Gi)),o=Math.max(o,s.distanceToSquared(Ie))}this.boundingSphere.radius=Math.sqrt(o),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const s=t.array,o=e.position.array,a=e.normal.array,h=e.uv.array,c=o.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Sn(new Float32Array(4*c),4));const d=this.getAttribute("tangent").array,f=[],p=[];for(let I=0;I<c;I++)f[I]=new G,p[I]=new G;const _=new G,v=new G,y=new G,M=new ie,S=new ie,x=new ie,m=new G,P=new G;function b(I,J,it){_.fromArray(o,I*3),v.fromArray(o,J*3),y.fromArray(o,it*3),M.fromArray(h,I*2),S.fromArray(h,J*2),x.fromArray(h,it*2),v.sub(_),y.sub(_),S.sub(M),x.sub(M);const lt=1/(S.x*x.y-x.x*S.y);isFinite(lt)&&(m.copy(v).multiplyScalar(x.y).addScaledVector(y,-S.y).multiplyScalar(lt),P.copy(y).multiplyScalar(S.x).addScaledVector(v,-x.x).multiplyScalar(lt),f[I].add(m),f[J].add(m),f[it].add(m),p[I].add(P),p[J].add(P),p[it].add(P))}let D=this.groups;D.length===0&&(D=[{start:0,count:s.length}]);for(let I=0,J=D.length;I<J;++I){const it=D[I],lt=it.start,F=it.count;for(let $=lt,Q=lt+F;$<Q;$+=3)b(s[$+0],s[$+1],s[$+2])}const B=new G,C=new G,U=new G,et=new G;function w(I){U.fromArray(a,I*3),et.copy(U);const J=f[I];B.copy(J),B.sub(U.multiplyScalar(U.dot(J))).normalize(),C.crossVectors(et,J);const lt=C.dot(p[I])<0?-1:1;d[I*4]=B.x,d[I*4+1]=B.y,d[I*4+2]=B.z,d[I*4+3]=lt}for(let I=0,J=D.length;I<J;++I){const it=D[I],lt=it.start,F=it.count;for(let $=lt,Q=lt+F;$<Q;$+=3)w(s[$+0]),w(s[$+1]),w(s[$+2])}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let s=this.getAttribute("normal");if(s===void 0)s=new Sn(new Float32Array(e.count*3),3),this.setAttribute("normal",s);else for(let v=0,y=s.count;v<y;v++)s.setXYZ(v,0,0,0);const o=new G,a=new G,h=new G,c=new G,d=new G,f=new G,p=new G,_=new G;if(t)for(let v=0,y=t.count;v<y;v+=3){const M=t.getX(v+0),S=t.getX(v+1),x=t.getX(v+2);o.fromBufferAttribute(e,M),a.fromBufferAttribute(e,S),h.fromBufferAttribute(e,x),p.subVectors(h,a),_.subVectors(o,a),p.cross(_),c.fromBufferAttribute(s,M),d.fromBufferAttribute(s,S),f.fromBufferAttribute(s,x),c.add(p),d.add(p),f.add(p),s.setXYZ(M,c.x,c.y,c.z),s.setXYZ(S,d.x,d.y,d.z),s.setXYZ(x,f.x,f.y,f.z)}else for(let v=0,y=e.count;v<y;v+=3)o.fromBufferAttribute(e,v+0),a.fromBufferAttribute(e,v+1),h.fromBufferAttribute(e,v+2),p.subVectors(h,a),_.subVectors(o,a),p.cross(_),s.setXYZ(v+0,p.x,p.y,p.z),s.setXYZ(v+1,p.x,p.y,p.z),s.setXYZ(v+2,p.x,p.y,p.z);this.normalizeNormals(),s.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,s=t.count;e<s;e++)Ie.fromBufferAttribute(t,e),Ie.normalize(),t.setXYZ(e,Ie.x,Ie.y,Ie.z)}toNonIndexed(){function t(c,d){const f=c.array,p=c.itemSize,_=c.normalized,v=new f.constructor(d.length*p);let y=0,M=0;for(let S=0,x=d.length;S<x;S++){c.isInterleavedBufferAttribute?y=d[S]*c.data.stride+c.offset:y=d[S]*p;for(let m=0;m<p;m++)v[M++]=f[y++]}return new Sn(v,p,_)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Je,s=this.index.array,o=this.attributes;for(const c in o){const d=o[c],f=t(d,s);e.setAttribute(c,f)}const a=this.morphAttributes;for(const c in a){const d=[],f=a[c];for(let p=0,_=f.length;p<_;p++){const v=f[p],y=t(v,s);d.push(y)}e.morphAttributes[c]=d}e.morphTargetsRelative=this.morphTargetsRelative;const h=this.groups;for(let c=0,d=h.length;c<d;c++){const f=h[c];e.addGroup(f.start,f.count,f.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const d=this.parameters;for(const f in d)d[f]!==void 0&&(t[f]=d[f]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const s=this.attributes;for(const d in s){const f=s[d];t.data.attributes[d]=f.toJSON(t.data)}const o={};let a=!1;for(const d in this.morphAttributes){const f=this.morphAttributes[d],p=[];for(let _=0,v=f.length;_<v;_++){const y=f[_];p.push(y.toJSON(t.data))}p.length>0&&(o[d]=p,a=!0)}a&&(t.data.morphAttributes=o,t.data.morphTargetsRelative=this.morphTargetsRelative);const h=this.groups;h.length>0&&(t.data.groups=JSON.parse(JSON.stringify(h)));const c=this.boundingSphere;return c!==null&&(t.data.boundingSphere={center:c.center.toArray(),radius:c.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const s=t.index;s!==null&&this.setIndex(s.clone(e));const o=t.attributes;for(const f in o){const p=o[f];this.setAttribute(f,p.clone(e))}const a=t.morphAttributes;for(const f in a){const p=[],_=a[f];for(let v=0,y=_.length;v<y;v++)p.push(_[v].clone(e));this.morphAttributes[f]=p}this.morphTargetsRelative=t.morphTargetsRelative;const h=t.groups;for(let f=0,p=h.length;f<p;f++){const _=h[f];this.addGroup(_.start,_.count,_.materialIndex)}const c=t.boundingBox;c!==null&&(this.boundingBox=c.clone());const d=t.boundingSphere;return d!==null&&(this.boundingSphere=d.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ic=new Se,mi=new Bs,fs=new Br,rc=new G,Vi=new G,Wi=new G,Xi=new G,Uo=new G,ps=new G,ms=new ie,_s=new ie,gs=new ie,sc=new G,oc=new G,ac=new G,vs=new G,xs=new G;class en extends Ue{constructor(t=new Je,e=new Ur){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,s=Object.keys(e);if(s.length>0){const o=e[s[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,h=o.length;a<h;a++){const c=o[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[c]=a}}}}getVertexPosition(t,e){const s=this.geometry,o=s.attributes.position,a=s.morphAttributes.position,h=s.morphTargetsRelative;e.fromBufferAttribute(o,t);const c=this.morphTargetInfluences;if(a&&c){ps.set(0,0,0);for(let d=0,f=a.length;d<f;d++){const p=c[d],_=a[d];p!==0&&(Uo.fromBufferAttribute(_,t),h?ps.addScaledVector(Uo,p):ps.addScaledVector(Uo.sub(e),p))}e.add(ps)}return e}raycast(t,e){const s=this.geometry,o=this.material,a=this.matrixWorld;o!==void 0&&(s.boundingSphere===null&&s.computeBoundingSphere(),fs.copy(s.boundingSphere),fs.applyMatrix4(a),mi.copy(t.ray).recast(t.near),!(fs.containsPoint(mi.origin)===!1&&(mi.intersectSphere(fs,rc)===null||mi.origin.distanceToSquared(rc)>(t.far-t.near)**2))&&(ic.copy(a).invert(),mi.copy(t.ray).applyMatrix4(ic),!(s.boundingBox!==null&&mi.intersectsBox(s.boundingBox)===!1)&&this._computeIntersections(t,e,mi)))}_computeIntersections(t,e,s){let o;const a=this.geometry,h=this.material,c=a.index,d=a.attributes.position,f=a.attributes.uv,p=a.attributes.uv1,_=a.attributes.normal,v=a.groups,y=a.drawRange;if(c!==null)if(Array.isArray(h))for(let M=0,S=v.length;M<S;M++){const x=v[M],m=h[x.materialIndex],P=Math.max(x.start,y.start),b=Math.min(c.count,Math.min(x.start+x.count,y.start+y.count));for(let D=P,B=b;D<B;D+=3){const C=c.getX(D),U=c.getX(D+1),et=c.getX(D+2);o=ys(this,m,t,s,f,p,_,C,U,et),o&&(o.faceIndex=Math.floor(D/3),o.face.materialIndex=x.materialIndex,e.push(o))}}else{const M=Math.max(0,y.start),S=Math.min(c.count,y.start+y.count);for(let x=M,m=S;x<m;x+=3){const P=c.getX(x),b=c.getX(x+1),D=c.getX(x+2);o=ys(this,h,t,s,f,p,_,P,b,D),o&&(o.faceIndex=Math.floor(x/3),e.push(o))}}else if(d!==void 0)if(Array.isArray(h))for(let M=0,S=v.length;M<S;M++){const x=v[M],m=h[x.materialIndex],P=Math.max(x.start,y.start),b=Math.min(d.count,Math.min(x.start+x.count,y.start+y.count));for(let D=P,B=b;D<B;D+=3){const C=D,U=D+1,et=D+2;o=ys(this,m,t,s,f,p,_,C,U,et),o&&(o.faceIndex=Math.floor(D/3),o.face.materialIndex=x.materialIndex,e.push(o))}}else{const M=Math.max(0,y.start),S=Math.min(d.count,y.start+y.count);for(let x=M,m=S;x<m;x+=3){const P=x,b=x+1,D=x+2;o=ys(this,h,t,s,f,p,_,P,b,D),o&&(o.faceIndex=Math.floor(x/3),e.push(o))}}}}function rf(r,t,e,s,o,a,h,c){let d;if(t.side===je?d=s.intersectTriangle(h,a,o,!0,c):d=s.intersectTriangle(o,a,h,t.side===ni,c),d===null)return null;xs.copy(c),xs.applyMatrix4(r.matrixWorld);const f=e.ray.origin.distanceTo(xs);return f<e.near||f>e.far?null:{distance:f,point:xs.clone(),object:r}}function ys(r,t,e,s,o,a,h,c,d,f){r.getVertexPosition(c,Vi),r.getVertexPosition(d,Wi),r.getVertexPosition(f,Xi);const p=rf(r,t,e,s,Vi,Wi,Xi,vs);if(p){o&&(ms.fromBufferAttribute(o,c),_s.fromBufferAttribute(o,d),gs.fromBufferAttribute(o,f),p.uv=xn.getInterpolation(vs,Vi,Wi,Xi,ms,_s,gs,new ie)),a&&(ms.fromBufferAttribute(a,c),_s.fromBufferAttribute(a,d),gs.fromBufferAttribute(a,f),p.uv1=xn.getInterpolation(vs,Vi,Wi,Xi,ms,_s,gs,new ie),p.uv2=p.uv1),h&&(sc.fromBufferAttribute(h,c),oc.fromBufferAttribute(h,d),ac.fromBufferAttribute(h,f),p.normal=xn.getInterpolation(vs,Vi,Wi,Xi,sc,oc,ac,new G),p.normal.dot(s.direction)>0&&p.normal.multiplyScalar(-1));const _={a:c,b:d,c:f,normal:new G,materialIndex:0};xn.getNormal(Vi,Wi,Xi,_.normal),p.face=_}return p}class zr extends Je{constructor(t=1,e=1,s=1,o=1,a=1,h=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:s,widthSegments:o,heightSegments:a,depthSegments:h};const c=this;o=Math.floor(o),a=Math.floor(a),h=Math.floor(h);const d=[],f=[],p=[],_=[];let v=0,y=0;M("z","y","x",-1,-1,s,e,t,h,a,0),M("z","y","x",1,-1,s,e,-t,h,a,1),M("x","z","y",1,1,t,s,e,o,h,2),M("x","z","y",1,-1,t,s,-e,o,h,3),M("x","y","z",1,-1,t,e,s,o,a,4),M("x","y","z",-1,-1,t,e,-s,o,a,5),this.setIndex(d),this.setAttribute("position",new ke(f,3)),this.setAttribute("normal",new ke(p,3)),this.setAttribute("uv",new ke(_,2));function M(S,x,m,P,b,D,B,C,U,et,w){const I=D/U,J=B/et,it=D/2,lt=B/2,F=C/2,$=U+1,Q=et+1;let st=0,X=0;const V=new G;for(let z=0;z<Q;z++){const nt=z*J-lt;for(let ot=0;ot<$;ot++){const W=ot*I-it;V[S]=W*P,V[x]=nt*b,V[m]=F,f.push(V.x,V.y,V.z),V[S]=0,V[x]=0,V[m]=C>0?1:-1,p.push(V.x,V.y,V.z),_.push(ot/U),_.push(1-z/et),st+=1}}for(let z=0;z<et;z++)for(let nt=0;nt<U;nt++){const ot=v+nt+$*z,W=v+nt+$*(z+1),rt=v+(nt+1)+$*(z+1),ct=v+(nt+1)+$*z;d.push(ot,W,ct),d.push(W,rt,ct),X+=6}c.addGroup(y,X,w),y+=X,v+=st}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new zr(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function sr(r){const t={};for(const e in r){t[e]={};for(const s in r[e]){const o=r[e][s];o&&(o.isColor||o.isMatrix3||o.isMatrix4||o.isVector2||o.isVector3||o.isVector4||o.isTexture||o.isQuaternion)?o.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][s]=null):t[e][s]=o.clone():Array.isArray(o)?t[e][s]=o.slice():t[e][s]=o}}return t}function qe(r){const t={};for(let e=0;e<r.length;e++){const s=sr(r[e]);for(const o in s)t[o]=s[o]}return t}function sf(r){const t=[];for(let e=0;e<r.length;e++)t.push(r[e].clone());return t}function ah(r){return r.getRenderTarget()===null?r.outputColorSpace:pe.workingColorSpace}const of={clone:sr,merge:qe};var af=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,lf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class bi extends wi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=af,this.fragmentShader=lf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=sr(t.uniforms),this.uniformsGroups=sf(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const o in this.uniforms){const h=this.uniforms[o].value;h&&h.isTexture?e.uniforms[o]={type:"t",value:h.toJSON(t).uuid}:h&&h.isColor?e.uniforms[o]={type:"c",value:h.getHex()}:h&&h.isVector2?e.uniforms[o]={type:"v2",value:h.toArray()}:h&&h.isVector3?e.uniforms[o]={type:"v3",value:h.toArray()}:h&&h.isVector4?e.uniforms[o]={type:"v4",value:h.toArray()}:h&&h.isMatrix3?e.uniforms[o]={type:"m3",value:h.toArray()}:h&&h.isMatrix4?e.uniforms[o]={type:"m4",value:h.toArray()}:e.uniforms[o]={value:h}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const s={};for(const o in this.extensions)this.extensions[o]===!0&&(s[o]=!0);return Object.keys(s).length>0&&(e.extensions=s),e}}class lh extends Ue{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Se,this.projectionMatrix=new Se,this.projectionMatrixInverse=new Se,this.coordinateSystem=kn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class dn extends lh{constructor(t=50,e=1,s=.1,o=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=s,this.far=o,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Ir*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Ar*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ir*2*Math.atan(Math.tan(Ar*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(t,e,s,o,a,h){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=s,this.view.offsetY=o,this.view.width=a,this.view.height=h,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Ar*.5*this.fov)/this.zoom,s=2*e,o=this.aspect*s,a=-.5*o;const h=this.view;if(this.view!==null&&this.view.enabled){const d=h.fullWidth,f=h.fullHeight;a+=h.offsetX*o/d,e-=h.offsetY*s/f,o*=h.width/d,s*=h.height/f}const c=this.filmOffset;c!==0&&(a+=t*c/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+o,e,e-s,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Zi=-90,qi=1;class cf extends Ue{constructor(t,e,s){super(),this.type="CubeCamera",this.renderTarget=s,this.coordinateSystem=null,this.activeMipmapLevel=0;const o=new dn(Zi,qi,t,e);o.layers=this.layers,this.add(o);const a=new dn(Zi,qi,t,e);a.layers=this.layers,this.add(a);const h=new dn(Zi,qi,t,e);h.layers=this.layers,this.add(h);const c=new dn(Zi,qi,t,e);c.layers=this.layers,this.add(c);const d=new dn(Zi,qi,t,e);d.layers=this.layers,this.add(d);const f=new dn(Zi,qi,t,e);f.layers=this.layers,this.add(f)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[s,o,a,h,c,d]=e;for(const f of e)this.remove(f);if(t===kn)s.up.set(0,1,0),s.lookAt(1,0,0),o.up.set(0,1,0),o.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),h.up.set(0,0,1),h.lookAt(0,-1,0),c.up.set(0,1,0),c.lookAt(0,0,1),d.up.set(0,1,0),d.lookAt(0,0,-1);else if(t===Ds)s.up.set(0,-1,0),s.lookAt(-1,0,0),o.up.set(0,-1,0),o.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),h.up.set(0,0,-1),h.lookAt(0,-1,0),c.up.set(0,-1,0),c.lookAt(0,0,1),d.up.set(0,-1,0),d.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const f of e)this.add(f),f.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:s,activeMipmapLevel:o}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[a,h,c,d,f,p]=this.children,_=t.getRenderTarget(),v=t.getActiveCubeFace(),y=t.getActiveMipmapLevel(),M=t.xr.enabled;t.xr.enabled=!1;const S=s.texture.generateMipmaps;s.texture.generateMipmaps=!1,t.setRenderTarget(s,0,o),t.render(e,a),t.setRenderTarget(s,1,o),t.render(e,h),t.setRenderTarget(s,2,o),t.render(e,c),t.setRenderTarget(s,3,o),t.render(e,d),t.setRenderTarget(s,4,o),t.render(e,f),s.texture.generateMipmaps=S,t.setRenderTarget(s,5,o),t.render(e,p),t.setRenderTarget(_,v,y),t.xr.enabled=M,s.texture.needsPMREMUpdate=!0}}class ch extends $e{constructor(t,e,s,o,a,h,c,d,f,p){t=t!==void 0?t:[],e=e!==void 0?e:nr,super(t,e,s,o,a,h,c,d,f,p),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class hf extends Ti{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const s={width:t,height:t,depth:1},o=[s,s,s,s,s,s];e.encoding!==void 0&&(Pr("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),e.colorSpace=e.encoding===Ei?ze:fn),this.texture=new ch(o,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:un}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const s={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},o=new zr(5,5,5),a=new bi({name:"CubemapFromEquirect",uniforms:sr(s.uniforms),vertexShader:s.vertexShader,fragmentShader:s.fragmentShader,side:je,blending:Qn});a.uniforms.tEquirect.value=e;const h=new en(o,a),c=e.minFilter;return e.minFilter===Rr&&(e.minFilter=un),new cf(1,10,this).update(t,h),e.minFilter=c,h.geometry.dispose(),h.material.dispose(),this}clear(t,e,s,o){const a=t.getRenderTarget();for(let h=0;h<6;h++)t.setRenderTarget(this,h),t.clear(e,s,o);t.setRenderTarget(a)}}const No=new G,uf=new G,df=new ne;class gi{constructor(t=new G(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,s,o){return this.normal.set(t,e,s),this.constant=o,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,s){const o=No.subVectors(s,e).cross(uf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(o,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const s=t.delta(No),o=this.normal.dot(s);if(o===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const a=-(t.start.dot(this.normal)+this.constant)/o;return a<0||a>1?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){const e=this.distanceToPoint(t.start),s=this.distanceToPoint(t.end);return e<0&&s>0||s<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const s=e||df.getNormalMatrix(t),o=this.coplanarPoint(No).applyMatrix4(t),a=this.normal.applyMatrix3(s).normalize();return this.constant=-o.dot(a),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const _i=new Br,Ms=new G;class ha{constructor(t=new gi,e=new gi,s=new gi,o=new gi,a=new gi,h=new gi){this.planes=[t,e,s,o,a,h]}set(t,e,s,o,a,h){const c=this.planes;return c[0].copy(t),c[1].copy(e),c[2].copy(s),c[3].copy(o),c[4].copy(a),c[5].copy(h),this}copy(t){const e=this.planes;for(let s=0;s<6;s++)e[s].copy(t.planes[s]);return this}setFromProjectionMatrix(t,e=kn){const s=this.planes,o=t.elements,a=o[0],h=o[1],c=o[2],d=o[3],f=o[4],p=o[5],_=o[6],v=o[7],y=o[8],M=o[9],S=o[10],x=o[11],m=o[12],P=o[13],b=o[14],D=o[15];if(s[0].setComponents(d-a,v-f,x-y,D-m).normalize(),s[1].setComponents(d+a,v+f,x+y,D+m).normalize(),s[2].setComponents(d+h,v+p,x+M,D+P).normalize(),s[3].setComponents(d-h,v-p,x-M,D-P).normalize(),s[4].setComponents(d-c,v-_,x-S,D-b).normalize(),e===kn)s[5].setComponents(d+c,v+_,x+S,D+b).normalize();else if(e===Ds)s[5].setComponents(c,_,S,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),_i.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),_i.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(_i)}intersectsSprite(t){return _i.center.set(0,0,0),_i.radius=.7071067811865476,_i.applyMatrix4(t.matrixWorld),this.intersectsSphere(_i)}intersectsSphere(t){const e=this.planes,s=t.center,o=-t.radius;for(let a=0;a<6;a++)if(e[a].distanceToPoint(s)<o)return!1;return!0}intersectsBox(t){const e=this.planes;for(let s=0;s<6;s++){const o=e[s];if(Ms.x=o.normal.x>0?t.max.x:t.min.x,Ms.y=o.normal.y>0?t.max.y:t.min.y,Ms.z=o.normal.z>0?t.max.z:t.min.z,o.distanceToPoint(Ms)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let s=0;s<6;s++)if(e[s].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function hh(){let r=null,t=!1,e=null,s=null;function o(a,h){e(a,h),s=r.requestAnimationFrame(o)}return{start:function(){t!==!0&&e!==null&&(s=r.requestAnimationFrame(o),t=!0)},stop:function(){r.cancelAnimationFrame(s),t=!1},setAnimationLoop:function(a){e=a},setContext:function(a){r=a}}}function ff(r,t){const e=t.isWebGL2,s=new WeakMap;function o(f,p){const _=f.array,v=f.usage,y=_.byteLength,M=r.createBuffer();r.bindBuffer(p,M),r.bufferData(p,_,v),f.onUploadCallback();let S;if(_ instanceof Float32Array)S=r.FLOAT;else if(_ instanceof Uint16Array)if(f.isFloat16BufferAttribute)if(e)S=r.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else S=r.UNSIGNED_SHORT;else if(_ instanceof Int16Array)S=r.SHORT;else if(_ instanceof Uint32Array)S=r.UNSIGNED_INT;else if(_ instanceof Int32Array)S=r.INT;else if(_ instanceof Int8Array)S=r.BYTE;else if(_ instanceof Uint8Array)S=r.UNSIGNED_BYTE;else if(_ instanceof Uint8ClampedArray)S=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+_);return{buffer:M,type:S,bytesPerElement:_.BYTES_PER_ELEMENT,version:f.version,size:y}}function a(f,p,_){const v=p.array,y=p._updateRange,M=p.updateRanges;if(r.bindBuffer(_,f),y.count===-1&&M.length===0&&r.bufferSubData(_,0,v),M.length!==0){for(let S=0,x=M.length;S<x;S++){const m=M[S];e?r.bufferSubData(_,m.start*v.BYTES_PER_ELEMENT,v,m.start,m.count):r.bufferSubData(_,m.start*v.BYTES_PER_ELEMENT,v.subarray(m.start,m.start+m.count))}p.clearUpdateRanges()}y.count!==-1&&(e?r.bufferSubData(_,y.offset*v.BYTES_PER_ELEMENT,v,y.offset,y.count):r.bufferSubData(_,y.offset*v.BYTES_PER_ELEMENT,v.subarray(y.offset,y.offset+y.count)),y.count=-1),p.onUploadCallback()}function h(f){return f.isInterleavedBufferAttribute&&(f=f.data),s.get(f)}function c(f){f.isInterleavedBufferAttribute&&(f=f.data);const p=s.get(f);p&&(r.deleteBuffer(p.buffer),s.delete(f))}function d(f,p){if(f.isGLBufferAttribute){const v=s.get(f);(!v||v.version<f.version)&&s.set(f,{buffer:f.buffer,type:f.type,bytesPerElement:f.elementSize,version:f.version});return}f.isInterleavedBufferAttribute&&(f=f.data);const _=s.get(f);if(_===void 0)s.set(f,o(f,p));else if(_.version<f.version){if(_.size!==f.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");a(_.buffer,f,p),_.version=f.version}}return{get:h,remove:c,update:d}}class ua extends Je{constructor(t=1,e=1,s=1,o=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:s,heightSegments:o};const a=t/2,h=e/2,c=Math.floor(s),d=Math.floor(o),f=c+1,p=d+1,_=t/c,v=e/d,y=[],M=[],S=[],x=[];for(let m=0;m<p;m++){const P=m*v-h;for(let b=0;b<f;b++){const D=b*_-a;M.push(D,-P,0),S.push(0,0,1),x.push(b/c),x.push(1-m/d)}}for(let m=0;m<d;m++)for(let P=0;P<c;P++){const b=P+f*m,D=P+f*(m+1),B=P+1+f*(m+1),C=P+1+f*m;y.push(b,D,C),y.push(D,B,C)}this.setIndex(y),this.setAttribute("position",new ke(M,3)),this.setAttribute("normal",new ke(S,3)),this.setAttribute("uv",new ke(x,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ua(t.width,t.height,t.widthSegments,t.heightSegments)}}var pf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,mf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,_f=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,gf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vf=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,xf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,yf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Mf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Sf=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Ef=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Tf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,bf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,wf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Af=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Lf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Pf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,Rf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Cf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,If=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Df=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Uf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Nf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,Of=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Ff=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Bf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,zf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,kf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Hf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Gf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Vf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Wf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Xf=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,Zf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,qf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Yf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,jf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Kf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,$f=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Jf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Qf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,tp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ep=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,np=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,ip=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,rp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,sp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,op=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ap=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,lp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,cp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,hp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,up=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,dp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,fp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,pp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,mp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,_p=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,gp=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,vp=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,xp=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,yp=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Mp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Sp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ep=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Tp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,wp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ap=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Lp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,Pp=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,Rp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,Cp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Ip=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Dp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Up=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Np=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Op=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Fp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Bp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,zp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,kp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Hp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Gp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Vp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Wp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Xp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Zp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,qp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Yp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,jp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,Kp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,$p=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Jp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Qp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,tm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,em=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,nm=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,im=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,rm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,sm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,om=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,am=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,lm=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,cm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,hm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,um=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,dm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const fm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,pm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,mm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_m=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,vm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,xm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,ym=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,Mm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Sm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Em=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Tm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,wm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Am=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Lm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Rm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Cm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Im=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Dm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Um=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Nm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Om=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Bm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,km=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Gm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Vm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Wm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Xm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Zm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Qt={alphahash_fragment:pf,alphahash_pars_fragment:mf,alphamap_fragment:_f,alphamap_pars_fragment:gf,alphatest_fragment:vf,alphatest_pars_fragment:xf,aomap_fragment:yf,aomap_pars_fragment:Mf,batching_pars_vertex:Sf,batching_vertex:Ef,begin_vertex:Tf,beginnormal_vertex:bf,bsdfs:wf,iridescence_fragment:Af,bumpmap_pars_fragment:Lf,clipping_planes_fragment:Pf,clipping_planes_pars_fragment:Rf,clipping_planes_pars_vertex:Cf,clipping_planes_vertex:If,color_fragment:Df,color_pars_fragment:Uf,color_pars_vertex:Nf,color_vertex:Of,common:Ff,cube_uv_reflection_fragment:Bf,defaultnormal_vertex:zf,displacementmap_pars_vertex:kf,displacementmap_vertex:Hf,emissivemap_fragment:Gf,emissivemap_pars_fragment:Vf,colorspace_fragment:Wf,colorspace_pars_fragment:Xf,envmap_fragment:Zf,envmap_common_pars_fragment:qf,envmap_pars_fragment:Yf,envmap_pars_vertex:jf,envmap_physical_pars_fragment:ap,envmap_vertex:Kf,fog_vertex:$f,fog_pars_vertex:Jf,fog_fragment:Qf,fog_pars_fragment:tp,gradientmap_pars_fragment:ep,lightmap_fragment:np,lightmap_pars_fragment:ip,lights_lambert_fragment:rp,lights_lambert_pars_fragment:sp,lights_pars_begin:op,lights_toon_fragment:lp,lights_toon_pars_fragment:cp,lights_phong_fragment:hp,lights_phong_pars_fragment:up,lights_physical_fragment:dp,lights_physical_pars_fragment:fp,lights_fragment_begin:pp,lights_fragment_maps:mp,lights_fragment_end:_p,logdepthbuf_fragment:gp,logdepthbuf_pars_fragment:vp,logdepthbuf_pars_vertex:xp,logdepthbuf_vertex:yp,map_fragment:Mp,map_pars_fragment:Sp,map_particle_fragment:Ep,map_particle_pars_fragment:Tp,metalnessmap_fragment:bp,metalnessmap_pars_fragment:wp,morphcolor_vertex:Ap,morphnormal_vertex:Lp,morphtarget_pars_vertex:Pp,morphtarget_vertex:Rp,normal_fragment_begin:Cp,normal_fragment_maps:Ip,normal_pars_fragment:Dp,normal_pars_vertex:Up,normal_vertex:Np,normalmap_pars_fragment:Op,clearcoat_normal_fragment_begin:Fp,clearcoat_normal_fragment_maps:Bp,clearcoat_pars_fragment:zp,iridescence_pars_fragment:kp,opaque_fragment:Hp,packing:Gp,premultiplied_alpha_fragment:Vp,project_vertex:Wp,dithering_fragment:Xp,dithering_pars_fragment:Zp,roughnessmap_fragment:qp,roughnessmap_pars_fragment:Yp,shadowmap_pars_fragment:jp,shadowmap_pars_vertex:Kp,shadowmap_vertex:$p,shadowmask_pars_fragment:Jp,skinbase_vertex:Qp,skinning_pars_vertex:tm,skinning_vertex:em,skinnormal_vertex:nm,specularmap_fragment:im,specularmap_pars_fragment:rm,tonemapping_fragment:sm,tonemapping_pars_fragment:om,transmission_fragment:am,transmission_pars_fragment:lm,uv_pars_fragment:cm,uv_pars_vertex:hm,uv_vertex:um,worldpos_vertex:dm,background_vert:fm,background_frag:pm,backgroundCube_vert:mm,backgroundCube_frag:_m,cube_vert:gm,cube_frag:vm,depth_vert:xm,depth_frag:ym,distanceRGBA_vert:Mm,distanceRGBA_frag:Sm,equirect_vert:Em,equirect_frag:Tm,linedashed_vert:bm,linedashed_frag:wm,meshbasic_vert:Am,meshbasic_frag:Lm,meshlambert_vert:Pm,meshlambert_frag:Rm,meshmatcap_vert:Cm,meshmatcap_frag:Im,meshnormal_vert:Dm,meshnormal_frag:Um,meshphong_vert:Nm,meshphong_frag:Om,meshphysical_vert:Fm,meshphysical_frag:Bm,meshtoon_vert:zm,meshtoon_frag:km,points_vert:Hm,points_frag:Gm,shadow_vert:Vm,shadow_frag:Wm,sprite_vert:Xm,sprite_frag:Zm},_t={common:{diffuse:{value:new le(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ne},alphaMap:{value:null},alphaMapTransform:{value:new ne},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ne}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ne}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ne}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ne},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ne},normalScale:{value:new ie(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ne},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ne}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ne}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ne}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new le(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new le(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ne},alphaTest:{value:0},uvTransform:{value:new ne}},sprite:{diffuse:{value:new le(16777215)},opacity:{value:1},center:{value:new ie(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ne},alphaMap:{value:null},alphaMapTransform:{value:new ne},alphaTest:{value:0}}},wn={basic:{uniforms:qe([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.fog]),vertexShader:Qt.meshbasic_vert,fragmentShader:Qt.meshbasic_frag},lambert:{uniforms:qe([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new le(0)}}]),vertexShader:Qt.meshlambert_vert,fragmentShader:Qt.meshlambert_frag},phong:{uniforms:qe([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new le(0)},specular:{value:new le(1118481)},shininess:{value:30}}]),vertexShader:Qt.meshphong_vert,fragmentShader:Qt.meshphong_frag},standard:{uniforms:qe([_t.common,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.roughnessmap,_t.metalnessmap,_t.fog,_t.lights,{emissive:{value:new le(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qt.meshphysical_vert,fragmentShader:Qt.meshphysical_frag},toon:{uniforms:qe([_t.common,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.gradientmap,_t.fog,_t.lights,{emissive:{value:new le(0)}}]),vertexShader:Qt.meshtoon_vert,fragmentShader:Qt.meshtoon_frag},matcap:{uniforms:qe([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,{matcap:{value:null}}]),vertexShader:Qt.meshmatcap_vert,fragmentShader:Qt.meshmatcap_frag},points:{uniforms:qe([_t.points,_t.fog]),vertexShader:Qt.points_vert,fragmentShader:Qt.points_frag},dashed:{uniforms:qe([_t.common,_t.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qt.linedashed_vert,fragmentShader:Qt.linedashed_frag},depth:{uniforms:qe([_t.common,_t.displacementmap]),vertexShader:Qt.depth_vert,fragmentShader:Qt.depth_frag},normal:{uniforms:qe([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,{opacity:{value:1}}]),vertexShader:Qt.meshnormal_vert,fragmentShader:Qt.meshnormal_frag},sprite:{uniforms:qe([_t.sprite,_t.fog]),vertexShader:Qt.sprite_vert,fragmentShader:Qt.sprite_frag},background:{uniforms:{uvTransform:{value:new ne},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qt.background_vert,fragmentShader:Qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Qt.backgroundCube_vert,fragmentShader:Qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qt.cube_vert,fragmentShader:Qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qt.equirect_vert,fragmentShader:Qt.equirect_frag},distanceRGBA:{uniforms:qe([_t.common,_t.displacementmap,{referencePosition:{value:new G},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qt.distanceRGBA_vert,fragmentShader:Qt.distanceRGBA_frag},shadow:{uniforms:qe([_t.lights,_t.fog,{color:{value:new le(0)},opacity:{value:1}}]),vertexShader:Qt.shadow_vert,fragmentShader:Qt.shadow_frag}};wn.physical={uniforms:qe([wn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ne},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ne},clearcoatNormalScale:{value:new ie(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ne},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ne},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ne},sheen:{value:0},sheenColor:{value:new le(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ne},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ne},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ne},transmissionSamplerSize:{value:new ie},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ne},attenuationDistance:{value:0},attenuationColor:{value:new le(0)},specularColor:{value:new le(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ne},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ne},anisotropyVector:{value:new ie},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ne}}]),vertexShader:Qt.meshphysical_vert,fragmentShader:Qt.meshphysical_frag};const Ss={r:0,b:0,g:0};function qm(r,t,e,s,o,a,h){const c=new le(0);let d=a===!0?0:1,f,p,_=null,v=0,y=null;function M(x,m){let P=!1,b=m.isScene===!0?m.background:null;b&&b.isTexture&&(b=(m.backgroundBlurriness>0?e:t).get(b)),b===null?S(c,d):b&&b.isColor&&(S(b,1),P=!0);const D=r.xr.getEnvironmentBlendMode();D==="additive"?s.buffers.color.setClear(0,0,0,1,h):D==="alpha-blend"&&s.buffers.color.setClear(0,0,0,0,h),(r.autoClear||P)&&r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil),b&&(b.isCubeTexture||b.mapping===Os)?(p===void 0&&(p=new en(new zr(1,1,1),new bi({name:"BackgroundCubeMaterial",uniforms:sr(wn.backgroundCube.uniforms),vertexShader:wn.backgroundCube.vertexShader,fragmentShader:wn.backgroundCube.fragmentShader,side:je,depthTest:!1,depthWrite:!1,fog:!1})),p.geometry.deleteAttribute("normal"),p.geometry.deleteAttribute("uv"),p.onBeforeRender=function(B,C,U){this.matrixWorld.copyPosition(U.matrixWorld)},Object.defineProperty(p.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),o.update(p)),p.material.uniforms.envMap.value=b,p.material.uniforms.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,p.material.uniforms.backgroundBlurriness.value=m.backgroundBlurriness,p.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,p.material.toneMapped=pe.getTransfer(b.colorSpace)!==ve,(_!==b||v!==b.version||y!==r.toneMapping)&&(p.material.needsUpdate=!0,_=b,v=b.version,y=r.toneMapping),p.layers.enableAll(),x.unshift(p,p.geometry,p.material,0,0,null)):b&&b.isTexture&&(f===void 0&&(f=new en(new ua(2,2),new bi({name:"BackgroundMaterial",uniforms:sr(wn.background.uniforms),vertexShader:wn.background.vertexShader,fragmentShader:wn.background.fragmentShader,side:ni,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),Object.defineProperty(f.material,"map",{get:function(){return this.uniforms.t2D.value}}),o.update(f)),f.material.uniforms.t2D.value=b,f.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,f.material.toneMapped=pe.getTransfer(b.colorSpace)!==ve,b.matrixAutoUpdate===!0&&b.updateMatrix(),f.material.uniforms.uvTransform.value.copy(b.matrix),(_!==b||v!==b.version||y!==r.toneMapping)&&(f.material.needsUpdate=!0,_=b,v=b.version,y=r.toneMapping),f.layers.enableAll(),x.unshift(f,f.geometry,f.material,0,0,null))}function S(x,m){x.getRGB(Ss,ah(r)),s.buffers.color.setClear(Ss.r,Ss.g,Ss.b,m,h)}return{getClearColor:function(){return c},setClearColor:function(x,m=1){c.set(x),d=m,S(c,d)},getClearAlpha:function(){return d},setClearAlpha:function(x){d=x,S(c,d)},render:M}}function Ym(r,t,e,s){const o=r.getParameter(r.MAX_VERTEX_ATTRIBS),a=s.isWebGL2?null:t.get("OES_vertex_array_object"),h=s.isWebGL2||a!==null,c={},d=x(null);let f=d,p=!1;function _(F,$,Q,st,X){let V=!1;if(h){const z=S(st,Q,$);f!==z&&(f=z,y(f.object)),V=m(F,st,Q,X),V&&P(F,st,Q,X)}else{const z=$.wireframe===!0;(f.geometry!==st.id||f.program!==Q.id||f.wireframe!==z)&&(f.geometry=st.id,f.program=Q.id,f.wireframe=z,V=!0)}X!==null&&e.update(X,r.ELEMENT_ARRAY_BUFFER),(V||p)&&(p=!1,et(F,$,Q,st),X!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(X).buffer))}function v(){return s.isWebGL2?r.createVertexArray():a.createVertexArrayOES()}function y(F){return s.isWebGL2?r.bindVertexArray(F):a.bindVertexArrayOES(F)}function M(F){return s.isWebGL2?r.deleteVertexArray(F):a.deleteVertexArrayOES(F)}function S(F,$,Q){const st=Q.wireframe===!0;let X=c[F.id];X===void 0&&(X={},c[F.id]=X);let V=X[$.id];V===void 0&&(V={},X[$.id]=V);let z=V[st];return z===void 0&&(z=x(v()),V[st]=z),z}function x(F){const $=[],Q=[],st=[];for(let X=0;X<o;X++)$[X]=0,Q[X]=0,st[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:$,enabledAttributes:Q,attributeDivisors:st,object:F,attributes:{},index:null}}function m(F,$,Q,st){const X=f.attributes,V=$.attributes;let z=0;const nt=Q.getAttributes();for(const ot in nt)if(nt[ot].location>=0){const rt=X[ot];let ct=V[ot];if(ct===void 0&&(ot==="instanceMatrix"&&F.instanceMatrix&&(ct=F.instanceMatrix),ot==="instanceColor"&&F.instanceColor&&(ct=F.instanceColor)),rt===void 0||rt.attribute!==ct||ct&&rt.data!==ct.data)return!0;z++}return f.attributesNum!==z||f.index!==st}function P(F,$,Q,st){const X={},V=$.attributes;let z=0;const nt=Q.getAttributes();for(const ot in nt)if(nt[ot].location>=0){let rt=V[ot];rt===void 0&&(ot==="instanceMatrix"&&F.instanceMatrix&&(rt=F.instanceMatrix),ot==="instanceColor"&&F.instanceColor&&(rt=F.instanceColor));const ct={};ct.attribute=rt,rt&&rt.data&&(ct.data=rt.data),X[ot]=ct,z++}f.attributes=X,f.attributesNum=z,f.index=st}function b(){const F=f.newAttributes;for(let $=0,Q=F.length;$<Q;$++)F[$]=0}function D(F){B(F,0)}function B(F,$){const Q=f.newAttributes,st=f.enabledAttributes,X=f.attributeDivisors;Q[F]=1,st[F]===0&&(r.enableVertexAttribArray(F),st[F]=1),X[F]!==$&&((s.isWebGL2?r:t.get("ANGLE_instanced_arrays"))[s.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](F,$),X[F]=$)}function C(){const F=f.newAttributes,$=f.enabledAttributes;for(let Q=0,st=$.length;Q<st;Q++)$[Q]!==F[Q]&&(r.disableVertexAttribArray(Q),$[Q]=0)}function U(F,$,Q,st,X,V,z){z===!0?r.vertexAttribIPointer(F,$,Q,X,V):r.vertexAttribPointer(F,$,Q,st,X,V)}function et(F,$,Q,st){if(s.isWebGL2===!1&&(F.isInstancedMesh||st.isInstancedBufferGeometry)&&t.get("ANGLE_instanced_arrays")===null)return;b();const X=st.attributes,V=Q.getAttributes(),z=$.defaultAttributeValues;for(const nt in V){const ot=V[nt];if(ot.location>=0){let W=X[nt];if(W===void 0&&(nt==="instanceMatrix"&&F.instanceMatrix&&(W=F.instanceMatrix),nt==="instanceColor"&&F.instanceColor&&(W=F.instanceColor)),W!==void 0){const rt=W.normalized,ct=W.itemSize,pt=e.get(W);if(pt===void 0)continue;const St=pt.buffer,Ut=pt.type,Zt=pt.bytesPerElement,Nt=s.isWebGL2===!0&&(Ut===r.INT||Ut===r.UNSIGNED_INT||W.gpuType===Wc);if(W.isInterleavedBufferAttribute){const re=W.data,Z=re.stride,Ae=W.offset;if(re.isInstancedInterleavedBuffer){for(let It=0;It<ot.locationSize;It++)B(ot.location+It,re.meshPerAttribute);F.isInstancedMesh!==!0&&st._maxInstanceCount===void 0&&(st._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let It=0;It<ot.locationSize;It++)D(ot.location+It);r.bindBuffer(r.ARRAY_BUFFER,St);for(let It=0;It<ot.locationSize;It++)U(ot.location+It,ct/ot.locationSize,Ut,rt,Z*Zt,(Ae+ct/ot.locationSize*It)*Zt,Nt)}else{if(W.isInstancedBufferAttribute){for(let re=0;re<ot.locationSize;re++)B(ot.location+re,W.meshPerAttribute);F.isInstancedMesh!==!0&&st._maxInstanceCount===void 0&&(st._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let re=0;re<ot.locationSize;re++)D(ot.location+re);r.bindBuffer(r.ARRAY_BUFFER,St);for(let re=0;re<ot.locationSize;re++)U(ot.location+re,ct/ot.locationSize,Ut,rt,ct*Zt,ct/ot.locationSize*re*Zt,Nt)}}else if(z!==void 0){const rt=z[nt];if(rt!==void 0)switch(rt.length){case 2:r.vertexAttrib2fv(ot.location,rt);break;case 3:r.vertexAttrib3fv(ot.location,rt);break;case 4:r.vertexAttrib4fv(ot.location,rt);break;default:r.vertexAttrib1fv(ot.location,rt)}}}}C()}function w(){it();for(const F in c){const $=c[F];for(const Q in $){const st=$[Q];for(const X in st)M(st[X].object),delete st[X];delete $[Q]}delete c[F]}}function I(F){if(c[F.id]===void 0)return;const $=c[F.id];for(const Q in $){const st=$[Q];for(const X in st)M(st[X].object),delete st[X];delete $[Q]}delete c[F.id]}function J(F){for(const $ in c){const Q=c[$];if(Q[F.id]===void 0)continue;const st=Q[F.id];for(const X in st)M(st[X].object),delete st[X];delete Q[F.id]}}function it(){lt(),p=!0,f!==d&&(f=d,y(f.object))}function lt(){d.geometry=null,d.program=null,d.wireframe=!1}return{setup:_,reset:it,resetDefaultState:lt,dispose:w,releaseStatesOfGeometry:I,releaseStatesOfProgram:J,initAttributes:b,enableAttribute:D,disableUnusedAttributes:C}}function jm(r,t,e,s){const o=s.isWebGL2;let a;function h(p){a=p}function c(p,_){r.drawArrays(a,p,_),e.update(_,a,1)}function d(p,_,v){if(v===0)return;let y,M;if(o)y=r,M="drawArraysInstanced";else if(y=t.get("ANGLE_instanced_arrays"),M="drawArraysInstancedANGLE",y===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}y[M](a,p,_,v),e.update(_,a,v)}function f(p,_,v){if(v===0)return;const y=t.get("WEBGL_multi_draw");if(y===null)for(let M=0;M<v;M++)this.render(p[M],_[M]);else{y.multiDrawArraysWEBGL(a,p,0,_,0,v);let M=0;for(let S=0;S<v;S++)M+=_[S];e.update(M,a,1)}}this.setMode=h,this.render=c,this.renderInstances=d,this.renderMultiDraw=f}function Km(r,t,e){let s;function o(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const U=t.get("EXT_texture_filter_anisotropic");s=r.getParameter(U.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(U){if(U==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";U="mediump"}return U==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const h=typeof WebGL2RenderingContext<"u"&&r.constructor.name==="WebGL2RenderingContext";let c=e.precision!==void 0?e.precision:"highp";const d=a(c);d!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);const f=h||t.has("WEBGL_draw_buffers"),p=e.logarithmicDepthBuffer===!0,_=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),v=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=r.getParameter(r.MAX_TEXTURE_SIZE),M=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),S=r.getParameter(r.MAX_VERTEX_ATTRIBS),x=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),m=r.getParameter(r.MAX_VARYING_VECTORS),P=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),b=v>0,D=h||t.has("OES_texture_float"),B=b&&D,C=h?r.getParameter(r.MAX_SAMPLES):0;return{isWebGL2:h,drawBuffers:f,getMaxAnisotropy:o,getMaxPrecision:a,precision:c,logarithmicDepthBuffer:p,maxTextures:_,maxVertexTextures:v,maxTextureSize:y,maxCubemapSize:M,maxAttributes:S,maxVertexUniforms:x,maxVaryings:m,maxFragmentUniforms:P,vertexTextures:b,floatFragmentTextures:D,floatVertexTextures:B,maxSamples:C}}function $m(r){const t=this;let e=null,s=0,o=!1,a=!1;const h=new gi,c=new ne,d={value:null,needsUpdate:!1};this.uniform=d,this.numPlanes=0,this.numIntersection=0,this.init=function(_,v){const y=_.length!==0||v||s!==0||o;return o=v,s=_.length,y},this.beginShadows=function(){a=!0,p(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(_,v){e=p(_,v,0)},this.setState=function(_,v,y){const M=_.clippingPlanes,S=_.clipIntersection,x=_.clipShadows,m=r.get(_);if(!o||M===null||M.length===0||a&&!x)a?p(null):f();else{const P=a?0:s,b=P*4;let D=m.clippingState||null;d.value=D,D=p(M,v,b,y);for(let B=0;B!==b;++B)D[B]=e[B];m.clippingState=D,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=P}};function f(){d.value!==e&&(d.value=e,d.needsUpdate=s>0),t.numPlanes=s,t.numIntersection=0}function p(_,v,y,M){const S=_!==null?_.length:0;let x=null;if(S!==0){if(x=d.value,M!==!0||x===null){const m=y+S*4,P=v.matrixWorldInverse;c.getNormalMatrix(P),(x===null||x.length<m)&&(x=new Float32Array(m));for(let b=0,D=y;b!==S;++b,D+=4)h.copy(_[b]).applyMatrix4(P,c),h.normal.toArray(x,D),x[D+3]=h.constant}d.value=x,d.needsUpdate=!0}return t.numPlanes=S,t.numIntersection=0,x}}function Jm(r){let t=new WeakMap;function e(h,c){return c===qo?h.mapping=nr:c===Yo&&(h.mapping=ir),h}function s(h){if(h&&h.isTexture){const c=h.mapping;if(c===qo||c===Yo)if(t.has(h)){const d=t.get(h).texture;return e(d,h.mapping)}else{const d=h.image;if(d&&d.height>0){const f=new hf(d.height/2);return f.fromEquirectangularTexture(r,h),t.set(h,f),h.addEventListener("dispose",o),e(f.texture,h.mapping)}else return null}}return h}function o(h){const c=h.target;c.removeEventListener("dispose",o);const d=t.get(c);d!==void 0&&(t.delete(c),d.dispose())}function a(){t=new WeakMap}return{get:s,dispose:a}}class uh extends lh{constructor(t=-1,e=1,s=1,o=-1,a=.1,h=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=s,this.bottom=o,this.near=a,this.far=h,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,s,o,a,h){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=s,this.view.offsetY=o,this.view.width=a,this.view.height=h,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),s=(this.right+this.left)/2,o=(this.top+this.bottom)/2;let a=s-t,h=s+t,c=o+e,d=o-e;if(this.view!==null&&this.view.enabled){const f=(this.right-this.left)/this.view.fullWidth/this.zoom,p=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=f*this.view.offsetX,h=a+f*this.view.width,c-=p*this.view.offsetY,d=c-p*this.view.height}this.projectionMatrix.makeOrthographic(a,h,c,d,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const $i=4,lc=[.125,.215,.35,.446,.526,.582],yi=20,Oo=new uh,cc=new le;let Fo=null,Bo=0,zo=0;const vi=(1+Math.sqrt(5))/2,Yi=1/vi,hc=[new G(1,1,1),new G(-1,1,1),new G(1,1,-1),new G(-1,1,-1),new G(0,vi,Yi),new G(0,vi,-Yi),new G(Yi,0,vi),new G(-Yi,0,vi),new G(vi,Yi,0),new G(-vi,Yi,0)];class uc{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,s=.1,o=100){Fo=this._renderer.getRenderTarget(),Bo=this._renderer.getActiveCubeFace(),zo=this._renderer.getActiveMipmapLevel(),this._setSize(256);const a=this._allocateTargets();return a.depthBuffer=!0,this._sceneToCubeUV(t,s,o,a),e>0&&this._blur(a,0,0,e),this._applyPMREM(a),this._cleanup(a),a}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=pc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=fc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Fo,Bo,zo),t.scissorTest=!1,Es(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===nr||t.mapping===ir?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Fo=this._renderer.getRenderTarget(),Bo=this._renderer.getActiveCubeFace(),zo=this._renderer.getActiveMipmapLevel();const s=e||this._allocateTargets();return this._textureToCubeUV(t,s),this._applyPMREM(s),this._cleanup(s),s}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,s={magFilter:un,minFilter:un,generateMipmaps:!1,type:Cr,format:Mn,colorSpace:Gn,depthBuffer:!1},o=dc(t,e,s);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=dc(t,e,s);const{_lodMax:a}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Qm(a)),this._blurMaterial=t_(a,t,e)}return o}_compileMaterial(t){const e=new en(this._lodPlanes[0],t);this._renderer.compile(e,Oo)}_sceneToCubeUV(t,e,s,o){const c=new dn(90,1,e,s),d=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],p=this._renderer,_=p.autoClear,v=p.toneMapping;p.getClearColor(cc),p.toneMapping=ti,p.autoClear=!1;const y=new Ur({name:"PMREM.Background",side:je,depthWrite:!1,depthTest:!1}),M=new en(new zr,y);let S=!1;const x=t.background;x?x.isColor&&(y.color.copy(x),t.background=null,S=!0):(y.color.copy(cc),S=!0);for(let m=0;m<6;m++){const P=m%3;P===0?(c.up.set(0,d[m],0),c.lookAt(f[m],0,0)):P===1?(c.up.set(0,0,d[m]),c.lookAt(0,f[m],0)):(c.up.set(0,d[m],0),c.lookAt(0,0,f[m]));const b=this._cubeSize;Es(o,P*b,m>2?b:0,b,b),p.setRenderTarget(o),S&&p.render(M,c),p.render(t,c)}M.geometry.dispose(),M.material.dispose(),p.toneMapping=v,p.autoClear=_,t.background=x}_textureToCubeUV(t,e){const s=this._renderer,o=t.mapping===nr||t.mapping===ir;o?(this._cubemapMaterial===null&&(this._cubemapMaterial=pc()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=fc());const a=o?this._cubemapMaterial:this._equirectMaterial,h=new en(this._lodPlanes[0],a),c=a.uniforms;c.envMap.value=t;const d=this._cubeSize;Es(e,0,0,3*d,2*d),s.setRenderTarget(e),s.render(h,Oo)}_applyPMREM(t){const e=this._renderer,s=e.autoClear;e.autoClear=!1;for(let o=1;o<this._lodPlanes.length;o++){const a=Math.sqrt(this._sigmas[o]*this._sigmas[o]-this._sigmas[o-1]*this._sigmas[o-1]),h=hc[(o-1)%hc.length];this._blur(t,o-1,o,a,h)}e.autoClear=s}_blur(t,e,s,o,a){const h=this._pingPongRenderTarget;this._halfBlur(t,h,e,s,o,"latitudinal",a),this._halfBlur(h,t,s,s,o,"longitudinal",a)}_halfBlur(t,e,s,o,a,h,c){const d=this._renderer,f=this._blurMaterial;h!=="latitudinal"&&h!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const p=3,_=new en(this._lodPlanes[o],f),v=f.uniforms,y=this._sizeLods[s]-1,M=isFinite(a)?Math.PI/(2*y):2*Math.PI/(2*yi-1),S=a/M,x=isFinite(a)?1+Math.floor(p*S):yi;x>yi&&console.warn(`sigmaRadians, ${a}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${yi}`);const m=[];let P=0;for(let U=0;U<yi;++U){const et=U/S,w=Math.exp(-et*et/2);m.push(w),U===0?P+=w:U<x&&(P+=2*w)}for(let U=0;U<m.length;U++)m[U]=m[U]/P;v.envMap.value=t.texture,v.samples.value=x,v.weights.value=m,v.latitudinal.value=h==="latitudinal",c&&(v.poleAxis.value=c);const{_lodMax:b}=this;v.dTheta.value=M,v.mipInt.value=b-s;const D=this._sizeLods[o],B=3*D*(o>b-$i?o-b+$i:0),C=4*(this._cubeSize-D);Es(e,B,C,3*D,2*D),d.setRenderTarget(e),d.render(_,Oo)}}function Qm(r){const t=[],e=[],s=[];let o=r;const a=r-$i+1+lc.length;for(let h=0;h<a;h++){const c=Math.pow(2,o);e.push(c);let d=1/c;h>r-$i?d=lc[h-r+$i-1]:h===0&&(d=0),s.push(d);const f=1/(c-2),p=-f,_=1+f,v=[p,p,_,p,_,_,p,p,_,_,p,_],y=6,M=6,S=3,x=2,m=1,P=new Float32Array(S*M*y),b=new Float32Array(x*M*y),D=new Float32Array(m*M*y);for(let C=0;C<y;C++){const U=C%3*2/3-1,et=C>2?0:-1,w=[U,et,0,U+2/3,et,0,U+2/3,et+1,0,U,et,0,U+2/3,et+1,0,U,et+1,0];P.set(w,S*M*C),b.set(v,x*M*C);const I=[C,C,C,C,C,C];D.set(I,m*M*C)}const B=new Je;B.setAttribute("position",new Sn(P,S)),B.setAttribute("uv",new Sn(b,x)),B.setAttribute("faceIndex",new Sn(D,m)),t.push(B),o>$i&&o--}return{lodPlanes:t,sizeLods:e,sigmas:s}}function dc(r,t,e){const s=new Ti(r,t,e);return s.texture.mapping=Os,s.texture.name="PMREM.cubeUv",s.scissorTest=!0,s}function Es(r,t,e,s,o){r.viewport.set(t,e,s,o),r.scissor.set(t,e,s,o)}function t_(r,t,e){const s=new Float32Array(yi),o=new G(0,1,0);return new bi({name:"SphericalGaussianBlur",defines:{n:yi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:s},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:o}},vertexShader:da(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function fc(){return new bi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:da(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function pc(){return new bi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:da(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function da(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function e_(r){let t=new WeakMap,e=null;function s(c){if(c&&c.isTexture){const d=c.mapping,f=d===qo||d===Yo,p=d===nr||d===ir;if(f||p)if(c.isRenderTargetTexture&&c.needsPMREMUpdate===!0){c.needsPMREMUpdate=!1;let _=t.get(c);return e===null&&(e=new uc(r)),_=f?e.fromEquirectangular(c,_):e.fromCubemap(c,_),t.set(c,_),_.texture}else{if(t.has(c))return t.get(c).texture;{const _=c.image;if(f&&_&&_.height>0||p&&_&&o(_)){e===null&&(e=new uc(r));const v=f?e.fromEquirectangular(c):e.fromCubemap(c);return t.set(c,v),c.addEventListener("dispose",a),v.texture}else return null}}}return c}function o(c){let d=0;const f=6;for(let p=0;p<f;p++)c[p]!==void 0&&d++;return d===f}function a(c){const d=c.target;d.removeEventListener("dispose",a);const f=t.get(d);f!==void 0&&(t.delete(d),f.dispose())}function h(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:s,dispose:h}}function n_(r){const t={};function e(s){if(t[s]!==void 0)return t[s];let o;switch(s){case"WEBGL_depth_texture":o=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":o=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":o=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":o=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:o=r.getExtension(s)}return t[s]=o,o}return{has:function(s){return e(s)!==null},init:function(s){s.isWebGL2?(e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance")):(e("WEBGL_depth_texture"),e("OES_texture_float"),e("OES_texture_half_float"),e("OES_texture_half_float_linear"),e("OES_standard_derivatives"),e("OES_element_index_uint"),e("OES_vertex_array_object"),e("ANGLE_instanced_arrays")),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture")},get:function(s){const o=e(s);return o===null&&console.warn("THREE.WebGLRenderer: "+s+" extension not supported."),o}}}function i_(r,t,e,s){const o={},a=new WeakMap;function h(_){const v=_.target;v.index!==null&&t.remove(v.index);for(const M in v.attributes)t.remove(v.attributes[M]);for(const M in v.morphAttributes){const S=v.morphAttributes[M];for(let x=0,m=S.length;x<m;x++)t.remove(S[x])}v.removeEventListener("dispose",h),delete o[v.id];const y=a.get(v);y&&(t.remove(y),a.delete(v)),s.releaseStatesOfGeometry(v),v.isInstancedBufferGeometry===!0&&delete v._maxInstanceCount,e.memory.geometries--}function c(_,v){return o[v.id]===!0||(v.addEventListener("dispose",h),o[v.id]=!0,e.memory.geometries++),v}function d(_){const v=_.attributes;for(const M in v)t.update(v[M],r.ARRAY_BUFFER);const y=_.morphAttributes;for(const M in y){const S=y[M];for(let x=0,m=S.length;x<m;x++)t.update(S[x],r.ARRAY_BUFFER)}}function f(_){const v=[],y=_.index,M=_.attributes.position;let S=0;if(y!==null){const P=y.array;S=y.version;for(let b=0,D=P.length;b<D;b+=3){const B=P[b+0],C=P[b+1],U=P[b+2];v.push(B,C,C,U,U,B)}}else if(M!==void 0){const P=M.array;S=M.version;for(let b=0,D=P.length/3-1;b<D;b+=3){const B=b+0,C=b+1,U=b+2;v.push(B,C,C,U,U,B)}}else return;const x=new(th(v)?oh:sh)(v,1);x.version=S;const m=a.get(_);m&&t.remove(m),a.set(_,x)}function p(_){const v=a.get(_);if(v){const y=_.index;y!==null&&v.version<y.version&&f(_)}else f(_);return a.get(_)}return{get:c,update:d,getWireframeAttribute:p}}function r_(r,t,e,s){const o=s.isWebGL2;let a;function h(y){a=y}let c,d;function f(y){c=y.type,d=y.bytesPerElement}function p(y,M){r.drawElements(a,M,c,y*d),e.update(M,a,1)}function _(y,M,S){if(S===0)return;let x,m;if(o)x=r,m="drawElementsInstanced";else if(x=t.get("ANGLE_instanced_arrays"),m="drawElementsInstancedANGLE",x===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}x[m](a,M,c,y*d,S),e.update(M,a,S)}function v(y,M,S){if(S===0)return;const x=t.get("WEBGL_multi_draw");if(x===null)for(let m=0;m<S;m++)this.render(y[m]/d,M[m]);else{x.multiDrawElementsWEBGL(a,M,0,c,y,0,S);let m=0;for(let P=0;P<S;P++)m+=M[P];e.update(m,a,1)}}this.setMode=h,this.setIndex=f,this.render=p,this.renderInstances=_,this.renderMultiDraw=v}function s_(r){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function s(a,h,c){switch(e.calls++,h){case r.TRIANGLES:e.triangles+=c*(a/3);break;case r.LINES:e.lines+=c*(a/2);break;case r.LINE_STRIP:e.lines+=c*(a-1);break;case r.LINE_LOOP:e.lines+=c*a;break;case r.POINTS:e.points+=c*a;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",h);break}}function o(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:o,update:s}}function o_(r,t){return r[0]-t[0]}function a_(r,t){return Math.abs(t[1])-Math.abs(r[1])}function l_(r,t,e){const s={},o=new Float32Array(8),a=new WeakMap,h=new De,c=[];for(let f=0;f<8;f++)c[f]=[f,0];function d(f,p,_){const v=f.morphTargetInfluences;if(t.isWebGL2===!0){const M=p.morphAttributes.position||p.morphAttributes.normal||p.morphAttributes.color,S=M!==void 0?M.length:0;let x=a.get(p);if(x===void 0||x.count!==S){let $=function(){lt.dispose(),a.delete(p),p.removeEventListener("dispose",$)};var y=$;x!==void 0&&x.texture.dispose();const b=p.morphAttributes.position!==void 0,D=p.morphAttributes.normal!==void 0,B=p.morphAttributes.color!==void 0,C=p.morphAttributes.position||[],U=p.morphAttributes.normal||[],et=p.morphAttributes.color||[];let w=0;b===!0&&(w=1),D===!0&&(w=2),B===!0&&(w=3);let I=p.attributes.position.count*w,J=1;I>t.maxTextureSize&&(J=Math.ceil(I/t.maxTextureSize),I=t.maxTextureSize);const it=new Float32Array(I*J*4*S),lt=new ih(it,I,J,S);lt.type=Jn,lt.needsUpdate=!0;const F=w*4;for(let Q=0;Q<S;Q++){const st=C[Q],X=U[Q],V=et[Q],z=I*J*4*Q;for(let nt=0;nt<st.count;nt++){const ot=nt*F;b===!0&&(h.fromBufferAttribute(st,nt),it[z+ot+0]=h.x,it[z+ot+1]=h.y,it[z+ot+2]=h.z,it[z+ot+3]=0),D===!0&&(h.fromBufferAttribute(X,nt),it[z+ot+4]=h.x,it[z+ot+5]=h.y,it[z+ot+6]=h.z,it[z+ot+7]=0),B===!0&&(h.fromBufferAttribute(V,nt),it[z+ot+8]=h.x,it[z+ot+9]=h.y,it[z+ot+10]=h.z,it[z+ot+11]=V.itemSize===4?h.w:1)}}x={count:S,texture:lt,size:new ie(I,J)},a.set(p,x),p.addEventListener("dispose",$)}let m=0;for(let b=0;b<v.length;b++)m+=v[b];const P=p.morphTargetsRelative?1:1-m;_.getUniforms().setValue(r,"morphTargetBaseInfluence",P),_.getUniforms().setValue(r,"morphTargetInfluences",v),_.getUniforms().setValue(r,"morphTargetsTexture",x.texture,e),_.getUniforms().setValue(r,"morphTargetsTextureSize",x.size)}else{const M=v===void 0?0:v.length;let S=s[p.id];if(S===void 0||S.length!==M){S=[];for(let D=0;D<M;D++)S[D]=[D,0];s[p.id]=S}for(let D=0;D<M;D++){const B=S[D];B[0]=D,B[1]=v[D]}S.sort(a_);for(let D=0;D<8;D++)D<M&&S[D][1]?(c[D][0]=S[D][0],c[D][1]=S[D][1]):(c[D][0]=Number.MAX_SAFE_INTEGER,c[D][1]=0);c.sort(o_);const x=p.morphAttributes.position,m=p.morphAttributes.normal;let P=0;for(let D=0;D<8;D++){const B=c[D],C=B[0],U=B[1];C!==Number.MAX_SAFE_INTEGER&&U?(x&&p.getAttribute("morphTarget"+D)!==x[C]&&p.setAttribute("morphTarget"+D,x[C]),m&&p.getAttribute("morphNormal"+D)!==m[C]&&p.setAttribute("morphNormal"+D,m[C]),o[D]=U,P+=U):(x&&p.hasAttribute("morphTarget"+D)===!0&&p.deleteAttribute("morphTarget"+D),m&&p.hasAttribute("morphNormal"+D)===!0&&p.deleteAttribute("morphNormal"+D),o[D]=0)}const b=p.morphTargetsRelative?1:1-P;_.getUniforms().setValue(r,"morphTargetBaseInfluence",b),_.getUniforms().setValue(r,"morphTargetInfluences",o)}}return{update:d}}function c_(r,t,e,s){let o=new WeakMap;function a(d){const f=s.render.frame,p=d.geometry,_=t.get(d,p);if(o.get(_)!==f&&(t.update(_),o.set(_,f)),d.isInstancedMesh&&(d.hasEventListener("dispose",c)===!1&&d.addEventListener("dispose",c),o.get(d)!==f&&(e.update(d.instanceMatrix,r.ARRAY_BUFFER),d.instanceColor!==null&&e.update(d.instanceColor,r.ARRAY_BUFFER),o.set(d,f))),d.isSkinnedMesh){const v=d.skeleton;o.get(v)!==f&&(v.update(),o.set(v,f))}return _}function h(){o=new WeakMap}function c(d){const f=d.target;f.removeEventListener("dispose",c),e.remove(f.instanceMatrix),f.instanceColor!==null&&e.remove(f.instanceColor)}return{update:a,dispose:h}}class dh extends $e{constructor(t,e,s,o,a,h,c,d,f,p){if(p=p!==void 0?p:Si,p!==Si&&p!==rr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");s===void 0&&p===Si&&(s=$n),s===void 0&&p===rr&&(s=Mi),super(null,o,a,h,c,d,p,s,f),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=c!==void 0?c:Ye,this.minFilter=d!==void 0?d:Ye,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const fh=new $e,ph=new dh(1,1);ph.compareFunction=Qc;const mh=new ih,_h=new Zd,gh=new ch,mc=[],_c=[],gc=new Float32Array(16),vc=new Float32Array(9),xc=new Float32Array(4);function lr(r,t,e){const s=r[0];if(s<=0||s>0)return r;const o=t*e;let a=mc[o];if(a===void 0&&(a=new Float32Array(o),mc[o]=a),t!==0){s.toArray(a,0);for(let h=1,c=0;h!==t;++h)c+=e,r[h].toArray(a,c)}return a}function Pe(r,t){if(r.length!==t.length)return!1;for(let e=0,s=r.length;e<s;e++)if(r[e]!==t[e])return!1;return!0}function Re(r,t){for(let e=0,s=t.length;e<s;e++)r[e]=t[e]}function ks(r,t){let e=_c[t];e===void 0&&(e=new Int32Array(t),_c[t]=e);for(let s=0;s!==t;++s)e[s]=r.allocateTextureUnit();return e}function h_(r,t){const e=this.cache;e[0]!==t&&(r.uniform1f(this.addr,t),e[0]=t)}function u_(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Pe(e,t))return;r.uniform2fv(this.addr,t),Re(e,t)}}function d_(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(r.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Pe(e,t))return;r.uniform3fv(this.addr,t),Re(e,t)}}function f_(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Pe(e,t))return;r.uniform4fv(this.addr,t),Re(e,t)}}function p_(r,t){const e=this.cache,s=t.elements;if(s===void 0){if(Pe(e,t))return;r.uniformMatrix2fv(this.addr,!1,t),Re(e,t)}else{if(Pe(e,s))return;xc.set(s),r.uniformMatrix2fv(this.addr,!1,xc),Re(e,s)}}function m_(r,t){const e=this.cache,s=t.elements;if(s===void 0){if(Pe(e,t))return;r.uniformMatrix3fv(this.addr,!1,t),Re(e,t)}else{if(Pe(e,s))return;vc.set(s),r.uniformMatrix3fv(this.addr,!1,vc),Re(e,s)}}function __(r,t){const e=this.cache,s=t.elements;if(s===void 0){if(Pe(e,t))return;r.uniformMatrix4fv(this.addr,!1,t),Re(e,t)}else{if(Pe(e,s))return;gc.set(s),r.uniformMatrix4fv(this.addr,!1,gc),Re(e,s)}}function g_(r,t){const e=this.cache;e[0]!==t&&(r.uniform1i(this.addr,t),e[0]=t)}function v_(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Pe(e,t))return;r.uniform2iv(this.addr,t),Re(e,t)}}function x_(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Pe(e,t))return;r.uniform3iv(this.addr,t),Re(e,t)}}function y_(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Pe(e,t))return;r.uniform4iv(this.addr,t),Re(e,t)}}function M_(r,t){const e=this.cache;e[0]!==t&&(r.uniform1ui(this.addr,t),e[0]=t)}function S_(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Pe(e,t))return;r.uniform2uiv(this.addr,t),Re(e,t)}}function E_(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Pe(e,t))return;r.uniform3uiv(this.addr,t),Re(e,t)}}function T_(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Pe(e,t))return;r.uniform4uiv(this.addr,t),Re(e,t)}}function b_(r,t,e){const s=this.cache,o=e.allocateTextureUnit();s[0]!==o&&(r.uniform1i(this.addr,o),s[0]=o);const a=this.type===r.SAMPLER_2D_SHADOW?ph:fh;e.setTexture2D(t||a,o)}function w_(r,t,e){const s=this.cache,o=e.allocateTextureUnit();s[0]!==o&&(r.uniform1i(this.addr,o),s[0]=o),e.setTexture3D(t||_h,o)}function A_(r,t,e){const s=this.cache,o=e.allocateTextureUnit();s[0]!==o&&(r.uniform1i(this.addr,o),s[0]=o),e.setTextureCube(t||gh,o)}function L_(r,t,e){const s=this.cache,o=e.allocateTextureUnit();s[0]!==o&&(r.uniform1i(this.addr,o),s[0]=o),e.setTexture2DArray(t||mh,o)}function P_(r){switch(r){case 5126:return h_;case 35664:return u_;case 35665:return d_;case 35666:return f_;case 35674:return p_;case 35675:return m_;case 35676:return __;case 5124:case 35670:return g_;case 35667:case 35671:return v_;case 35668:case 35672:return x_;case 35669:case 35673:return y_;case 5125:return M_;case 36294:return S_;case 36295:return E_;case 36296:return T_;case 35678:case 36198:case 36298:case 36306:case 35682:return b_;case 35679:case 36299:case 36307:return w_;case 35680:case 36300:case 36308:case 36293:return A_;case 36289:case 36303:case 36311:case 36292:return L_}}function R_(r,t){r.uniform1fv(this.addr,t)}function C_(r,t){const e=lr(t,this.size,2);r.uniform2fv(this.addr,e)}function I_(r,t){const e=lr(t,this.size,3);r.uniform3fv(this.addr,e)}function D_(r,t){const e=lr(t,this.size,4);r.uniform4fv(this.addr,e)}function U_(r,t){const e=lr(t,this.size,4);r.uniformMatrix2fv(this.addr,!1,e)}function N_(r,t){const e=lr(t,this.size,9);r.uniformMatrix3fv(this.addr,!1,e)}function O_(r,t){const e=lr(t,this.size,16);r.uniformMatrix4fv(this.addr,!1,e)}function F_(r,t){r.uniform1iv(this.addr,t)}function B_(r,t){r.uniform2iv(this.addr,t)}function z_(r,t){r.uniform3iv(this.addr,t)}function k_(r,t){r.uniform4iv(this.addr,t)}function H_(r,t){r.uniform1uiv(this.addr,t)}function G_(r,t){r.uniform2uiv(this.addr,t)}function V_(r,t){r.uniform3uiv(this.addr,t)}function W_(r,t){r.uniform4uiv(this.addr,t)}function X_(r,t,e){const s=this.cache,o=t.length,a=ks(e,o);Pe(s,a)||(r.uniform1iv(this.addr,a),Re(s,a));for(let h=0;h!==o;++h)e.setTexture2D(t[h]||fh,a[h])}function Z_(r,t,e){const s=this.cache,o=t.length,a=ks(e,o);Pe(s,a)||(r.uniform1iv(this.addr,a),Re(s,a));for(let h=0;h!==o;++h)e.setTexture3D(t[h]||_h,a[h])}function q_(r,t,e){const s=this.cache,o=t.length,a=ks(e,o);Pe(s,a)||(r.uniform1iv(this.addr,a),Re(s,a));for(let h=0;h!==o;++h)e.setTextureCube(t[h]||gh,a[h])}function Y_(r,t,e){const s=this.cache,o=t.length,a=ks(e,o);Pe(s,a)||(r.uniform1iv(this.addr,a),Re(s,a));for(let h=0;h!==o;++h)e.setTexture2DArray(t[h]||mh,a[h])}function j_(r){switch(r){case 5126:return R_;case 35664:return C_;case 35665:return I_;case 35666:return D_;case 35674:return U_;case 35675:return N_;case 35676:return O_;case 5124:case 35670:return F_;case 35667:case 35671:return B_;case 35668:case 35672:return z_;case 35669:case 35673:return k_;case 5125:return H_;case 36294:return G_;case 36295:return V_;case 36296:return W_;case 35678:case 36198:case 36298:case 36306:case 35682:return X_;case 35679:case 36299:case 36307:return Z_;case 35680:case 36300:case 36308:case 36293:return q_;case 36289:case 36303:case 36311:case 36292:return Y_}}class K_{constructor(t,e,s){this.id=t,this.addr=s,this.cache=[],this.type=e.type,this.setValue=P_(e.type)}}class $_{constructor(t,e,s){this.id=t,this.addr=s,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=j_(e.type)}}class J_{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,s){const o=this.seq;for(let a=0,h=o.length;a!==h;++a){const c=o[a];c.setValue(t,e[c.id],s)}}}const ko=/(\w+)(\])?(\[|\.)?/g;function yc(r,t){r.seq.push(t),r.map[t.id]=t}function Q_(r,t,e){const s=r.name,o=s.length;for(ko.lastIndex=0;;){const a=ko.exec(s),h=ko.lastIndex;let c=a[1];const d=a[2]==="]",f=a[3];if(d&&(c=c|0),f===void 0||f==="["&&h+2===o){yc(e,f===void 0?new K_(c,r,t):new $_(c,r,t));break}else{let _=e.map[c];_===void 0&&(_=new J_(c),yc(e,_)),e=_}}}class Ls{constructor(t,e){this.seq=[],this.map={};const s=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<s;++o){const a=t.getActiveUniform(e,o),h=t.getUniformLocation(e,a.name);Q_(a,h,this)}}setValue(t,e,s,o){const a=this.map[e];a!==void 0&&a.setValue(t,s,o)}setOptional(t,e,s){const o=e[s];o!==void 0&&this.setValue(t,s,o)}static upload(t,e,s,o){for(let a=0,h=e.length;a!==h;++a){const c=e[a],d=s[c.id];d.needsUpdate!==!1&&c.setValue(t,d.value,o)}}static seqWithValue(t,e){const s=[];for(let o=0,a=t.length;o!==a;++o){const h=t[o];h.id in e&&s.push(h)}return s}}function Mc(r,t,e){const s=r.createShader(t);return r.shaderSource(s,e),r.compileShader(s),s}const tg=37297;let eg=0;function ng(r,t){const e=r.split(`
`),s=[],o=Math.max(t-6,0),a=Math.min(t+6,e.length);for(let h=o;h<a;h++){const c=h+1;s.push(`${c===t?">":" "} ${c}: ${e[h]}`)}return s.join(`
`)}function ig(r){const t=pe.getPrimaries(pe.workingColorSpace),e=pe.getPrimaries(r);let s;switch(t===e?s="":t===Is&&e===Cs?s="LinearDisplayP3ToLinearSRGB":t===Cs&&e===Is&&(s="LinearSRGBToLinearDisplayP3"),r){case Gn:case Fs:return[s,"LinearTransferOETF"];case ze:case aa:return[s,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",r),[s,"LinearTransferOETF"]}}function Sc(r,t,e){const s=r.getShaderParameter(t,r.COMPILE_STATUS),o=r.getShaderInfoLog(t).trim();if(s&&o==="")return"";const a=/ERROR: 0:(\d+)/.exec(o);if(a){const h=parseInt(a[1]);return e.toUpperCase()+`

`+o+`

`+ng(r.getShaderSource(t),h)}else return o}function rg(r,t){const e=ig(t);return`vec4 ${r}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function sg(r,t){let e;switch(t){case nd:e="Linear";break;case id:e="Reinhard";break;case rd:e="OptimizedCineon";break;case sd:e="ACESFilmic";break;case ad:e="AgX";break;case od:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+r+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}function og(r){return[r.extensionDerivatives||r.envMapCubeUVHeight||r.bumpMap||r.normalMapTangentSpace||r.clearcoatNormalMap||r.flatShading||r.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(r.extensionFragDepth||r.logarithmicDepthBuffer)&&r.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",r.extensionDrawBuffers&&r.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(r.extensionShaderTextureLOD||r.envMap||r.transmission)&&r.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Ji).join(`
`)}function ag(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(Ji).join(`
`)}function lg(r){const t=[];for(const e in r){const s=r[e];s!==!1&&t.push("#define "+e+" "+s)}return t.join(`
`)}function cg(r,t){const e={},s=r.getProgramParameter(t,r.ACTIVE_ATTRIBUTES);for(let o=0;o<s;o++){const a=r.getActiveAttrib(t,o),h=a.name;let c=1;a.type===r.FLOAT_MAT2&&(c=2),a.type===r.FLOAT_MAT3&&(c=3),a.type===r.FLOAT_MAT4&&(c=4),e[h]={type:a.type,location:r.getAttribLocation(t,h),locationSize:c}}return e}function Ji(r){return r!==""}function Ec(r,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Tc(r,t){return r.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const hg=/^[ \t]*#include +<([\w\d./]+)>/gm;function ta(r){return r.replace(hg,dg)}const ug=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function dg(r,t){let e=Qt[t];if(e===void 0){const s=ug.get(t);if(s!==void 0)e=Qt[s],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,s);else throw new Error("Can not resolve #include <"+t+">")}return ta(e)}const fg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function bc(r){return r.replace(fg,pg)}function pg(r,t,e,s){let o="";for(let a=parseInt(t);a<parseInt(e);a++)o+=s.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return o}function wc(r){let t="precision "+r.precision+` float;
precision `+r.precision+" int;";return r.precision==="highp"?t+=`
#define HIGH_PRECISION`:r.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function mg(r){let t="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===Gc?t="SHADOWMAP_TYPE_PCF":r.shadowMapType===Ru?t="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===Bn&&(t="SHADOWMAP_TYPE_VSM"),t}function _g(r){let t="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case nr:case ir:t="ENVMAP_TYPE_CUBE";break;case Os:t="ENVMAP_TYPE_CUBE_UV";break}return t}function gg(r){let t="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case ir:t="ENVMAP_MODE_REFRACTION";break}return t}function vg(r){let t="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case sa:t="ENVMAP_BLENDING_MULTIPLY";break;case td:t="ENVMAP_BLENDING_MIX";break;case ed:t="ENVMAP_BLENDING_ADD";break}return t}function xg(r){const t=r.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,s=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:s,maxMip:e}}function yg(r,t,e,s){const o=r.getContext(),a=e.defines;let h=e.vertexShader,c=e.fragmentShader;const d=mg(e),f=_g(e),p=gg(e),_=vg(e),v=xg(e),y=e.isWebGL2?"":og(e),M=ag(e),S=lg(a),x=o.createProgram();let m,P,b=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,S].filter(Ji).join(`
`),m.length>0&&(m+=`
`),P=[y,"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,S].filter(Ji).join(`
`),P.length>0&&(P+=`
`)):(m=[wc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,S,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+p:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors&&e.isWebGL2?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+d:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ji).join(`
`),P=[y,wc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,S,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+f:"",e.envMap?"#define "+p:"",e.envMap?"#define "+_:"",v?"#define CUBEUV_TEXEL_WIDTH "+v.texelWidth:"",v?"#define CUBEUV_TEXEL_HEIGHT "+v.texelHeight:"",v?"#define CUBEUV_MAX_MIP "+v.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+d:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ti?"#define TONE_MAPPING":"",e.toneMapping!==ti?Qt.tonemapping_pars_fragment:"",e.toneMapping!==ti?sg("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Qt.colorspace_pars_fragment,rg("linearToOutputTexel",e.outputColorSpace),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ji).join(`
`)),h=ta(h),h=Ec(h,e),h=Tc(h,e),c=ta(c),c=Ec(c,e),c=Tc(c,e),h=bc(h),c=bc(c),e.isWebGL2&&e.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[M,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,P=["precision mediump sampler2DArray;","#define varying in",e.glslVersion===Wl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Wl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+P);const D=b+m+h,B=b+P+c,C=Mc(o,o.VERTEX_SHADER,D),U=Mc(o,o.FRAGMENT_SHADER,B);o.attachShader(x,C),o.attachShader(x,U),e.index0AttributeName!==void 0?o.bindAttribLocation(x,0,e.index0AttributeName):e.morphTargets===!0&&o.bindAttribLocation(x,0,"position"),o.linkProgram(x);function et(it){if(r.debug.checkShaderErrors){const lt=o.getProgramInfoLog(x).trim(),F=o.getShaderInfoLog(C).trim(),$=o.getShaderInfoLog(U).trim();let Q=!0,st=!0;if(o.getProgramParameter(x,o.LINK_STATUS)===!1)if(Q=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(o,x,C,U);else{const X=Sc(o,C,"vertex"),V=Sc(o,U,"fragment");console.error("THREE.WebGLProgram: Shader Error "+o.getError()+" - VALIDATE_STATUS "+o.getProgramParameter(x,o.VALIDATE_STATUS)+`

Program Info Log: `+lt+`
`+X+`
`+V)}else lt!==""?console.warn("THREE.WebGLProgram: Program Info Log:",lt):(F===""||$==="")&&(st=!1);st&&(it.diagnostics={runnable:Q,programLog:lt,vertexShader:{log:F,prefix:m},fragmentShader:{log:$,prefix:P}})}o.deleteShader(C),o.deleteShader(U),w=new Ls(o,x),I=cg(o,x)}let w;this.getUniforms=function(){return w===void 0&&et(this),w};let I;this.getAttributes=function(){return I===void 0&&et(this),I};let J=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return J===!1&&(J=o.getProgramParameter(x,tg)),J},this.destroy=function(){s.releaseStatesOfProgram(this),o.deleteProgram(x),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=eg++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=C,this.fragmentShader=U,this}let Mg=0;class Sg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,s=t.fragmentShader,o=this._getShaderStage(e),a=this._getShaderStage(s),h=this._getShaderCacheForMaterial(t);return h.has(o)===!1&&(h.add(o),o.usedTimes++),h.has(a)===!1&&(h.add(a),a.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const s of e)s.usedTimes--,s.usedTimes===0&&this.shaderCache.delete(s.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let s=e.get(t);return s===void 0&&(s=new Set,e.set(t,s)),s}_getShaderStage(t){const e=this.shaderCache;let s=e.get(t);return s===void 0&&(s=new Eg(t),e.set(t,s)),s}}class Eg{constructor(t){this.id=Mg++,this.code=t,this.usedTimes=0}}function Tg(r,t,e,s,o,a,h){const c=new ca,d=new Sg,f=[],p=o.isWebGL2,_=o.logarithmicDepthBuffer,v=o.vertexTextures;let y=o.precision;const M={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function S(w){return w===0?"uv":`uv${w}`}function x(w,I,J,it,lt){const F=it.fog,$=lt.geometry,Q=w.isMeshStandardMaterial?it.environment:null,st=(w.isMeshStandardMaterial?e:t).get(w.envMap||Q),X=st&&st.mapping===Os?st.image.height:null,V=M[w.type];w.precision!==null&&(y=o.getMaxPrecision(w.precision),y!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",y,"instead."));const z=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,nt=z!==void 0?z.length:0;let ot=0;$.morphAttributes.position!==void 0&&(ot=1),$.morphAttributes.normal!==void 0&&(ot=2),$.morphAttributes.color!==void 0&&(ot=3);let W,rt,ct,pt;if(V){const Le=wn[V];W=Le.vertexShader,rt=Le.fragmentShader}else W=w.vertexShader,rt=w.fragmentShader,d.update(w),ct=d.getVertexShaderID(w),pt=d.getFragmentShaderID(w);const St=r.getRenderTarget(),Ut=lt.isInstancedMesh===!0,Zt=lt.isBatchedMesh===!0,Nt=!!w.map,re=!!w.matcap,Z=!!st,Ae=!!w.aoMap,It=!!w.lightMap,Gt=!!w.bumpMap,wt=!!w.normalMap,me=!!w.displacementMap,Vt=!!w.emissiveMap,R=!!w.metalnessMap,T=!!w.roughnessMap,q=w.anisotropy>0,dt=w.clearcoat>0,ut=w.iridescence>0,ft=w.sheen>0,At=w.transmission>0,vt=q&&!!w.anisotropyMap,Et=dt&&!!w.clearcoatMap,Ot=dt&&!!w.clearcoatNormalMap,Kt=dt&&!!w.clearcoatRoughnessMap,ht=ut&&!!w.iridescenceMap,ce=ut&&!!w.iridescenceThicknessMap,te=ft&&!!w.sheenColorMap,kt=ft&&!!w.sheenRoughnessMap,Rt=!!w.specularMap,Tt=!!w.specularColorMap,Yt=!!w.specularIntensityMap,oe=At&&!!w.transmissionMap,xe=At&&!!w.thicknessMap,Jt=!!w.gradientMap,mt=!!w.alphaMap,O=w.alphaTest>0,gt=!!w.alphaHash,xt=!!w.extensions,Bt=!!$.attributes.uv1,Dt=!!$.attributes.uv2,ue=!!$.attributes.uv3;let de=ti;return w.toneMapped&&(St===null||St.isXRRenderTarget===!0)&&(de=r.toneMapping),{isWebGL2:p,shaderID:V,shaderType:w.type,shaderName:w.name,vertexShader:W,fragmentShader:rt,defines:w.defines,customVertexShaderID:ct,customFragmentShaderID:pt,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:y,batching:Zt,instancing:Ut,instancingColor:Ut&&lt.instanceColor!==null,supportsVertexTextures:v,outputColorSpace:St===null?r.outputColorSpace:St.isXRRenderTarget===!0?St.texture.colorSpace:Gn,map:Nt,matcap:re,envMap:Z,envMapMode:Z&&st.mapping,envMapCubeUVHeight:X,aoMap:Ae,lightMap:It,bumpMap:Gt,normalMap:wt,displacementMap:v&&me,emissiveMap:Vt,normalMapObjectSpace:wt&&w.normalMapType===xd,normalMapTangentSpace:wt&&w.normalMapType===Jc,metalnessMap:R,roughnessMap:T,anisotropy:q,anisotropyMap:vt,clearcoat:dt,clearcoatMap:Et,clearcoatNormalMap:Ot,clearcoatRoughnessMap:Kt,iridescence:ut,iridescenceMap:ht,iridescenceThicknessMap:ce,sheen:ft,sheenColorMap:te,sheenRoughnessMap:kt,specularMap:Rt,specularColorMap:Tt,specularIntensityMap:Yt,transmission:At,transmissionMap:oe,thicknessMap:xe,gradientMap:Jt,opaque:w.transparent===!1&&w.blending===tr,alphaMap:mt,alphaTest:O,alphaHash:gt,combine:w.combine,mapUv:Nt&&S(w.map.channel),aoMapUv:Ae&&S(w.aoMap.channel),lightMapUv:It&&S(w.lightMap.channel),bumpMapUv:Gt&&S(w.bumpMap.channel),normalMapUv:wt&&S(w.normalMap.channel),displacementMapUv:me&&S(w.displacementMap.channel),emissiveMapUv:Vt&&S(w.emissiveMap.channel),metalnessMapUv:R&&S(w.metalnessMap.channel),roughnessMapUv:T&&S(w.roughnessMap.channel),anisotropyMapUv:vt&&S(w.anisotropyMap.channel),clearcoatMapUv:Et&&S(w.clearcoatMap.channel),clearcoatNormalMapUv:Ot&&S(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Kt&&S(w.clearcoatRoughnessMap.channel),iridescenceMapUv:ht&&S(w.iridescenceMap.channel),iridescenceThicknessMapUv:ce&&S(w.iridescenceThicknessMap.channel),sheenColorMapUv:te&&S(w.sheenColorMap.channel),sheenRoughnessMapUv:kt&&S(w.sheenRoughnessMap.channel),specularMapUv:Rt&&S(w.specularMap.channel),specularColorMapUv:Tt&&S(w.specularColorMap.channel),specularIntensityMapUv:Yt&&S(w.specularIntensityMap.channel),transmissionMapUv:oe&&S(w.transmissionMap.channel),thicknessMapUv:xe&&S(w.thicknessMap.channel),alphaMapUv:mt&&S(w.alphaMap.channel),vertexTangents:!!$.attributes.tangent&&(wt||q),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,vertexUv1s:Bt,vertexUv2s:Dt,vertexUv3s:ue,pointsUvs:lt.isPoints===!0&&!!$.attributes.uv&&(Nt||mt),fog:!!F,useFog:w.fog===!0,fogExp2:F&&F.isFogExp2,flatShading:w.flatShading===!0,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:_,skinning:lt.isSkinnedMesh===!0,morphTargets:$.morphAttributes.position!==void 0,morphNormals:$.morphAttributes.normal!==void 0,morphColors:$.morphAttributes.color!==void 0,morphTargetsCount:nt,morphTextureStride:ot,numDirLights:I.directional.length,numPointLights:I.point.length,numSpotLights:I.spot.length,numSpotLightMaps:I.spotLightMap.length,numRectAreaLights:I.rectArea.length,numHemiLights:I.hemi.length,numDirLightShadows:I.directionalShadowMap.length,numPointLightShadows:I.pointShadowMap.length,numSpotLightShadows:I.spotShadowMap.length,numSpotLightShadowsWithMaps:I.numSpotLightShadowsWithMaps,numLightProbes:I.numLightProbes,numClippingPlanes:h.numPlanes,numClipIntersection:h.numIntersection,dithering:w.dithering,shadowMapEnabled:r.shadowMap.enabled&&J.length>0,shadowMapType:r.shadowMap.type,toneMapping:de,useLegacyLights:r._useLegacyLights,decodeVideoTexture:Nt&&w.map.isVideoTexture===!0&&pe.getTransfer(w.map.colorSpace)===ve,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===An,flipSided:w.side===je,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionDerivatives:xt&&w.extensions.derivatives===!0,extensionFragDepth:xt&&w.extensions.fragDepth===!0,extensionDrawBuffers:xt&&w.extensions.drawBuffers===!0,extensionShaderTextureLOD:xt&&w.extensions.shaderTextureLOD===!0,extensionClipCullDistance:xt&&w.extensions.clipCullDistance&&s.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:p||s.has("EXT_frag_depth"),rendererExtensionDrawBuffers:p||s.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:p||s.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:s.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()}}function m(w){const I=[];if(w.shaderID?I.push(w.shaderID):(I.push(w.customVertexShaderID),I.push(w.customFragmentShaderID)),w.defines!==void 0)for(const J in w.defines)I.push(J),I.push(w.defines[J]);return w.isRawShaderMaterial===!1&&(P(I,w),b(I,w),I.push(r.outputColorSpace)),I.push(w.customProgramCacheKey),I.join()}function P(w,I){w.push(I.precision),w.push(I.outputColorSpace),w.push(I.envMapMode),w.push(I.envMapCubeUVHeight),w.push(I.mapUv),w.push(I.alphaMapUv),w.push(I.lightMapUv),w.push(I.aoMapUv),w.push(I.bumpMapUv),w.push(I.normalMapUv),w.push(I.displacementMapUv),w.push(I.emissiveMapUv),w.push(I.metalnessMapUv),w.push(I.roughnessMapUv),w.push(I.anisotropyMapUv),w.push(I.clearcoatMapUv),w.push(I.clearcoatNormalMapUv),w.push(I.clearcoatRoughnessMapUv),w.push(I.iridescenceMapUv),w.push(I.iridescenceThicknessMapUv),w.push(I.sheenColorMapUv),w.push(I.sheenRoughnessMapUv),w.push(I.specularMapUv),w.push(I.specularColorMapUv),w.push(I.specularIntensityMapUv),w.push(I.transmissionMapUv),w.push(I.thicknessMapUv),w.push(I.combine),w.push(I.fogExp2),w.push(I.sizeAttenuation),w.push(I.morphTargetsCount),w.push(I.morphAttributeCount),w.push(I.numDirLights),w.push(I.numPointLights),w.push(I.numSpotLights),w.push(I.numSpotLightMaps),w.push(I.numHemiLights),w.push(I.numRectAreaLights),w.push(I.numDirLightShadows),w.push(I.numPointLightShadows),w.push(I.numSpotLightShadows),w.push(I.numSpotLightShadowsWithMaps),w.push(I.numLightProbes),w.push(I.shadowMapType),w.push(I.toneMapping),w.push(I.numClippingPlanes),w.push(I.numClipIntersection),w.push(I.depthPacking)}function b(w,I){c.disableAll(),I.isWebGL2&&c.enable(0),I.supportsVertexTextures&&c.enable(1),I.instancing&&c.enable(2),I.instancingColor&&c.enable(3),I.matcap&&c.enable(4),I.envMap&&c.enable(5),I.normalMapObjectSpace&&c.enable(6),I.normalMapTangentSpace&&c.enable(7),I.clearcoat&&c.enable(8),I.iridescence&&c.enable(9),I.alphaTest&&c.enable(10),I.vertexColors&&c.enable(11),I.vertexAlphas&&c.enable(12),I.vertexUv1s&&c.enable(13),I.vertexUv2s&&c.enable(14),I.vertexUv3s&&c.enable(15),I.vertexTangents&&c.enable(16),I.anisotropy&&c.enable(17),I.alphaHash&&c.enable(18),I.batching&&c.enable(19),w.push(c.mask),c.disableAll(),I.fog&&c.enable(0),I.useFog&&c.enable(1),I.flatShading&&c.enable(2),I.logarithmicDepthBuffer&&c.enable(3),I.skinning&&c.enable(4),I.morphTargets&&c.enable(5),I.morphNormals&&c.enable(6),I.morphColors&&c.enable(7),I.premultipliedAlpha&&c.enable(8),I.shadowMapEnabled&&c.enable(9),I.useLegacyLights&&c.enable(10),I.doubleSided&&c.enable(11),I.flipSided&&c.enable(12),I.useDepthPacking&&c.enable(13),I.dithering&&c.enable(14),I.transmission&&c.enable(15),I.sheen&&c.enable(16),I.opaque&&c.enable(17),I.pointsUvs&&c.enable(18),I.decodeVideoTexture&&c.enable(19),w.push(c.mask)}function D(w){const I=M[w.type];let J;if(I){const it=wn[I];J=of.clone(it.uniforms)}else J=w.uniforms;return J}function B(w,I){let J;for(let it=0,lt=f.length;it<lt;it++){const F=f[it];if(F.cacheKey===I){J=F,++J.usedTimes;break}}return J===void 0&&(J=new yg(r,I,w,a),f.push(J)),J}function C(w){if(--w.usedTimes===0){const I=f.indexOf(w);f[I]=f[f.length-1],f.pop(),w.destroy()}}function U(w){d.remove(w)}function et(){d.dispose()}return{getParameters:x,getProgramCacheKey:m,getUniforms:D,acquireProgram:B,releaseProgram:C,releaseShaderCache:U,programs:f,dispose:et}}function bg(){let r=new WeakMap;function t(a){let h=r.get(a);return h===void 0&&(h={},r.set(a,h)),h}function e(a){r.delete(a)}function s(a,h,c){r.get(a)[h]=c}function o(){r=new WeakMap}return{get:t,remove:e,update:s,dispose:o}}function wg(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.material.id!==t.material.id?r.material.id-t.material.id:r.z!==t.z?r.z-t.z:r.id-t.id}function Ac(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.z!==t.z?t.z-r.z:r.id-t.id}function Lc(){const r=[];let t=0;const e=[],s=[],o=[];function a(){t=0,e.length=0,s.length=0,o.length=0}function h(_,v,y,M,S,x){let m=r[t];return m===void 0?(m={id:_.id,object:_,geometry:v,material:y,groupOrder:M,renderOrder:_.renderOrder,z:S,group:x},r[t]=m):(m.id=_.id,m.object=_,m.geometry=v,m.material=y,m.groupOrder=M,m.renderOrder=_.renderOrder,m.z=S,m.group=x),t++,m}function c(_,v,y,M,S,x){const m=h(_,v,y,M,S,x);y.transmission>0?s.push(m):y.transparent===!0?o.push(m):e.push(m)}function d(_,v,y,M,S,x){const m=h(_,v,y,M,S,x);y.transmission>0?s.unshift(m):y.transparent===!0?o.unshift(m):e.unshift(m)}function f(_,v){e.length>1&&e.sort(_||wg),s.length>1&&s.sort(v||Ac),o.length>1&&o.sort(v||Ac)}function p(){for(let _=t,v=r.length;_<v;_++){const y=r[_];if(y.id===null)break;y.id=null,y.object=null,y.geometry=null,y.material=null,y.group=null}}return{opaque:e,transmissive:s,transparent:o,init:a,push:c,unshift:d,finish:p,sort:f}}function Ag(){let r=new WeakMap;function t(s,o){const a=r.get(s);let h;return a===void 0?(h=new Lc,r.set(s,[h])):o>=a.length?(h=new Lc,a.push(h)):h=a[o],h}function e(){r=new WeakMap}return{get:t,dispose:e}}function Lg(){const r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new G,color:new le};break;case"SpotLight":e={position:new G,direction:new G,color:new le,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new G,color:new le,distance:0,decay:0};break;case"HemisphereLight":e={direction:new G,skyColor:new le,groundColor:new le};break;case"RectAreaLight":e={color:new le,position:new G,halfWidth:new G,halfHeight:new G};break}return r[t.id]=e,e}}}function Pg(){const r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie};break;case"SpotLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie};break;case"PointLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[t.id]=e,e}}}let Rg=0;function Cg(r,t){return(t.castShadow?2:0)-(r.castShadow?2:0)+(t.map?1:0)-(r.map?1:0)}function Ig(r,t){const e=new Lg,s=Pg(),o={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let p=0;p<9;p++)o.probe.push(new G);const a=new G,h=new Se,c=new Se;function d(p,_){let v=0,y=0,M=0;for(let it=0;it<9;it++)o.probe[it].set(0,0,0);let S=0,x=0,m=0,P=0,b=0,D=0,B=0,C=0,U=0,et=0,w=0;p.sort(Cg);const I=_===!0?Math.PI:1;for(let it=0,lt=p.length;it<lt;it++){const F=p[it],$=F.color,Q=F.intensity,st=F.distance,X=F.shadow&&F.shadow.map?F.shadow.map.texture:null;if(F.isAmbientLight)v+=$.r*Q*I,y+=$.g*Q*I,M+=$.b*Q*I;else if(F.isLightProbe){for(let V=0;V<9;V++)o.probe[V].addScaledVector(F.sh.coefficients[V],Q);w++}else if(F.isDirectionalLight){const V=e.get(F);if(V.color.copy(F.color).multiplyScalar(F.intensity*I),F.castShadow){const z=F.shadow,nt=s.get(F);nt.shadowBias=z.bias,nt.shadowNormalBias=z.normalBias,nt.shadowRadius=z.radius,nt.shadowMapSize=z.mapSize,o.directionalShadow[S]=nt,o.directionalShadowMap[S]=X,o.directionalShadowMatrix[S]=F.shadow.matrix,D++}o.directional[S]=V,S++}else if(F.isSpotLight){const V=e.get(F);V.position.setFromMatrixPosition(F.matrixWorld),V.color.copy($).multiplyScalar(Q*I),V.distance=st,V.coneCos=Math.cos(F.angle),V.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),V.decay=F.decay,o.spot[m]=V;const z=F.shadow;if(F.map&&(o.spotLightMap[U]=F.map,U++,z.updateMatrices(F),F.castShadow&&et++),o.spotLightMatrix[m]=z.matrix,F.castShadow){const nt=s.get(F);nt.shadowBias=z.bias,nt.shadowNormalBias=z.normalBias,nt.shadowRadius=z.radius,nt.shadowMapSize=z.mapSize,o.spotShadow[m]=nt,o.spotShadowMap[m]=X,C++}m++}else if(F.isRectAreaLight){const V=e.get(F);V.color.copy($).multiplyScalar(Q),V.halfWidth.set(F.width*.5,0,0),V.halfHeight.set(0,F.height*.5,0),o.rectArea[P]=V,P++}else if(F.isPointLight){const V=e.get(F);if(V.color.copy(F.color).multiplyScalar(F.intensity*I),V.distance=F.distance,V.decay=F.decay,F.castShadow){const z=F.shadow,nt=s.get(F);nt.shadowBias=z.bias,nt.shadowNormalBias=z.normalBias,nt.shadowRadius=z.radius,nt.shadowMapSize=z.mapSize,nt.shadowCameraNear=z.camera.near,nt.shadowCameraFar=z.camera.far,o.pointShadow[x]=nt,o.pointShadowMap[x]=X,o.pointShadowMatrix[x]=F.shadow.matrix,B++}o.point[x]=V,x++}else if(F.isHemisphereLight){const V=e.get(F);V.skyColor.copy(F.color).multiplyScalar(Q*I),V.groundColor.copy(F.groundColor).multiplyScalar(Q*I),o.hemi[b]=V,b++}}P>0&&(t.isWebGL2?r.has("OES_texture_float_linear")===!0?(o.rectAreaLTC1=_t.LTC_FLOAT_1,o.rectAreaLTC2=_t.LTC_FLOAT_2):(o.rectAreaLTC1=_t.LTC_HALF_1,o.rectAreaLTC2=_t.LTC_HALF_2):r.has("OES_texture_float_linear")===!0?(o.rectAreaLTC1=_t.LTC_FLOAT_1,o.rectAreaLTC2=_t.LTC_FLOAT_2):r.has("OES_texture_half_float_linear")===!0?(o.rectAreaLTC1=_t.LTC_HALF_1,o.rectAreaLTC2=_t.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),o.ambient[0]=v,o.ambient[1]=y,o.ambient[2]=M;const J=o.hash;(J.directionalLength!==S||J.pointLength!==x||J.spotLength!==m||J.rectAreaLength!==P||J.hemiLength!==b||J.numDirectionalShadows!==D||J.numPointShadows!==B||J.numSpotShadows!==C||J.numSpotMaps!==U||J.numLightProbes!==w)&&(o.directional.length=S,o.spot.length=m,o.rectArea.length=P,o.point.length=x,o.hemi.length=b,o.directionalShadow.length=D,o.directionalShadowMap.length=D,o.pointShadow.length=B,o.pointShadowMap.length=B,o.spotShadow.length=C,o.spotShadowMap.length=C,o.directionalShadowMatrix.length=D,o.pointShadowMatrix.length=B,o.spotLightMatrix.length=C+U-et,o.spotLightMap.length=U,o.numSpotLightShadowsWithMaps=et,o.numLightProbes=w,J.directionalLength=S,J.pointLength=x,J.spotLength=m,J.rectAreaLength=P,J.hemiLength=b,J.numDirectionalShadows=D,J.numPointShadows=B,J.numSpotShadows=C,J.numSpotMaps=U,J.numLightProbes=w,o.version=Rg++)}function f(p,_){let v=0,y=0,M=0,S=0,x=0;const m=_.matrixWorldInverse;for(let P=0,b=p.length;P<b;P++){const D=p[P];if(D.isDirectionalLight){const B=o.directional[v];B.direction.setFromMatrixPosition(D.matrixWorld),a.setFromMatrixPosition(D.target.matrixWorld),B.direction.sub(a),B.direction.transformDirection(m),v++}else if(D.isSpotLight){const B=o.spot[M];B.position.setFromMatrixPosition(D.matrixWorld),B.position.applyMatrix4(m),B.direction.setFromMatrixPosition(D.matrixWorld),a.setFromMatrixPosition(D.target.matrixWorld),B.direction.sub(a),B.direction.transformDirection(m),M++}else if(D.isRectAreaLight){const B=o.rectArea[S];B.position.setFromMatrixPosition(D.matrixWorld),B.position.applyMatrix4(m),c.identity(),h.copy(D.matrixWorld),h.premultiply(m),c.extractRotation(h),B.halfWidth.set(D.width*.5,0,0),B.halfHeight.set(0,D.height*.5,0),B.halfWidth.applyMatrix4(c),B.halfHeight.applyMatrix4(c),S++}else if(D.isPointLight){const B=o.point[y];B.position.setFromMatrixPosition(D.matrixWorld),B.position.applyMatrix4(m),y++}else if(D.isHemisphereLight){const B=o.hemi[x];B.direction.setFromMatrixPosition(D.matrixWorld),B.direction.transformDirection(m),x++}}}return{setup:d,setupView:f,state:o}}function Pc(r,t){const e=new Ig(r,t),s=[],o=[];function a(){s.length=0,o.length=0}function h(_){s.push(_)}function c(_){o.push(_)}function d(_){e.setup(s,_)}function f(_){e.setupView(s,_)}return{init:a,state:{lightsArray:s,shadowsArray:o,lights:e},setupLights:d,setupLightsView:f,pushLight:h,pushShadow:c}}function Dg(r,t){let e=new WeakMap;function s(a,h=0){const c=e.get(a);let d;return c===void 0?(d=new Pc(r,t),e.set(a,[d])):h>=c.length?(d=new Pc(r,t),c.push(d)):d=c[h],d}function o(){e=new WeakMap}return{get:s,dispose:o}}class Ug extends wi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=gd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Ng extends wi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const Og=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Fg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Bg(r,t,e){let s=new ha;const o=new ie,a=new ie,h=new De,c=new Ug({depthPacking:vd}),d=new Ng,f={},p=e.maxTextureSize,_={[ni]:je,[je]:ni,[An]:An},v=new bi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ie},radius:{value:4}},vertexShader:Og,fragmentShader:Fg}),y=v.clone();y.defines.HORIZONTAL_PASS=1;const M=new Je;M.setAttribute("position",new Sn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const S=new en(M,v),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Gc;let m=this.type;this.render=function(C,U,et){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||C.length===0)return;const w=r.getRenderTarget(),I=r.getActiveCubeFace(),J=r.getActiveMipmapLevel(),it=r.state;it.setBlending(Qn),it.buffers.color.setClear(1,1,1,1),it.buffers.depth.setTest(!0),it.setScissorTest(!1);const lt=m!==Bn&&this.type===Bn,F=m===Bn&&this.type!==Bn;for(let $=0,Q=C.length;$<Q;$++){const st=C[$],X=st.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",st,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;o.copy(X.mapSize);const V=X.getFrameExtents();if(o.multiply(V),a.copy(X.mapSize),(o.x>p||o.y>p)&&(o.x>p&&(a.x=Math.floor(p/V.x),o.x=a.x*V.x,X.mapSize.x=a.x),o.y>p&&(a.y=Math.floor(p/V.y),o.y=a.y*V.y,X.mapSize.y=a.y)),X.map===null||lt===!0||F===!0){const nt=this.type!==Bn?{minFilter:Ye,magFilter:Ye}:{};X.map!==null&&X.map.dispose(),X.map=new Ti(o.x,o.y,nt),X.map.texture.name=st.name+".shadowMap",X.camera.updateProjectionMatrix()}r.setRenderTarget(X.map),r.clear();const z=X.getViewportCount();for(let nt=0;nt<z;nt++){const ot=X.getViewport(nt);h.set(a.x*ot.x,a.y*ot.y,a.x*ot.z,a.y*ot.w),it.viewport(h),X.updateMatrices(st,nt),s=X.getFrustum(),D(U,et,X.camera,st,this.type)}X.isPointLightShadow!==!0&&this.type===Bn&&P(X,et),X.needsUpdate=!1}m=this.type,x.needsUpdate=!1,r.setRenderTarget(w,I,J)};function P(C,U){const et=t.update(S);v.defines.VSM_SAMPLES!==C.blurSamples&&(v.defines.VSM_SAMPLES=C.blurSamples,y.defines.VSM_SAMPLES=C.blurSamples,v.needsUpdate=!0,y.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new Ti(o.x,o.y)),v.uniforms.shadow_pass.value=C.map.texture,v.uniforms.resolution.value=C.mapSize,v.uniforms.radius.value=C.radius,r.setRenderTarget(C.mapPass),r.clear(),r.renderBufferDirect(U,null,et,v,S,null),y.uniforms.shadow_pass.value=C.mapPass.texture,y.uniforms.resolution.value=C.mapSize,y.uniforms.radius.value=C.radius,r.setRenderTarget(C.map),r.clear(),r.renderBufferDirect(U,null,et,y,S,null)}function b(C,U,et,w){let I=null;const J=et.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(J!==void 0)I=J;else if(I=et.isPointLight===!0?d:c,r.localClippingEnabled&&U.clipShadows===!0&&Array.isArray(U.clippingPlanes)&&U.clippingPlanes.length!==0||U.displacementMap&&U.displacementScale!==0||U.alphaMap&&U.alphaTest>0||U.map&&U.alphaTest>0){const it=I.uuid,lt=U.uuid;let F=f[it];F===void 0&&(F={},f[it]=F);let $=F[lt];$===void 0&&($=I.clone(),F[lt]=$,U.addEventListener("dispose",B)),I=$}if(I.visible=U.visible,I.wireframe=U.wireframe,w===Bn?I.side=U.shadowSide!==null?U.shadowSide:U.side:I.side=U.shadowSide!==null?U.shadowSide:_[U.side],I.alphaMap=U.alphaMap,I.alphaTest=U.alphaTest,I.map=U.map,I.clipShadows=U.clipShadows,I.clippingPlanes=U.clippingPlanes,I.clipIntersection=U.clipIntersection,I.displacementMap=U.displacementMap,I.displacementScale=U.displacementScale,I.displacementBias=U.displacementBias,I.wireframeLinewidth=U.wireframeLinewidth,I.linewidth=U.linewidth,et.isPointLight===!0&&I.isMeshDistanceMaterial===!0){const it=r.properties.get(I);it.light=et}return I}function D(C,U,et,w,I){if(C.visible===!1)return;if(C.layers.test(U.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&I===Bn)&&(!C.frustumCulled||s.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(et.matrixWorldInverse,C.matrixWorld);const lt=t.update(C),F=C.material;if(Array.isArray(F)){const $=lt.groups;for(let Q=0,st=$.length;Q<st;Q++){const X=$[Q],V=F[X.materialIndex];if(V&&V.visible){const z=b(C,V,w,I);C.onBeforeShadow(r,C,U,et,lt,z,X),r.renderBufferDirect(et,null,lt,z,C,X),C.onAfterShadow(r,C,U,et,lt,z,X)}}}else if(F.visible){const $=b(C,F,w,I);C.onBeforeShadow(r,C,U,et,lt,$,null),r.renderBufferDirect(et,null,lt,$,C,null),C.onAfterShadow(r,C,U,et,lt,$,null)}}const it=C.children;for(let lt=0,F=it.length;lt<F;lt++)D(it[lt],U,et,w,I)}function B(C){C.target.removeEventListener("dispose",B);for(const et in f){const w=f[et],I=C.target.uuid;I in w&&(w[I].dispose(),delete w[I])}}}function zg(r,t,e){const s=e.isWebGL2;function o(){let O=!1;const gt=new De;let xt=null;const Bt=new De(0,0,0,0);return{setMask:function(Dt){xt!==Dt&&!O&&(r.colorMask(Dt,Dt,Dt,Dt),xt=Dt)},setLocked:function(Dt){O=Dt},setClear:function(Dt,ue,de,Ee,Le){Le===!0&&(Dt*=Ee,ue*=Ee,de*=Ee),gt.set(Dt,ue,de,Ee),Bt.equals(gt)===!1&&(r.clearColor(Dt,ue,de,Ee),Bt.copy(gt))},reset:function(){O=!1,xt=null,Bt.set(-1,0,0,0)}}}function a(){let O=!1,gt=null,xt=null,Bt=null;return{setTest:function(Dt){Dt?Zt(r.DEPTH_TEST):Nt(r.DEPTH_TEST)},setMask:function(Dt){gt!==Dt&&!O&&(r.depthMask(Dt),gt=Dt)},setFunc:function(Dt){if(xt!==Dt){switch(Dt){case qu:r.depthFunc(r.NEVER);break;case Yu:r.depthFunc(r.ALWAYS);break;case ju:r.depthFunc(r.LESS);break;case Ps:r.depthFunc(r.LEQUAL);break;case Ku:r.depthFunc(r.EQUAL);break;case $u:r.depthFunc(r.GEQUAL);break;case Ju:r.depthFunc(r.GREATER);break;case Qu:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}xt=Dt}},setLocked:function(Dt){O=Dt},setClear:function(Dt){Bt!==Dt&&(r.clearDepth(Dt),Bt=Dt)},reset:function(){O=!1,gt=null,xt=null,Bt=null}}}function h(){let O=!1,gt=null,xt=null,Bt=null,Dt=null,ue=null,de=null,Ee=null,Le=null;return{setTest:function(fe){O||(fe?Zt(r.STENCIL_TEST):Nt(r.STENCIL_TEST))},setMask:function(fe){gt!==fe&&!O&&(r.stencilMask(fe),gt=fe)},setFunc:function(fe,Ne,nn){(xt!==fe||Bt!==Ne||Dt!==nn)&&(r.stencilFunc(fe,Ne,nn),xt=fe,Bt=Ne,Dt=nn)},setOp:function(fe,Ne,nn){(ue!==fe||de!==Ne||Ee!==nn)&&(r.stencilOp(fe,Ne,nn),ue=fe,de=Ne,Ee=nn)},setLocked:function(fe){O=fe},setClear:function(fe){Le!==fe&&(r.clearStencil(fe),Le=fe)},reset:function(){O=!1,gt=null,xt=null,Bt=null,Dt=null,ue=null,de=null,Ee=null,Le=null}}}const c=new o,d=new a,f=new h,p=new WeakMap,_=new WeakMap;let v={},y={},M=new WeakMap,S=[],x=null,m=!1,P=null,b=null,D=null,B=null,C=null,U=null,et=null,w=new le(0,0,0),I=0,J=!1,it=null,lt=null,F=null,$=null,Q=null;const st=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,V=0;const z=r.getParameter(r.VERSION);z.indexOf("WebGL")!==-1?(V=parseFloat(/^WebGL (\d)/.exec(z)[1]),X=V>=1):z.indexOf("OpenGL ES")!==-1&&(V=parseFloat(/^OpenGL ES (\d)/.exec(z)[1]),X=V>=2);let nt=null,ot={};const W=r.getParameter(r.SCISSOR_BOX),rt=r.getParameter(r.VIEWPORT),ct=new De().fromArray(W),pt=new De().fromArray(rt);function St(O,gt,xt,Bt){const Dt=new Uint8Array(4),ue=r.createTexture();r.bindTexture(O,ue),r.texParameteri(O,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(O,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let de=0;de<xt;de++)s&&(O===r.TEXTURE_3D||O===r.TEXTURE_2D_ARRAY)?r.texImage3D(gt,0,r.RGBA,1,1,Bt,0,r.RGBA,r.UNSIGNED_BYTE,Dt):r.texImage2D(gt+de,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,Dt);return ue}const Ut={};Ut[r.TEXTURE_2D]=St(r.TEXTURE_2D,r.TEXTURE_2D,1),Ut[r.TEXTURE_CUBE_MAP]=St(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),s&&(Ut[r.TEXTURE_2D_ARRAY]=St(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),Ut[r.TEXTURE_3D]=St(r.TEXTURE_3D,r.TEXTURE_3D,1,1)),c.setClear(0,0,0,1),d.setClear(1),f.setClear(0),Zt(r.DEPTH_TEST),d.setFunc(Ps),Vt(!1),R(hl),Zt(r.CULL_FACE),wt(Qn);function Zt(O){v[O]!==!0&&(r.enable(O),v[O]=!0)}function Nt(O){v[O]!==!1&&(r.disable(O),v[O]=!1)}function re(O,gt){return y[O]!==gt?(r.bindFramebuffer(O,gt),y[O]=gt,s&&(O===r.DRAW_FRAMEBUFFER&&(y[r.FRAMEBUFFER]=gt),O===r.FRAMEBUFFER&&(y[r.DRAW_FRAMEBUFFER]=gt)),!0):!1}function Z(O,gt){let xt=S,Bt=!1;if(O)if(xt=M.get(gt),xt===void 0&&(xt=[],M.set(gt,xt)),O.isWebGLMultipleRenderTargets){const Dt=O.texture;if(xt.length!==Dt.length||xt[0]!==r.COLOR_ATTACHMENT0){for(let ue=0,de=Dt.length;ue<de;ue++)xt[ue]=r.COLOR_ATTACHMENT0+ue;xt.length=Dt.length,Bt=!0}}else xt[0]!==r.COLOR_ATTACHMENT0&&(xt[0]=r.COLOR_ATTACHMENT0,Bt=!0);else xt[0]!==r.BACK&&(xt[0]=r.BACK,Bt=!0);Bt&&(e.isWebGL2?r.drawBuffers(xt):t.get("WEBGL_draw_buffers").drawBuffersWEBGL(xt))}function Ae(O){return x!==O?(r.useProgram(O),x=O,!0):!1}const It={[xi]:r.FUNC_ADD,[Iu]:r.FUNC_SUBTRACT,[Du]:r.FUNC_REVERSE_SUBTRACT};if(s)It[pl]=r.MIN,It[ml]=r.MAX;else{const O=t.get("EXT_blend_minmax");O!==null&&(It[pl]=O.MIN_EXT,It[ml]=O.MAX_EXT)}const Gt={[Uu]:r.ZERO,[Nu]:r.ONE,[Ou]:r.SRC_COLOR,[Xo]:r.SRC_ALPHA,[Gu]:r.SRC_ALPHA_SATURATE,[ku]:r.DST_COLOR,[Bu]:r.DST_ALPHA,[Fu]:r.ONE_MINUS_SRC_COLOR,[Zo]:r.ONE_MINUS_SRC_ALPHA,[Hu]:r.ONE_MINUS_DST_COLOR,[zu]:r.ONE_MINUS_DST_ALPHA,[Vu]:r.CONSTANT_COLOR,[Wu]:r.ONE_MINUS_CONSTANT_COLOR,[Xu]:r.CONSTANT_ALPHA,[Zu]:r.ONE_MINUS_CONSTANT_ALPHA};function wt(O,gt,xt,Bt,Dt,ue,de,Ee,Le,fe){if(O===Qn){m===!0&&(Nt(r.BLEND),m=!1);return}if(m===!1&&(Zt(r.BLEND),m=!0),O!==Cu){if(O!==P||fe!==J){if((b!==xi||C!==xi)&&(r.blendEquation(r.FUNC_ADD),b=xi,C=xi),fe)switch(O){case tr:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case ul:r.blendFunc(r.ONE,r.ONE);break;case dl:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case fl:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}else switch(O){case tr:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case ul:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case dl:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case fl:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}D=null,B=null,U=null,et=null,w.set(0,0,0),I=0,P=O,J=fe}return}Dt=Dt||gt,ue=ue||xt,de=de||Bt,(gt!==b||Dt!==C)&&(r.blendEquationSeparate(It[gt],It[Dt]),b=gt,C=Dt),(xt!==D||Bt!==B||ue!==U||de!==et)&&(r.blendFuncSeparate(Gt[xt],Gt[Bt],Gt[ue],Gt[de]),D=xt,B=Bt,U=ue,et=de),(Ee.equals(w)===!1||Le!==I)&&(r.blendColor(Ee.r,Ee.g,Ee.b,Le),w.copy(Ee),I=Le),P=O,J=!1}function me(O,gt){O.side===An?Nt(r.CULL_FACE):Zt(r.CULL_FACE);let xt=O.side===je;gt&&(xt=!xt),Vt(xt),O.blending===tr&&O.transparent===!1?wt(Qn):wt(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),d.setFunc(O.depthFunc),d.setTest(O.depthTest),d.setMask(O.depthWrite),c.setMask(O.colorWrite);const Bt=O.stencilWrite;f.setTest(Bt),Bt&&(f.setMask(O.stencilWriteMask),f.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),f.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),q(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?Zt(r.SAMPLE_ALPHA_TO_COVERAGE):Nt(r.SAMPLE_ALPHA_TO_COVERAGE)}function Vt(O){it!==O&&(O?r.frontFace(r.CW):r.frontFace(r.CCW),it=O)}function R(O){O!==Lu?(Zt(r.CULL_FACE),O!==lt&&(O===hl?r.cullFace(r.BACK):O===Pu?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):Nt(r.CULL_FACE),lt=O}function T(O){O!==F&&(X&&r.lineWidth(O),F=O)}function q(O,gt,xt){O?(Zt(r.POLYGON_OFFSET_FILL),($!==gt||Q!==xt)&&(r.polygonOffset(gt,xt),$=gt,Q=xt)):Nt(r.POLYGON_OFFSET_FILL)}function dt(O){O?Zt(r.SCISSOR_TEST):Nt(r.SCISSOR_TEST)}function ut(O){O===void 0&&(O=r.TEXTURE0+st-1),nt!==O&&(r.activeTexture(O),nt=O)}function ft(O,gt,xt){xt===void 0&&(nt===null?xt=r.TEXTURE0+st-1:xt=nt);let Bt=ot[xt];Bt===void 0&&(Bt={type:void 0,texture:void 0},ot[xt]=Bt),(Bt.type!==O||Bt.texture!==gt)&&(nt!==xt&&(r.activeTexture(xt),nt=xt),r.bindTexture(O,gt||Ut[O]),Bt.type=O,Bt.texture=gt)}function At(){const O=ot[nt];O!==void 0&&O.type!==void 0&&(r.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function vt(){try{r.compressedTexImage2D.apply(r,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Et(){try{r.compressedTexImage3D.apply(r,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Ot(){try{r.texSubImage2D.apply(r,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Kt(){try{r.texSubImage3D.apply(r,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function ht(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function ce(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function te(){try{r.texStorage2D.apply(r,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function kt(){try{r.texStorage3D.apply(r,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Rt(){try{r.texImage2D.apply(r,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Tt(){try{r.texImage3D.apply(r,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Yt(O){ct.equals(O)===!1&&(r.scissor(O.x,O.y,O.z,O.w),ct.copy(O))}function oe(O){pt.equals(O)===!1&&(r.viewport(O.x,O.y,O.z,O.w),pt.copy(O))}function xe(O,gt){let xt=_.get(gt);xt===void 0&&(xt=new WeakMap,_.set(gt,xt));let Bt=xt.get(O);Bt===void 0&&(Bt=r.getUniformBlockIndex(gt,O.name),xt.set(O,Bt))}function Jt(O,gt){const Bt=_.get(gt).get(O);p.get(gt)!==Bt&&(r.uniformBlockBinding(gt,Bt,O.__bindingPointIndex),p.set(gt,Bt))}function mt(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),s===!0&&(r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null)),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),v={},nt=null,ot={},y={},M=new WeakMap,S=[],x=null,m=!1,P=null,b=null,D=null,B=null,C=null,U=null,et=null,w=new le(0,0,0),I=0,J=!1,it=null,lt=null,F=null,$=null,Q=null,ct.set(0,0,r.canvas.width,r.canvas.height),pt.set(0,0,r.canvas.width,r.canvas.height),c.reset(),d.reset(),f.reset()}return{buffers:{color:c,depth:d,stencil:f},enable:Zt,disable:Nt,bindFramebuffer:re,drawBuffers:Z,useProgram:Ae,setBlending:wt,setMaterial:me,setFlipSided:Vt,setCullFace:R,setLineWidth:T,setPolygonOffset:q,setScissorTest:dt,activeTexture:ut,bindTexture:ft,unbindTexture:At,compressedTexImage2D:vt,compressedTexImage3D:Et,texImage2D:Rt,texImage3D:Tt,updateUBOMapping:xe,uniformBlockBinding:Jt,texStorage2D:te,texStorage3D:kt,texSubImage2D:Ot,texSubImage3D:Kt,compressedTexSubImage2D:ht,compressedTexSubImage3D:ce,scissor:Yt,viewport:oe,reset:mt}}function kg(r,t,e,s,o,a,h){const c=o.isWebGL2,d=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,f=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),p=new WeakMap;let _;const v=new WeakMap;let y=!1;try{y=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(R,T){return y?new OffscreenCanvas(R,T):Dr("canvas")}function S(R,T,q,dt){let ut=1;if((R.width>dt||R.height>dt)&&(ut=dt/Math.max(R.width,R.height)),ut<1||T===!0)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap){const ft=T?Us:Math.floor,At=ft(ut*R.width),vt=ft(ut*R.height);_===void 0&&(_=M(At,vt));const Et=q?M(At,vt):_;return Et.width=At,Et.height=vt,Et.getContext("2d").drawImage(R,0,0,At,vt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+R.width+"x"+R.height+") to ("+At+"x"+vt+")."),Et}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+R.width+"x"+R.height+")."),R;return R}function x(R){return Jo(R.width)&&Jo(R.height)}function m(R){return c?!1:R.wrapS!==yn||R.wrapT!==yn||R.minFilter!==Ye&&R.minFilter!==un}function P(R,T){return R.generateMipmaps&&T&&R.minFilter!==Ye&&R.minFilter!==un}function b(R){r.generateMipmap(R)}function D(R,T,q,dt,ut=!1){if(c===!1)return T;if(R!==null){if(r[R]!==void 0)return r[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let ft=T;if(T===r.RED&&(q===r.FLOAT&&(ft=r.R32F),q===r.HALF_FLOAT&&(ft=r.R16F),q===r.UNSIGNED_BYTE&&(ft=r.R8)),T===r.RED_INTEGER&&(q===r.UNSIGNED_BYTE&&(ft=r.R8UI),q===r.UNSIGNED_SHORT&&(ft=r.R16UI),q===r.UNSIGNED_INT&&(ft=r.R32UI),q===r.BYTE&&(ft=r.R8I),q===r.SHORT&&(ft=r.R16I),q===r.INT&&(ft=r.R32I)),T===r.RG&&(q===r.FLOAT&&(ft=r.RG32F),q===r.HALF_FLOAT&&(ft=r.RG16F),q===r.UNSIGNED_BYTE&&(ft=r.RG8)),T===r.RGBA){const At=ut?Rs:pe.getTransfer(dt);q===r.FLOAT&&(ft=r.RGBA32F),q===r.HALF_FLOAT&&(ft=r.RGBA16F),q===r.UNSIGNED_BYTE&&(ft=At===ve?r.SRGB8_ALPHA8:r.RGBA8),q===r.UNSIGNED_SHORT_4_4_4_4&&(ft=r.RGBA4),q===r.UNSIGNED_SHORT_5_5_5_1&&(ft=r.RGB5_A1)}return(ft===r.R16F||ft===r.R32F||ft===r.RG16F||ft===r.RG32F||ft===r.RGBA16F||ft===r.RGBA32F)&&t.get("EXT_color_buffer_float"),ft}function B(R,T,q){return P(R,q)===!0||R.isFramebufferTexture&&R.minFilter!==Ye&&R.minFilter!==un?Math.log2(Math.max(T.width,T.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?T.mipmaps.length:1}function C(R){return R===Ye||R===_l||R===fo?r.NEAREST:r.LINEAR}function U(R){const T=R.target;T.removeEventListener("dispose",U),w(T),T.isVideoTexture&&p.delete(T)}function et(R){const T=R.target;T.removeEventListener("dispose",et),J(T)}function w(R){const T=s.get(R);if(T.__webglInit===void 0)return;const q=R.source,dt=v.get(q);if(dt){const ut=dt[T.__cacheKey];ut.usedTimes--,ut.usedTimes===0&&I(R),Object.keys(dt).length===0&&v.delete(q)}s.remove(R)}function I(R){const T=s.get(R);r.deleteTexture(T.__webglTexture);const q=R.source,dt=v.get(q);delete dt[T.__cacheKey],h.memory.textures--}function J(R){const T=R.texture,q=s.get(R),dt=s.get(T);if(dt.__webglTexture!==void 0&&(r.deleteTexture(dt.__webglTexture),h.memory.textures--),R.depthTexture&&R.depthTexture.dispose(),R.isWebGLCubeRenderTarget)for(let ut=0;ut<6;ut++){if(Array.isArray(q.__webglFramebuffer[ut]))for(let ft=0;ft<q.__webglFramebuffer[ut].length;ft++)r.deleteFramebuffer(q.__webglFramebuffer[ut][ft]);else r.deleteFramebuffer(q.__webglFramebuffer[ut]);q.__webglDepthbuffer&&r.deleteRenderbuffer(q.__webglDepthbuffer[ut])}else{if(Array.isArray(q.__webglFramebuffer))for(let ut=0;ut<q.__webglFramebuffer.length;ut++)r.deleteFramebuffer(q.__webglFramebuffer[ut]);else r.deleteFramebuffer(q.__webglFramebuffer);if(q.__webglDepthbuffer&&r.deleteRenderbuffer(q.__webglDepthbuffer),q.__webglMultisampledFramebuffer&&r.deleteFramebuffer(q.__webglMultisampledFramebuffer),q.__webglColorRenderbuffer)for(let ut=0;ut<q.__webglColorRenderbuffer.length;ut++)q.__webglColorRenderbuffer[ut]&&r.deleteRenderbuffer(q.__webglColorRenderbuffer[ut]);q.__webglDepthRenderbuffer&&r.deleteRenderbuffer(q.__webglDepthRenderbuffer)}if(R.isWebGLMultipleRenderTargets)for(let ut=0,ft=T.length;ut<ft;ut++){const At=s.get(T[ut]);At.__webglTexture&&(r.deleteTexture(At.__webglTexture),h.memory.textures--),s.remove(T[ut])}s.remove(T),s.remove(R)}let it=0;function lt(){it=0}function F(){const R=it;return R>=o.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+o.maxTextures),it+=1,R}function $(R){const T=[];return T.push(R.wrapS),T.push(R.wrapT),T.push(R.wrapR||0),T.push(R.magFilter),T.push(R.minFilter),T.push(R.anisotropy),T.push(R.internalFormat),T.push(R.format),T.push(R.type),T.push(R.generateMipmaps),T.push(R.premultiplyAlpha),T.push(R.flipY),T.push(R.unpackAlignment),T.push(R.colorSpace),T.join()}function Q(R,T){const q=s.get(R);if(R.isVideoTexture&&me(R),R.isRenderTargetTexture===!1&&R.version>0&&q.__version!==R.version){const dt=R.image;if(dt===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(dt.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ct(q,R,T);return}}e.bindTexture(r.TEXTURE_2D,q.__webglTexture,r.TEXTURE0+T)}function st(R,T){const q=s.get(R);if(R.version>0&&q.__version!==R.version){ct(q,R,T);return}e.bindTexture(r.TEXTURE_2D_ARRAY,q.__webglTexture,r.TEXTURE0+T)}function X(R,T){const q=s.get(R);if(R.version>0&&q.__version!==R.version){ct(q,R,T);return}e.bindTexture(r.TEXTURE_3D,q.__webglTexture,r.TEXTURE0+T)}function V(R,T){const q=s.get(R);if(R.version>0&&q.__version!==R.version){pt(q,R,T);return}e.bindTexture(r.TEXTURE_CUBE_MAP,q.__webglTexture,r.TEXTURE0+T)}const z={[jo]:r.REPEAT,[yn]:r.CLAMP_TO_EDGE,[Ko]:r.MIRRORED_REPEAT},nt={[Ye]:r.NEAREST,[_l]:r.NEAREST_MIPMAP_NEAREST,[fo]:r.NEAREST_MIPMAP_LINEAR,[un]:r.LINEAR,[ld]:r.LINEAR_MIPMAP_NEAREST,[Rr]:r.LINEAR_MIPMAP_LINEAR},ot={[yd]:r.NEVER,[wd]:r.ALWAYS,[Md]:r.LESS,[Qc]:r.LEQUAL,[Sd]:r.EQUAL,[bd]:r.GEQUAL,[Ed]:r.GREATER,[Td]:r.NOTEQUAL};function W(R,T,q){if(q?(r.texParameteri(R,r.TEXTURE_WRAP_S,z[T.wrapS]),r.texParameteri(R,r.TEXTURE_WRAP_T,z[T.wrapT]),(R===r.TEXTURE_3D||R===r.TEXTURE_2D_ARRAY)&&r.texParameteri(R,r.TEXTURE_WRAP_R,z[T.wrapR]),r.texParameteri(R,r.TEXTURE_MAG_FILTER,nt[T.magFilter]),r.texParameteri(R,r.TEXTURE_MIN_FILTER,nt[T.minFilter])):(r.texParameteri(R,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(R,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),(R===r.TEXTURE_3D||R===r.TEXTURE_2D_ARRAY)&&r.texParameteri(R,r.TEXTURE_WRAP_R,r.CLAMP_TO_EDGE),(T.wrapS!==yn||T.wrapT!==yn)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),r.texParameteri(R,r.TEXTURE_MAG_FILTER,C(T.magFilter)),r.texParameteri(R,r.TEXTURE_MIN_FILTER,C(T.minFilter)),T.minFilter!==Ye&&T.minFilter!==un&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),T.compareFunction&&(r.texParameteri(R,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(R,r.TEXTURE_COMPARE_FUNC,ot[T.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){const dt=t.get("EXT_texture_filter_anisotropic");if(T.magFilter===Ye||T.minFilter!==fo&&T.minFilter!==Rr||T.type===Jn&&t.has("OES_texture_float_linear")===!1||c===!1&&T.type===Cr&&t.has("OES_texture_half_float_linear")===!1)return;(T.anisotropy>1||s.get(T).__currentAnisotropy)&&(r.texParameterf(R,dt.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,o.getMaxAnisotropy())),s.get(T).__currentAnisotropy=T.anisotropy)}}function rt(R,T){let q=!1;R.__webglInit===void 0&&(R.__webglInit=!0,T.addEventListener("dispose",U));const dt=T.source;let ut=v.get(dt);ut===void 0&&(ut={},v.set(dt,ut));const ft=$(T);if(ft!==R.__cacheKey){ut[ft]===void 0&&(ut[ft]={texture:r.createTexture(),usedTimes:0},h.memory.textures++,q=!0),ut[ft].usedTimes++;const At=ut[R.__cacheKey];At!==void 0&&(ut[R.__cacheKey].usedTimes--,At.usedTimes===0&&I(T)),R.__cacheKey=ft,R.__webglTexture=ut[ft].texture}return q}function ct(R,T,q){let dt=r.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(dt=r.TEXTURE_2D_ARRAY),T.isData3DTexture&&(dt=r.TEXTURE_3D);const ut=rt(R,T),ft=T.source;e.bindTexture(dt,R.__webglTexture,r.TEXTURE0+q);const At=s.get(ft);if(ft.version!==At.__version||ut===!0){e.activeTexture(r.TEXTURE0+q);const vt=pe.getPrimaries(pe.workingColorSpace),Et=T.colorSpace===fn?null:pe.getPrimaries(T.colorSpace),Ot=T.colorSpace===fn||vt===Et?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,T.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,T.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ot);const Kt=m(T)&&x(T.image)===!1;let ht=S(T.image,Kt,!1,o.maxTextureSize);ht=Vt(T,ht);const ce=x(ht)||c,te=a.convert(T.format,T.colorSpace);let kt=a.convert(T.type),Rt=D(T.internalFormat,te,kt,T.colorSpace,T.isVideoTexture);W(dt,T,ce);let Tt;const Yt=T.mipmaps,oe=c&&T.isVideoTexture!==!0&&Rt!==Kc,xe=At.__version===void 0||ut===!0,Jt=B(T,ht,ce);if(T.isDepthTexture)Rt=r.DEPTH_COMPONENT,c?T.type===Jn?Rt=r.DEPTH_COMPONENT32F:T.type===$n?Rt=r.DEPTH_COMPONENT24:T.type===Mi?Rt=r.DEPTH24_STENCIL8:Rt=r.DEPTH_COMPONENT16:T.type===Jn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),T.format===Si&&Rt===r.DEPTH_COMPONENT&&T.type!==oa&&T.type!==$n&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),T.type=$n,kt=a.convert(T.type)),T.format===rr&&Rt===r.DEPTH_COMPONENT&&(Rt=r.DEPTH_STENCIL,T.type!==Mi&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),T.type=Mi,kt=a.convert(T.type))),xe&&(oe?e.texStorage2D(r.TEXTURE_2D,1,Rt,ht.width,ht.height):e.texImage2D(r.TEXTURE_2D,0,Rt,ht.width,ht.height,0,te,kt,null));else if(T.isDataTexture)if(Yt.length>0&&ce){oe&&xe&&e.texStorage2D(r.TEXTURE_2D,Jt,Rt,Yt[0].width,Yt[0].height);for(let mt=0,O=Yt.length;mt<O;mt++)Tt=Yt[mt],oe?e.texSubImage2D(r.TEXTURE_2D,mt,0,0,Tt.width,Tt.height,te,kt,Tt.data):e.texImage2D(r.TEXTURE_2D,mt,Rt,Tt.width,Tt.height,0,te,kt,Tt.data);T.generateMipmaps=!1}else oe?(xe&&e.texStorage2D(r.TEXTURE_2D,Jt,Rt,ht.width,ht.height),e.texSubImage2D(r.TEXTURE_2D,0,0,0,ht.width,ht.height,te,kt,ht.data)):e.texImage2D(r.TEXTURE_2D,0,Rt,ht.width,ht.height,0,te,kt,ht.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){oe&&xe&&e.texStorage3D(r.TEXTURE_2D_ARRAY,Jt,Rt,Yt[0].width,Yt[0].height,ht.depth);for(let mt=0,O=Yt.length;mt<O;mt++)Tt=Yt[mt],T.format!==Mn?te!==null?oe?e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,mt,0,0,0,Tt.width,Tt.height,ht.depth,te,Tt.data,0,0):e.compressedTexImage3D(r.TEXTURE_2D_ARRAY,mt,Rt,Tt.width,Tt.height,ht.depth,0,Tt.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):oe?e.texSubImage3D(r.TEXTURE_2D_ARRAY,mt,0,0,0,Tt.width,Tt.height,ht.depth,te,kt,Tt.data):e.texImage3D(r.TEXTURE_2D_ARRAY,mt,Rt,Tt.width,Tt.height,ht.depth,0,te,kt,Tt.data)}else{oe&&xe&&e.texStorage2D(r.TEXTURE_2D,Jt,Rt,Yt[0].width,Yt[0].height);for(let mt=0,O=Yt.length;mt<O;mt++)Tt=Yt[mt],T.format!==Mn?te!==null?oe?e.compressedTexSubImage2D(r.TEXTURE_2D,mt,0,0,Tt.width,Tt.height,te,Tt.data):e.compressedTexImage2D(r.TEXTURE_2D,mt,Rt,Tt.width,Tt.height,0,Tt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):oe?e.texSubImage2D(r.TEXTURE_2D,mt,0,0,Tt.width,Tt.height,te,kt,Tt.data):e.texImage2D(r.TEXTURE_2D,mt,Rt,Tt.width,Tt.height,0,te,kt,Tt.data)}else if(T.isDataArrayTexture)oe?(xe&&e.texStorage3D(r.TEXTURE_2D_ARRAY,Jt,Rt,ht.width,ht.height,ht.depth),e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,ht.width,ht.height,ht.depth,te,kt,ht.data)):e.texImage3D(r.TEXTURE_2D_ARRAY,0,Rt,ht.width,ht.height,ht.depth,0,te,kt,ht.data);else if(T.isData3DTexture)oe?(xe&&e.texStorage3D(r.TEXTURE_3D,Jt,Rt,ht.width,ht.height,ht.depth),e.texSubImage3D(r.TEXTURE_3D,0,0,0,0,ht.width,ht.height,ht.depth,te,kt,ht.data)):e.texImage3D(r.TEXTURE_3D,0,Rt,ht.width,ht.height,ht.depth,0,te,kt,ht.data);else if(T.isFramebufferTexture){if(xe)if(oe)e.texStorage2D(r.TEXTURE_2D,Jt,Rt,ht.width,ht.height);else{let mt=ht.width,O=ht.height;for(let gt=0;gt<Jt;gt++)e.texImage2D(r.TEXTURE_2D,gt,Rt,mt,O,0,te,kt,null),mt>>=1,O>>=1}}else if(Yt.length>0&&ce){oe&&xe&&e.texStorage2D(r.TEXTURE_2D,Jt,Rt,Yt[0].width,Yt[0].height);for(let mt=0,O=Yt.length;mt<O;mt++)Tt=Yt[mt],oe?e.texSubImage2D(r.TEXTURE_2D,mt,0,0,te,kt,Tt):e.texImage2D(r.TEXTURE_2D,mt,Rt,te,kt,Tt);T.generateMipmaps=!1}else oe?(xe&&e.texStorage2D(r.TEXTURE_2D,Jt,Rt,ht.width,ht.height),e.texSubImage2D(r.TEXTURE_2D,0,0,0,te,kt,ht)):e.texImage2D(r.TEXTURE_2D,0,Rt,te,kt,ht);P(T,ce)&&b(dt),At.__version=ft.version,T.onUpdate&&T.onUpdate(T)}R.__version=T.version}function pt(R,T,q){if(T.image.length!==6)return;const dt=rt(R,T),ut=T.source;e.bindTexture(r.TEXTURE_CUBE_MAP,R.__webglTexture,r.TEXTURE0+q);const ft=s.get(ut);if(ut.version!==ft.__version||dt===!0){e.activeTexture(r.TEXTURE0+q);const At=pe.getPrimaries(pe.workingColorSpace),vt=T.colorSpace===fn?null:pe.getPrimaries(T.colorSpace),Et=T.colorSpace===fn||At===vt?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,T.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,T.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Et);const Ot=T.isCompressedTexture||T.image[0].isCompressedTexture,Kt=T.image[0]&&T.image[0].isDataTexture,ht=[];for(let mt=0;mt<6;mt++)!Ot&&!Kt?ht[mt]=S(T.image[mt],!1,!0,o.maxCubemapSize):ht[mt]=Kt?T.image[mt].image:T.image[mt],ht[mt]=Vt(T,ht[mt]);const ce=ht[0],te=x(ce)||c,kt=a.convert(T.format,T.colorSpace),Rt=a.convert(T.type),Tt=D(T.internalFormat,kt,Rt,T.colorSpace),Yt=c&&T.isVideoTexture!==!0,oe=ft.__version===void 0||dt===!0;let xe=B(T,ce,te);W(r.TEXTURE_CUBE_MAP,T,te);let Jt;if(Ot){Yt&&oe&&e.texStorage2D(r.TEXTURE_CUBE_MAP,xe,Tt,ce.width,ce.height);for(let mt=0;mt<6;mt++){Jt=ht[mt].mipmaps;for(let O=0;O<Jt.length;O++){const gt=Jt[O];T.format!==Mn?kt!==null?Yt?e.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,O,0,0,gt.width,gt.height,kt,gt.data):e.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,O,Tt,gt.width,gt.height,0,gt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Yt?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,O,0,0,gt.width,gt.height,kt,Rt,gt.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,O,Tt,gt.width,gt.height,0,kt,Rt,gt.data)}}}else{Jt=T.mipmaps,Yt&&oe&&(Jt.length>0&&xe++,e.texStorage2D(r.TEXTURE_CUBE_MAP,xe,Tt,ht[0].width,ht[0].height));for(let mt=0;mt<6;mt++)if(Kt){Yt?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,0,0,ht[mt].width,ht[mt].height,kt,Rt,ht[mt].data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,Tt,ht[mt].width,ht[mt].height,0,kt,Rt,ht[mt].data);for(let O=0;O<Jt.length;O++){const xt=Jt[O].image[mt].image;Yt?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,O+1,0,0,xt.width,xt.height,kt,Rt,xt.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,O+1,Tt,xt.width,xt.height,0,kt,Rt,xt.data)}}else{Yt?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,0,0,kt,Rt,ht[mt]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,Tt,kt,Rt,ht[mt]);for(let O=0;O<Jt.length;O++){const gt=Jt[O];Yt?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,O+1,0,0,kt,Rt,gt.image[mt]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mt,O+1,Tt,kt,Rt,gt.image[mt])}}}P(T,te)&&b(r.TEXTURE_CUBE_MAP),ft.__version=ut.version,T.onUpdate&&T.onUpdate(T)}R.__version=T.version}function St(R,T,q,dt,ut,ft){const At=a.convert(q.format,q.colorSpace),vt=a.convert(q.type),Et=D(q.internalFormat,At,vt,q.colorSpace);if(!s.get(T).__hasExternalTextures){const Kt=Math.max(1,T.width>>ft),ht=Math.max(1,T.height>>ft);ut===r.TEXTURE_3D||ut===r.TEXTURE_2D_ARRAY?e.texImage3D(ut,ft,Et,Kt,ht,T.depth,0,At,vt,null):e.texImage2D(ut,ft,Et,Kt,ht,0,At,vt,null)}e.bindFramebuffer(r.FRAMEBUFFER,R),wt(T)?d.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,dt,ut,s.get(q).__webglTexture,0,Gt(T)):(ut===r.TEXTURE_2D||ut>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&ut<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,dt,ut,s.get(q).__webglTexture,ft),e.bindFramebuffer(r.FRAMEBUFFER,null)}function Ut(R,T,q){if(r.bindRenderbuffer(r.RENDERBUFFER,R),T.depthBuffer&&!T.stencilBuffer){let dt=c===!0?r.DEPTH_COMPONENT24:r.DEPTH_COMPONENT16;if(q||wt(T)){const ut=T.depthTexture;ut&&ut.isDepthTexture&&(ut.type===Jn?dt=r.DEPTH_COMPONENT32F:ut.type===$n&&(dt=r.DEPTH_COMPONENT24));const ft=Gt(T);wt(T)?d.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ft,dt,T.width,T.height):r.renderbufferStorageMultisample(r.RENDERBUFFER,ft,dt,T.width,T.height)}else r.renderbufferStorage(r.RENDERBUFFER,dt,T.width,T.height);r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.RENDERBUFFER,R)}else if(T.depthBuffer&&T.stencilBuffer){const dt=Gt(T);q&&wt(T)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,dt,r.DEPTH24_STENCIL8,T.width,T.height):wt(T)?d.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,dt,r.DEPTH24_STENCIL8,T.width,T.height):r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_STENCIL,T.width,T.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.RENDERBUFFER,R)}else{const dt=T.isWebGLMultipleRenderTargets===!0?T.texture:[T.texture];for(let ut=0;ut<dt.length;ut++){const ft=dt[ut],At=a.convert(ft.format,ft.colorSpace),vt=a.convert(ft.type),Et=D(ft.internalFormat,At,vt,ft.colorSpace),Ot=Gt(T);q&&wt(T)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ot,Et,T.width,T.height):wt(T)?d.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ot,Et,T.width,T.height):r.renderbufferStorage(r.RENDERBUFFER,Et,T.width,T.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function Zt(R,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(r.FRAMEBUFFER,R),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!s.get(T.depthTexture).__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),Q(T.depthTexture,0);const dt=s.get(T.depthTexture).__webglTexture,ut=Gt(T);if(T.depthTexture.format===Si)wt(T)?d.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,dt,0,ut):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,dt,0);else if(T.depthTexture.format===rr)wt(T)?d.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,dt,0,ut):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,dt,0);else throw new Error("Unknown depthTexture format")}function Nt(R){const T=s.get(R),q=R.isWebGLCubeRenderTarget===!0;if(R.depthTexture&&!T.__autoAllocateDepthBuffer){if(q)throw new Error("target.depthTexture not supported in Cube render targets");Zt(T.__webglFramebuffer,R)}else if(q){T.__webglDepthbuffer=[];for(let dt=0;dt<6;dt++)e.bindFramebuffer(r.FRAMEBUFFER,T.__webglFramebuffer[dt]),T.__webglDepthbuffer[dt]=r.createRenderbuffer(),Ut(T.__webglDepthbuffer[dt],R,!1)}else e.bindFramebuffer(r.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer=r.createRenderbuffer(),Ut(T.__webglDepthbuffer,R,!1);e.bindFramebuffer(r.FRAMEBUFFER,null)}function re(R,T,q){const dt=s.get(R);T!==void 0&&St(dt.__webglFramebuffer,R,R.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),q!==void 0&&Nt(R)}function Z(R){const T=R.texture,q=s.get(R),dt=s.get(T);R.addEventListener("dispose",et),R.isWebGLMultipleRenderTargets!==!0&&(dt.__webglTexture===void 0&&(dt.__webglTexture=r.createTexture()),dt.__version=T.version,h.memory.textures++);const ut=R.isWebGLCubeRenderTarget===!0,ft=R.isWebGLMultipleRenderTargets===!0,At=x(R)||c;if(ut){q.__webglFramebuffer=[];for(let vt=0;vt<6;vt++)if(c&&T.mipmaps&&T.mipmaps.length>0){q.__webglFramebuffer[vt]=[];for(let Et=0;Et<T.mipmaps.length;Et++)q.__webglFramebuffer[vt][Et]=r.createFramebuffer()}else q.__webglFramebuffer[vt]=r.createFramebuffer()}else{if(c&&T.mipmaps&&T.mipmaps.length>0){q.__webglFramebuffer=[];for(let vt=0;vt<T.mipmaps.length;vt++)q.__webglFramebuffer[vt]=r.createFramebuffer()}else q.__webglFramebuffer=r.createFramebuffer();if(ft)if(o.drawBuffers){const vt=R.texture;for(let Et=0,Ot=vt.length;Et<Ot;Et++){const Kt=s.get(vt[Et]);Kt.__webglTexture===void 0&&(Kt.__webglTexture=r.createTexture(),h.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(c&&R.samples>0&&wt(R)===!1){const vt=ft?T:[T];q.__webglMultisampledFramebuffer=r.createFramebuffer(),q.__webglColorRenderbuffer=[],e.bindFramebuffer(r.FRAMEBUFFER,q.__webglMultisampledFramebuffer);for(let Et=0;Et<vt.length;Et++){const Ot=vt[Et];q.__webglColorRenderbuffer[Et]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,q.__webglColorRenderbuffer[Et]);const Kt=a.convert(Ot.format,Ot.colorSpace),ht=a.convert(Ot.type),ce=D(Ot.internalFormat,Kt,ht,Ot.colorSpace,R.isXRRenderTarget===!0),te=Gt(R);r.renderbufferStorageMultisample(r.RENDERBUFFER,te,ce,R.width,R.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Et,r.RENDERBUFFER,q.__webglColorRenderbuffer[Et])}r.bindRenderbuffer(r.RENDERBUFFER,null),R.depthBuffer&&(q.__webglDepthRenderbuffer=r.createRenderbuffer(),Ut(q.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(r.FRAMEBUFFER,null)}}if(ut){e.bindTexture(r.TEXTURE_CUBE_MAP,dt.__webglTexture),W(r.TEXTURE_CUBE_MAP,T,At);for(let vt=0;vt<6;vt++)if(c&&T.mipmaps&&T.mipmaps.length>0)for(let Et=0;Et<T.mipmaps.length;Et++)St(q.__webglFramebuffer[vt][Et],R,T,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+vt,Et);else St(q.__webglFramebuffer[vt],R,T,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0);P(T,At)&&b(r.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ft){const vt=R.texture;for(let Et=0,Ot=vt.length;Et<Ot;Et++){const Kt=vt[Et],ht=s.get(Kt);e.bindTexture(r.TEXTURE_2D,ht.__webglTexture),W(r.TEXTURE_2D,Kt,At),St(q.__webglFramebuffer,R,Kt,r.COLOR_ATTACHMENT0+Et,r.TEXTURE_2D,0),P(Kt,At)&&b(r.TEXTURE_2D)}e.unbindTexture()}else{let vt=r.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(c?vt=R.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),e.bindTexture(vt,dt.__webglTexture),W(vt,T,At),c&&T.mipmaps&&T.mipmaps.length>0)for(let Et=0;Et<T.mipmaps.length;Et++)St(q.__webglFramebuffer[Et],R,T,r.COLOR_ATTACHMENT0,vt,Et);else St(q.__webglFramebuffer,R,T,r.COLOR_ATTACHMENT0,vt,0);P(T,At)&&b(vt),e.unbindTexture()}R.depthBuffer&&Nt(R)}function Ae(R){const T=x(R)||c,q=R.isWebGLMultipleRenderTargets===!0?R.texture:[R.texture];for(let dt=0,ut=q.length;dt<ut;dt++){const ft=q[dt];if(P(ft,T)){const At=R.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:r.TEXTURE_2D,vt=s.get(ft).__webglTexture;e.bindTexture(At,vt),b(At),e.unbindTexture()}}}function It(R){if(c&&R.samples>0&&wt(R)===!1){const T=R.isWebGLMultipleRenderTargets?R.texture:[R.texture],q=R.width,dt=R.height;let ut=r.COLOR_BUFFER_BIT;const ft=[],At=R.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,vt=s.get(R),Et=R.isWebGLMultipleRenderTargets===!0;if(Et)for(let Ot=0;Ot<T.length;Ot++)e.bindFramebuffer(r.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ot,r.RENDERBUFFER,null),e.bindFramebuffer(r.FRAMEBUFFER,vt.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ot,r.TEXTURE_2D,null,0);e.bindFramebuffer(r.READ_FRAMEBUFFER,vt.__webglMultisampledFramebuffer),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,vt.__webglFramebuffer);for(let Ot=0;Ot<T.length;Ot++){ft.push(r.COLOR_ATTACHMENT0+Ot),R.depthBuffer&&ft.push(At);const Kt=vt.__ignoreDepthValues!==void 0?vt.__ignoreDepthValues:!1;if(Kt===!1&&(R.depthBuffer&&(ut|=r.DEPTH_BUFFER_BIT),R.stencilBuffer&&(ut|=r.STENCIL_BUFFER_BIT)),Et&&r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,vt.__webglColorRenderbuffer[Ot]),Kt===!0&&(r.invalidateFramebuffer(r.READ_FRAMEBUFFER,[At]),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[At])),Et){const ht=s.get(T[Ot]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,ht,0)}r.blitFramebuffer(0,0,q,dt,0,0,q,dt,ut,r.NEAREST),f&&r.invalidateFramebuffer(r.READ_FRAMEBUFFER,ft)}if(e.bindFramebuffer(r.READ_FRAMEBUFFER,null),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),Et)for(let Ot=0;Ot<T.length;Ot++){e.bindFramebuffer(r.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ot,r.RENDERBUFFER,vt.__webglColorRenderbuffer[Ot]);const Kt=s.get(T[Ot]).__webglTexture;e.bindFramebuffer(r.FRAMEBUFFER,vt.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ot,r.TEXTURE_2D,Kt,0)}e.bindFramebuffer(r.DRAW_FRAMEBUFFER,vt.__webglMultisampledFramebuffer)}}function Gt(R){return Math.min(o.maxSamples,R.samples)}function wt(R){const T=s.get(R);return c&&R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function me(R){const T=h.render.frame;p.get(R)!==T&&(p.set(R,T),R.update())}function Vt(R,T){const q=R.colorSpace,dt=R.format,ut=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||R.format===$o||q!==Gn&&q!==fn&&(pe.getTransfer(q)===ve?c===!1?t.has("EXT_sRGB")===!0&&dt===Mn?(R.format=$o,R.minFilter=un,R.generateMipmaps=!1):T=eh.sRGBToLinear(T):(dt!==Mn||ut!==ei)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",q)),T}this.allocateTextureUnit=F,this.resetTextureUnits=lt,this.setTexture2D=Q,this.setTexture2DArray=st,this.setTexture3D=X,this.setTextureCube=V,this.rebindTextures=re,this.setupRenderTarget=Z,this.updateRenderTargetMipmap=Ae,this.updateMultisampleRenderTarget=It,this.setupDepthRenderbuffer=Nt,this.setupFrameBufferTexture=St,this.useMultisampledRTT=wt}function Hg(r,t,e){const s=e.isWebGL2;function o(a,h=fn){let c;const d=pe.getTransfer(h);if(a===ei)return r.UNSIGNED_BYTE;if(a===Xc)return r.UNSIGNED_SHORT_4_4_4_4;if(a===Zc)return r.UNSIGNED_SHORT_5_5_5_1;if(a===cd)return r.BYTE;if(a===hd)return r.SHORT;if(a===oa)return r.UNSIGNED_SHORT;if(a===Wc)return r.INT;if(a===$n)return r.UNSIGNED_INT;if(a===Jn)return r.FLOAT;if(a===Cr)return s?r.HALF_FLOAT:(c=t.get("OES_texture_half_float"),c!==null?c.HALF_FLOAT_OES:null);if(a===ud)return r.ALPHA;if(a===Mn)return r.RGBA;if(a===dd)return r.LUMINANCE;if(a===fd)return r.LUMINANCE_ALPHA;if(a===Si)return r.DEPTH_COMPONENT;if(a===rr)return r.DEPTH_STENCIL;if(a===$o)return c=t.get("EXT_sRGB"),c!==null?c.SRGB_ALPHA_EXT:null;if(a===pd)return r.RED;if(a===qc)return r.RED_INTEGER;if(a===md)return r.RG;if(a===Yc)return r.RG_INTEGER;if(a===jc)return r.RGBA_INTEGER;if(a===po||a===mo||a===_o||a===go)if(d===ve)if(c=t.get("WEBGL_compressed_texture_s3tc_srgb"),c!==null){if(a===po)return c.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(a===mo)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(a===_o)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(a===go)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(c=t.get("WEBGL_compressed_texture_s3tc"),c!==null){if(a===po)return c.COMPRESSED_RGB_S3TC_DXT1_EXT;if(a===mo)return c.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(a===_o)return c.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(a===go)return c.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(a===gl||a===vl||a===xl||a===yl)if(c=t.get("WEBGL_compressed_texture_pvrtc"),c!==null){if(a===gl)return c.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(a===vl)return c.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(a===xl)return c.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(a===yl)return c.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(a===Kc)return c=t.get("WEBGL_compressed_texture_etc1"),c!==null?c.COMPRESSED_RGB_ETC1_WEBGL:null;if(a===Ml||a===Sl)if(c=t.get("WEBGL_compressed_texture_etc"),c!==null){if(a===Ml)return d===ve?c.COMPRESSED_SRGB8_ETC2:c.COMPRESSED_RGB8_ETC2;if(a===Sl)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:c.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(a===El||a===Tl||a===bl||a===wl||a===Al||a===Ll||a===Pl||a===Rl||a===Cl||a===Il||a===Dl||a===Ul||a===Nl||a===Ol)if(c=t.get("WEBGL_compressed_texture_astc"),c!==null){if(a===El)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:c.COMPRESSED_RGBA_ASTC_4x4_KHR;if(a===Tl)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:c.COMPRESSED_RGBA_ASTC_5x4_KHR;if(a===bl)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:c.COMPRESSED_RGBA_ASTC_5x5_KHR;if(a===wl)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:c.COMPRESSED_RGBA_ASTC_6x5_KHR;if(a===Al)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:c.COMPRESSED_RGBA_ASTC_6x6_KHR;if(a===Ll)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:c.COMPRESSED_RGBA_ASTC_8x5_KHR;if(a===Pl)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:c.COMPRESSED_RGBA_ASTC_8x6_KHR;if(a===Rl)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:c.COMPRESSED_RGBA_ASTC_8x8_KHR;if(a===Cl)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:c.COMPRESSED_RGBA_ASTC_10x5_KHR;if(a===Il)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:c.COMPRESSED_RGBA_ASTC_10x6_KHR;if(a===Dl)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:c.COMPRESSED_RGBA_ASTC_10x8_KHR;if(a===Ul)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:c.COMPRESSED_RGBA_ASTC_10x10_KHR;if(a===Nl)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:c.COMPRESSED_RGBA_ASTC_12x10_KHR;if(a===Ol)return d===ve?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:c.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(a===vo||a===Fl||a===Bl)if(c=t.get("EXT_texture_compression_bptc"),c!==null){if(a===vo)return d===ve?c.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:c.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(a===Fl)return c.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(a===Bl)return c.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(a===_d||a===zl||a===kl||a===Hl)if(c=t.get("EXT_texture_compression_rgtc"),c!==null){if(a===vo)return c.COMPRESSED_RED_RGTC1_EXT;if(a===zl)return c.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(a===kl)return c.COMPRESSED_RED_GREEN_RGTC2_EXT;if(a===Hl)return c.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return a===Mi?s?r.UNSIGNED_INT_24_8:(c=t.get("WEBGL_depth_texture"),c!==null?c.UNSIGNED_INT_24_8_WEBGL:null):r[a]!==void 0?r[a]:null}return{convert:o}}class Gg extends dn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Qi extends Ue{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Vg={type:"move"};class Ho{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new G,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new G),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new G,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new G),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const s of t.hand.values())this._getHandJoint(e,s)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,s){let o=null,a=null,h=null;const c=this._targetRay,d=this._grip,f=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(f&&t.hand){h=!0;for(const S of t.hand.values()){const x=e.getJointPose(S,s),m=this._getHandJoint(f,S);x!==null&&(m.matrix.fromArray(x.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=x.radius),m.visible=x!==null}const p=f.joints["index-finger-tip"],_=f.joints["thumb-tip"],v=p.position.distanceTo(_.position),y=.02,M=.005;f.inputState.pinching&&v>y+M?(f.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!f.inputState.pinching&&v<=y-M&&(f.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else d!==null&&t.gripSpace&&(a=e.getPose(t.gripSpace,s),a!==null&&(d.matrix.fromArray(a.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,a.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(a.linearVelocity)):d.hasLinearVelocity=!1,a.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(a.angularVelocity)):d.hasAngularVelocity=!1));c!==null&&(o=e.getPose(t.targetRaySpace,s),o===null&&a!==null&&(o=a),o!==null&&(c.matrix.fromArray(o.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,o.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(o.linearVelocity)):c.hasLinearVelocity=!1,o.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(o.angularVelocity)):c.hasAngularVelocity=!1,this.dispatchEvent(Vg)))}return c!==null&&(c.visible=o!==null),d!==null&&(d.visible=a!==null),f!==null&&(f.visible=h!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const s=new Qi;s.matrixAutoUpdate=!1,s.visible=!1,t.joints[e.jointName]=s,t.add(s)}return t.joints[e.jointName]}}class Wg extends or{constructor(t,e){super();const s=this;let o=null,a=1,h=null,c="local-floor",d=1,f=null,p=null,_=null,v=null,y=null,M=null;const S=e.getContextAttributes();let x=null,m=null;const P=[],b=[],D=new ie;let B=null;const C=new dn;C.layers.enable(1),C.viewport=new De;const U=new dn;U.layers.enable(2),U.viewport=new De;const et=[C,U],w=new Gg;w.layers.enable(1),w.layers.enable(2);let I=null,J=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let rt=P[W];return rt===void 0&&(rt=new Ho,P[W]=rt),rt.getTargetRaySpace()},this.getControllerGrip=function(W){let rt=P[W];return rt===void 0&&(rt=new Ho,P[W]=rt),rt.getGripSpace()},this.getHand=function(W){let rt=P[W];return rt===void 0&&(rt=new Ho,P[W]=rt),rt.getHandSpace()};function it(W){const rt=b.indexOf(W.inputSource);if(rt===-1)return;const ct=P[rt];ct!==void 0&&(ct.update(W.inputSource,W.frame,f||h),ct.dispatchEvent({type:W.type,data:W.inputSource}))}function lt(){o.removeEventListener("select",it),o.removeEventListener("selectstart",it),o.removeEventListener("selectend",it),o.removeEventListener("squeeze",it),o.removeEventListener("squeezestart",it),o.removeEventListener("squeezeend",it),o.removeEventListener("end",lt),o.removeEventListener("inputsourceschange",F);for(let W=0;W<P.length;W++){const rt=b[W];rt!==null&&(b[W]=null,P[W].disconnect(rt))}I=null,J=null,t.setRenderTarget(x),y=null,v=null,_=null,o=null,m=null,ot.stop(),s.isPresenting=!1,t.setPixelRatio(B),t.setSize(D.width,D.height,!1),s.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){a=W,s.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){c=W,s.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return f||h},this.setReferenceSpace=function(W){f=W},this.getBaseLayer=function(){return v!==null?v:y},this.getBinding=function(){return _},this.getFrame=function(){return M},this.getSession=function(){return o},this.setSession=async function(W){if(o=W,o!==null){if(x=t.getRenderTarget(),o.addEventListener("select",it),o.addEventListener("selectstart",it),o.addEventListener("selectend",it),o.addEventListener("squeeze",it),o.addEventListener("squeezestart",it),o.addEventListener("squeezeend",it),o.addEventListener("end",lt),o.addEventListener("inputsourceschange",F),S.xrCompatible!==!0&&await e.makeXRCompatible(),B=t.getPixelRatio(),t.getSize(D),o.renderState.layers===void 0||t.capabilities.isWebGL2===!1){const rt={antialias:o.renderState.layers===void 0?S.antialias:!0,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:a};y=new XRWebGLLayer(o,e,rt),o.updateRenderState({baseLayer:y}),t.setPixelRatio(1),t.setSize(y.framebufferWidth,y.framebufferHeight,!1),m=new Ti(y.framebufferWidth,y.framebufferHeight,{format:Mn,type:ei,colorSpace:t.outputColorSpace,stencilBuffer:S.stencil})}else{let rt=null,ct=null,pt=null;S.depth&&(pt=S.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,rt=S.stencil?rr:Si,ct=S.stencil?Mi:$n);const St={colorFormat:e.RGBA8,depthFormat:pt,scaleFactor:a};_=new XRWebGLBinding(o,e),v=_.createProjectionLayer(St),o.updateRenderState({layers:[v]}),t.setPixelRatio(1),t.setSize(v.textureWidth,v.textureHeight,!1),m=new Ti(v.textureWidth,v.textureHeight,{format:Mn,type:ei,depthTexture:new dh(v.textureWidth,v.textureHeight,ct,void 0,void 0,void 0,void 0,void 0,void 0,rt),stencilBuffer:S.stencil,colorSpace:t.outputColorSpace,samples:S.antialias?4:0});const Ut=t.properties.get(m);Ut.__ignoreDepthValues=v.ignoreDepthValues}m.isXRRenderTarget=!0,this.setFoveation(d),f=null,h=await o.requestReferenceSpace(c),ot.setContext(o),ot.start(),s.isPresenting=!0,s.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(o!==null)return o.environmentBlendMode};function F(W){for(let rt=0;rt<W.removed.length;rt++){const ct=W.removed[rt],pt=b.indexOf(ct);pt>=0&&(b[pt]=null,P[pt].disconnect(ct))}for(let rt=0;rt<W.added.length;rt++){const ct=W.added[rt];let pt=b.indexOf(ct);if(pt===-1){for(let Ut=0;Ut<P.length;Ut++)if(Ut>=b.length){b.push(ct),pt=Ut;break}else if(b[Ut]===null){b[Ut]=ct,pt=Ut;break}if(pt===-1)break}const St=P[pt];St&&St.connect(ct)}}const $=new G,Q=new G;function st(W,rt,ct){$.setFromMatrixPosition(rt.matrixWorld),Q.setFromMatrixPosition(ct.matrixWorld);const pt=$.distanceTo(Q),St=rt.projectionMatrix.elements,Ut=ct.projectionMatrix.elements,Zt=St[14]/(St[10]-1),Nt=St[14]/(St[10]+1),re=(St[9]+1)/St[5],Z=(St[9]-1)/St[5],Ae=(St[8]-1)/St[0],It=(Ut[8]+1)/Ut[0],Gt=Zt*Ae,wt=Zt*It,me=pt/(-Ae+It),Vt=me*-Ae;rt.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(Vt),W.translateZ(me),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert();const R=Zt+me,T=Nt+me,q=Gt-Vt,dt=wt+(pt-Vt),ut=re*Nt/T*R,ft=Z*Nt/T*R;W.projectionMatrix.makePerspective(q,dt,ut,ft,R,T),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}function X(W,rt){rt===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(rt.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(o===null)return;w.near=U.near=C.near=W.near,w.far=U.far=C.far=W.far,(I!==w.near||J!==w.far)&&(o.updateRenderState({depthNear:w.near,depthFar:w.far}),I=w.near,J=w.far);const rt=W.parent,ct=w.cameras;X(w,rt);for(let pt=0;pt<ct.length;pt++)X(ct[pt],rt);ct.length===2?st(w,C,U):w.projectionMatrix.copy(C.projectionMatrix),V(W,w,rt)};function V(W,rt,ct){ct===null?W.matrix.copy(rt.matrixWorld):(W.matrix.copy(ct.matrixWorld),W.matrix.invert(),W.matrix.multiply(rt.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(rt.projectionMatrix),W.projectionMatrixInverse.copy(rt.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=Ir*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return w},this.getFoveation=function(){if(!(v===null&&y===null))return d},this.setFoveation=function(W){d=W,v!==null&&(v.fixedFoveation=W),y!==null&&y.fixedFoveation!==void 0&&(y.fixedFoveation=W)};let z=null;function nt(W,rt){if(p=rt.getViewerPose(f||h),M=rt,p!==null){const ct=p.views;y!==null&&(t.setRenderTargetFramebuffer(m,y.framebuffer),t.setRenderTarget(m));let pt=!1;ct.length!==w.cameras.length&&(w.cameras.length=0,pt=!0);for(let St=0;St<ct.length;St++){const Ut=ct[St];let Zt=null;if(y!==null)Zt=y.getViewport(Ut);else{const re=_.getViewSubImage(v,Ut);Zt=re.viewport,St===0&&(t.setRenderTargetTextures(m,re.colorTexture,v.ignoreDepthValues?void 0:re.depthStencilTexture),t.setRenderTarget(m))}let Nt=et[St];Nt===void 0&&(Nt=new dn,Nt.layers.enable(St),Nt.viewport=new De,et[St]=Nt),Nt.matrix.fromArray(Ut.transform.matrix),Nt.matrix.decompose(Nt.position,Nt.quaternion,Nt.scale),Nt.projectionMatrix.fromArray(Ut.projectionMatrix),Nt.projectionMatrixInverse.copy(Nt.projectionMatrix).invert(),Nt.viewport.set(Zt.x,Zt.y,Zt.width,Zt.height),St===0&&(w.matrix.copy(Nt.matrix),w.matrix.decompose(w.position,w.quaternion,w.scale)),pt===!0&&w.cameras.push(Nt)}}for(let ct=0;ct<P.length;ct++){const pt=b[ct],St=P[ct];pt!==null&&St!==void 0&&St.update(pt,rt,f||h)}z&&z(W,rt),rt.detectedPlanes&&s.dispatchEvent({type:"planesdetected",data:rt}),M=null}const ot=new hh;ot.setAnimationLoop(nt),this.setAnimationLoop=function(W){z=W},this.dispose=function(){}}}function Xg(r,t){function e(x,m){x.matrixAutoUpdate===!0&&x.updateMatrix(),m.value.copy(x.matrix)}function s(x,m){m.color.getRGB(x.fogColor.value,ah(r)),m.isFog?(x.fogNear.value=m.near,x.fogFar.value=m.far):m.isFogExp2&&(x.fogDensity.value=m.density)}function o(x,m,P,b,D){m.isMeshBasicMaterial||m.isMeshLambertMaterial?a(x,m):m.isMeshToonMaterial?(a(x,m),_(x,m)):m.isMeshPhongMaterial?(a(x,m),p(x,m)):m.isMeshStandardMaterial?(a(x,m),v(x,m),m.isMeshPhysicalMaterial&&y(x,m,D)):m.isMeshMatcapMaterial?(a(x,m),M(x,m)):m.isMeshDepthMaterial?a(x,m):m.isMeshDistanceMaterial?(a(x,m),S(x,m)):m.isMeshNormalMaterial?a(x,m):m.isLineBasicMaterial?(h(x,m),m.isLineDashedMaterial&&c(x,m)):m.isPointsMaterial?d(x,m,P,b):m.isSpriteMaterial?f(x,m):m.isShadowMaterial?(x.color.value.copy(m.color),x.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function a(x,m){x.opacity.value=m.opacity,m.color&&x.diffuse.value.copy(m.color),m.emissive&&x.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(x.map.value=m.map,e(m.map,x.mapTransform)),m.alphaMap&&(x.alphaMap.value=m.alphaMap,e(m.alphaMap,x.alphaMapTransform)),m.bumpMap&&(x.bumpMap.value=m.bumpMap,e(m.bumpMap,x.bumpMapTransform),x.bumpScale.value=m.bumpScale,m.side===je&&(x.bumpScale.value*=-1)),m.normalMap&&(x.normalMap.value=m.normalMap,e(m.normalMap,x.normalMapTransform),x.normalScale.value.copy(m.normalScale),m.side===je&&x.normalScale.value.negate()),m.displacementMap&&(x.displacementMap.value=m.displacementMap,e(m.displacementMap,x.displacementMapTransform),x.displacementScale.value=m.displacementScale,x.displacementBias.value=m.displacementBias),m.emissiveMap&&(x.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,x.emissiveMapTransform)),m.specularMap&&(x.specularMap.value=m.specularMap,e(m.specularMap,x.specularMapTransform)),m.alphaTest>0&&(x.alphaTest.value=m.alphaTest);const P=t.get(m).envMap;if(P&&(x.envMap.value=P,x.flipEnvMap.value=P.isCubeTexture&&P.isRenderTargetTexture===!1?-1:1,x.reflectivity.value=m.reflectivity,x.ior.value=m.ior,x.refractionRatio.value=m.refractionRatio),m.lightMap){x.lightMap.value=m.lightMap;const b=r._useLegacyLights===!0?Math.PI:1;x.lightMapIntensity.value=m.lightMapIntensity*b,e(m.lightMap,x.lightMapTransform)}m.aoMap&&(x.aoMap.value=m.aoMap,x.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,x.aoMapTransform))}function h(x,m){x.diffuse.value.copy(m.color),x.opacity.value=m.opacity,m.map&&(x.map.value=m.map,e(m.map,x.mapTransform))}function c(x,m){x.dashSize.value=m.dashSize,x.totalSize.value=m.dashSize+m.gapSize,x.scale.value=m.scale}function d(x,m,P,b){x.diffuse.value.copy(m.color),x.opacity.value=m.opacity,x.size.value=m.size*P,x.scale.value=b*.5,m.map&&(x.map.value=m.map,e(m.map,x.uvTransform)),m.alphaMap&&(x.alphaMap.value=m.alphaMap,e(m.alphaMap,x.alphaMapTransform)),m.alphaTest>0&&(x.alphaTest.value=m.alphaTest)}function f(x,m){x.diffuse.value.copy(m.color),x.opacity.value=m.opacity,x.rotation.value=m.rotation,m.map&&(x.map.value=m.map,e(m.map,x.mapTransform)),m.alphaMap&&(x.alphaMap.value=m.alphaMap,e(m.alphaMap,x.alphaMapTransform)),m.alphaTest>0&&(x.alphaTest.value=m.alphaTest)}function p(x,m){x.specular.value.copy(m.specular),x.shininess.value=Math.max(m.shininess,1e-4)}function _(x,m){m.gradientMap&&(x.gradientMap.value=m.gradientMap)}function v(x,m){x.metalness.value=m.metalness,m.metalnessMap&&(x.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,x.metalnessMapTransform)),x.roughness.value=m.roughness,m.roughnessMap&&(x.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,x.roughnessMapTransform)),t.get(m).envMap&&(x.envMapIntensity.value=m.envMapIntensity)}function y(x,m,P){x.ior.value=m.ior,m.sheen>0&&(x.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),x.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(x.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,x.sheenColorMapTransform)),m.sheenRoughnessMap&&(x.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,x.sheenRoughnessMapTransform))),m.clearcoat>0&&(x.clearcoat.value=m.clearcoat,x.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(x.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,x.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(x.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,x.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(x.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,x.clearcoatNormalMapTransform),x.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===je&&x.clearcoatNormalScale.value.negate())),m.iridescence>0&&(x.iridescence.value=m.iridescence,x.iridescenceIOR.value=m.iridescenceIOR,x.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],x.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(x.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,x.iridescenceMapTransform)),m.iridescenceThicknessMap&&(x.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,x.iridescenceThicknessMapTransform))),m.transmission>0&&(x.transmission.value=m.transmission,x.transmissionSamplerMap.value=P.texture,x.transmissionSamplerSize.value.set(P.width,P.height),m.transmissionMap&&(x.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,x.transmissionMapTransform)),x.thickness.value=m.thickness,m.thicknessMap&&(x.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,x.thicknessMapTransform)),x.attenuationDistance.value=m.attenuationDistance,x.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(x.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(x.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,x.anisotropyMapTransform))),x.specularIntensity.value=m.specularIntensity,x.specularColor.value.copy(m.specularColor),m.specularColorMap&&(x.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,x.specularColorMapTransform)),m.specularIntensityMap&&(x.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,x.specularIntensityMapTransform))}function M(x,m){m.matcap&&(x.matcap.value=m.matcap)}function S(x,m){const P=t.get(m).light;x.referencePosition.value.setFromMatrixPosition(P.matrixWorld),x.nearDistance.value=P.shadow.camera.near,x.farDistance.value=P.shadow.camera.far}return{refreshFogUniforms:s,refreshMaterialUniforms:o}}function Zg(r,t,e,s){let o={},a={},h=[];const c=e.isWebGL2?r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS):0;function d(P,b){const D=b.program;s.uniformBlockBinding(P,D)}function f(P,b){let D=o[P.id];D===void 0&&(M(P),D=p(P),o[P.id]=D,P.addEventListener("dispose",x));const B=b.program;s.updateUBOMapping(P,B);const C=t.render.frame;a[P.id]!==C&&(v(P),a[P.id]=C)}function p(P){const b=_();P.__bindingPointIndex=b;const D=r.createBuffer(),B=P.__size,C=P.usage;return r.bindBuffer(r.UNIFORM_BUFFER,D),r.bufferData(r.UNIFORM_BUFFER,B,C),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,b,D),D}function _(){for(let P=0;P<c;P++)if(h.indexOf(P)===-1)return h.push(P),P;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function v(P){const b=o[P.id],D=P.uniforms,B=P.__cache;r.bindBuffer(r.UNIFORM_BUFFER,b);for(let C=0,U=D.length;C<U;C++){const et=Array.isArray(D[C])?D[C]:[D[C]];for(let w=0,I=et.length;w<I;w++){const J=et[w];if(y(J,C,w,B)===!0){const it=J.__offset,lt=Array.isArray(J.value)?J.value:[J.value];let F=0;for(let $=0;$<lt.length;$++){const Q=lt[$],st=S(Q);typeof Q=="number"||typeof Q=="boolean"?(J.__data[0]=Q,r.bufferSubData(r.UNIFORM_BUFFER,it+F,J.__data)):Q.isMatrix3?(J.__data[0]=Q.elements[0],J.__data[1]=Q.elements[1],J.__data[2]=Q.elements[2],J.__data[3]=0,J.__data[4]=Q.elements[3],J.__data[5]=Q.elements[4],J.__data[6]=Q.elements[5],J.__data[7]=0,J.__data[8]=Q.elements[6],J.__data[9]=Q.elements[7],J.__data[10]=Q.elements[8],J.__data[11]=0):(Q.toArray(J.__data,F),F+=st.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,it,J.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function y(P,b,D,B){const C=P.value,U=b+"_"+D;if(B[U]===void 0)return typeof C=="number"||typeof C=="boolean"?B[U]=C:B[U]=C.clone(),!0;{const et=B[U];if(typeof C=="number"||typeof C=="boolean"){if(et!==C)return B[U]=C,!0}else if(et.equals(C)===!1)return et.copy(C),!0}return!1}function M(P){const b=P.uniforms;let D=0;const B=16;for(let U=0,et=b.length;U<et;U++){const w=Array.isArray(b[U])?b[U]:[b[U]];for(let I=0,J=w.length;I<J;I++){const it=w[I],lt=Array.isArray(it.value)?it.value:[it.value];for(let F=0,$=lt.length;F<$;F++){const Q=lt[F],st=S(Q),X=D%B;X!==0&&B-X<st.boundary&&(D+=B-X),it.__data=new Float32Array(st.storage/Float32Array.BYTES_PER_ELEMENT),it.__offset=D,D+=st.storage}}}const C=D%B;return C>0&&(D+=B-C),P.__size=D,P.__cache={},this}function S(P){const b={boundary:0,storage:0};return typeof P=="number"||typeof P=="boolean"?(b.boundary=4,b.storage=4):P.isVector2?(b.boundary=8,b.storage=8):P.isVector3||P.isColor?(b.boundary=16,b.storage=12):P.isVector4?(b.boundary=16,b.storage=16):P.isMatrix3?(b.boundary=48,b.storage=48):P.isMatrix4?(b.boundary=64,b.storage=64):P.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",P),b}function x(P){const b=P.target;b.removeEventListener("dispose",x);const D=h.indexOf(b.__bindingPointIndex);h.splice(D,1),r.deleteBuffer(o[b.id]),delete o[b.id],delete a[b.id]}function m(){for(const P in o)r.deleteBuffer(o[P]);h=[],o={},a={}}return{bind:d,update:f,dispose:m}}class vh{constructor(t={}){const{canvas:e=Hd(),context:s=null,depth:o=!0,stencil:a=!0,alpha:h=!1,antialias:c=!1,premultipliedAlpha:d=!0,preserveDrawingBuffer:f=!1,powerPreference:p="default",failIfMajorPerformanceCaveat:_=!1}=t;this.isWebGLRenderer=!0;let v;s!==null?v=s.getContextAttributes().alpha:v=h;const y=new Uint32Array(4),M=new Int32Array(4);let S=null,x=null;const m=[],P=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=ze,this._useLegacyLights=!1,this.toneMapping=ti,this.toneMappingExposure=1;const b=this;let D=!1,B=0,C=0,U=null,et=-1,w=null;const I=new De,J=new De;let it=null;const lt=new le(0);let F=0,$=e.width,Q=e.height,st=1,X=null,V=null;const z=new De(0,0,$,Q),nt=new De(0,0,$,Q);let ot=!1;const W=new ha;let rt=!1,ct=!1,pt=null;const St=new Se,Ut=new ie,Zt=new G,Nt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function re(){return U===null?st:1}let Z=s;function Ae(A,k){for(let K=0;K<A.length;K++){const tt=A[K],Y=e.getContext(tt,k);if(Y!==null)return Y}return null}try{const A={alpha:!0,depth:o,stencil:a,antialias:c,premultipliedAlpha:d,preserveDrawingBuffer:f,powerPreference:p,failIfMajorPerformanceCaveat:_};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${ra}`),e.addEventListener("webglcontextlost",mt,!1),e.addEventListener("webglcontextrestored",O,!1),e.addEventListener("webglcontextcreationerror",gt,!1),Z===null){const k=["webgl2","webgl","experimental-webgl"];if(b.isWebGL1Renderer===!0&&k.shift(),Z=Ae(k,A),Z===null)throw Ae(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&Z instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),Z.getShaderPrecisionFormat===void 0&&(Z.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let It,Gt,wt,me,Vt,R,T,q,dt,ut,ft,At,vt,Et,Ot,Kt,ht,ce,te,kt,Rt,Tt,Yt,oe;function xe(){It=new n_(Z),Gt=new Km(Z,It,t),It.init(Gt),Tt=new Hg(Z,It,Gt),wt=new zg(Z,It,Gt),me=new s_(Z),Vt=new bg,R=new kg(Z,It,wt,Vt,Gt,Tt,me),T=new Jm(b),q=new e_(b),dt=new ff(Z,Gt),Yt=new Ym(Z,It,dt,Gt),ut=new i_(Z,dt,me,Yt),ft=new c_(Z,ut,dt,me),te=new l_(Z,Gt,R),Kt=new $m(Vt),At=new Tg(b,T,q,It,Gt,Yt,Kt),vt=new Xg(b,Vt),Et=new Ag,Ot=new Dg(It,Gt),ce=new qm(b,T,q,wt,ft,v,d),ht=new Bg(b,ft,Gt),oe=new Zg(Z,me,Gt,wt),kt=new jm(Z,It,me,Gt),Rt=new r_(Z,It,me,Gt),me.programs=At.programs,b.capabilities=Gt,b.extensions=It,b.properties=Vt,b.renderLists=Et,b.shadowMap=ht,b.state=wt,b.info=me}xe();const Jt=new Wg(b,Z);this.xr=Jt,this.getContext=function(){return Z},this.getContextAttributes=function(){return Z.getContextAttributes()},this.forceContextLoss=function(){const A=It.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=It.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return st},this.setPixelRatio=function(A){A!==void 0&&(st=A,this.setSize($,Q,!1))},this.getSize=function(A){return A.set($,Q)},this.setSize=function(A,k,K=!0){if(Jt.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}$=A,Q=k,e.width=Math.floor(A*st),e.height=Math.floor(k*st),K===!0&&(e.style.width=A+"px",e.style.height=k+"px"),this.setViewport(0,0,A,k)},this.getDrawingBufferSize=function(A){return A.set($*st,Q*st).floor()},this.setDrawingBufferSize=function(A,k,K){$=A,Q=k,st=K,e.width=Math.floor(A*K),e.height=Math.floor(k*K),this.setViewport(0,0,A,k)},this.getCurrentViewport=function(A){return A.copy(I)},this.getViewport=function(A){return A.copy(z)},this.setViewport=function(A,k,K,tt){A.isVector4?z.set(A.x,A.y,A.z,A.w):z.set(A,k,K,tt),wt.viewport(I.copy(z).multiplyScalar(st).floor())},this.getScissor=function(A){return A.copy(nt)},this.setScissor=function(A,k,K,tt){A.isVector4?nt.set(A.x,A.y,A.z,A.w):nt.set(A,k,K,tt),wt.scissor(J.copy(nt).multiplyScalar(st).floor())},this.getScissorTest=function(){return ot},this.setScissorTest=function(A){wt.setScissorTest(ot=A)},this.setOpaqueSort=function(A){X=A},this.setTransparentSort=function(A){V=A},this.getClearColor=function(A){return A.copy(ce.getClearColor())},this.setClearColor=function(){ce.setClearColor.apply(ce,arguments)},this.getClearAlpha=function(){return ce.getClearAlpha()},this.setClearAlpha=function(){ce.setClearAlpha.apply(ce,arguments)},this.clear=function(A=!0,k=!0,K=!0){let tt=0;if(A){let Y=!1;if(U!==null){const yt=U.texture.format;Y=yt===jc||yt===Yc||yt===qc}if(Y){const yt=U.texture.type,Lt=yt===ei||yt===$n||yt===oa||yt===Mi||yt===Xc||yt===Zc,Ct=ce.getClearColor(),zt=ce.getClearAlpha(),$t=Ct.r,Wt=Ct.g,qt=Ct.b;Lt?(y[0]=$t,y[1]=Wt,y[2]=qt,y[3]=zt,Z.clearBufferuiv(Z.COLOR,0,y)):(M[0]=$t,M[1]=Wt,M[2]=qt,M[3]=zt,Z.clearBufferiv(Z.COLOR,0,M))}else tt|=Z.COLOR_BUFFER_BIT}k&&(tt|=Z.DEPTH_BUFFER_BIT),K&&(tt|=Z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Z.clear(tt)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",mt,!1),e.removeEventListener("webglcontextrestored",O,!1),e.removeEventListener("webglcontextcreationerror",gt,!1),Et.dispose(),Ot.dispose(),Vt.dispose(),T.dispose(),q.dispose(),ft.dispose(),Yt.dispose(),oe.dispose(),At.dispose(),Jt.dispose(),Jt.removeEventListener("sessionstart",Le),Jt.removeEventListener("sessionend",fe),pt&&(pt.dispose(),pt=null),Ne.stop()};function mt(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function O(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;const A=me.autoReset,k=ht.enabled,K=ht.autoUpdate,tt=ht.needsUpdate,Y=ht.type;xe(),me.autoReset=A,ht.enabled=k,ht.autoUpdate=K,ht.needsUpdate=tt,ht.type=Y}function gt(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function xt(A){const k=A.target;k.removeEventListener("dispose",xt),Bt(k)}function Bt(A){Dt(A),Vt.remove(A)}function Dt(A){const k=Vt.get(A).programs;k!==void 0&&(k.forEach(function(K){At.releaseProgram(K)}),A.isShaderMaterial&&At.releaseShaderCache(A))}this.renderBufferDirect=function(A,k,K,tt,Y,yt){k===null&&(k=Nt);const Lt=Y.isMesh&&Y.matrixWorld.determinant()<0,Ct=dr(A,k,K,tt,Y);wt.setMaterial(tt,Lt);let zt=K.index,$t=1;if(tt.wireframe===!0){if(zt=ut.getWireframeAttribute(K),zt===void 0)return;$t=2}const Wt=K.drawRange,qt=K.attributes.position;let Me=Wt.start*$t,Oe=(Wt.start+Wt.count)*$t;yt!==null&&(Me=Math.max(Me,yt.start*$t),Oe=Math.min(Oe,(yt.start+yt.count)*$t)),zt!==null?(Me=Math.max(Me,0),Oe=Math.min(Oe,zt.count)):qt!=null&&(Me=Math.max(Me,0),Oe=Math.min(Oe,qt.count));const ye=Oe-Me;if(ye<0||ye===1/0)return;Yt.setup(Y,tt,Ct,K,zt);let sn,_e=kt;if(zt!==null&&(sn=dt.get(zt),_e=Rt,_e.setIndex(sn)),Y.isMesh)tt.wireframe===!0?(wt.setLineWidth(tt.wireframeLinewidth*re()),_e.setMode(Z.LINES)):_e.setMode(Z.TRIANGLES);else if(Y.isLine){let Xt=tt.linewidth;Xt===void 0&&(Xt=1),wt.setLineWidth(Xt*re()),Y.isLineSegments?_e.setMode(Z.LINES):Y.isLineLoop?_e.setMode(Z.LINE_LOOP):_e.setMode(Z.LINE_STRIP)}else Y.isPoints?_e.setMode(Z.POINTS):Y.isSprite&&_e.setMode(Z.TRIANGLES);if(Y.isBatchedMesh)_e.renderMultiDraw(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount);else if(Y.isInstancedMesh)_e.renderInstances(Me,ye,Y.count);else if(K.isInstancedBufferGeometry){const Xt=K._maxInstanceCount!==void 0?K._maxInstanceCount:1/0,se=Math.min(K.instanceCount,Xt);_e.renderInstances(Me,ye,se)}else _e.render(Me,ye)};function ue(A,k,K){A.transparent===!0&&A.side===An&&A.forceSinglePass===!1?(A.side=je,A.needsUpdate=!0,ri(A,k,K),A.side=ni,A.needsUpdate=!0,ri(A,k,K),A.side=An):ri(A,k,K)}this.compile=function(A,k,K=null){K===null&&(K=A),x=Ot.get(K),x.init(),P.push(x),K.traverseVisible(function(Y){Y.isLight&&Y.layers.test(k.layers)&&(x.pushLight(Y),Y.castShadow&&x.pushShadow(Y))}),A!==K&&A.traverseVisible(function(Y){Y.isLight&&Y.layers.test(k.layers)&&(x.pushLight(Y),Y.castShadow&&x.pushShadow(Y))}),x.setupLights(b._useLegacyLights);const tt=new Set;return A.traverse(function(Y){const yt=Y.material;if(yt)if(Array.isArray(yt))for(let Lt=0;Lt<yt.length;Lt++){const Ct=yt[Lt];ue(Ct,K,Y),tt.add(Ct)}else ue(yt,K,Y),tt.add(yt)}),P.pop(),x=null,tt},this.compileAsync=function(A,k,K=null){const tt=this.compile(A,k,K);return new Promise(Y=>{function yt(){if(tt.forEach(function(Lt){Vt.get(Lt).currentProgram.isReady()&&tt.delete(Lt)}),tt.size===0){Y(A);return}setTimeout(yt,10)}It.get("KHR_parallel_shader_compile")!==null?yt():setTimeout(yt,10)})};let de=null;function Ee(A){de&&de(A)}function Le(){Ne.stop()}function fe(){Ne.start()}const Ne=new hh;Ne.setAnimationLoop(Ee),typeof self<"u"&&Ne.setContext(self),this.setAnimationLoop=function(A){de=A,Jt.setAnimationLoop(A),A===null?Ne.stop():Ne.start()},Jt.addEventListener("sessionstart",Le),Jt.addEventListener("sessionend",fe),this.render=function(A,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),Jt.enabled===!0&&Jt.isPresenting===!0&&(Jt.cameraAutoUpdate===!0&&Jt.updateCamera(k),k=Jt.getCamera()),A.isScene===!0&&A.onBeforeRender(b,A,k,U),x=Ot.get(A,P.length),x.init(),P.push(x),St.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),W.setFromProjectionMatrix(St),ct=this.localClippingEnabled,rt=Kt.init(this.clippingPlanes,ct),S=Et.get(A,m.length),S.init(),m.push(S),nn(A,k,0,b.sortObjects),S.finish(),b.sortObjects===!0&&S.sort(X,V),this.info.render.frame++,rt===!0&&Kt.beginShadows();const K=x.state.shadowsArray;if(ht.render(K,A,k),rt===!0&&Kt.endShadows(),this.info.autoReset===!0&&this.info.reset(),ce.render(S,A),x.setupLights(b._useLegacyLights),k.isArrayCamera){const tt=k.cameras;for(let Y=0,yt=tt.length;Y<yt;Y++){const Lt=tt[Y];kr(S,A,Lt,Lt.viewport)}}else kr(S,A,k);U!==null&&(R.updateMultisampleRenderTarget(U),R.updateRenderTargetMipmap(U)),A.isScene===!0&&A.onAfterRender(b,A,k),Yt.resetDefaultState(),et=-1,w=null,P.pop(),P.length>0?x=P[P.length-1]:x=null,m.pop(),m.length>0?S=m[m.length-1]:S=null};function nn(A,k,K,tt){if(A.visible===!1)return;if(A.layers.test(k.layers)){if(A.isGroup)K=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(k);else if(A.isLight)x.pushLight(A),A.castShadow&&x.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||W.intersectsSprite(A)){tt&&Zt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(St);const Lt=ft.update(A),Ct=A.material;Ct.visible&&S.push(A,Lt,Ct,K,Zt.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||W.intersectsObject(A))){const Lt=ft.update(A),Ct=A.material;if(tt&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Zt.copy(A.boundingSphere.center)):(Lt.boundingSphere===null&&Lt.computeBoundingSphere(),Zt.copy(Lt.boundingSphere.center)),Zt.applyMatrix4(A.matrixWorld).applyMatrix4(St)),Array.isArray(Ct)){const zt=Lt.groups;for(let $t=0,Wt=zt.length;$t<Wt;$t++){const qt=zt[$t],Me=Ct[qt.materialIndex];Me&&Me.visible&&S.push(A,Lt,Me,K,Zt.z,qt)}}else Ct.visible&&S.push(A,Lt,Ct,K,Zt.z,null)}}const yt=A.children;for(let Lt=0,Ct=yt.length;Lt<Ct;Lt++)nn(yt[Lt],k,K,tt)}function kr(A,k,K,tt){const Y=A.opaque,yt=A.transmissive,Lt=A.transparent;x.setupLightsView(K),rt===!0&&Kt.setGlobalState(b.clippingPlanes,K),yt.length>0&&rn(Y,yt,k,K),tt&&wt.viewport(I.copy(tt)),Y.length>0&&bt(Y,k,K),yt.length>0&&bt(yt,k,K),Lt.length>0&&bt(Lt,k,K),wt.buffers.depth.setTest(!0),wt.buffers.depth.setMask(!0),wt.buffers.color.setMask(!0),wt.setPolygonOffset(!1)}function rn(A,k,K,tt){if((K.isScene===!0?K.overrideMaterial:null)!==null)return;const yt=Gt.isWebGL2;pt===null&&(pt=new Ti(1,1,{generateMipmaps:!0,type:It.has("EXT_color_buffer_half_float")?Cr:ei,minFilter:Rr,samples:yt?4:0})),b.getDrawingBufferSize(Ut),yt?pt.setSize(Ut.x,Ut.y):pt.setSize(Us(Ut.x),Us(Ut.y));const Lt=b.getRenderTarget();b.setRenderTarget(pt),b.getClearColor(lt),F=b.getClearAlpha(),F<1&&b.setClearColor(16777215,.5),b.clear();const Ct=b.toneMapping;b.toneMapping=ti,bt(A,K,tt),R.updateMultisampleRenderTarget(pt),R.updateRenderTargetMipmap(pt);let zt=!1;for(let $t=0,Wt=k.length;$t<Wt;$t++){const qt=k[$t],Me=qt.object,Oe=qt.geometry,ye=qt.material,sn=qt.group;if(ye.side===An&&Me.layers.test(tt.layers)){const _e=ye.side;ye.side=je,ye.needsUpdate=!0,cr(Me,K,tt,Oe,ye,sn),ye.side=_e,ye.needsUpdate=!0,zt=!0}}zt===!0&&(R.updateMultisampleRenderTarget(pt),R.updateRenderTargetMipmap(pt)),b.setRenderTarget(Lt),b.setClearColor(lt,F),b.toneMapping=Ct}function bt(A,k,K){const tt=k.isScene===!0?k.overrideMaterial:null;for(let Y=0,yt=A.length;Y<yt;Y++){const Lt=A[Y],Ct=Lt.object,zt=Lt.geometry,$t=tt===null?Lt.material:tt,Wt=Lt.group;Ct.layers.test(K.layers)&&cr(Ct,k,K,zt,$t,Wt)}}function cr(A,k,K,tt,Y,yt){A.onBeforeRender(b,k,K,tt,Y,yt),A.modelViewMatrix.multiplyMatrices(K.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),Y.onBeforeRender(b,k,K,tt,A,yt),Y.transparent===!0&&Y.side===An&&Y.forceSinglePass===!1?(Y.side=je,Y.needsUpdate=!0,b.renderBufferDirect(K,k,tt,Y,A,yt),Y.side=ni,Y.needsUpdate=!0,b.renderBufferDirect(K,k,tt,Y,A,yt),Y.side=An):b.renderBufferDirect(K,k,tt,Y,A,yt),A.onAfterRender(b,k,K,tt,Y,yt)}function ri(A,k,K){k.isScene!==!0&&(k=Nt);const tt=Vt.get(A),Y=x.state.lights,yt=x.state.shadowsArray,Lt=Y.state.version,Ct=At.getParameters(A,Y.state,yt,k,K),zt=At.getProgramCacheKey(Ct);let $t=tt.programs;tt.environment=A.isMeshStandardMaterial?k.environment:null,tt.fog=k.fog,tt.envMap=(A.isMeshStandardMaterial?q:T).get(A.envMap||tt.environment),$t===void 0&&(A.addEventListener("dispose",xt),$t=new Map,tt.programs=$t);let Wt=$t.get(zt);if(Wt!==void 0){if(tt.currentProgram===Wt&&tt.lightsStateVersion===Lt)return ur(A,Ct),Wt}else Ct.uniforms=At.getUniforms(A),A.onBuild(K,Ct,b),A.onBeforeCompile(Ct,b),Wt=At.acquireProgram(Ct,zt),$t.set(zt,Wt),tt.uniforms=Ct.uniforms;const qt=tt.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(qt.clippingPlanes=Kt.uniform),ur(A,Ct),tt.needsLights=Vn(A),tt.lightsStateVersion=Lt,tt.needsLights&&(qt.ambientLightColor.value=Y.state.ambient,qt.lightProbe.value=Y.state.probe,qt.directionalLights.value=Y.state.directional,qt.directionalLightShadows.value=Y.state.directionalShadow,qt.spotLights.value=Y.state.spot,qt.spotLightShadows.value=Y.state.spotShadow,qt.rectAreaLights.value=Y.state.rectArea,qt.ltc_1.value=Y.state.rectAreaLTC1,qt.ltc_2.value=Y.state.rectAreaLTC2,qt.pointLights.value=Y.state.point,qt.pointLightShadows.value=Y.state.pointShadow,qt.hemisphereLights.value=Y.state.hemi,qt.directionalShadowMap.value=Y.state.directionalShadowMap,qt.directionalShadowMatrix.value=Y.state.directionalShadowMatrix,qt.spotShadowMap.value=Y.state.spotShadowMap,qt.spotLightMatrix.value=Y.state.spotLightMatrix,qt.spotLightMap.value=Y.state.spotLightMap,qt.pointShadowMap.value=Y.state.pointShadowMap,qt.pointShadowMatrix.value=Y.state.pointShadowMatrix),tt.currentProgram=Wt,tt.uniformsList=null,Wt}function hr(A){if(A.uniformsList===null){const k=A.currentProgram.getUniforms();A.uniformsList=Ls.seqWithValue(k.seq,A.uniforms)}return A.uniformsList}function ur(A,k){const K=Vt.get(A);K.outputColorSpace=k.outputColorSpace,K.batching=k.batching,K.instancing=k.instancing,K.instancingColor=k.instancingColor,K.skinning=k.skinning,K.morphTargets=k.morphTargets,K.morphNormals=k.morphNormals,K.morphColors=k.morphColors,K.morphTargetsCount=k.morphTargetsCount,K.numClippingPlanes=k.numClippingPlanes,K.numIntersection=k.numClipIntersection,K.vertexAlphas=k.vertexAlphas,K.vertexTangents=k.vertexTangents,K.toneMapping=k.toneMapping}function dr(A,k,K,tt,Y){k.isScene!==!0&&(k=Nt),R.resetTextureUnits();const yt=k.fog,Lt=tt.isMeshStandardMaterial?k.environment:null,Ct=U===null?b.outputColorSpace:U.isXRRenderTarget===!0?U.texture.colorSpace:Gn,zt=(tt.isMeshStandardMaterial?q:T).get(tt.envMap||Lt),$t=tt.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,Wt=!!K.attributes.tangent&&(!!tt.normalMap||tt.anisotropy>0),qt=!!K.morphAttributes.position,Me=!!K.morphAttributes.normal,Oe=!!K.morphAttributes.color;let ye=ti;tt.toneMapped&&(U===null||U.isXRRenderTarget===!0)&&(ye=b.toneMapping);const sn=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,_e=sn!==void 0?sn.length:0,Xt=Vt.get(tt),se=x.state.lights;if(rt===!0&&(ct===!0||A!==w)){const Fe=A===w&&tt.id===et;Kt.setState(tt,A,Fe)}let Ht=!1;tt.version===Xt.__version?(Xt.needsLights&&Xt.lightsStateVersion!==se.state.version||Xt.outputColorSpace!==Ct||Y.isBatchedMesh&&Xt.batching===!1||!Y.isBatchedMesh&&Xt.batching===!0||Y.isInstancedMesh&&Xt.instancing===!1||!Y.isInstancedMesh&&Xt.instancing===!0||Y.isSkinnedMesh&&Xt.skinning===!1||!Y.isSkinnedMesh&&Xt.skinning===!0||Y.isInstancedMesh&&Xt.instancingColor===!0&&Y.instanceColor===null||Y.isInstancedMesh&&Xt.instancingColor===!1&&Y.instanceColor!==null||Xt.envMap!==zt||tt.fog===!0&&Xt.fog!==yt||Xt.numClippingPlanes!==void 0&&(Xt.numClippingPlanes!==Kt.numPlanes||Xt.numIntersection!==Kt.numIntersection)||Xt.vertexAlphas!==$t||Xt.vertexTangents!==Wt||Xt.morphTargets!==qt||Xt.morphNormals!==Me||Xt.morphColors!==Oe||Xt.toneMapping!==ye||Gt.isWebGL2===!0&&Xt.morphTargetsCount!==_e)&&(Ht=!0):(Ht=!0,Xt.__version=tt.version);let on=Xt.currentProgram;Ht===!0&&(on=ri(tt,k,Y));let Ln=!1,an=!1,si=!1;const Pt=on.getUniforms(),he=Xt.uniforms;if(wt.useProgram(on.program)&&(Ln=!0,an=!0,si=!0),tt.id!==et&&(et=tt.id,an=!0),Ln||w!==A){Pt.setValue(Z,"projectionMatrix",A.projectionMatrix),Pt.setValue(Z,"viewMatrix",A.matrixWorldInverse);const Fe=Pt.map.cameraPosition;Fe!==void 0&&Fe.setValue(Z,Zt.setFromMatrixPosition(A.matrixWorld)),Gt.logarithmicDepthBuffer&&Pt.setValue(Z,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(tt.isMeshPhongMaterial||tt.isMeshToonMaterial||tt.isMeshLambertMaterial||tt.isMeshBasicMaterial||tt.isMeshStandardMaterial||tt.isShaderMaterial)&&Pt.setValue(Z,"isOrthographic",A.isOrthographicCamera===!0),w!==A&&(w=A,an=!0,si=!0)}if(Y.isSkinnedMesh){Pt.setOptional(Z,Y,"bindMatrix"),Pt.setOptional(Z,Y,"bindMatrixInverse");const Fe=Y.skeleton;Fe&&(Gt.floatVertexTextures?(Fe.boneTexture===null&&Fe.computeBoneTexture(),Pt.setValue(Z,"boneTexture",Fe.boneTexture,R)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}Y.isBatchedMesh&&(Pt.setOptional(Z,Y,"batchingTexture"),Pt.setValue(Z,"batchingTexture",Y._matricesTexture,R));const oi=K.morphAttributes;if((oi.position!==void 0||oi.normal!==void 0||oi.color!==void 0&&Gt.isWebGL2===!0)&&te.update(Y,K,on),(an||Xt.receiveShadow!==Y.receiveShadow)&&(Xt.receiveShadow=Y.receiveShadow,Pt.setValue(Z,"receiveShadow",Y.receiveShadow)),tt.isMeshGouraudMaterial&&tt.envMap!==null&&(he.envMap.value=zt,he.flipEnvMap.value=zt.isCubeTexture&&zt.isRenderTargetTexture===!1?-1:1),an&&(Pt.setValue(Z,"toneMappingExposure",b.toneMappingExposure),Xt.needsLights&&Hr(he,si),yt&&tt.fog===!0&&vt.refreshFogUniforms(he,yt),vt.refreshMaterialUniforms(he,tt,st,Q,pt),Ls.upload(Z,hr(Xt),he,R)),tt.isShaderMaterial&&tt.uniformsNeedUpdate===!0&&(Ls.upload(Z,hr(Xt),he,R),tt.uniformsNeedUpdate=!1),tt.isSpriteMaterial&&Pt.setValue(Z,"center",Y.center),Pt.setValue(Z,"modelViewMatrix",Y.modelViewMatrix),Pt.setValue(Z,"normalMatrix",Y.normalMatrix),Pt.setValue(Z,"modelMatrix",Y.matrixWorld),tt.isShaderMaterial||tt.isRawShaderMaterial){const Fe=tt.uniformsGroups;for(let He=0,Hs=Fe.length;He<Hs;He++)if(Gt.isWebGL2){const ai=Fe[He];oe.update(ai,on),oe.bind(ai,on)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return on}function Hr(A,k){A.ambientLightColor.needsUpdate=k,A.lightProbe.needsUpdate=k,A.directionalLights.needsUpdate=k,A.directionalLightShadows.needsUpdate=k,A.pointLights.needsUpdate=k,A.pointLightShadows.needsUpdate=k,A.spotLights.needsUpdate=k,A.spotLightShadows.needsUpdate=k,A.rectAreaLights.needsUpdate=k,A.hemisphereLights.needsUpdate=k}function Vn(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return B},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return U},this.setRenderTargetTextures=function(A,k,K){Vt.get(A.texture).__webglTexture=k,Vt.get(A.depthTexture).__webglTexture=K;const tt=Vt.get(A);tt.__hasExternalTextures=!0,tt.__hasExternalTextures&&(tt.__autoAllocateDepthBuffer=K===void 0,tt.__autoAllocateDepthBuffer||It.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),tt.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(A,k){const K=Vt.get(A);K.__webglFramebuffer=k,K.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(A,k=0,K=0){U=A,B=k,C=K;let tt=!0,Y=null,yt=!1,Lt=!1;if(A){const zt=Vt.get(A);zt.__useDefaultFramebuffer!==void 0?(wt.bindFramebuffer(Z.FRAMEBUFFER,null),tt=!1):zt.__webglFramebuffer===void 0?R.setupRenderTarget(A):zt.__hasExternalTextures&&R.rebindTextures(A,Vt.get(A.texture).__webglTexture,Vt.get(A.depthTexture).__webglTexture);const $t=A.texture;($t.isData3DTexture||$t.isDataArrayTexture||$t.isCompressedArrayTexture)&&(Lt=!0);const Wt=Vt.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Wt[k])?Y=Wt[k][K]:Y=Wt[k],yt=!0):Gt.isWebGL2&&A.samples>0&&R.useMultisampledRTT(A)===!1?Y=Vt.get(A).__webglMultisampledFramebuffer:Array.isArray(Wt)?Y=Wt[K]:Y=Wt,I.copy(A.viewport),J.copy(A.scissor),it=A.scissorTest}else I.copy(z).multiplyScalar(st).floor(),J.copy(nt).multiplyScalar(st).floor(),it=ot;if(wt.bindFramebuffer(Z.FRAMEBUFFER,Y)&&Gt.drawBuffers&&tt&&wt.drawBuffers(A,Y),wt.viewport(I),wt.scissor(J),wt.setScissorTest(it),yt){const zt=Vt.get(A.texture);Z.framebufferTexture2D(Z.FRAMEBUFFER,Z.COLOR_ATTACHMENT0,Z.TEXTURE_CUBE_MAP_POSITIVE_X+k,zt.__webglTexture,K)}else if(Lt){const zt=Vt.get(A.texture),$t=k||0;Z.framebufferTextureLayer(Z.FRAMEBUFFER,Z.COLOR_ATTACHMENT0,zt.__webglTexture,K||0,$t)}et=-1},this.readRenderTargetPixels=function(A,k,K,tt,Y,yt,Lt){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ct=Vt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Lt!==void 0&&(Ct=Ct[Lt]),Ct){wt.bindFramebuffer(Z.FRAMEBUFFER,Ct);try{const zt=A.texture,$t=zt.format,Wt=zt.type;if($t!==Mn&&Tt.convert($t)!==Z.getParameter(Z.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const qt=Wt===Cr&&(It.has("EXT_color_buffer_half_float")||Gt.isWebGL2&&It.has("EXT_color_buffer_float"));if(Wt!==ei&&Tt.convert(Wt)!==Z.getParameter(Z.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Wt===Jn&&(Gt.isWebGL2||It.has("OES_texture_float")||It.has("WEBGL_color_buffer_float")))&&!qt){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=A.width-tt&&K>=0&&K<=A.height-Y&&Z.readPixels(k,K,tt,Y,Tt.convert($t),Tt.convert(Wt),yt)}finally{const zt=U!==null?Vt.get(U).__webglFramebuffer:null;wt.bindFramebuffer(Z.FRAMEBUFFER,zt)}}},this.copyFramebufferToTexture=function(A,k,K=0){const tt=Math.pow(2,-K),Y=Math.floor(k.image.width*tt),yt=Math.floor(k.image.height*tt);R.setTexture2D(k,0),Z.copyTexSubImage2D(Z.TEXTURE_2D,K,0,0,A.x,A.y,Y,yt),wt.unbindTexture()},this.copyTextureToTexture=function(A,k,K,tt=0){const Y=k.image.width,yt=k.image.height,Lt=Tt.convert(K.format),Ct=Tt.convert(K.type);R.setTexture2D(K,0),Z.pixelStorei(Z.UNPACK_FLIP_Y_WEBGL,K.flipY),Z.pixelStorei(Z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,K.premultiplyAlpha),Z.pixelStorei(Z.UNPACK_ALIGNMENT,K.unpackAlignment),k.isDataTexture?Z.texSubImage2D(Z.TEXTURE_2D,tt,A.x,A.y,Y,yt,Lt,Ct,k.image.data):k.isCompressedTexture?Z.compressedTexSubImage2D(Z.TEXTURE_2D,tt,A.x,A.y,k.mipmaps[0].width,k.mipmaps[0].height,Lt,k.mipmaps[0].data):Z.texSubImage2D(Z.TEXTURE_2D,tt,A.x,A.y,Lt,Ct,k.image),tt===0&&K.generateMipmaps&&Z.generateMipmap(Z.TEXTURE_2D),wt.unbindTexture()},this.copyTextureToTexture3D=function(A,k,K,tt,Y=0){if(b.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const yt=A.max.x-A.min.x+1,Lt=A.max.y-A.min.y+1,Ct=A.max.z-A.min.z+1,zt=Tt.convert(tt.format),$t=Tt.convert(tt.type);let Wt;if(tt.isData3DTexture)R.setTexture3D(tt,0),Wt=Z.TEXTURE_3D;else if(tt.isDataArrayTexture||tt.isCompressedArrayTexture)R.setTexture2DArray(tt,0),Wt=Z.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}Z.pixelStorei(Z.UNPACK_FLIP_Y_WEBGL,tt.flipY),Z.pixelStorei(Z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,tt.premultiplyAlpha),Z.pixelStorei(Z.UNPACK_ALIGNMENT,tt.unpackAlignment);const qt=Z.getParameter(Z.UNPACK_ROW_LENGTH),Me=Z.getParameter(Z.UNPACK_IMAGE_HEIGHT),Oe=Z.getParameter(Z.UNPACK_SKIP_PIXELS),ye=Z.getParameter(Z.UNPACK_SKIP_ROWS),sn=Z.getParameter(Z.UNPACK_SKIP_IMAGES),_e=K.isCompressedTexture?K.mipmaps[Y]:K.image;Z.pixelStorei(Z.UNPACK_ROW_LENGTH,_e.width),Z.pixelStorei(Z.UNPACK_IMAGE_HEIGHT,_e.height),Z.pixelStorei(Z.UNPACK_SKIP_PIXELS,A.min.x),Z.pixelStorei(Z.UNPACK_SKIP_ROWS,A.min.y),Z.pixelStorei(Z.UNPACK_SKIP_IMAGES,A.min.z),K.isDataTexture||K.isData3DTexture?Z.texSubImage3D(Wt,Y,k.x,k.y,k.z,yt,Lt,Ct,zt,$t,_e.data):K.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),Z.compressedTexSubImage3D(Wt,Y,k.x,k.y,k.z,yt,Lt,Ct,zt,_e.data)):Z.texSubImage3D(Wt,Y,k.x,k.y,k.z,yt,Lt,Ct,zt,$t,_e),Z.pixelStorei(Z.UNPACK_ROW_LENGTH,qt),Z.pixelStorei(Z.UNPACK_IMAGE_HEIGHT,Me),Z.pixelStorei(Z.UNPACK_SKIP_PIXELS,Oe),Z.pixelStorei(Z.UNPACK_SKIP_ROWS,ye),Z.pixelStorei(Z.UNPACK_SKIP_IMAGES,sn),Y===0&&tt.generateMipmaps&&Z.generateMipmap(Wt),wt.unbindTexture()},this.initTexture=function(A){A.isCubeTexture?R.setTextureCube(A,0):A.isData3DTexture?R.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?R.setTexture2DArray(A,0):R.setTexture2D(A,0),wt.unbindTexture()},this.resetState=function(){B=0,C=0,U=null,wt.reset(),Yt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return kn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===aa?"display-p3":"srgb",e.unpackColorSpace=pe.workingColorSpace===Fs?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===ze?Ei:$c}set outputEncoding(t){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=t===Ei?ze:Gn}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(t){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=t}}class qg extends vh{}qg.prototype.isWebGL1Renderer=!0;class Yg extends Ue{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e}}class xh extends wi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new le(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const Rc=new G,Cc=new G,Ic=new Se,Go=new Bs,Ts=new Br;class jg extends Ue{constructor(t=new Je,e=new xh){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,s=[0];for(let o=1,a=e.count;o<a;o++)Rc.fromBufferAttribute(e,o-1),Cc.fromBufferAttribute(e,o),s[o]=s[o-1],s[o]+=Rc.distanceTo(Cc);t.setAttribute("lineDistance",new ke(s,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const s=this.geometry,o=this.matrixWorld,a=t.params.Line.threshold,h=s.drawRange;if(s.boundingSphere===null&&s.computeBoundingSphere(),Ts.copy(s.boundingSphere),Ts.applyMatrix4(o),Ts.radius+=a,t.ray.intersectsSphere(Ts)===!1)return;Ic.copy(o).invert(),Go.copy(t.ray).applyMatrix4(Ic);const c=a/((this.scale.x+this.scale.y+this.scale.z)/3),d=c*c,f=new G,p=new G,_=new G,v=new G,y=this.isLineSegments?2:1,M=s.index,x=s.attributes.position;if(M!==null){const m=Math.max(0,h.start),P=Math.min(M.count,h.start+h.count);for(let b=m,D=P-1;b<D;b+=y){const B=M.getX(b),C=M.getX(b+1);if(f.fromBufferAttribute(x,B),p.fromBufferAttribute(x,C),Go.distanceSqToSegment(f,p,v,_)>d)continue;v.applyMatrix4(this.matrixWorld);const et=t.ray.origin.distanceTo(v);et<t.near||et>t.far||e.push({distance:et,point:_.clone().applyMatrix4(this.matrixWorld),index:b,face:null,faceIndex:null,object:this})}}else{const m=Math.max(0,h.start),P=Math.min(x.count,h.start+h.count);for(let b=m,D=P-1;b<D;b+=y){if(f.fromBufferAttribute(x,b),p.fromBufferAttribute(x,b+1),Go.distanceSqToSegment(f,p,v,_)>d)continue;v.applyMatrix4(this.matrixWorld);const C=t.ray.origin.distanceTo(v);C<t.near||C>t.far||e.push({distance:C,point:_.clone().applyMatrix4(this.matrixWorld),index:b,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){const e=this.geometry.morphAttributes,s=Object.keys(e);if(s.length>0){const o=e[s[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,h=o.length;a<h;a++){const c=o[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[c]=a}}}}}class yh extends wi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new le(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Dc=new Se,ea=new Bs,bs=new Br,ws=new G;class Kg extends Ue{constructor(t=new Je,e=new yh){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const s=this.geometry,o=this.matrixWorld,a=t.params.Points.threshold,h=s.drawRange;if(s.boundingSphere===null&&s.computeBoundingSphere(),bs.copy(s.boundingSphere),bs.applyMatrix4(o),bs.radius+=a,t.ray.intersectsSphere(bs)===!1)return;Dc.copy(o).invert(),ea.copy(t.ray).applyMatrix4(Dc);const c=a/((this.scale.x+this.scale.y+this.scale.z)/3),d=c*c,f=s.index,_=s.attributes.position;if(f!==null){const v=Math.max(0,h.start),y=Math.min(f.count,h.start+h.count);for(let M=v,S=y;M<S;M++){const x=f.getX(M);ws.fromBufferAttribute(_,x),Uc(ws,x,d,o,t,e,this)}}else{const v=Math.max(0,h.start),y=Math.min(_.count,h.start+h.count);for(let M=v,S=y;M<S;M++)ws.fromBufferAttribute(_,M),Uc(ws,M,d,o,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,s=Object.keys(e);if(s.length>0){const o=e[s[0]];if(o!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,h=o.length;a<h;a++){const c=o[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[c]=a}}}}}function Uc(r,t,e,s,o,a,h){const c=ea.distanceSqToPoint(r);if(c<e){const d=new G;ea.closestPointToPoint(r,d),d.applyMatrix4(s);const f=o.ray.origin.distanceTo(d);if(f<o.near||f>o.far)return;a.push({distance:f,distanceToRay:Math.sqrt(c),point:d,index:t,face:null,object:h})}}class fa extends Je{constructor(t=[new ie(0,-.5),new ie(.5,0),new ie(0,.5)],e=12,s=0,o=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:s,phiLength:o},e=Math.floor(e),o=We(o,0,Math.PI*2);const a=[],h=[],c=[],d=[],f=[],p=1/e,_=new G,v=new ie,y=new G,M=new G,S=new G;let x=0,m=0;for(let P=0;P<=t.length-1;P++)switch(P){case 0:x=t[P+1].x-t[P].x,m=t[P+1].y-t[P].y,y.x=m*1,y.y=-x,y.z=m*0,S.copy(y),y.normalize(),d.push(y.x,y.y,y.z);break;case t.length-1:d.push(S.x,S.y,S.z);break;default:x=t[P+1].x-t[P].x,m=t[P+1].y-t[P].y,y.x=m*1,y.y=-x,y.z=m*0,M.copy(y),y.x+=S.x,y.y+=S.y,y.z+=S.z,y.normalize(),d.push(y.x,y.y,y.z),S.copy(M)}for(let P=0;P<=e;P++){const b=s+P*p*o,D=Math.sin(b),B=Math.cos(b);for(let C=0;C<=t.length-1;C++){_.x=t[C].x*D,_.y=t[C].y,_.z=t[C].x*B,h.push(_.x,_.y,_.z),v.x=P/e,v.y=C/(t.length-1),c.push(v.x,v.y);const U=d[3*C+0]*D,et=d[3*C+1],w=d[3*C+0]*B;f.push(U,et,w)}}for(let P=0;P<e;P++)for(let b=0;b<t.length-1;b++){const D=b+P*t.length,B=D,C=D+t.length,U=D+t.length+1,et=D+1;a.push(B,C,et),a.push(U,et,C)}this.setIndex(a),this.setAttribute("position",new ke(h,3)),this.setAttribute("uv",new ke(c,2)),this.setAttribute("normal",new ke(f,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new fa(t.points,t.segments,t.phiStart,t.phiLength)}}class pa extends Je{constructor(t=1,e=32,s=0,o=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:s,thetaLength:o},e=Math.max(3,e);const a=[],h=[],c=[],d=[],f=new G,p=new ie;h.push(0,0,0),c.push(0,0,1),d.push(.5,.5);for(let _=0,v=3;_<=e;_++,v+=3){const y=s+_/e*o;f.x=t*Math.cos(y),f.y=t*Math.sin(y),h.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(h[v]/t+1)/2,p.y=(h[v+1]/t+1)/2,d.push(p.x,p.y)}for(let _=1;_<=e;_++)a.push(_,_+1,0);this.setIndex(a),this.setAttribute("position",new ke(h,3)),this.setAttribute("normal",new ke(c,3)),this.setAttribute("uv",new ke(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new pa(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class Nr extends Je{constructor(t=1,e=32,s=16,o=0,a=Math.PI*2,h=0,c=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:s,phiStart:o,phiLength:a,thetaStart:h,thetaLength:c},e=Math.max(3,Math.floor(e)),s=Math.max(2,Math.floor(s));const d=Math.min(h+c,Math.PI);let f=0;const p=[],_=new G,v=new G,y=[],M=[],S=[],x=[];for(let m=0;m<=s;m++){const P=[],b=m/s;let D=0;m===0&&h===0?D=.5/e:m===s&&d===Math.PI&&(D=-.5/e);for(let B=0;B<=e;B++){const C=B/e;_.x=-t*Math.cos(o+C*a)*Math.sin(h+b*c),_.y=t*Math.cos(h+b*c),_.z=t*Math.sin(o+C*a)*Math.sin(h+b*c),M.push(_.x,_.y,_.z),v.copy(_).normalize(),S.push(v.x,v.y,v.z),x.push(C+D,1-b),P.push(f++)}p.push(P)}for(let m=0;m<s;m++)for(let P=0;P<e;P++){const b=p[m][P+1],D=p[m][P],B=p[m+1][P],C=p[m+1][P+1];(m!==0||h>0)&&y.push(b,D,C),(m!==s-1||d<Math.PI)&&y.push(D,B,C)}this.setIndex(y),this.setAttribute("position",new ke(M,3)),this.setAttribute("normal",new ke(S,3)),this.setAttribute("uv",new ke(x,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Nr(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Mh extends wi{constructor(t){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new le(16777215),this.specular=new le(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Jc,this.normalScale=new ie(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=sa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class $g extends xh{constructor(t){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(t)}copy(t){return super.copy(t),this.scale=t.scale,this.dashSize=t.dashSize,this.gapSize=t.gapSize,this}}const Nc={enabled:!1,files:{},add:function(r,t){this.enabled!==!1&&(this.files[r]=t)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}};class Jg{constructor(t,e,s){const o=this;let a=!1,h=0,c=0,d;const f=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=s,this.itemStart=function(p){c++,a===!1&&o.onStart!==void 0&&o.onStart(p,h,c),a=!0},this.itemEnd=function(p){h++,o.onProgress!==void 0&&o.onProgress(p,h,c),h===c&&(a=!1,o.onLoad!==void 0&&o.onLoad())},this.itemError=function(p){o.onError!==void 0&&o.onError(p)},this.resolveURL=function(p){return d?d(p):p},this.setURLModifier=function(p){return d=p,this},this.addHandler=function(p,_){return f.push(p,_),this},this.removeHandler=function(p){const _=f.indexOf(p);return _!==-1&&f.splice(_,2),this},this.getHandler=function(p){for(let _=0,v=f.length;_<v;_+=2){const y=f[_],M=f[_+1];if(y.global&&(y.lastIndex=0),y.test(p))return M}return null}}}const Qg=new Jg;class ma{constructor(t){this.manager=t!==void 0?t:Qg,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){const s=this;return new Promise(function(o,a){s.load(t,o,e,a)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}}ma.DEFAULT_MATERIAL_NAME="__DEFAULT";class tv extends ma{constructor(t){super(t)}load(t,e,s,o){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);const a=this,h=Nc.get(t);if(h!==void 0)return a.manager.itemStart(t),setTimeout(function(){e&&e(h),a.manager.itemEnd(t)},0),h;const c=Dr("img");function d(){p(),Nc.add(t,this),e&&e(this),a.manager.itemEnd(t)}function f(_){p(),o&&o(_),a.manager.itemError(t),a.manager.itemEnd(t)}function p(){c.removeEventListener("load",d,!1),c.removeEventListener("error",f,!1)}return c.addEventListener("load",d,!1),c.addEventListener("error",f,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(c.crossOrigin=this.crossOrigin),a.manager.itemStart(t),c.src=t,c}}class ev extends ma{constructor(t){super(t)}load(t,e,s,o){const a=new $e,h=new tv(this.manager);return h.setCrossOrigin(this.crossOrigin),h.setPath(this.path),h.load(t,function(c){a.image=c,a.needsUpdate=!0,e!==void 0&&e(a)},s,o),a}}class Sh extends Ue{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new le(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),e}}const Vo=new Se,Oc=new G,Fc=new G;class nv{constructor(t){this.camera=t,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ie(512,512),this.map=null,this.mapPass=null,this.matrix=new Se,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ha,this._frameExtents=new ie(1,1),this._viewportCount=1,this._viewports=[new De(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,s=this.matrix;Oc.setFromMatrixPosition(t.matrixWorld),e.position.copy(Oc),Fc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Fc),e.updateMatrixWorld(),Vo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Vo),s.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),s.multiply(Vo)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class iv extends nv{constructor(){super(new uh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class rv extends Sh{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ue.DEFAULT_UP),this.updateMatrix(),this.target=new Ue,this.shadow=new iv}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class sv extends Sh{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}}class ov{constructor(t,e,s=0,o=1/0){this.ray=new Bs(t,e),this.near=s,this.far=o,this.camera=null,this.layers=new ca,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}intersectObject(t,e=!0,s=[]){return na(t,this,s,e),s.sort(Bc),s}intersectObjects(t,e=!0,s=[]){for(let o=0,a=t.length;o<a;o++)na(t[o],this,s,e);return s.sort(Bc),s}}function Bc(r,t){return r.distance-t.distance}function na(r,t,e,s){if(r.layers.test(t.layers)&&r.raycast(t,e),s===!0){const o=r.children;for(let a=0,h=o.length;a<h;a++)na(o[a],t,e,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ra}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ra);const av=[[0,0],[.014,.014],[.033,.04],[.05,.076],[.057,.115],[.055,.154],[.042,.19],[.022,.215],[0,.225]].map(([r,t])=>new ie(r,t)),Wo=15352629,lv=16740178;function cv(r){const t=new fa(av,24),e=new Nr(.024,16,16),s=new pa(.03,20);function o(h,c,d=r){const f=(90-h)*(Math.PI/180),p=(c+180)*(Math.PI/180);return new G(-d*Math.sin(f)*Math.cos(p),d*Math.cos(f),d*Math.sin(f)*Math.sin(p))}function a(h,c,d=Wo){const f=o(h,c),p=f.clone().normalize(),_=new Mh({color:d,shininess:60,specular:4465186}),v=new en(t,_);v.position.copy(f),v.quaternion.setFromUnitVectors(new G(0,1,0),p);const y=new en(e,new Ur({color:16777215}));y.position.set(0,.13,0),v.add(y);const M=new en(s,new Ur({color:0,transparent:!0,opacity:.28,side:An}));return M.position.copy(p.clone().multiplyScalar(r+.002)),M.lookAt(0,0,0),v.userData={dot:y,ring:M,baseColor:d,hotColor:d===Wo?lv:d},{mesh:v,ring:M}}return{create:a,latLngToVec3:o,RED:Wo}}function hv(r,t,e,s=96,o=1.02){const a=r.clone().normalize(),h=t.clone().normalize(),c=[];for(let d=0;d<=s;d++){const f=d/s,p=Qo.clamp(a.dot(h),-1,1),_=Math.acos(p);let v;if(_<1e-4)v=a.clone();else{const M=Math.sin((1-f)*_)/Math.sin(_),S=Math.sin(f*_)/Math.sin(_);v=a.clone().multiplyScalar(M).add(h.clone().multiplyScalar(S))}const y=1+.12*Math.sin(Math.PI*f);c.push(v.normalize().multiplyScalar(e*o*y))}return c}function uv(r){function t(e,s=16765514){const o=new Qi;for(let a=0;a<e.length-1;a++){const h=hv(e[a],e[a+1],r),c=new Je().setFromPoints(h),d=new $g({color:s,dashSize:.12,gapSize:.08,transparent:!0,opacity:.95,linewidth:2}),f=new jg(c,d);f.computeLineDistances(),o.add(f)}return o}return{createRoute:t}}const As=2.6;function dv(r,{onSelect:t}={}){const e=new vh({canvas:r,antialias:!0,alpha:!0});e.setPixelRatio(Math.min(window.devicePixelRatio,2));const s=new Yg,o=new dn(45,innerWidth/innerHeight,.1,1e3);o.position.set(0,0,7.2);const a=new Qi;s.add(a);const h=new Nr(As,96,96),c=new Mh({color:2771562,shininess:8}),d=new en(h,c);a.add(d);const f=new ev;f.setCrossOrigin("anonymous"),f.load(Su,V=>{c.map=V,c.color.set(16777215),c.needsUpdate=!0}),f.load(Eu,V=>{c.bumpMap=V,c.bumpScale=.04,c.needsUpdate=!0});const p=new en(new Nr(As*1.03,32,32),new Ur({color:9358335,transparent:!0,opacity:.1,side:je}));a.add(p),s.add(new sv(16777215,.85));const _=new rv(16777215,.6);_.position.set(5,3,6),s.add(_);{const V=new Je,z=900,nt=new Float32Array(z*3);for(let ot=0;ot<z;ot++){const W=40+Math.random()*60,rt=Math.random()*Math.PI*2,ct=Math.acos(Math.random()*2-1);nt[ot*3]=W*Math.sin(ct)*Math.cos(rt),nt[ot*3+1]=W*Math.sin(ct)*Math.sin(rt),nt[ot*3+2]=W*Math.cos(ct)}V.setAttribute("position",new Sn(nt,3)),s.add(new Kg(V,new yh({color:15919315,size:.09,transparent:!0,opacity:.55})))}const v=cv(As),y=uv(As),M=[];let S=null,x=null;const m=new Map;function P(V){const{mesh:z,ring:nt}=v.create(V.lat,V.lng);z.userData.id=V.id,a.add(z),a.add(nt),M.push({mesh:z,id:V.id,ring:nt}),m.set(V.id,[V.lat,V.lng])}function b(V){V.forEach(P)}function D(V,z,nt){const{mesh:ot,ring:W}=v.create(V,z,16757504);ot.userData.id=nt,a.add(ot),a.add(W);const rt={mesh:ot,id:nt,ring:W,custom:!0};return M.push(rt),rt}function B(V){const z=M.findIndex(W=>W.id===V);if(z===-1)return;const{mesh:nt,ring:ot}=M[z];a.remove(nt,ot),M.splice(z,1),m.delete(V)}function C(V){if(x&&(a.remove(x),x=null),!V||V.length<2)return;const z=V.map(nt=>v.latLngToVec3(nt.lat,nt.lng));x=y.createRoute(z),a.add(x)}function U(V,z){it=!1,F={y:-(z+180)*(Math.PI/180)-Math.PI/2,x:Qo.clamp(V*(Math.PI/180),-1.1,1.1)},setTimeout(()=>it=!0,6e3)}function et(V){S=V,m.has(V)&&U(...w(V))}function w(V){return m.get(V)||[0,0]}let I=!1,J=!1,it=!0,lt={x:0,y:0},F=null;r.addEventListener("pointerdown",V=>{I=!0,it=!1,J=!1,F=null,lt={x:V.clientX,y:V.clientY}}),addEventListener("pointerup",()=>{I=!1,setTimeout(()=>it=!0,3e3)}),addEventListener("pointermove",V=>{if(!I)return;const z=V.clientX-lt.x,nt=V.clientY-lt.y;(Math.abs(z)>2||Math.abs(nt)>2)&&(J=!0),a.rotation.y+=z*.005,a.rotation.x=Qo.clamp(a.rotation.x+nt*.005,-1.1,1.1),lt={x:V.clientX,y:V.clientY}});const $=new ov,Q=new ie;r.addEventListener("click",V=>{if(J)return;Q.x=V.clientX/innerWidth*2-1,Q.y=-(V.clientY/innerHeight)*2+1,$.setFromCamera(Q,o);const z=$.intersectObjects(M.map(nt=>nt.mesh));z.length&&t&&t(z[0].object.userData.id)});function st(){e.setSize(innerWidth,innerHeight),o.aspect=innerWidth/innerHeight,o.updateProjectionMatrix()}addEventListener("resize",st),st();function X(){requestAnimationFrame(X),F?(a.rotation.y+=(F.y-a.rotation.y)*.08,a.rotation.x+=(F.x-a.rotation.x)*.08):it&&!I&&(a.rotation.y+=.0015);const V=performance.now()*.002;M.forEach(({mesh:z,id:nt,ring:ot})=>{const W=S===nt,rt=W?1.4+Math.sin(V*2)*.08:1;z.scale.setScalar(rt),ot.scale.setScalar(W?1+Math.sin(V*2)*.25:1),z.material.color.set(W?z.userData.hotColor:z.userData.baseColor)}),e.render(s,o)}return X(),{addDestinations:b,addDestination:P,addCustomPin:D,removePin:B,setRoute:C,focusOn:U,select:et,setSelected(V){S=V}}}function _a(r){return!r||!r.length?"":`<div class="srcTag">sourced from ${r.length} live web result${r.length>1?"s":""}</div>`}function ga(r,t){return`<div class="sectionTitle">${r} <span class="srcTag">unavailable</span></div>
    <div class="loading">Data is unavailable at the moment.</div>`}function fv(r){if(r.status!=="ok")return ga("Flights from "+(r.origin||"JFK"));const t=r.budget_option||{},e=r.luxury_option||{},s=(o,a)=>`
    <div class="flightRow">
      <span class="fAir">${o}</span>
      <span class="fMeta">${a.airline_or_source||""}${a.notes?" · "+a.notes:""}</span>
      <span class="fPrice">${a.price_usd!=null?"$"+Math.round(a.price_usd):"n/a"}</span>
    </div>`;return`<div class="sectionTitle">Flights from ${r.origin} <span class="srcTag">web research</span></div>
    ${s("Budget",t)}${s("Luxury",e)}
    ${r.summary?`<div class="bestPick">${r.summary}</div>`:""}
    ${_a(r.sources)}`}function pv(r){var o;if(r.status!=="ok")return ga("Best time to travel");const t=new Set(r.best_months||[]),e=r.months.map(a=>`
    <div class="btCol" title="${a.month_name}: ${a.avg_temp_c} C, ${a.rain_mm} mm rain, comfort ${a.comfort_score}">
      <div class="btBar ${t.has(a.month_name)?"best":""}" style="height:${Math.max(4,a.comfort_score)}%"></div>
      <span>${a.month_name[0]}</span>
    </div>`).join("");return`
    <div class="sectionTitle">Best time to travel <span class="srcTag">${r.source==="open-meteo-era5"?"ERA5 climate data, 5-year average":"web research"}</span></div>
    <div class="bestPick"><b>${(r.best_months||[]).join(", ")}</b> score highest for temperature and rainfall.</div>
    <div class="btChart">${e}</div>
    ${r.narrative?`<div class="loading">${r.narrative}</div>`:""}
    ${(o=r.avoid_months)!=null&&o.length?`<div class="loading">Least comfortable: ${r.avoid_months.join(", ")}</div>`:""}
    ${_a(r.sources)}`}function mv(r,t){if(r.status!=="ok")return ga("Budget vs. luxury");const e=(o,a)=>`
    <div class="predictStats"><div>
      <b>${a.est_total_usd!=null?"$"+Math.round(a.est_total_usd):"n/a"}</b>
      <span>${o}</span>
    </div></div>
    <div class="loading">${a.flight_style||""}${a.flight_style&&a.stay_style?" · ":""}${a.stay_style||""}${a.notes?" — "+a.notes:""}</div>`,s=r.fits_budget==="luxury"?"now":r.fits_budget==="neither"?"wait":"soon";return`
    <div class="sectionTitle">Budget vs. Luxury <span class="srcTag">web research, $${Math.round(t)} budget</span></div>
    <div class="predictBadge ${s}">Fits: ${r.fits_budget||"unknown"}</div>
    ${e("budget tier",r.budget_tier||{})}
    ${e("luxury tier",r.luxury_tier||{})}
    ${r.recommendation?`<div class="bestPick">${r.recommendation}</div>`:""}
    ${_a(r.sources)}`}const _v=[2026,2027,2028,2029,2030,2031,2032];function gv({onAddBucket:r,onAddRoute:t,onOpenMap:e,onSearchNearby:s,onRemoveDestination:o,getBucketYears:a}){const h=document.getElementById("detailPanel"),c=document.getElementById("panelScroll");document.getElementById("closeDetail").onclick=()=>h.classList.remove("open");let d=null,f=null;function p(M){d=M;const S=a(M.id),x=M.attractions||[],m=M.activities||[],P=M.famous||[],b=M.budgetLow*M.days,D=x.length||m.length||P.length?`${x.length?`<div class="sectionTitle">Must-Visit Spots, Ranked</div>
          ${x.map((lt,F)=>`<div class="attrItem"><div class="attrRank">${F+1}</div>
            <div><div class="attrName">${lt.name}</div><div class="attrDesc">${lt.desc}</div></div></div>`).join("")}`:""}
         ${m.length?`<div class="sectionTitle">Top Activities</div>
          <div class="pillList">${m.map(lt=>`<div class="pill">${lt}</div>`).join("")}</div>`:""}
         ${P.length?`<div class="sectionTitle">Famous For</div>
          <div class="pillList">${P.map(lt=>`<div class="pill famousPill">${lt}</div>`).join("")}</div>`:""}`:`<div class="customNote">Your custom destination. Live flights and best-time data are above.
           Use <b>Nearby places</b> to explore what's around it.</div>`;c.innerHTML=`
      <div class="eyebrow">${M.country} · ${M.airport||"nearest airport TBD"}${M.custom?" · custom":""}</div>
      <h2>${M.name}</h2>
      ${M.tagline?`<div class="tagline">${M.tagline}</div>`:""}

      <div class="actionBar">
        <button class="actBtn" id="btnMap">Map / Street View</button>
        <button class="actBtn" id="btnRoute">Add to route</button>
        <button class="actBtn" id="btnNearby">Nearby places</button>
        <button class="actBtn danger" id="btnRemove">Remove</button>
      </div>

      <div class="metaRow">
        <div class="metaChip"><b>Suggested:</b> ${M.days} days</div>
        <div class="metaChip"><b>Reference budget:</b> $${M.budgetLow}–$${M.budgetHigh}/day</div>
      </div>

      <div id="liveIntel" class="liveIntel"><div class="loading">Loading climate data…</div></div>
      <button class="actBtn" id="btnLivePrices">Check live flight and cost data</button>
      <div id="pricesBox"></div>

      <div class="peopleInput">
        <label>Total trip budget ($)</label>
        <input type="number" id="tradeoffBudget" value="${b}" min="0" step="50"/>
      </div>
      <input type="range" id="tradeoffSlider" min="200" max="10000" step="50" value="${b}" style="width:100%;margin:6px 0 12px;"/>
      <div id="tradeoffBox"></div>

      ${D}

      <div class="addBucketBox">
        <label>Add to bucket list for</label>
        <select id="yearSelect">
          ${_v.map(lt=>`<option value="${lt}" ${S.includes(lt)?"disabled":""}>${lt}${S.includes(lt)?" (added)":""}</option>`).join("")}
        </select>
        <label>Number of days</label>
        <input type="number" id="daysInput" value="${M.days}" min="1" max="60"/>
        <label>Estimated trip budget ($ total)</label>
        <input type="number" id="budgetInput" value="${b}" min="0"/>
        <button id="addBucketBtn">Add to Bucket List</button>
      </div>`,h.classList.add("open"),document.getElementById("btnMap").onclick=()=>e(M),document.getElementById("btnRoute").onclick=()=>t(M),document.getElementById("btnNearby").onclick=()=>s(M),document.getElementById("btnRemove").onclick=()=>{confirm(`Remove "${M.name}" from your atlas?`)&&(o(M),h.classList.remove("open"))};const B=document.getElementById("daysInput"),C=document.getElementById("budgetInput");let U=!1;C.addEventListener("input",()=>{U=!0}),B.addEventListener("input",()=>{const lt=Math.max(1,parseInt(B.value,10)||1);U||(C.value=M.budgetLow*lt)}),document.getElementById("addBucketBtn").onclick=()=>{var st;const lt=parseInt(document.getElementById("yearSelect").value,10),F=Math.max(1,parseInt(B.value,10)||M.days),$=parseFloat(C.value)||0;r(M,lt,$,F,((st=kc())==null?void 0:st.name)||"Guest");const Q=document.getElementById("addBucketBtn");Q.textContent="Added!",Q.classList.add("added"),setTimeout(()=>p(M),700)};const et=document.getElementById("tradeoffSlider"),w=document.getElementById("tradeoffBudget");let I=!1;const J=lt=>{et.value=lt,w.value=lt},it=()=>{I&&(clearTimeout(f),f=setTimeout(()=>y(M,Number(w.value)),600))};et.addEventListener("input",()=>J(et.value)),et.addEventListener("change",it),w.addEventListener("change",()=>{J(w.value),it()}),document.getElementById("btnLivePrices").onclick=()=>{I=!0,document.getElementById("btnLivePrices").style.display="none",v(M),y(M,Number(w.value))},_(M)}async function _(M){const S=document.getElementById("liveIntel");try{const x=await Hn.bestTime(M.name,M.country,M.lat,M.lng);if((d==null?void 0:d.id)!==M.id)return;S.innerHTML=pv(x)}catch{S.innerHTML='<div class="loading">Climate data is unavailable at the moment.</div>'}}async function v(M){const S=document.getElementById("pricesBox");S.innerHTML='<div class="loading">Searching current flight prices…</div>';try{const x=await Hn.flights(M.name,M.country);if((d==null?void 0:d.id)!==M.id)return;S.innerHTML=fv(x)}catch(x){S.innerHTML=`<div class="loading">${x.message.includes("limited")||x.message.includes("limit")?x.message:"Flight data is unavailable at the moment."}</div>`}}async function y(M,S){const x=document.getElementById("tradeoffBox");if(x){x.innerHTML='<div class="loading">Comparing budget vs. luxury options…</div>';try{const m=await Hn.tradeoff(M.name,M.country,S);if((d==null?void 0:d.id)!==M.id)return;x.innerHTML=mv(m,S)}catch(m){x.innerHTML=`<div class="loading">${m.message.includes("limit")?m.message:"Cost data is unavailable at the moment."}</div>`}}}return{open:p,close:()=>h.classList.remove("open")}}var vv=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function xv(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var ia={exports:{}};/* @preserve
 * Leaflet 1.9.4, a JS library for interactive maps. https://leafletjs.com
 * (c) 2010-2023 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */(function(r,t){(function(e,s){s(t)})(vv,function(e){var s="1.9.4";function o(n){var i,l,u,g;for(l=1,u=arguments.length;l<u;l++){g=arguments[l];for(i in g)n[i]=g[i]}return n}var a=Object.create||function(){function n(){}return function(i){return n.prototype=i,new n}}();function h(n,i){var l=Array.prototype.slice;if(n.bind)return n.bind.apply(n,l.call(arguments,1));var u=l.call(arguments,2);return function(){return n.apply(i,u.length?u.concat(l.call(arguments)):arguments)}}var c=0;function d(n){return"_leaflet_id"in n||(n._leaflet_id=++c),n._leaflet_id}function f(n,i,l){var u,g,E,N;return N=function(){u=!1,g&&(E.apply(l,g),g=!1)},E=function(){u?g=arguments:(n.apply(l,arguments),setTimeout(N,i),u=!0)},E}function p(n,i,l){var u=i[1],g=i[0],E=u-g;return n===u&&l?n:((n-g)%E+E)%E+g}function _(){return!1}function v(n,i){if(i===!1)return n;var l=Math.pow(10,i===void 0?6:i);return Math.round(n*l)/l}function y(n){return n.trim?n.trim():n.replace(/^\s+|\s+$/g,"")}function M(n){return y(n).split(/\s+/)}function S(n,i){Object.prototype.hasOwnProperty.call(n,"options")||(n.options=n.options?a(n.options):{});for(var l in i)n.options[l]=i[l];return n.options}function x(n,i,l){var u=[];for(var g in n)u.push(encodeURIComponent(l?g.toUpperCase():g)+"="+encodeURIComponent(n[g]));return(!i||i.indexOf("?")===-1?"?":"&")+u.join("&")}var m=/\{ *([\w_ -]+) *\}/g;function P(n,i){return n.replace(m,function(l,u){var g=i[u];if(g===void 0)throw new Error("No value provided for variable "+l);return typeof g=="function"&&(g=g(i)),g})}var b=Array.isArray||function(n){return Object.prototype.toString.call(n)==="[object Array]"};function D(n,i){for(var l=0;l<n.length;l++)if(n[l]===i)return l;return-1}var B="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";function C(n){return window["webkit"+n]||window["moz"+n]||window["ms"+n]}var U=0;function et(n){var i=+new Date,l=Math.max(0,16-(i-U));return U=i+l,window.setTimeout(n,l)}var w=window.requestAnimationFrame||C("RequestAnimationFrame")||et,I=window.cancelAnimationFrame||C("CancelAnimationFrame")||C("CancelRequestAnimationFrame")||function(n){window.clearTimeout(n)};function J(n,i,l){if(l&&w===et)n.call(i);else return w.call(window,h(n,i))}function it(n){n&&I.call(window,n)}var lt={__proto__:null,extend:o,create:a,bind:h,get lastId(){return c},stamp:d,throttle:f,wrapNum:p,falseFn:_,formatNum:v,trim:y,splitWords:M,setOptions:S,getParamString:x,template:P,isArray:b,indexOf:D,emptyImageUrl:B,requestFn:w,cancelFn:I,requestAnimFrame:J,cancelAnimFrame:it};function F(){}F.extend=function(n){var i=function(){S(this),this.initialize&&this.initialize.apply(this,arguments),this.callInitHooks()},l=i.__super__=this.prototype,u=a(l);u.constructor=i,i.prototype=u;for(var g in this)Object.prototype.hasOwnProperty.call(this,g)&&g!=="prototype"&&g!=="__super__"&&(i[g]=this[g]);return n.statics&&o(i,n.statics),n.includes&&($(n.includes),o.apply(null,[u].concat(n.includes))),o(u,n),delete u.statics,delete u.includes,u.options&&(u.options=l.options?a(l.options):{},o(u.options,n.options)),u._initHooks=[],u.callInitHooks=function(){if(!this._initHooksCalled){l.callInitHooks&&l.callInitHooks.call(this),this._initHooksCalled=!0;for(var E=0,N=u._initHooks.length;E<N;E++)u._initHooks[E].call(this)}},i},F.include=function(n){var i=this.prototype.options;return o(this.prototype,n),n.options&&(this.prototype.options=i,this.mergeOptions(n.options)),this},F.mergeOptions=function(n){return o(this.prototype.options,n),this},F.addInitHook=function(n){var i=Array.prototype.slice.call(arguments,1),l=typeof n=="function"?n:function(){this[n].apply(this,i)};return this.prototype._initHooks=this.prototype._initHooks||[],this.prototype._initHooks.push(l),this};function $(n){if(!(typeof L>"u"||!L||!L.Mixin)){n=b(n)?n:[n];for(var i=0;i<n.length;i++)n[i]===L.Mixin.Events&&console.warn("Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.",new Error().stack)}}var Q={on:function(n,i,l){if(typeof n=="object")for(var u in n)this._on(u,n[u],i);else{n=M(n);for(var g=0,E=n.length;g<E;g++)this._on(n[g],i,l)}return this},off:function(n,i,l){if(!arguments.length)delete this._events;else if(typeof n=="object")for(var u in n)this._off(u,n[u],i);else{n=M(n);for(var g=arguments.length===1,E=0,N=n.length;E<N;E++)g?this._off(n[E]):this._off(n[E],i,l)}return this},_on:function(n,i,l,u){if(typeof i!="function"){console.warn("wrong listener type: "+typeof i);return}if(this._listens(n,i,l)===!1){l===this&&(l=void 0);var g={fn:i,ctx:l};u&&(g.once=!0),this._events=this._events||{},this._events[n]=this._events[n]||[],this._events[n].push(g)}},_off:function(n,i,l){var u,g,E;if(this._events&&(u=this._events[n],!!u)){if(arguments.length===1){if(this._firingCount)for(g=0,E=u.length;g<E;g++)u[g].fn=_;delete this._events[n];return}if(typeof i!="function"){console.warn("wrong listener type: "+typeof i);return}var N=this._listens(n,i,l);if(N!==!1){var H=u[N];this._firingCount&&(H.fn=_,this._events[n]=u=u.slice()),u.splice(N,1)}}},fire:function(n,i,l){if(!this.listens(n,l))return this;var u=o({},i,{type:n,target:this,sourceTarget:i&&i.sourceTarget||this});if(this._events){var g=this._events[n];if(g){this._firingCount=this._firingCount+1||1;for(var E=0,N=g.length;E<N;E++){var H=g[E],j=H.fn;H.once&&this.off(n,j,H.ctx),j.call(H.ctx||this,u)}this._firingCount--}}return l&&this._propagateEvent(u),this},listens:function(n,i,l,u){typeof n!="string"&&console.warn('"string" type argument expected');var g=i;typeof i!="function"&&(u=!!i,g=void 0,l=void 0);var E=this._events&&this._events[n];if(E&&E.length&&this._listens(n,g,l)!==!1)return!0;if(u){for(var N in this._eventParents)if(this._eventParents[N].listens(n,i,l,u))return!0}return!1},_listens:function(n,i,l){if(!this._events)return!1;var u=this._events[n]||[];if(!i)return!!u.length;l===this&&(l=void 0);for(var g=0,E=u.length;g<E;g++)if(u[g].fn===i&&u[g].ctx===l)return g;return!1},once:function(n,i,l){if(typeof n=="object")for(var u in n)this._on(u,n[u],i,!0);else{n=M(n);for(var g=0,E=n.length;g<E;g++)this._on(n[g],i,l,!0)}return this},addEventParent:function(n){return this._eventParents=this._eventParents||{},this._eventParents[d(n)]=n,this},removeEventParent:function(n){return this._eventParents&&delete this._eventParents[d(n)],this},_propagateEvent:function(n){for(var i in this._eventParents)this._eventParents[i].fire(n.type,o({layer:n.target,propagatedFrom:n.target},n),!0)}};Q.addEventListener=Q.on,Q.removeEventListener=Q.clearAllEventListeners=Q.off,Q.addOneTimeEventListener=Q.once,Q.fireEvent=Q.fire,Q.hasEventListeners=Q.listens;var st=F.extend(Q);function X(n,i,l){this.x=l?Math.round(n):n,this.y=l?Math.round(i):i}var V=Math.trunc||function(n){return n>0?Math.floor(n):Math.ceil(n)};X.prototype={clone:function(){return new X(this.x,this.y)},add:function(n){return this.clone()._add(z(n))},_add:function(n){return this.x+=n.x,this.y+=n.y,this},subtract:function(n){return this.clone()._subtract(z(n))},_subtract:function(n){return this.x-=n.x,this.y-=n.y,this},divideBy:function(n){return this.clone()._divideBy(n)},_divideBy:function(n){return this.x/=n,this.y/=n,this},multiplyBy:function(n){return this.clone()._multiplyBy(n)},_multiplyBy:function(n){return this.x*=n,this.y*=n,this},scaleBy:function(n){return new X(this.x*n.x,this.y*n.y)},unscaleBy:function(n){return new X(this.x/n.x,this.y/n.y)},round:function(){return this.clone()._round()},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},floor:function(){return this.clone()._floor()},_floor:function(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this},ceil:function(){return this.clone()._ceil()},_ceil:function(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this},trunc:function(){return this.clone()._trunc()},_trunc:function(){return this.x=V(this.x),this.y=V(this.y),this},distanceTo:function(n){n=z(n);var i=n.x-this.x,l=n.y-this.y;return Math.sqrt(i*i+l*l)},equals:function(n){return n=z(n),n.x===this.x&&n.y===this.y},contains:function(n){return n=z(n),Math.abs(n.x)<=Math.abs(this.x)&&Math.abs(n.y)<=Math.abs(this.y)},toString:function(){return"Point("+v(this.x)+", "+v(this.y)+")"}};function z(n,i,l){return n instanceof X?n:b(n)?new X(n[0],n[1]):n==null?n:typeof n=="object"&&"x"in n&&"y"in n?new X(n.x,n.y):new X(n,i,l)}function nt(n,i){if(n)for(var l=i?[n,i]:n,u=0,g=l.length;u<g;u++)this.extend(l[u])}nt.prototype={extend:function(n){var i,l;if(!n)return this;if(n instanceof X||typeof n[0]=="number"||"x"in n)i=l=z(n);else if(n=ot(n),i=n.min,l=n.max,!i||!l)return this;return!this.min&&!this.max?(this.min=i.clone(),this.max=l.clone()):(this.min.x=Math.min(i.x,this.min.x),this.max.x=Math.max(l.x,this.max.x),this.min.y=Math.min(i.y,this.min.y),this.max.y=Math.max(l.y,this.max.y)),this},getCenter:function(n){return z((this.min.x+this.max.x)/2,(this.min.y+this.max.y)/2,n)},getBottomLeft:function(){return z(this.min.x,this.max.y)},getTopRight:function(){return z(this.max.x,this.min.y)},getTopLeft:function(){return this.min},getBottomRight:function(){return this.max},getSize:function(){return this.max.subtract(this.min)},contains:function(n){var i,l;return typeof n[0]=="number"||n instanceof X?n=z(n):n=ot(n),n instanceof nt?(i=n.min,l=n.max):i=l=n,i.x>=this.min.x&&l.x<=this.max.x&&i.y>=this.min.y&&l.y<=this.max.y},intersects:function(n){n=ot(n);var i=this.min,l=this.max,u=n.min,g=n.max,E=g.x>=i.x&&u.x<=l.x,N=g.y>=i.y&&u.y<=l.y;return E&&N},overlaps:function(n){n=ot(n);var i=this.min,l=this.max,u=n.min,g=n.max,E=g.x>i.x&&u.x<l.x,N=g.y>i.y&&u.y<l.y;return E&&N},isValid:function(){return!!(this.min&&this.max)},pad:function(n){var i=this.min,l=this.max,u=Math.abs(i.x-l.x)*n,g=Math.abs(i.y-l.y)*n;return ot(z(i.x-u,i.y-g),z(l.x+u,l.y+g))},equals:function(n){return n?(n=ot(n),this.min.equals(n.getTopLeft())&&this.max.equals(n.getBottomRight())):!1}};function ot(n,i){return!n||n instanceof nt?n:new nt(n,i)}function W(n,i){if(n)for(var l=i?[n,i]:n,u=0,g=l.length;u<g;u++)this.extend(l[u])}W.prototype={extend:function(n){var i=this._southWest,l=this._northEast,u,g;if(n instanceof ct)u=n,g=n;else if(n instanceof W){if(u=n._southWest,g=n._northEast,!u||!g)return this}else return n?this.extend(pt(n)||rt(n)):this;return!i&&!l?(this._southWest=new ct(u.lat,u.lng),this._northEast=new ct(g.lat,g.lng)):(i.lat=Math.min(u.lat,i.lat),i.lng=Math.min(u.lng,i.lng),l.lat=Math.max(g.lat,l.lat),l.lng=Math.max(g.lng,l.lng)),this},pad:function(n){var i=this._southWest,l=this._northEast,u=Math.abs(i.lat-l.lat)*n,g=Math.abs(i.lng-l.lng)*n;return new W(new ct(i.lat-u,i.lng-g),new ct(l.lat+u,l.lng+g))},getCenter:function(){return new ct((this._southWest.lat+this._northEast.lat)/2,(this._southWest.lng+this._northEast.lng)/2)},getSouthWest:function(){return this._southWest},getNorthEast:function(){return this._northEast},getNorthWest:function(){return new ct(this.getNorth(),this.getWest())},getSouthEast:function(){return new ct(this.getSouth(),this.getEast())},getWest:function(){return this._southWest.lng},getSouth:function(){return this._southWest.lat},getEast:function(){return this._northEast.lng},getNorth:function(){return this._northEast.lat},contains:function(n){typeof n[0]=="number"||n instanceof ct||"lat"in n?n=pt(n):n=rt(n);var i=this._southWest,l=this._northEast,u,g;return n instanceof W?(u=n.getSouthWest(),g=n.getNorthEast()):u=g=n,u.lat>=i.lat&&g.lat<=l.lat&&u.lng>=i.lng&&g.lng<=l.lng},intersects:function(n){n=rt(n);var i=this._southWest,l=this._northEast,u=n.getSouthWest(),g=n.getNorthEast(),E=g.lat>=i.lat&&u.lat<=l.lat,N=g.lng>=i.lng&&u.lng<=l.lng;return E&&N},overlaps:function(n){n=rt(n);var i=this._southWest,l=this._northEast,u=n.getSouthWest(),g=n.getNorthEast(),E=g.lat>i.lat&&u.lat<l.lat,N=g.lng>i.lng&&u.lng<l.lng;return E&&N},toBBoxString:function(){return[this.getWest(),this.getSouth(),this.getEast(),this.getNorth()].join(",")},equals:function(n,i){return n?(n=rt(n),this._southWest.equals(n.getSouthWest(),i)&&this._northEast.equals(n.getNorthEast(),i)):!1},isValid:function(){return!!(this._southWest&&this._northEast)}};function rt(n,i){return n instanceof W?n:new W(n,i)}function ct(n,i,l){if(isNaN(n)||isNaN(i))throw new Error("Invalid LatLng object: ("+n+", "+i+")");this.lat=+n,this.lng=+i,l!==void 0&&(this.alt=+l)}ct.prototype={equals:function(n,i){if(!n)return!1;n=pt(n);var l=Math.max(Math.abs(this.lat-n.lat),Math.abs(this.lng-n.lng));return l<=(i===void 0?1e-9:i)},toString:function(n){return"LatLng("+v(this.lat,n)+", "+v(this.lng,n)+")"},distanceTo:function(n){return Ut.distance(this,pt(n))},wrap:function(){return Ut.wrapLatLng(this)},toBounds:function(n){var i=180*n/40075017,l=i/Math.cos(Math.PI/180*this.lat);return rt([this.lat-i,this.lng-l],[this.lat+i,this.lng+l])},clone:function(){return new ct(this.lat,this.lng,this.alt)}};function pt(n,i,l){return n instanceof ct?n:b(n)&&typeof n[0]!="object"?n.length===3?new ct(n[0],n[1],n[2]):n.length===2?new ct(n[0],n[1]):null:n==null?n:typeof n=="object"&&"lat"in n?new ct(n.lat,"lng"in n?n.lng:n.lon,n.alt):i===void 0?null:new ct(n,i,l)}var St={latLngToPoint:function(n,i){var l=this.projection.project(n),u=this.scale(i);return this.transformation._transform(l,u)},pointToLatLng:function(n,i){var l=this.scale(i),u=this.transformation.untransform(n,l);return this.projection.unproject(u)},project:function(n){return this.projection.project(n)},unproject:function(n){return this.projection.unproject(n)},scale:function(n){return 256*Math.pow(2,n)},zoom:function(n){return Math.log(n/256)/Math.LN2},getProjectedBounds:function(n){if(this.infinite)return null;var i=this.projection.bounds,l=this.scale(n),u=this.transformation.transform(i.min,l),g=this.transformation.transform(i.max,l);return new nt(u,g)},infinite:!1,wrapLatLng:function(n){var i=this.wrapLng?p(n.lng,this.wrapLng,!0):n.lng,l=this.wrapLat?p(n.lat,this.wrapLat,!0):n.lat,u=n.alt;return new ct(l,i,u)},wrapLatLngBounds:function(n){var i=n.getCenter(),l=this.wrapLatLng(i),u=i.lat-l.lat,g=i.lng-l.lng;if(u===0&&g===0)return n;var E=n.getSouthWest(),N=n.getNorthEast(),H=new ct(E.lat-u,E.lng-g),j=new ct(N.lat-u,N.lng-g);return new W(H,j)}},Ut=o({},St,{wrapLng:[-180,180],R:6371e3,distance:function(n,i){var l=Math.PI/180,u=n.lat*l,g=i.lat*l,E=Math.sin((i.lat-n.lat)*l/2),N=Math.sin((i.lng-n.lng)*l/2),H=E*E+Math.cos(u)*Math.cos(g)*N*N,j=2*Math.atan2(Math.sqrt(H),Math.sqrt(1-H));return this.R*j}}),Zt=6378137,Nt={R:Zt,MAX_LATITUDE:85.0511287798,project:function(n){var i=Math.PI/180,l=this.MAX_LATITUDE,u=Math.max(Math.min(l,n.lat),-l),g=Math.sin(u*i);return new X(this.R*n.lng*i,this.R*Math.log((1+g)/(1-g))/2)},unproject:function(n){var i=180/Math.PI;return new ct((2*Math.atan(Math.exp(n.y/this.R))-Math.PI/2)*i,n.x*i/this.R)},bounds:function(){var n=Zt*Math.PI;return new nt([-n,-n],[n,n])}()};function re(n,i,l,u){if(b(n)){this._a=n[0],this._b=n[1],this._c=n[2],this._d=n[3];return}this._a=n,this._b=i,this._c=l,this._d=u}re.prototype={transform:function(n,i){return this._transform(n.clone(),i)},_transform:function(n,i){return i=i||1,n.x=i*(this._a*n.x+this._b),n.y=i*(this._c*n.y+this._d),n},untransform:function(n,i){return i=i||1,new X((n.x/i-this._b)/this._a,(n.y/i-this._d)/this._c)}};function Z(n,i,l,u){return new re(n,i,l,u)}var Ae=o({},Ut,{code:"EPSG:3857",projection:Nt,transformation:function(){var n=.5/(Math.PI*Nt.R);return Z(n,.5,-n,.5)}()}),It=o({},Ae,{code:"EPSG:900913"});function Gt(n){return document.createElementNS("http://www.w3.org/2000/svg",n)}function wt(n,i){var l="",u,g,E,N,H,j;for(u=0,E=n.length;u<E;u++){for(H=n[u],g=0,N=H.length;g<N;g++)j=H[g],l+=(g?"L":"M")+j.x+" "+j.y;l+=i?bt.svg?"z":"x":""}return l||"M0 0"}var me=document.documentElement.style,Vt="ActiveXObject"in window,R=Vt&&!document.addEventListener,T="msLaunchUri"in navigator&&!("documentMode"in document),q=rn("webkit"),dt=rn("android"),ut=rn("android 2")||rn("android 3"),ft=parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1],10),At=dt&&rn("Google")&&ft<537&&!("AudioNode"in window),vt=!!window.opera,Et=!T&&rn("chrome"),Ot=rn("gecko")&&!q&&!vt&&!Vt,Kt=!Et&&rn("safari"),ht=rn("phantom"),ce="OTransition"in me,te=navigator.platform.indexOf("Win")===0,kt=Vt&&"transition"in me,Rt="WebKitCSSMatrix"in window&&"m11"in new window.WebKitCSSMatrix&&!ut,Tt="MozPerspective"in me,Yt=!window.L_DISABLE_3D&&(kt||Rt||Tt)&&!ce&&!ht,oe=typeof orientation<"u"||rn("mobile"),xe=oe&&q,Jt=oe&&Rt,mt=!window.PointerEvent&&window.MSPointerEvent,O=!!(window.PointerEvent||mt),gt="ontouchstart"in window||!!window.TouchEvent,xt=!window.L_NO_TOUCH&&(gt||O),Bt=oe&&vt,Dt=oe&&Ot,ue=(window.devicePixelRatio||window.screen.deviceXDPI/window.screen.logicalXDPI)>1,de=function(){var n=!1;try{var i=Object.defineProperty({},"passive",{get:function(){n=!0}});window.addEventListener("testPassiveEventSupport",_,i),window.removeEventListener("testPassiveEventSupport",_,i)}catch{}return n}(),Ee=function(){return!!document.createElement("canvas").getContext}(),Le=!!(document.createElementNS&&Gt("svg").createSVGRect),fe=!!Le&&function(){var n=document.createElement("div");return n.innerHTML="<svg/>",(n.firstChild&&n.firstChild.namespaceURI)==="http://www.w3.org/2000/svg"}(),Ne=!Le&&function(){try{var n=document.createElement("div");n.innerHTML='<v:shape adj="1"/>';var i=n.firstChild;return i.style.behavior="url(#default#VML)",i&&typeof i.adj=="object"}catch{return!1}}(),nn=navigator.platform.indexOf("Mac")===0,kr=navigator.platform.indexOf("Linux")===0;function rn(n){return navigator.userAgent.toLowerCase().indexOf(n)>=0}var bt={ie:Vt,ielt9:R,edge:T,webkit:q,android:dt,android23:ut,androidStock:At,opera:vt,chrome:Et,gecko:Ot,safari:Kt,phantom:ht,opera12:ce,win:te,ie3d:kt,webkit3d:Rt,gecko3d:Tt,any3d:Yt,mobile:oe,mobileWebkit:xe,mobileWebkit3d:Jt,msPointer:mt,pointer:O,touch:xt,touchNative:gt,mobileOpera:Bt,mobileGecko:Dt,retina:ue,passiveEvents:de,canvas:Ee,svg:Le,vml:Ne,inlineSvg:fe,mac:nn,linux:kr},cr=bt.msPointer?"MSPointerDown":"pointerdown",ri=bt.msPointer?"MSPointerMove":"pointermove",hr=bt.msPointer?"MSPointerUp":"pointerup",ur=bt.msPointer?"MSPointerCancel":"pointercancel",dr={touchstart:cr,touchmove:ri,touchend:hr,touchcancel:ur},Hr={touchstart:zt,touchmove:Ct,touchend:Ct,touchcancel:Ct},Vn={},A=!1;function k(n,i,l){return i==="touchstart"&&Lt(),Hr[i]?(l=Hr[i].bind(this,l),n.addEventListener(dr[i],l,!1),l):(console.warn("wrong event specified:",i),_)}function K(n,i,l){if(!dr[i]){console.warn("wrong event specified:",i);return}n.removeEventListener(dr[i],l,!1)}function tt(n){Vn[n.pointerId]=n}function Y(n){Vn[n.pointerId]&&(Vn[n.pointerId]=n)}function yt(n){delete Vn[n.pointerId]}function Lt(){A||(document.addEventListener(cr,tt,!0),document.addEventListener(ri,Y,!0),document.addEventListener(hr,yt,!0),document.addEventListener(ur,yt,!0),A=!0)}function Ct(n,i){if(i.pointerType!==(i.MSPOINTER_TYPE_MOUSE||"mouse")){i.touches=[];for(var l in Vn)i.touches.push(Vn[l]);i.changedTouches=[i],n(i)}}function zt(n,i){i.MSPOINTER_TYPE_TOUCH&&i.pointerType===i.MSPOINTER_TYPE_TOUCH&&Be(i),Ct(n,i)}function $t(n){var i={},l,u;for(u in n)l=n[u],i[u]=l&&l.bind?l.bind(n):l;return n=i,i.type="dblclick",i.detail=2,i.isTrusted=!1,i._simulated=!0,i}var Wt=200;function qt(n,i){n.addEventListener("dblclick",i);var l=0,u;function g(E){if(E.detail!==1){u=E.detail;return}if(!(E.pointerType==="mouse"||E.sourceCapabilities&&!E.sourceCapabilities.firesTouchEvents)){var N=Ma(E);if(!(N.some(function(j){return j instanceof HTMLLabelElement&&j.attributes.for})&&!N.some(function(j){return j instanceof HTMLInputElement||j instanceof HTMLSelectElement}))){var H=Date.now();H-l<=Wt?(u++,u===2&&i($t(E))):u=1,l=H}}}return n.addEventListener("click",g),{dblclick:i,simDblclick:g}}function Me(n,i){n.removeEventListener("dblclick",i.dblclick),n.removeEventListener("click",i.simDblclick)}var Oe=ai(["transform","webkitTransform","OTransform","MozTransform","msTransform"]),ye=ai(["webkitTransition","transition","OTransition","MozTransition","msTransition"]),sn=ye==="webkitTransition"||ye==="OTransition"?ye+"End":"transitionend";function _e(n){return typeof n=="string"?document.getElementById(n):n}function Xt(n,i){var l=n.style[i]||n.currentStyle&&n.currentStyle[i];if((!l||l==="auto")&&document.defaultView){var u=document.defaultView.getComputedStyle(n,null);l=u?u[i]:null}return l==="auto"?null:l}function se(n,i,l){var u=document.createElement(n);return u.className=i||"",l&&l.appendChild(u),u}function Ht(n){var i=n.parentNode;i&&i.removeChild(n)}function on(n){for(;n.firstChild;)n.removeChild(n.firstChild)}function Ln(n){var i=n.parentNode;i&&i.lastChild!==n&&i.appendChild(n)}function an(n){var i=n.parentNode;i&&i.firstChild!==n&&i.insertBefore(n,i.firstChild)}function si(n,i){if(n.classList!==void 0)return n.classList.contains(i);var l=Fe(n);return l.length>0&&new RegExp("(^|\\s)"+i+"(\\s|$)").test(l)}function Pt(n,i){if(n.classList!==void 0)for(var l=M(i),u=0,g=l.length;u<g;u++)n.classList.add(l[u]);else if(!si(n,i)){var E=Fe(n);oi(n,(E?E+" ":"")+i)}}function he(n,i){n.classList!==void 0?n.classList.remove(i):oi(n,y((" "+Fe(n)+" ").replace(" "+i+" "," ")))}function oi(n,i){n.className.baseVal===void 0?n.className=i:n.className.baseVal=i}function Fe(n){return n.correspondingElement&&(n=n.correspondingElement),n.className.baseVal===void 0?n.className:n.className.baseVal}function He(n,i){"opacity"in n.style?n.style.opacity=i:"filter"in n.style&&Hs(n,i)}function Hs(n,i){var l=!1,u="DXImageTransform.Microsoft.Alpha";try{l=n.filters.item(u)}catch{if(i===1)return}i=Math.round(i*100),l?(l.Enabled=i!==100,l.Opacity=i):n.style.filter+=" progid:"+u+"(opacity="+i+")"}function ai(n){for(var i=document.documentElement.style,l=0;l<n.length;l++)if(n[l]in i)return n[l];return!1}function li(n,i,l){var u=i||new X(0,0);n.style[Oe]=(bt.ie3d?"translate("+u.x+"px,"+u.y+"px)":"translate3d("+u.x+"px,"+u.y+"px,0)")+(l?" scale("+l+")":"")}function Te(n,i){n._leaflet_pos=i,bt.any3d?li(n,i):(n.style.left=i.x+"px",n.style.top=i.y+"px")}function ci(n){return n._leaflet_pos||new X(0,0)}var fr,pr,Gs;if("onselectstart"in document)fr=function(){jt(window,"selectstart",Be)},pr=function(){ge(window,"selectstart",Be)};else{var mr=ai(["userSelect","WebkitUserSelect","OUserSelect","MozUserSelect","msUserSelect"]);fr=function(){if(mr){var n=document.documentElement.style;Gs=n[mr],n[mr]="none"}},pr=function(){mr&&(document.documentElement.style[mr]=Gs,Gs=void 0)}}function Vs(){jt(window,"dragstart",Be)}function Ws(){ge(window,"dragstart",Be)}var Gr,Xs;function Zs(n){for(;n.tabIndex===-1;)n=n.parentNode;n.style&&(Vr(),Gr=n,Xs=n.style.outlineStyle,n.style.outlineStyle="none",jt(window,"keydown",Vr))}function Vr(){Gr&&(Gr.style.outlineStyle=Xs,Gr=void 0,Xs=void 0,ge(window,"keydown",Vr))}function xa(n){do n=n.parentNode;while((!n.offsetWidth||!n.offsetHeight)&&n!==document.body);return n}function qs(n){var i=n.getBoundingClientRect();return{x:i.width/n.offsetWidth||1,y:i.height/n.offsetHeight||1,boundingClientRect:i}}var Lh={__proto__:null,TRANSFORM:Oe,TRANSITION:ye,TRANSITION_END:sn,get:_e,getStyle:Xt,create:se,remove:Ht,empty:on,toFront:Ln,toBack:an,hasClass:si,addClass:Pt,removeClass:he,setClass:oi,getClass:Fe,setOpacity:He,testProp:ai,setTransform:li,setPosition:Te,getPosition:ci,get disableTextSelection(){return fr},get enableTextSelection(){return pr},disableImageDrag:Vs,enableImageDrag:Ws,preventOutline:Zs,restoreOutline:Vr,getSizedParentNode:xa,getScale:qs};function jt(n,i,l,u){if(i&&typeof i=="object")for(var g in i)js(n,g,i[g],l);else{i=M(i);for(var E=0,N=i.length;E<N;E++)js(n,i[E],l,u)}return this}var En="_leaflet_events";function ge(n,i,l,u){if(arguments.length===1)ya(n),delete n[En];else if(i&&typeof i=="object")for(var g in i)Ks(n,g,i[g],l);else if(i=M(i),arguments.length===2)ya(n,function(H){return D(i,H)!==-1});else for(var E=0,N=i.length;E<N;E++)Ks(n,i[E],l,u);return this}function ya(n,i){for(var l in n[En]){var u=l.split(/\d/)[0];(!i||i(u))&&Ks(n,u,null,null,l)}}var Ys={mouseenter:"mouseover",mouseleave:"mouseout",wheel:!("onwheel"in window)&&"mousewheel"};function js(n,i,l,u){var g=i+d(l)+(u?"_"+d(u):"");if(n[En]&&n[En][g])return this;var E=function(H){return l.call(u||n,H||window.event)},N=E;!bt.touchNative&&bt.pointer&&i.indexOf("touch")===0?E=k(n,i,E):bt.touch&&i==="dblclick"?E=qt(n,E):"addEventListener"in n?i==="touchstart"||i==="touchmove"||i==="wheel"||i==="mousewheel"?n.addEventListener(Ys[i]||i,E,bt.passiveEvents?{passive:!1}:!1):i==="mouseenter"||i==="mouseleave"?(E=function(H){H=H||window.event,Js(n,H)&&N(H)},n.addEventListener(Ys[i],E,!1)):n.addEventListener(i,N,!1):n.attachEvent("on"+i,E),n[En]=n[En]||{},n[En][g]=E}function Ks(n,i,l,u,g){g=g||i+d(l)+(u?"_"+d(u):"");var E=n[En]&&n[En][g];if(!E)return this;!bt.touchNative&&bt.pointer&&i.indexOf("touch")===0?K(n,i,E):bt.touch&&i==="dblclick"?Me(n,E):"removeEventListener"in n?n.removeEventListener(Ys[i]||i,E,!1):n.detachEvent("on"+i,E),n[En][g]=null}function hi(n){return n.stopPropagation?n.stopPropagation():n.originalEvent?n.originalEvent._stopped=!0:n.cancelBubble=!0,this}function $s(n){return js(n,"wheel",hi),this}function _r(n){return jt(n,"mousedown touchstart dblclick contextmenu",hi),n._leaflet_disable_click=!0,this}function Be(n){return n.preventDefault?n.preventDefault():n.returnValue=!1,this}function ui(n){return Be(n),hi(n),this}function Ma(n){if(n.composedPath)return n.composedPath();for(var i=[],l=n.target;l;)i.push(l),l=l.parentNode;return i}function Sa(n,i){if(!i)return new X(n.clientX,n.clientY);var l=qs(i),u=l.boundingClientRect;return new X((n.clientX-u.left)/l.x-i.clientLeft,(n.clientY-u.top)/l.y-i.clientTop)}var Ph=bt.linux&&bt.chrome?window.devicePixelRatio:bt.mac?window.devicePixelRatio*3:window.devicePixelRatio>0?2*window.devicePixelRatio:1;function Ea(n){return bt.edge?n.wheelDeltaY/2:n.deltaY&&n.deltaMode===0?-n.deltaY/Ph:n.deltaY&&n.deltaMode===1?-n.deltaY*20:n.deltaY&&n.deltaMode===2?-n.deltaY*60:n.deltaX||n.deltaZ?0:n.wheelDelta?(n.wheelDeltaY||n.wheelDelta)/2:n.detail&&Math.abs(n.detail)<32765?-n.detail*20:n.detail?n.detail/-32765*60:0}function Js(n,i){var l=i.relatedTarget;if(!l)return!0;try{for(;l&&l!==n;)l=l.parentNode}catch{return!1}return l!==n}var Rh={__proto__:null,on:jt,off:ge,stopPropagation:hi,disableScrollPropagation:$s,disableClickPropagation:_r,preventDefault:Be,stop:ui,getPropagationPath:Ma,getMousePosition:Sa,getWheelDelta:Ea,isExternalTarget:Js,addListener:jt,removeListener:ge},Ta=st.extend({run:function(n,i,l,u){this.stop(),this._el=n,this._inProgress=!0,this._duration=l||.25,this._easeOutPower=1/Math.max(u||.5,.2),this._startPos=ci(n),this._offset=i.subtract(this._startPos),this._startTime=+new Date,this.fire("start"),this._animate()},stop:function(){this._inProgress&&(this._step(!0),this._complete())},_animate:function(){this._animId=J(this._animate,this),this._step()},_step:function(n){var i=+new Date-this._startTime,l=this._duration*1e3;i<l?this._runFrame(this._easeOut(i/l),n):(this._runFrame(1),this._complete())},_runFrame:function(n,i){var l=this._startPos.add(this._offset.multiplyBy(n));i&&l._round(),Te(this._el,l),this.fire("step")},_complete:function(){it(this._animId),this._inProgress=!1,this.fire("end")},_easeOut:function(n){return 1-Math.pow(1-n,this._easeOutPower)}}),ae=st.extend({options:{crs:Ae,center:void 0,zoom:void 0,minZoom:void 0,maxZoom:void 0,layers:[],maxBounds:void 0,renderer:void 0,zoomAnimation:!0,zoomAnimationThreshold:4,fadeAnimation:!0,markerZoomAnimation:!0,transform3DLimit:8388608,zoomSnap:1,zoomDelta:1,trackResize:!0},initialize:function(n,i){i=S(this,i),this._handlers=[],this._layers={},this._zoomBoundLayers={},this._sizeChanged=!0,this._initContainer(n),this._initLayout(),this._onResize=h(this._onResize,this),this._initEvents(),i.maxBounds&&this.setMaxBounds(i.maxBounds),i.zoom!==void 0&&(this._zoom=this._limitZoom(i.zoom)),i.center&&i.zoom!==void 0&&this.setView(pt(i.center),i.zoom,{reset:!0}),this.callInitHooks(),this._zoomAnimated=ye&&bt.any3d&&!bt.mobileOpera&&this.options.zoomAnimation,this._zoomAnimated&&(this._createAnimProxy(),jt(this._proxy,sn,this._catchTransitionEnd,this)),this._addLayers(this.options.layers)},setView:function(n,i,l){if(i=i===void 0?this._zoom:this._limitZoom(i),n=this._limitCenter(pt(n),i,this.options.maxBounds),l=l||{},this._stop(),this._loaded&&!l.reset&&l!==!0){l.animate!==void 0&&(l.zoom=o({animate:l.animate},l.zoom),l.pan=o({animate:l.animate,duration:l.duration},l.pan));var u=this._zoom!==i?this._tryAnimatedZoom&&this._tryAnimatedZoom(n,i,l.zoom):this._tryAnimatedPan(n,l.pan);if(u)return clearTimeout(this._sizeTimer),this}return this._resetView(n,i,l.pan&&l.pan.noMoveStart),this},setZoom:function(n,i){return this._loaded?this.setView(this.getCenter(),n,{zoom:i}):(this._zoom=n,this)},zoomIn:function(n,i){return n=n||(bt.any3d?this.options.zoomDelta:1),this.setZoom(this._zoom+n,i)},zoomOut:function(n,i){return n=n||(bt.any3d?this.options.zoomDelta:1),this.setZoom(this._zoom-n,i)},setZoomAround:function(n,i,l){var u=this.getZoomScale(i),g=this.getSize().divideBy(2),E=n instanceof X?n:this.latLngToContainerPoint(n),N=E.subtract(g).multiplyBy(1-1/u),H=this.containerPointToLatLng(g.add(N));return this.setView(H,i,{zoom:l})},_getBoundsCenterZoom:function(n,i){i=i||{},n=n.getBounds?n.getBounds():rt(n);var l=z(i.paddingTopLeft||i.padding||[0,0]),u=z(i.paddingBottomRight||i.padding||[0,0]),g=this.getBoundsZoom(n,!1,l.add(u));if(g=typeof i.maxZoom=="number"?Math.min(i.maxZoom,g):g,g===1/0)return{center:n.getCenter(),zoom:g};var E=u.subtract(l).divideBy(2),N=this.project(n.getSouthWest(),g),H=this.project(n.getNorthEast(),g),j=this.unproject(N.add(H).divideBy(2).add(E),g);return{center:j,zoom:g}},fitBounds:function(n,i){if(n=rt(n),!n.isValid())throw new Error("Bounds are not valid.");var l=this._getBoundsCenterZoom(n,i);return this.setView(l.center,l.zoom,i)},fitWorld:function(n){return this.fitBounds([[-90,-180],[90,180]],n)},panTo:function(n,i){return this.setView(n,this._zoom,{pan:i})},panBy:function(n,i){if(n=z(n).round(),i=i||{},!n.x&&!n.y)return this.fire("moveend");if(i.animate!==!0&&!this.getSize().contains(n))return this._resetView(this.unproject(this.project(this.getCenter()).add(n)),this.getZoom()),this;if(this._panAnim||(this._panAnim=new Ta,this._panAnim.on({step:this._onPanTransitionStep,end:this._onPanTransitionEnd},this)),i.noMoveStart||this.fire("movestart"),i.animate!==!1){Pt(this._mapPane,"leaflet-pan-anim");var l=this._getMapPanePos().subtract(n).round();this._panAnim.run(this._mapPane,l,i.duration||.25,i.easeLinearity)}else this._rawPanBy(n),this.fire("move").fire("moveend");return this},flyTo:function(n,i,l){if(l=l||{},l.animate===!1||!bt.any3d)return this.setView(n,i,l);this._stop();var u=this.project(this.getCenter()),g=this.project(n),E=this.getSize(),N=this._zoom;n=pt(n),i=i===void 0?N:i;var H=Math.max(E.x,E.y),j=H*this.getZoomScale(N,i),at=g.distanceTo(u)||1,Mt=1.42,Ft=Mt*Mt;function ee(be){var es=be?-1:1,vu=be?j:H,xu=j*j-H*H+es*Ft*Ft*at*at,yu=2*vu*Ft*at,co=xu/yu,rl=Math.sqrt(co*co+1)-co,Mu=rl<1e-9?-18:Math.log(rl);return Mu}function Xe(be){return(Math.exp(be)-Math.exp(-be))/2}function Ce(be){return(Math.exp(be)+Math.exp(-be))/2}function cn(be){return Xe(be)/Ce(be)}var Ke=ee(0);function Ii(be){return H*(Ce(Ke)/Ce(Ke+Mt*be))}function pu(be){return H*(Ce(Ke)*cn(Ke+Mt*be)-Xe(Ke))/Ft}function mu(be){return 1-Math.pow(1-be,1.5)}var _u=Date.now(),nl=(ee(1)-Ke)/Mt,gu=l.duration?1e3*l.duration:1e3*nl*.8;function il(){var be=(Date.now()-_u)/gu,es=mu(be)*nl;be<=1?(this._flyToFrame=J(il,this),this._move(this.unproject(u.add(g.subtract(u).multiplyBy(pu(es)/at)),N),this.getScaleZoom(H/Ii(es),N),{flyTo:!0})):this._move(n,i)._moveEnd(!0)}return this._moveStart(!0,l.noMoveStart),il.call(this),this},flyToBounds:function(n,i){var l=this._getBoundsCenterZoom(n,i);return this.flyTo(l.center,l.zoom,i)},setMaxBounds:function(n){return n=rt(n),this.listens("moveend",this._panInsideMaxBounds)&&this.off("moveend",this._panInsideMaxBounds),n.isValid()?(this.options.maxBounds=n,this._loaded&&this._panInsideMaxBounds(),this.on("moveend",this._panInsideMaxBounds)):(this.options.maxBounds=null,this)},setMinZoom:function(n){var i=this.options.minZoom;return this.options.minZoom=n,this._loaded&&i!==n&&(this.fire("zoomlevelschange"),this.getZoom()<this.options.minZoom)?this.setZoom(n):this},setMaxZoom:function(n){var i=this.options.maxZoom;return this.options.maxZoom=n,this._loaded&&i!==n&&(this.fire("zoomlevelschange"),this.getZoom()>this.options.maxZoom)?this.setZoom(n):this},panInsideBounds:function(n,i){this._enforcingBounds=!0;var l=this.getCenter(),u=this._limitCenter(l,this._zoom,rt(n));return l.equals(u)||this.panTo(u,i),this._enforcingBounds=!1,this},panInside:function(n,i){i=i||{};var l=z(i.paddingTopLeft||i.padding||[0,0]),u=z(i.paddingBottomRight||i.padding||[0,0]),g=this.project(this.getCenter()),E=this.project(n),N=this.getPixelBounds(),H=ot([N.min.add(l),N.max.subtract(u)]),j=H.getSize();if(!H.contains(E)){this._enforcingBounds=!0;var at=E.subtract(H.getCenter()),Mt=H.extend(E).getSize().subtract(j);g.x+=at.x<0?-Mt.x:Mt.x,g.y+=at.y<0?-Mt.y:Mt.y,this.panTo(this.unproject(g),i),this._enforcingBounds=!1}return this},invalidateSize:function(n){if(!this._loaded)return this;n=o({animate:!1,pan:!0},n===!0?{animate:!0}:n);var i=this.getSize();this._sizeChanged=!0,this._lastCenter=null;var l=this.getSize(),u=i.divideBy(2).round(),g=l.divideBy(2).round(),E=u.subtract(g);return!E.x&&!E.y?this:(n.animate&&n.pan?this.panBy(E):(n.pan&&this._rawPanBy(E),this.fire("move"),n.debounceMoveend?(clearTimeout(this._sizeTimer),this._sizeTimer=setTimeout(h(this.fire,this,"moveend"),200)):this.fire("moveend")),this.fire("resize",{oldSize:i,newSize:l}))},stop:function(){return this.setZoom(this._limitZoom(this._zoom)),this.options.zoomSnap||this.fire("viewreset"),this._stop()},locate:function(n){if(n=this._locateOptions=o({timeout:1e4,watch:!1},n),!("geolocation"in navigator))return this._handleGeolocationError({code:0,message:"Geolocation not supported."}),this;var i=h(this._handleGeolocationResponse,this),l=h(this._handleGeolocationError,this);return n.watch?this._locationWatchId=navigator.geolocation.watchPosition(i,l,n):navigator.geolocation.getCurrentPosition(i,l,n),this},stopLocate:function(){return navigator.geolocation&&navigator.geolocation.clearWatch&&navigator.geolocation.clearWatch(this._locationWatchId),this._locateOptions&&(this._locateOptions.setView=!1),this},_handleGeolocationError:function(n){if(this._container._leaflet_id){var i=n.code,l=n.message||(i===1?"permission denied":i===2?"position unavailable":"timeout");this._locateOptions.setView&&!this._loaded&&this.fitWorld(),this.fire("locationerror",{code:i,message:"Geolocation error: "+l+"."})}},_handleGeolocationResponse:function(n){if(this._container._leaflet_id){var i=n.coords.latitude,l=n.coords.longitude,u=new ct(i,l),g=u.toBounds(n.coords.accuracy*2),E=this._locateOptions;if(E.setView){var N=this.getBoundsZoom(g);this.setView(u,E.maxZoom?Math.min(N,E.maxZoom):N)}var H={latlng:u,bounds:g,timestamp:n.timestamp};for(var j in n.coords)typeof n.coords[j]=="number"&&(H[j]=n.coords[j]);this.fire("locationfound",H)}},addHandler:function(n,i){if(!i)return this;var l=this[n]=new i(this);return this._handlers.push(l),this.options[n]&&l.enable(),this},remove:function(){if(this._initEvents(!0),this.options.maxBounds&&this.off("moveend",this._panInsideMaxBounds),this._containerId!==this._container._leaflet_id)throw new Error("Map container is being reused by another instance");try{delete this._container._leaflet_id,delete this._containerId}catch{this._container._leaflet_id=void 0,this._containerId=void 0}this._locationWatchId!==void 0&&this.stopLocate(),this._stop(),Ht(this._mapPane),this._clearControlPos&&this._clearControlPos(),this._resizeRequest&&(it(this._resizeRequest),this._resizeRequest=null),this._clearHandlers(),this._loaded&&this.fire("unload");var n;for(n in this._layers)this._layers[n].remove();for(n in this._panes)Ht(this._panes[n]);return this._layers=[],this._panes=[],delete this._mapPane,delete this._renderer,this},createPane:function(n,i){var l="leaflet-pane"+(n?" leaflet-"+n.replace("Pane","")+"-pane":""),u=se("div",l,i||this._mapPane);return n&&(this._panes[n]=u),u},getCenter:function(){return this._checkIfLoaded(),this._lastCenter&&!this._moved()?this._lastCenter.clone():this.layerPointToLatLng(this._getCenterLayerPoint())},getZoom:function(){return this._zoom},getBounds:function(){var n=this.getPixelBounds(),i=this.unproject(n.getBottomLeft()),l=this.unproject(n.getTopRight());return new W(i,l)},getMinZoom:function(){return this.options.minZoom===void 0?this._layersMinZoom||0:this.options.minZoom},getMaxZoom:function(){return this.options.maxZoom===void 0?this._layersMaxZoom===void 0?1/0:this._layersMaxZoom:this.options.maxZoom},getBoundsZoom:function(n,i,l){n=rt(n),l=z(l||[0,0]);var u=this.getZoom()||0,g=this.getMinZoom(),E=this.getMaxZoom(),N=n.getNorthWest(),H=n.getSouthEast(),j=this.getSize().subtract(l),at=ot(this.project(H,u),this.project(N,u)).getSize(),Mt=bt.any3d?this.options.zoomSnap:1,Ft=j.x/at.x,ee=j.y/at.y,Xe=i?Math.max(Ft,ee):Math.min(Ft,ee);return u=this.getScaleZoom(Xe,u),Mt&&(u=Math.round(u/(Mt/100))*(Mt/100),u=i?Math.ceil(u/Mt)*Mt:Math.floor(u/Mt)*Mt),Math.max(g,Math.min(E,u))},getSize:function(){return(!this._size||this._sizeChanged)&&(this._size=new X(this._container.clientWidth||0,this._container.clientHeight||0),this._sizeChanged=!1),this._size.clone()},getPixelBounds:function(n,i){var l=this._getTopLeftPoint(n,i);return new nt(l,l.add(this.getSize()))},getPixelOrigin:function(){return this._checkIfLoaded(),this._pixelOrigin},getPixelWorldBounds:function(n){return this.options.crs.getProjectedBounds(n===void 0?this.getZoom():n)},getPane:function(n){return typeof n=="string"?this._panes[n]:n},getPanes:function(){return this._panes},getContainer:function(){return this._container},getZoomScale:function(n,i){var l=this.options.crs;return i=i===void 0?this._zoom:i,l.scale(n)/l.scale(i)},getScaleZoom:function(n,i){var l=this.options.crs;i=i===void 0?this._zoom:i;var u=l.zoom(n*l.scale(i));return isNaN(u)?1/0:u},project:function(n,i){return i=i===void 0?this._zoom:i,this.options.crs.latLngToPoint(pt(n),i)},unproject:function(n,i){return i=i===void 0?this._zoom:i,this.options.crs.pointToLatLng(z(n),i)},layerPointToLatLng:function(n){var i=z(n).add(this.getPixelOrigin());return this.unproject(i)},latLngToLayerPoint:function(n){var i=this.project(pt(n))._round();return i._subtract(this.getPixelOrigin())},wrapLatLng:function(n){return this.options.crs.wrapLatLng(pt(n))},wrapLatLngBounds:function(n){return this.options.crs.wrapLatLngBounds(rt(n))},distance:function(n,i){return this.options.crs.distance(pt(n),pt(i))},containerPointToLayerPoint:function(n){return z(n).subtract(this._getMapPanePos())},layerPointToContainerPoint:function(n){return z(n).add(this._getMapPanePos())},containerPointToLatLng:function(n){var i=this.containerPointToLayerPoint(z(n));return this.layerPointToLatLng(i)},latLngToContainerPoint:function(n){return this.layerPointToContainerPoint(this.latLngToLayerPoint(pt(n)))},mouseEventToContainerPoint:function(n){return Sa(n,this._container)},mouseEventToLayerPoint:function(n){return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(n))},mouseEventToLatLng:function(n){return this.layerPointToLatLng(this.mouseEventToLayerPoint(n))},_initContainer:function(n){var i=this._container=_e(n);if(i){if(i._leaflet_id)throw new Error("Map container is already initialized.")}else throw new Error("Map container not found.");jt(i,"scroll",this._onScroll,this),this._containerId=d(i)},_initLayout:function(){var n=this._container;this._fadeAnimated=this.options.fadeAnimation&&bt.any3d,Pt(n,"leaflet-container"+(bt.touch?" leaflet-touch":"")+(bt.retina?" leaflet-retina":"")+(bt.ielt9?" leaflet-oldie":"")+(bt.safari?" leaflet-safari":"")+(this._fadeAnimated?" leaflet-fade-anim":""));var i=Xt(n,"position");i!=="absolute"&&i!=="relative"&&i!=="fixed"&&i!=="sticky"&&(n.style.position="relative"),this._initPanes(),this._initControlPos&&this._initControlPos()},_initPanes:function(){var n=this._panes={};this._paneRenderers={},this._mapPane=this.createPane("mapPane",this._container),Te(this._mapPane,new X(0,0)),this.createPane("tilePane"),this.createPane("overlayPane"),this.createPane("shadowPane"),this.createPane("markerPane"),this.createPane("tooltipPane"),this.createPane("popupPane"),this.options.markerZoomAnimation||(Pt(n.markerPane,"leaflet-zoom-hide"),Pt(n.shadowPane,"leaflet-zoom-hide"))},_resetView:function(n,i,l){Te(this._mapPane,new X(0,0));var u=!this._loaded;this._loaded=!0,i=this._limitZoom(i),this.fire("viewprereset");var g=this._zoom!==i;this._moveStart(g,l)._move(n,i)._moveEnd(g),this.fire("viewreset"),u&&this.fire("load")},_moveStart:function(n,i){return n&&this.fire("zoomstart"),i||this.fire("movestart"),this},_move:function(n,i,l,u){i===void 0&&(i=this._zoom);var g=this._zoom!==i;return this._zoom=i,this._lastCenter=n,this._pixelOrigin=this._getNewPixelOrigin(n),u?l&&l.pinch&&this.fire("zoom",l):((g||l&&l.pinch)&&this.fire("zoom",l),this.fire("move",l)),this},_moveEnd:function(n){return n&&this.fire("zoomend"),this.fire("moveend")},_stop:function(){return it(this._flyToFrame),this._panAnim&&this._panAnim.stop(),this},_rawPanBy:function(n){Te(this._mapPane,this._getMapPanePos().subtract(n))},_getZoomSpan:function(){return this.getMaxZoom()-this.getMinZoom()},_panInsideMaxBounds:function(){this._enforcingBounds||this.panInsideBounds(this.options.maxBounds)},_checkIfLoaded:function(){if(!this._loaded)throw new Error("Set map center and zoom first.")},_initEvents:function(n){this._targets={},this._targets[d(this._container)]=this;var i=n?ge:jt;i(this._container,"click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress keydown keyup",this._handleDOMEvent,this),this.options.trackResize&&i(window,"resize",this._onResize,this),bt.any3d&&this.options.transform3DLimit&&(n?this.off:this.on).call(this,"moveend",this._onMoveEnd)},_onResize:function(){it(this._resizeRequest),this._resizeRequest=J(function(){this.invalidateSize({debounceMoveend:!0})},this)},_onScroll:function(){this._container.scrollTop=0,this._container.scrollLeft=0},_onMoveEnd:function(){var n=this._getMapPanePos();Math.max(Math.abs(n.x),Math.abs(n.y))>=this.options.transform3DLimit&&this._resetView(this.getCenter(),this.getZoom())},_findEventTargets:function(n,i){for(var l=[],u,g=i==="mouseout"||i==="mouseover",E=n.target||n.srcElement,N=!1;E;){if(u=this._targets[d(E)],u&&(i==="click"||i==="preclick")&&this._draggableMoved(u)){N=!0;break}if(u&&u.listens(i,!0)&&(g&&!Js(E,n)||(l.push(u),g))||E===this._container)break;E=E.parentNode}return!l.length&&!N&&!g&&this.listens(i,!0)&&(l=[this]),l},_isClickDisabled:function(n){for(;n&&n!==this._container;){if(n._leaflet_disable_click)return!0;n=n.parentNode}},_handleDOMEvent:function(n){var i=n.target||n.srcElement;if(!(!this._loaded||i._leaflet_disable_events||n.type==="click"&&this._isClickDisabled(i))){var l=n.type;l==="mousedown"&&Zs(i),this._fireDOMEvent(n,l)}},_mouseEvents:["click","dblclick","mouseover","mouseout","contextmenu"],_fireDOMEvent:function(n,i,l){if(n.type==="click"){var u=o({},n);u.type="preclick",this._fireDOMEvent(u,u.type,l)}var g=this._findEventTargets(n,i);if(l){for(var E=[],N=0;N<l.length;N++)l[N].listens(i,!0)&&E.push(l[N]);g=E.concat(g)}if(g.length){i==="contextmenu"&&Be(n);var H=g[0],j={originalEvent:n};if(n.type!=="keypress"&&n.type!=="keydown"&&n.type!=="keyup"){var at=H.getLatLng&&(!H._radius||H._radius<=10);j.containerPoint=at?this.latLngToContainerPoint(H.getLatLng()):this.mouseEventToContainerPoint(n),j.layerPoint=this.containerPointToLayerPoint(j.containerPoint),j.latlng=at?H.getLatLng():this.layerPointToLatLng(j.layerPoint)}for(N=0;N<g.length;N++)if(g[N].fire(i,j,!0),j.originalEvent._stopped||g[N].options.bubblingMouseEvents===!1&&D(this._mouseEvents,i)!==-1)return}},_draggableMoved:function(n){return n=n.dragging&&n.dragging.enabled()?n:this,n.dragging&&n.dragging.moved()||this.boxZoom&&this.boxZoom.moved()},_clearHandlers:function(){for(var n=0,i=this._handlers.length;n<i;n++)this._handlers[n].disable()},whenReady:function(n,i){return this._loaded?n.call(i||this,{target:this}):this.on("load",n,i),this},_getMapPanePos:function(){return ci(this._mapPane)||new X(0,0)},_moved:function(){var n=this._getMapPanePos();return n&&!n.equals([0,0])},_getTopLeftPoint:function(n,i){var l=n&&i!==void 0?this._getNewPixelOrigin(n,i):this.getPixelOrigin();return l.subtract(this._getMapPanePos())},_getNewPixelOrigin:function(n,i){var l=this.getSize()._divideBy(2);return this.project(n,i)._subtract(l)._add(this._getMapPanePos())._round()},_latLngToNewLayerPoint:function(n,i,l){var u=this._getNewPixelOrigin(l,i);return this.project(n,i)._subtract(u)},_latLngBoundsToNewLayerBounds:function(n,i,l){var u=this._getNewPixelOrigin(l,i);return ot([this.project(n.getSouthWest(),i)._subtract(u),this.project(n.getNorthWest(),i)._subtract(u),this.project(n.getSouthEast(),i)._subtract(u),this.project(n.getNorthEast(),i)._subtract(u)])},_getCenterLayerPoint:function(){return this.containerPointToLayerPoint(this.getSize()._divideBy(2))},_getCenterOffset:function(n){return this.latLngToLayerPoint(n).subtract(this._getCenterLayerPoint())},_limitCenter:function(n,i,l){if(!l)return n;var u=this.project(n,i),g=this.getSize().divideBy(2),E=new nt(u.subtract(g),u.add(g)),N=this._getBoundsOffset(E,l,i);return Math.abs(N.x)<=1&&Math.abs(N.y)<=1?n:this.unproject(u.add(N),i)},_limitOffset:function(n,i){if(!i)return n;var l=this.getPixelBounds(),u=new nt(l.min.add(n),l.max.add(n));return n.add(this._getBoundsOffset(u,i))},_getBoundsOffset:function(n,i,l){var u=ot(this.project(i.getNorthEast(),l),this.project(i.getSouthWest(),l)),g=u.min.subtract(n.min),E=u.max.subtract(n.max),N=this._rebound(g.x,-E.x),H=this._rebound(g.y,-E.y);return new X(N,H)},_rebound:function(n,i){return n+i>0?Math.round(n-i)/2:Math.max(0,Math.ceil(n))-Math.max(0,Math.floor(i))},_limitZoom:function(n){var i=this.getMinZoom(),l=this.getMaxZoom(),u=bt.any3d?this.options.zoomSnap:1;return u&&(n=Math.round(n/u)*u),Math.max(i,Math.min(l,n))},_onPanTransitionStep:function(){this.fire("move")},_onPanTransitionEnd:function(){he(this._mapPane,"leaflet-pan-anim"),this.fire("moveend")},_tryAnimatedPan:function(n,i){var l=this._getCenterOffset(n)._trunc();return(i&&i.animate)!==!0&&!this.getSize().contains(l)?!1:(this.panBy(l,i),!0)},_createAnimProxy:function(){var n=this._proxy=se("div","leaflet-proxy leaflet-zoom-animated");this._panes.mapPane.appendChild(n),this.on("zoomanim",function(i){var l=Oe,u=this._proxy.style[l];li(this._proxy,this.project(i.center,i.zoom),this.getZoomScale(i.zoom,1)),u===this._proxy.style[l]&&this._animatingZoom&&this._onZoomTransitionEnd()},this),this.on("load moveend",this._animMoveEnd,this),this._on("unload",this._destroyAnimProxy,this)},_destroyAnimProxy:function(){Ht(this._proxy),this.off("load moveend",this._animMoveEnd,this),delete this._proxy},_animMoveEnd:function(){var n=this.getCenter(),i=this.getZoom();li(this._proxy,this.project(n,i),this.getZoomScale(i,1))},_catchTransitionEnd:function(n){this._animatingZoom&&n.propertyName.indexOf("transform")>=0&&this._onZoomTransitionEnd()},_nothingToAnimate:function(){return!this._container.getElementsByClassName("leaflet-zoom-animated").length},_tryAnimatedZoom:function(n,i,l){if(this._animatingZoom)return!0;if(l=l||{},!this._zoomAnimated||l.animate===!1||this._nothingToAnimate()||Math.abs(i-this._zoom)>this.options.zoomAnimationThreshold)return!1;var u=this.getZoomScale(i),g=this._getCenterOffset(n)._divideBy(1-1/u);return l.animate!==!0&&!this.getSize().contains(g)?!1:(J(function(){this._moveStart(!0,l.noMoveStart||!1)._animateZoom(n,i,!0)},this),!0)},_animateZoom:function(n,i,l,u){this._mapPane&&(l&&(this._animatingZoom=!0,this._animateToCenter=n,this._animateToZoom=i,Pt(this._mapPane,"leaflet-zoom-anim")),this.fire("zoomanim",{center:n,zoom:i,noUpdate:u}),this._tempFireZoomEvent||(this._tempFireZoomEvent=this._zoom!==this._animateToZoom),this._move(this._animateToCenter,this._animateToZoom,void 0,!0),setTimeout(h(this._onZoomTransitionEnd,this),250))},_onZoomTransitionEnd:function(){this._animatingZoom&&(this._mapPane&&he(this._mapPane,"leaflet-zoom-anim"),this._animatingZoom=!1,this._move(this._animateToCenter,this._animateToZoom,void 0,!0),this._tempFireZoomEvent&&this.fire("zoom"),delete this._tempFireZoomEvent,this.fire("move"),this._moveEnd(!0))}});function Ch(n,i){return new ae(n,i)}var pn=F.extend({options:{position:"topright"},initialize:function(n){S(this,n)},getPosition:function(){return this.options.position},setPosition:function(n){var i=this._map;return i&&i.removeControl(this),this.options.position=n,i&&i.addControl(this),this},getContainer:function(){return this._container},addTo:function(n){this.remove(),this._map=n;var i=this._container=this.onAdd(n),l=this.getPosition(),u=n._controlCorners[l];return Pt(i,"leaflet-control"),l.indexOf("bottom")!==-1?u.insertBefore(i,u.firstChild):u.appendChild(i),this._map.on("unload",this.remove,this),this},remove:function(){return this._map?(Ht(this._container),this.onRemove&&this.onRemove(this._map),this._map.off("unload",this.remove,this),this._map=null,this):this},_refocusOnMap:function(n){this._map&&n&&n.screenX>0&&n.screenY>0&&this._map.getContainer().focus()}}),gr=function(n){return new pn(n)};ae.include({addControl:function(n){return n.addTo(this),this},removeControl:function(n){return n.remove(),this},_initControlPos:function(){var n=this._controlCorners={},i="leaflet-",l=this._controlContainer=se("div",i+"control-container",this._container);function u(g,E){var N=i+g+" "+i+E;n[g+E]=se("div",N,l)}u("top","left"),u("top","right"),u("bottom","left"),u("bottom","right")},_clearControlPos:function(){for(var n in this._controlCorners)Ht(this._controlCorners[n]);Ht(this._controlContainer),delete this._controlCorners,delete this._controlContainer}});var ba=pn.extend({options:{collapsed:!0,position:"topright",autoZIndex:!0,hideSingleBase:!1,sortLayers:!1,sortFunction:function(n,i,l,u){return l<u?-1:u<l?1:0}},initialize:function(n,i,l){S(this,l),this._layerControlInputs=[],this._layers=[],this._lastZIndex=0,this._handlingClick=!1,this._preventClick=!1;for(var u in n)this._addLayer(n[u],u);for(u in i)this._addLayer(i[u],u,!0)},onAdd:function(n){this._initLayout(),this._update(),this._map=n,n.on("zoomend",this._checkDisabledLayers,this);for(var i=0;i<this._layers.length;i++)this._layers[i].layer.on("add remove",this._onLayerChange,this);return this._container},addTo:function(n){return pn.prototype.addTo.call(this,n),this._expandIfNotCollapsed()},onRemove:function(){this._map.off("zoomend",this._checkDisabledLayers,this);for(var n=0;n<this._layers.length;n++)this._layers[n].layer.off("add remove",this._onLayerChange,this)},addBaseLayer:function(n,i){return this._addLayer(n,i),this._map?this._update():this},addOverlay:function(n,i){return this._addLayer(n,i,!0),this._map?this._update():this},removeLayer:function(n){n.off("add remove",this._onLayerChange,this);var i=this._getLayer(d(n));return i&&this._layers.splice(this._layers.indexOf(i),1),this._map?this._update():this},expand:function(){Pt(this._container,"leaflet-control-layers-expanded"),this._section.style.height=null;var n=this._map.getSize().y-(this._container.offsetTop+50);return n<this._section.clientHeight?(Pt(this._section,"leaflet-control-layers-scrollbar"),this._section.style.height=n+"px"):he(this._section,"leaflet-control-layers-scrollbar"),this._checkDisabledLayers(),this},collapse:function(){return he(this._container,"leaflet-control-layers-expanded"),this},_initLayout:function(){var n="leaflet-control-layers",i=this._container=se("div",n),l=this.options.collapsed;i.setAttribute("aria-haspopup",!0),_r(i),$s(i);var u=this._section=se("section",n+"-list");l&&(this._map.on("click",this.collapse,this),jt(i,{mouseenter:this._expandSafely,mouseleave:this.collapse},this));var g=this._layersLink=se("a",n+"-toggle",i);g.href="#",g.title="Layers",g.setAttribute("role","button"),jt(g,{keydown:function(E){E.keyCode===13&&this._expandSafely()},click:function(E){Be(E),this._expandSafely()}},this),l||this.expand(),this._baseLayersList=se("div",n+"-base",u),this._separator=se("div",n+"-separator",u),this._overlaysList=se("div",n+"-overlays",u),i.appendChild(u)},_getLayer:function(n){for(var i=0;i<this._layers.length;i++)if(this._layers[i]&&d(this._layers[i].layer)===n)return this._layers[i]},_addLayer:function(n,i,l){this._map&&n.on("add remove",this._onLayerChange,this),this._layers.push({layer:n,name:i,overlay:l}),this.options.sortLayers&&this._layers.sort(h(function(u,g){return this.options.sortFunction(u.layer,g.layer,u.name,g.name)},this)),this.options.autoZIndex&&n.setZIndex&&(this._lastZIndex++,n.setZIndex(this._lastZIndex)),this._expandIfNotCollapsed()},_update:function(){if(!this._container)return this;on(this._baseLayersList),on(this._overlaysList),this._layerControlInputs=[];var n,i,l,u,g=0;for(l=0;l<this._layers.length;l++)u=this._layers[l],this._addItem(u),i=i||u.overlay,n=n||!u.overlay,g+=u.overlay?0:1;return this.options.hideSingleBase&&(n=n&&g>1,this._baseLayersList.style.display=n?"":"none"),this._separator.style.display=i&&n?"":"none",this},_onLayerChange:function(n){this._handlingClick||this._update();var i=this._getLayer(d(n.target)),l=i.overlay?n.type==="add"?"overlayadd":"overlayremove":n.type==="add"?"baselayerchange":null;l&&this._map.fire(l,i)},_createRadioElement:function(n,i){var l='<input type="radio" class="leaflet-control-layers-selector" name="'+n+'"'+(i?' checked="checked"':"")+"/>",u=document.createElement("div");return u.innerHTML=l,u.firstChild},_addItem:function(n){var i=document.createElement("label"),l=this._map.hasLayer(n.layer),u;n.overlay?(u=document.createElement("input"),u.type="checkbox",u.className="leaflet-control-layers-selector",u.defaultChecked=l):u=this._createRadioElement("leaflet-base-layers_"+d(this),l),this._layerControlInputs.push(u),u.layerId=d(n.layer),jt(u,"click",this._onInputClick,this);var g=document.createElement("span");g.innerHTML=" "+n.name;var E=document.createElement("span");i.appendChild(E),E.appendChild(u),E.appendChild(g);var N=n.overlay?this._overlaysList:this._baseLayersList;return N.appendChild(i),this._checkDisabledLayers(),i},_onInputClick:function(){if(!this._preventClick){var n=this._layerControlInputs,i,l,u=[],g=[];this._handlingClick=!0;for(var E=n.length-1;E>=0;E--)i=n[E],l=this._getLayer(i.layerId).layer,i.checked?u.push(l):i.checked||g.push(l);for(E=0;E<g.length;E++)this._map.hasLayer(g[E])&&this._map.removeLayer(g[E]);for(E=0;E<u.length;E++)this._map.hasLayer(u[E])||this._map.addLayer(u[E]);this._handlingClick=!1,this._refocusOnMap()}},_checkDisabledLayers:function(){for(var n=this._layerControlInputs,i,l,u=this._map.getZoom(),g=n.length-1;g>=0;g--)i=n[g],l=this._getLayer(i.layerId).layer,i.disabled=l.options.minZoom!==void 0&&u<l.options.minZoom||l.options.maxZoom!==void 0&&u>l.options.maxZoom},_expandIfNotCollapsed:function(){return this._map&&!this.options.collapsed&&this.expand(),this},_expandSafely:function(){var n=this._section;this._preventClick=!0,jt(n,"click",Be),this.expand();var i=this;setTimeout(function(){ge(n,"click",Be),i._preventClick=!1})}}),Ih=function(n,i,l){return new ba(n,i,l)},Qs=pn.extend({options:{position:"topleft",zoomInText:'<span aria-hidden="true">+</span>',zoomInTitle:"Zoom in",zoomOutText:'<span aria-hidden="true">&#x2212;</span>',zoomOutTitle:"Zoom out"},onAdd:function(n){var i="leaflet-control-zoom",l=se("div",i+" leaflet-bar"),u=this.options;return this._zoomInButton=this._createButton(u.zoomInText,u.zoomInTitle,i+"-in",l,this._zoomIn),this._zoomOutButton=this._createButton(u.zoomOutText,u.zoomOutTitle,i+"-out",l,this._zoomOut),this._updateDisabled(),n.on("zoomend zoomlevelschange",this._updateDisabled,this),l},onRemove:function(n){n.off("zoomend zoomlevelschange",this._updateDisabled,this)},disable:function(){return this._disabled=!0,this._updateDisabled(),this},enable:function(){return this._disabled=!1,this._updateDisabled(),this},_zoomIn:function(n){!this._disabled&&this._map._zoom<this._map.getMaxZoom()&&this._map.zoomIn(this._map.options.zoomDelta*(n.shiftKey?3:1))},_zoomOut:function(n){!this._disabled&&this._map._zoom>this._map.getMinZoom()&&this._map.zoomOut(this._map.options.zoomDelta*(n.shiftKey?3:1))},_createButton:function(n,i,l,u,g){var E=se("a",l,u);return E.innerHTML=n,E.href="#",E.title=i,E.setAttribute("role","button"),E.setAttribute("aria-label",i),_r(E),jt(E,"click",ui),jt(E,"click",g,this),jt(E,"click",this._refocusOnMap,this),E},_updateDisabled:function(){var n=this._map,i="leaflet-disabled";he(this._zoomInButton,i),he(this._zoomOutButton,i),this._zoomInButton.setAttribute("aria-disabled","false"),this._zoomOutButton.setAttribute("aria-disabled","false"),(this._disabled||n._zoom===n.getMinZoom())&&(Pt(this._zoomOutButton,i),this._zoomOutButton.setAttribute("aria-disabled","true")),(this._disabled||n._zoom===n.getMaxZoom())&&(Pt(this._zoomInButton,i),this._zoomInButton.setAttribute("aria-disabled","true"))}});ae.mergeOptions({zoomControl:!0}),ae.addInitHook(function(){this.options.zoomControl&&(this.zoomControl=new Qs,this.addControl(this.zoomControl))});var Dh=function(n){return new Qs(n)},wa=pn.extend({options:{position:"bottomleft",maxWidth:100,metric:!0,imperial:!0},onAdd:function(n){var i="leaflet-control-scale",l=se("div",i),u=this.options;return this._addScales(u,i+"-line",l),n.on(u.updateWhenIdle?"moveend":"move",this._update,this),n.whenReady(this._update,this),l},onRemove:function(n){n.off(this.options.updateWhenIdle?"moveend":"move",this._update,this)},_addScales:function(n,i,l){n.metric&&(this._mScale=se("div",i,l)),n.imperial&&(this._iScale=se("div",i,l))},_update:function(){var n=this._map,i=n.getSize().y/2,l=n.distance(n.containerPointToLatLng([0,i]),n.containerPointToLatLng([this.options.maxWidth,i]));this._updateScales(l)},_updateScales:function(n){this.options.metric&&n&&this._updateMetric(n),this.options.imperial&&n&&this._updateImperial(n)},_updateMetric:function(n){var i=this._getRoundNum(n),l=i<1e3?i+" m":i/1e3+" km";this._updateScale(this._mScale,l,i/n)},_updateImperial:function(n){var i=n*3.2808399,l,u,g;i>5280?(l=i/5280,u=this._getRoundNum(l),this._updateScale(this._iScale,u+" mi",u/l)):(g=this._getRoundNum(i),this._updateScale(this._iScale,g+" ft",g/i))},_updateScale:function(n,i,l){n.style.width=Math.round(this.options.maxWidth*l)+"px",n.innerHTML=i},_getRoundNum:function(n){var i=Math.pow(10,(Math.floor(n)+"").length-1),l=n/i;return l=l>=10?10:l>=5?5:l>=3?3:l>=2?2:1,i*l}}),Uh=function(n){return new wa(n)},Nh='<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"/><path fill="#FFD500" d="M0 4h12v3H0z"/><path fill="#E0BC00" d="M0 7h12v1H0z"/></svg>',to=pn.extend({options:{position:"bottomright",prefix:'<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">'+(bt.inlineSvg?Nh+" ":"")+"Leaflet</a>"},initialize:function(n){S(this,n),this._attributions={}},onAdd:function(n){n.attributionControl=this,this._container=se("div","leaflet-control-attribution"),_r(this._container);for(var i in n._layers)n._layers[i].getAttribution&&this.addAttribution(n._layers[i].getAttribution());return this._update(),n.on("layeradd",this._addAttribution,this),this._container},onRemove:function(n){n.off("layeradd",this._addAttribution,this)},_addAttribution:function(n){n.layer.getAttribution&&(this.addAttribution(n.layer.getAttribution()),n.layer.once("remove",function(){this.removeAttribution(n.layer.getAttribution())},this))},setPrefix:function(n){return this.options.prefix=n,this._update(),this},addAttribution:function(n){return n?(this._attributions[n]||(this._attributions[n]=0),this._attributions[n]++,this._update(),this):this},removeAttribution:function(n){return n?(this._attributions[n]&&(this._attributions[n]--,this._update()),this):this},_update:function(){if(this._map){var n=[];for(var i in this._attributions)this._attributions[i]&&n.push(i);var l=[];this.options.prefix&&l.push(this.options.prefix),n.length&&l.push(n.join(", ")),this._container.innerHTML=l.join(' <span aria-hidden="true">|</span> ')}}});ae.mergeOptions({attributionControl:!0}),ae.addInitHook(function(){this.options.attributionControl&&new to().addTo(this)});var Oh=function(n){return new to(n)};pn.Layers=ba,pn.Zoom=Qs,pn.Scale=wa,pn.Attribution=to,gr.layers=Ih,gr.zoom=Dh,gr.scale=Uh,gr.attribution=Oh;var Tn=F.extend({initialize:function(n){this._map=n},enable:function(){return this._enabled?this:(this._enabled=!0,this.addHooks(),this)},disable:function(){return this._enabled?(this._enabled=!1,this.removeHooks(),this):this},enabled:function(){return!!this._enabled}});Tn.addTo=function(n,i){return n.addHandler(i,this),this};var Fh={Events:Q},Aa=bt.touch?"touchstart mousedown":"mousedown",Wn=st.extend({options:{clickTolerance:3},initialize:function(n,i,l,u){S(this,u),this._element=n,this._dragStartTarget=i||n,this._preventOutline=l},enable:function(){this._enabled||(jt(this._dragStartTarget,Aa,this._onDown,this),this._enabled=!0)},disable:function(){this._enabled&&(Wn._dragging===this&&this.finishDrag(!0),ge(this._dragStartTarget,Aa,this._onDown,this),this._enabled=!1,this._moved=!1)},_onDown:function(n){if(this._enabled&&(this._moved=!1,!si(this._element,"leaflet-zoom-anim"))){if(n.touches&&n.touches.length!==1){Wn._dragging===this&&this.finishDrag();return}if(!(Wn._dragging||n.shiftKey||n.which!==1&&n.button!==1&&!n.touches)&&(Wn._dragging=this,this._preventOutline&&Zs(this._element),Vs(),fr(),!this._moving)){this.fire("down");var i=n.touches?n.touches[0]:n,l=xa(this._element);this._startPoint=new X(i.clientX,i.clientY),this._startPos=ci(this._element),this._parentScale=qs(l);var u=n.type==="mousedown";jt(document,u?"mousemove":"touchmove",this._onMove,this),jt(document,u?"mouseup":"touchend touchcancel",this._onUp,this)}}},_onMove:function(n){if(this._enabled){if(n.touches&&n.touches.length>1){this._moved=!0;return}var i=n.touches&&n.touches.length===1?n.touches[0]:n,l=new X(i.clientX,i.clientY)._subtract(this._startPoint);!l.x&&!l.y||Math.abs(l.x)+Math.abs(l.y)<this.options.clickTolerance||(l.x/=this._parentScale.x,l.y/=this._parentScale.y,Be(n),this._moved||(this.fire("dragstart"),this._moved=!0,Pt(document.body,"leaflet-dragging"),this._lastTarget=n.target||n.srcElement,window.SVGElementInstance&&this._lastTarget instanceof window.SVGElementInstance&&(this._lastTarget=this._lastTarget.correspondingUseElement),Pt(this._lastTarget,"leaflet-drag-target")),this._newPos=this._startPos.add(l),this._moving=!0,this._lastEvent=n,this._updatePosition())}},_updatePosition:function(){var n={originalEvent:this._lastEvent};this.fire("predrag",n),Te(this._element,this._newPos),this.fire("drag",n)},_onUp:function(){this._enabled&&this.finishDrag()},finishDrag:function(n){he(document.body,"leaflet-dragging"),this._lastTarget&&(he(this._lastTarget,"leaflet-drag-target"),this._lastTarget=null),ge(document,"mousemove touchmove",this._onMove,this),ge(document,"mouseup touchend touchcancel",this._onUp,this),Ws(),pr();var i=this._moved&&this._moving;this._moving=!1,Wn._dragging=!1,i&&this.fire("dragend",{noInertia:n,distance:this._newPos.distanceTo(this._startPos)})}});function La(n,i,l){var u,g=[1,4,2,8],E,N,H,j,at,Mt,Ft,ee;for(E=0,Mt=n.length;E<Mt;E++)n[E]._code=di(n[E],i);for(H=0;H<4;H++){for(Ft=g[H],u=[],E=0,Mt=n.length,N=Mt-1;E<Mt;N=E++)j=n[E],at=n[N],j._code&Ft?at._code&Ft||(ee=Wr(at,j,Ft,i,l),ee._code=di(ee,i),u.push(ee)):(at._code&Ft&&(ee=Wr(at,j,Ft,i,l),ee._code=di(ee,i),u.push(ee)),u.push(j));n=u}return n}function Pa(n,i){var l,u,g,E,N,H,j,at,Mt;if(!n||n.length===0)throw new Error("latlngs not passed");ln(n)||(console.warn("latlngs are not flat! Only the first ring will be used"),n=n[0]);var Ft=pt([0,0]),ee=rt(n),Xe=ee.getNorthWest().distanceTo(ee.getSouthWest())*ee.getNorthEast().distanceTo(ee.getNorthWest());Xe<1700&&(Ft=eo(n));var Ce=n.length,cn=[];for(l=0;l<Ce;l++){var Ke=pt(n[l]);cn.push(i.project(pt([Ke.lat-Ft.lat,Ke.lng-Ft.lng])))}for(H=j=at=0,l=0,u=Ce-1;l<Ce;u=l++)g=cn[l],E=cn[u],N=g.y*E.x-E.y*g.x,j+=(g.x+E.x)*N,at+=(g.y+E.y)*N,H+=N*3;H===0?Mt=cn[0]:Mt=[j/H,at/H];var Ii=i.unproject(z(Mt));return pt([Ii.lat+Ft.lat,Ii.lng+Ft.lng])}function eo(n){for(var i=0,l=0,u=0,g=0;g<n.length;g++){var E=pt(n[g]);i+=E.lat,l+=E.lng,u++}return pt([i/u,l/u])}var Bh={__proto__:null,clipPolygon:La,polygonCenter:Pa,centroid:eo};function Ra(n,i){if(!i||!n.length)return n.slice();var l=i*i;return n=Hh(n,l),n=kh(n,l),n}function Ca(n,i,l){return Math.sqrt(vr(n,i,l,!0))}function zh(n,i,l){return vr(n,i,l)}function kh(n,i){var l=n.length,u=typeof Uint8Array<"u"?Uint8Array:Array,g=new u(l);g[0]=g[l-1]=1,no(n,g,i,0,l-1);var E,N=[];for(E=0;E<l;E++)g[E]&&N.push(n[E]);return N}function no(n,i,l,u,g){var E=0,N,H,j;for(H=u+1;H<=g-1;H++)j=vr(n[H],n[u],n[g],!0),j>E&&(N=H,E=j);E>l&&(i[N]=1,no(n,i,l,u,N),no(n,i,l,N,g))}function Hh(n,i){for(var l=[n[0]],u=1,g=0,E=n.length;u<E;u++)Gh(n[u],n[g])>i&&(l.push(n[u]),g=u);return g<E-1&&l.push(n[E-1]),l}var Ia;function Da(n,i,l,u,g){var E=u?Ia:di(n,l),N=di(i,l),H,j,at;for(Ia=N;;){if(!(E|N))return[n,i];if(E&N)return!1;H=E||N,j=Wr(n,i,H,l,g),at=di(j,l),H===E?(n=j,E=at):(i=j,N=at)}}function Wr(n,i,l,u,g){var E=i.x-n.x,N=i.y-n.y,H=u.min,j=u.max,at,Mt;return l&8?(at=n.x+E*(j.y-n.y)/N,Mt=j.y):l&4?(at=n.x+E*(H.y-n.y)/N,Mt=H.y):l&2?(at=j.x,Mt=n.y+N*(j.x-n.x)/E):l&1&&(at=H.x,Mt=n.y+N*(H.x-n.x)/E),new X(at,Mt,g)}function di(n,i){var l=0;return n.x<i.min.x?l|=1:n.x>i.max.x&&(l|=2),n.y<i.min.y?l|=4:n.y>i.max.y&&(l|=8),l}function Gh(n,i){var l=i.x-n.x,u=i.y-n.y;return l*l+u*u}function vr(n,i,l,u){var g=i.x,E=i.y,N=l.x-g,H=l.y-E,j=N*N+H*H,at;return j>0&&(at=((n.x-g)*N+(n.y-E)*H)/j,at>1?(g=l.x,E=l.y):at>0&&(g+=N*at,E+=H*at)),N=n.x-g,H=n.y-E,u?N*N+H*H:new X(g,E)}function ln(n){return!b(n[0])||typeof n[0][0]!="object"&&typeof n[0][0]<"u"}function Ua(n){return console.warn("Deprecated use of _flat, please use L.LineUtil.isFlat instead."),ln(n)}function Na(n,i){var l,u,g,E,N,H,j,at;if(!n||n.length===0)throw new Error("latlngs not passed");ln(n)||(console.warn("latlngs are not flat! Only the first ring will be used"),n=n[0]);var Mt=pt([0,0]),Ft=rt(n),ee=Ft.getNorthWest().distanceTo(Ft.getSouthWest())*Ft.getNorthEast().distanceTo(Ft.getNorthWest());ee<1700&&(Mt=eo(n));var Xe=n.length,Ce=[];for(l=0;l<Xe;l++){var cn=pt(n[l]);Ce.push(i.project(pt([cn.lat-Mt.lat,cn.lng-Mt.lng])))}for(l=0,u=0;l<Xe-1;l++)u+=Ce[l].distanceTo(Ce[l+1])/2;if(u===0)at=Ce[0];else for(l=0,E=0;l<Xe-1;l++)if(N=Ce[l],H=Ce[l+1],g=N.distanceTo(H),E+=g,E>u){j=(E-u)/g,at=[H.x-j*(H.x-N.x),H.y-j*(H.y-N.y)];break}var Ke=i.unproject(z(at));return pt([Ke.lat+Mt.lat,Ke.lng+Mt.lng])}var Vh={__proto__:null,simplify:Ra,pointToSegmentDistance:Ca,closestPointOnSegment:zh,clipSegment:Da,_getEdgeIntersection:Wr,_getBitCode:di,_sqClosestPointOnSegment:vr,isFlat:ln,_flat:Ua,polylineCenter:Na},io={project:function(n){return new X(n.lng,n.lat)},unproject:function(n){return new ct(n.y,n.x)},bounds:new nt([-180,-90],[180,90])},ro={R:6378137,R_MINOR:6356752314245179e-9,bounds:new nt([-2003750834279e-5,-1549657073972e-5],[2003750834279e-5,1876465623138e-5]),project:function(n){var i=Math.PI/180,l=this.R,u=n.lat*i,g=this.R_MINOR/l,E=Math.sqrt(1-g*g),N=E*Math.sin(u),H=Math.tan(Math.PI/4-u/2)/Math.pow((1-N)/(1+N),E/2);return u=-l*Math.log(Math.max(H,1e-10)),new X(n.lng*i*l,u)},unproject:function(n){for(var i=180/Math.PI,l=this.R,u=this.R_MINOR/l,g=Math.sqrt(1-u*u),E=Math.exp(-n.y/l),N=Math.PI/2-2*Math.atan(E),H=0,j=.1,at;H<15&&Math.abs(j)>1e-7;H++)at=g*Math.sin(N),at=Math.pow((1-at)/(1+at),g/2),j=Math.PI/2-2*Math.atan(E*at)-N,N+=j;return new ct(N*i,n.x*i/l)}},Wh={__proto__:null,LonLat:io,Mercator:ro,SphericalMercator:Nt},Xh=o({},Ut,{code:"EPSG:3395",projection:ro,transformation:function(){var n=.5/(Math.PI*ro.R);return Z(n,.5,-n,.5)}()}),Oa=o({},Ut,{code:"EPSG:4326",projection:io,transformation:Z(1/180,1,-1/180,.5)}),Zh=o({},St,{projection:io,transformation:Z(1,0,-1,0),scale:function(n){return Math.pow(2,n)},zoom:function(n){return Math.log(n)/Math.LN2},distance:function(n,i){var l=i.lng-n.lng,u=i.lat-n.lat;return Math.sqrt(l*l+u*u)},infinite:!0});St.Earth=Ut,St.EPSG3395=Xh,St.EPSG3857=Ae,St.EPSG900913=It,St.EPSG4326=Oa,St.Simple=Zh;var mn=st.extend({options:{pane:"overlayPane",attribution:null,bubblingMouseEvents:!0},addTo:function(n){return n.addLayer(this),this},remove:function(){return this.removeFrom(this._map||this._mapToAdd)},removeFrom:function(n){return n&&n.removeLayer(this),this},getPane:function(n){return this._map.getPane(n?this.options[n]||n:this.options.pane)},addInteractiveTarget:function(n){return this._map._targets[d(n)]=this,this},removeInteractiveTarget:function(n){return delete this._map._targets[d(n)],this},getAttribution:function(){return this.options.attribution},_layerAdd:function(n){var i=n.target;if(i.hasLayer(this)){if(this._map=i,this._zoomAnimated=i._zoomAnimated,this.getEvents){var l=this.getEvents();i.on(l,this),this.once("remove",function(){i.off(l,this)},this)}this.onAdd(i),this.fire("add"),i.fire("layeradd",{layer:this})}}});ae.include({addLayer:function(n){if(!n._layerAdd)throw new Error("The provided object is not a Layer.");var i=d(n);return this._layers[i]?this:(this._layers[i]=n,n._mapToAdd=this,n.beforeAdd&&n.beforeAdd(this),this.whenReady(n._layerAdd,n),this)},removeLayer:function(n){var i=d(n);return this._layers[i]?(this._loaded&&n.onRemove(this),delete this._layers[i],this._loaded&&(this.fire("layerremove",{layer:n}),n.fire("remove")),n._map=n._mapToAdd=null,this):this},hasLayer:function(n){return d(n)in this._layers},eachLayer:function(n,i){for(var l in this._layers)n.call(i,this._layers[l]);return this},_addLayers:function(n){n=n?b(n)?n:[n]:[];for(var i=0,l=n.length;i<l;i++)this.addLayer(n[i])},_addZoomLimit:function(n){(!isNaN(n.options.maxZoom)||!isNaN(n.options.minZoom))&&(this._zoomBoundLayers[d(n)]=n,this._updateZoomLevels())},_removeZoomLimit:function(n){var i=d(n);this._zoomBoundLayers[i]&&(delete this._zoomBoundLayers[i],this._updateZoomLevels())},_updateZoomLevels:function(){var n=1/0,i=-1/0,l=this._getZoomSpan();for(var u in this._zoomBoundLayers){var g=this._zoomBoundLayers[u].options;n=g.minZoom===void 0?n:Math.min(n,g.minZoom),i=g.maxZoom===void 0?i:Math.max(i,g.maxZoom)}this._layersMaxZoom=i===-1/0?void 0:i,this._layersMinZoom=n===1/0?void 0:n,l!==this._getZoomSpan()&&this.fire("zoomlevelschange"),this.options.maxZoom===void 0&&this._layersMaxZoom&&this.getZoom()>this._layersMaxZoom&&this.setZoom(this._layersMaxZoom),this.options.minZoom===void 0&&this._layersMinZoom&&this.getZoom()<this._layersMinZoom&&this.setZoom(this._layersMinZoom)}});var Ai=mn.extend({initialize:function(n,i){S(this,i),this._layers={};var l,u;if(n)for(l=0,u=n.length;l<u;l++)this.addLayer(n[l])},addLayer:function(n){var i=this.getLayerId(n);return this._layers[i]=n,this._map&&this._map.addLayer(n),this},removeLayer:function(n){var i=n in this._layers?n:this.getLayerId(n);return this._map&&this._layers[i]&&this._map.removeLayer(this._layers[i]),delete this._layers[i],this},hasLayer:function(n){var i=typeof n=="number"?n:this.getLayerId(n);return i in this._layers},clearLayers:function(){return this.eachLayer(this.removeLayer,this)},invoke:function(n){var i=Array.prototype.slice.call(arguments,1),l,u;for(l in this._layers)u=this._layers[l],u[n]&&u[n].apply(u,i);return this},onAdd:function(n){this.eachLayer(n.addLayer,n)},onRemove:function(n){this.eachLayer(n.removeLayer,n)},eachLayer:function(n,i){for(var l in this._layers)n.call(i,this._layers[l]);return this},getLayer:function(n){return this._layers[n]},getLayers:function(){var n=[];return this.eachLayer(n.push,n),n},setZIndex:function(n){return this.invoke("setZIndex",n)},getLayerId:function(n){return d(n)}}),qh=function(n,i){return new Ai(n,i)},Pn=Ai.extend({addLayer:function(n){return this.hasLayer(n)?this:(n.addEventParent(this),Ai.prototype.addLayer.call(this,n),this.fire("layeradd",{layer:n}))},removeLayer:function(n){return this.hasLayer(n)?(n in this._layers&&(n=this._layers[n]),n.removeEventParent(this),Ai.prototype.removeLayer.call(this,n),this.fire("layerremove",{layer:n})):this},setStyle:function(n){return this.invoke("setStyle",n)},bringToFront:function(){return this.invoke("bringToFront")},bringToBack:function(){return this.invoke("bringToBack")},getBounds:function(){var n=new W;for(var i in this._layers){var l=this._layers[i];n.extend(l.getBounds?l.getBounds():l.getLatLng())}return n}}),Yh=function(n,i){return new Pn(n,i)},Li=F.extend({options:{popupAnchor:[0,0],tooltipAnchor:[0,0],crossOrigin:!1},initialize:function(n){S(this,n)},createIcon:function(n){return this._createIcon("icon",n)},createShadow:function(n){return this._createIcon("shadow",n)},_createIcon:function(n,i){var l=this._getIconUrl(n);if(!l){if(n==="icon")throw new Error("iconUrl not set in Icon options (see the docs).");return null}var u=this._createImg(l,i&&i.tagName==="IMG"?i:null);return this._setIconStyles(u,n),(this.options.crossOrigin||this.options.crossOrigin==="")&&(u.crossOrigin=this.options.crossOrigin===!0?"":this.options.crossOrigin),u},_setIconStyles:function(n,i){var l=this.options,u=l[i+"Size"];typeof u=="number"&&(u=[u,u]);var g=z(u),E=z(i==="shadow"&&l.shadowAnchor||l.iconAnchor||g&&g.divideBy(2,!0));n.className="leaflet-marker-"+i+" "+(l.className||""),E&&(n.style.marginLeft=-E.x+"px",n.style.marginTop=-E.y+"px"),g&&(n.style.width=g.x+"px",n.style.height=g.y+"px")},_createImg:function(n,i){return i=i||document.createElement("img"),i.src=n,i},_getIconUrl:function(n){return bt.retina&&this.options[n+"RetinaUrl"]||this.options[n+"Url"]}});function jh(n){return new Li(n)}var xr=Li.extend({options:{iconUrl:"marker-icon.png",iconRetinaUrl:"marker-icon-2x.png",shadowUrl:"marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],tooltipAnchor:[16,-28],shadowSize:[41,41]},_getIconUrl:function(n){return typeof xr.imagePath!="string"&&(xr.imagePath=this._detectIconPath()),(this.options.imagePath||xr.imagePath)+Li.prototype._getIconUrl.call(this,n)},_stripUrl:function(n){var i=function(l,u,g){var E=u.exec(l);return E&&E[g]};return n=i(n,/^url\((['"])?(.+)\1\)$/,2),n&&i(n,/^(.*)marker-icon\.png$/,1)},_detectIconPath:function(){var n=se("div","leaflet-default-icon-path",document.body),i=Xt(n,"background-image")||Xt(n,"backgroundImage");if(document.body.removeChild(n),i=this._stripUrl(i),i)return i;var l=document.querySelector('link[href$="leaflet.css"]');return l?l.href.substring(0,l.href.length-11-1):""}}),Fa=Tn.extend({initialize:function(n){this._marker=n},addHooks:function(){var n=this._marker._icon;this._draggable||(this._draggable=new Wn(n,n,!0)),this._draggable.on({dragstart:this._onDragStart,predrag:this._onPreDrag,drag:this._onDrag,dragend:this._onDragEnd},this).enable(),Pt(n,"leaflet-marker-draggable")},removeHooks:function(){this._draggable.off({dragstart:this._onDragStart,predrag:this._onPreDrag,drag:this._onDrag,dragend:this._onDragEnd},this).disable(),this._marker._icon&&he(this._marker._icon,"leaflet-marker-draggable")},moved:function(){return this._draggable&&this._draggable._moved},_adjustPan:function(n){var i=this._marker,l=i._map,u=this._marker.options.autoPanSpeed,g=this._marker.options.autoPanPadding,E=ci(i._icon),N=l.getPixelBounds(),H=l.getPixelOrigin(),j=ot(N.min._subtract(H).add(g),N.max._subtract(H).subtract(g));if(!j.contains(E)){var at=z((Math.max(j.max.x,E.x)-j.max.x)/(N.max.x-j.max.x)-(Math.min(j.min.x,E.x)-j.min.x)/(N.min.x-j.min.x),(Math.max(j.max.y,E.y)-j.max.y)/(N.max.y-j.max.y)-(Math.min(j.min.y,E.y)-j.min.y)/(N.min.y-j.min.y)).multiplyBy(u);l.panBy(at,{animate:!1}),this._draggable._newPos._add(at),this._draggable._startPos._add(at),Te(i._icon,this._draggable._newPos),this._onDrag(n),this._panRequest=J(this._adjustPan.bind(this,n))}},_onDragStart:function(){this._oldLatLng=this._marker.getLatLng(),this._marker.closePopup&&this._marker.closePopup(),this._marker.fire("movestart").fire("dragstart")},_onPreDrag:function(n){this._marker.options.autoPan&&(it(this._panRequest),this._panRequest=J(this._adjustPan.bind(this,n)))},_onDrag:function(n){var i=this._marker,l=i._shadow,u=ci(i._icon),g=i._map.layerPointToLatLng(u);l&&Te(l,u),i._latlng=g,n.latlng=g,n.oldLatLng=this._oldLatLng,i.fire("move",n).fire("drag",n)},_onDragEnd:function(n){it(this._panRequest),delete this._oldLatLng,this._marker.fire("moveend").fire("dragend",n)}}),Xr=mn.extend({options:{icon:new xr,interactive:!0,keyboard:!0,title:"",alt:"Marker",zIndexOffset:0,opacity:1,riseOnHover:!1,riseOffset:250,pane:"markerPane",shadowPane:"shadowPane",bubblingMouseEvents:!1,autoPanOnFocus:!0,draggable:!1,autoPan:!1,autoPanPadding:[50,50],autoPanSpeed:10},initialize:function(n,i){S(this,i),this._latlng=pt(n)},onAdd:function(n){this._zoomAnimated=this._zoomAnimated&&n.options.markerZoomAnimation,this._zoomAnimated&&n.on("zoomanim",this._animateZoom,this),this._initIcon(),this.update()},onRemove:function(n){this.dragging&&this.dragging.enabled()&&(this.options.draggable=!0,this.dragging.removeHooks()),delete this.dragging,this._zoomAnimated&&n.off("zoomanim",this._animateZoom,this),this._removeIcon(),this._removeShadow()},getEvents:function(){return{zoom:this.update,viewreset:this.update}},getLatLng:function(){return this._latlng},setLatLng:function(n){var i=this._latlng;return this._latlng=pt(n),this.update(),this.fire("move",{oldLatLng:i,latlng:this._latlng})},setZIndexOffset:function(n){return this.options.zIndexOffset=n,this.update()},getIcon:function(){return this.options.icon},setIcon:function(n){return this.options.icon=n,this._map&&(this._initIcon(),this.update()),this._popup&&this.bindPopup(this._popup,this._popup.options),this},getElement:function(){return this._icon},update:function(){if(this._icon&&this._map){var n=this._map.latLngToLayerPoint(this._latlng).round();this._setPos(n)}return this},_initIcon:function(){var n=this.options,i="leaflet-zoom-"+(this._zoomAnimated?"animated":"hide"),l=n.icon.createIcon(this._icon),u=!1;l!==this._icon&&(this._icon&&this._removeIcon(),u=!0,n.title&&(l.title=n.title),l.tagName==="IMG"&&(l.alt=n.alt||"")),Pt(l,i),n.keyboard&&(l.tabIndex="0",l.setAttribute("role","button")),this._icon=l,n.riseOnHover&&this.on({mouseover:this._bringToFront,mouseout:this._resetZIndex}),this.options.autoPanOnFocus&&jt(l,"focus",this._panOnFocus,this);var g=n.icon.createShadow(this._shadow),E=!1;g!==this._shadow&&(this._removeShadow(),E=!0),g&&(Pt(g,i),g.alt=""),this._shadow=g,n.opacity<1&&this._updateOpacity(),u&&this.getPane().appendChild(this._icon),this._initInteraction(),g&&E&&this.getPane(n.shadowPane).appendChild(this._shadow)},_removeIcon:function(){this.options.riseOnHover&&this.off({mouseover:this._bringToFront,mouseout:this._resetZIndex}),this.options.autoPanOnFocus&&ge(this._icon,"focus",this._panOnFocus,this),Ht(this._icon),this.removeInteractiveTarget(this._icon),this._icon=null},_removeShadow:function(){this._shadow&&Ht(this._shadow),this._shadow=null},_setPos:function(n){this._icon&&Te(this._icon,n),this._shadow&&Te(this._shadow,n),this._zIndex=n.y+this.options.zIndexOffset,this._resetZIndex()},_updateZIndex:function(n){this._icon&&(this._icon.style.zIndex=this._zIndex+n)},_animateZoom:function(n){var i=this._map._latLngToNewLayerPoint(this._latlng,n.zoom,n.center).round();this._setPos(i)},_initInteraction:function(){if(this.options.interactive&&(Pt(this._icon,"leaflet-interactive"),this.addInteractiveTarget(this._icon),Fa)){var n=this.options.draggable;this.dragging&&(n=this.dragging.enabled(),this.dragging.disable()),this.dragging=new Fa(this),n&&this.dragging.enable()}},setOpacity:function(n){return this.options.opacity=n,this._map&&this._updateOpacity(),this},_updateOpacity:function(){var n=this.options.opacity;this._icon&&He(this._icon,n),this._shadow&&He(this._shadow,n)},_bringToFront:function(){this._updateZIndex(this.options.riseOffset)},_resetZIndex:function(){this._updateZIndex(0)},_panOnFocus:function(){var n=this._map;if(n){var i=this.options.icon.options,l=i.iconSize?z(i.iconSize):z(0,0),u=i.iconAnchor?z(i.iconAnchor):z(0,0);n.panInside(this._latlng,{paddingTopLeft:u,paddingBottomRight:l.subtract(u)})}},_getPopupAnchor:function(){return this.options.icon.options.popupAnchor},_getTooltipAnchor:function(){return this.options.icon.options.tooltipAnchor}});function Kh(n,i){return new Xr(n,i)}var Xn=mn.extend({options:{stroke:!0,color:"#3388ff",weight:3,opacity:1,lineCap:"round",lineJoin:"round",dashArray:null,dashOffset:null,fill:!1,fillColor:null,fillOpacity:.2,fillRule:"evenodd",interactive:!0,bubblingMouseEvents:!0},beforeAdd:function(n){this._renderer=n.getRenderer(this)},onAdd:function(){this._renderer._initPath(this),this._reset(),this._renderer._addPath(this)},onRemove:function(){this._renderer._removePath(this)},redraw:function(){return this._map&&this._renderer._updatePath(this),this},setStyle:function(n){return S(this,n),this._renderer&&(this._renderer._updateStyle(this),this.options.stroke&&n&&Object.prototype.hasOwnProperty.call(n,"weight")&&this._updateBounds()),this},bringToFront:function(){return this._renderer&&this._renderer._bringToFront(this),this},bringToBack:function(){return this._renderer&&this._renderer._bringToBack(this),this},getElement:function(){return this._path},_reset:function(){this._project(),this._update()},_clickTolerance:function(){return(this.options.stroke?this.options.weight/2:0)+(this._renderer.options.tolerance||0)}}),Zr=Xn.extend({options:{fill:!0,radius:10},initialize:function(n,i){S(this,i),this._latlng=pt(n),this._radius=this.options.radius},setLatLng:function(n){var i=this._latlng;return this._latlng=pt(n),this.redraw(),this.fire("move",{oldLatLng:i,latlng:this._latlng})},getLatLng:function(){return this._latlng},setRadius:function(n){return this.options.radius=this._radius=n,this.redraw()},getRadius:function(){return this._radius},setStyle:function(n){var i=n&&n.radius||this._radius;return Xn.prototype.setStyle.call(this,n),this.setRadius(i),this},_project:function(){this._point=this._map.latLngToLayerPoint(this._latlng),this._updateBounds()},_updateBounds:function(){var n=this._radius,i=this._radiusY||n,l=this._clickTolerance(),u=[n+l,i+l];this._pxBounds=new nt(this._point.subtract(u),this._point.add(u))},_update:function(){this._map&&this._updatePath()},_updatePath:function(){this._renderer._updateCircle(this)},_empty:function(){return this._radius&&!this._renderer._bounds.intersects(this._pxBounds)},_containsPoint:function(n){return n.distanceTo(this._point)<=this._radius+this._clickTolerance()}});function $h(n,i){return new Zr(n,i)}var so=Zr.extend({initialize:function(n,i,l){if(typeof i=="number"&&(i=o({},l,{radius:i})),S(this,i),this._latlng=pt(n),isNaN(this.options.radius))throw new Error("Circle radius cannot be NaN");this._mRadius=this.options.radius},setRadius:function(n){return this._mRadius=n,this.redraw()},getRadius:function(){return this._mRadius},getBounds:function(){var n=[this._radius,this._radiusY||this._radius];return new W(this._map.layerPointToLatLng(this._point.subtract(n)),this._map.layerPointToLatLng(this._point.add(n)))},setStyle:Xn.prototype.setStyle,_project:function(){var n=this._latlng.lng,i=this._latlng.lat,l=this._map,u=l.options.crs;if(u.distance===Ut.distance){var g=Math.PI/180,E=this._mRadius/Ut.R/g,N=l.project([i+E,n]),H=l.project([i-E,n]),j=N.add(H).divideBy(2),at=l.unproject(j).lat,Mt=Math.acos((Math.cos(E*g)-Math.sin(i*g)*Math.sin(at*g))/(Math.cos(i*g)*Math.cos(at*g)))/g;(isNaN(Mt)||Mt===0)&&(Mt=E/Math.cos(Math.PI/180*i)),this._point=j.subtract(l.getPixelOrigin()),this._radius=isNaN(Mt)?0:j.x-l.project([at,n-Mt]).x,this._radiusY=j.y-N.y}else{var Ft=u.unproject(u.project(this._latlng).subtract([this._mRadius,0]));this._point=l.latLngToLayerPoint(this._latlng),this._radius=this._point.x-l.latLngToLayerPoint(Ft).x}this._updateBounds()}});function Jh(n,i,l){return new so(n,i,l)}var Rn=Xn.extend({options:{smoothFactor:1,noClip:!1},initialize:function(n,i){S(this,i),this._setLatLngs(n)},getLatLngs:function(){return this._latlngs},setLatLngs:function(n){return this._setLatLngs(n),this.redraw()},isEmpty:function(){return!this._latlngs.length},closestLayerPoint:function(n){for(var i=1/0,l=null,u=vr,g,E,N=0,H=this._parts.length;N<H;N++)for(var j=this._parts[N],at=1,Mt=j.length;at<Mt;at++){g=j[at-1],E=j[at];var Ft=u(n,g,E,!0);Ft<i&&(i=Ft,l=u(n,g,E))}return l&&(l.distance=Math.sqrt(i)),l},getCenter:function(){if(!this._map)throw new Error("Must add layer to map before using getCenter()");return Na(this._defaultShape(),this._map.options.crs)},getBounds:function(){return this._bounds},addLatLng:function(n,i){return i=i||this._defaultShape(),n=pt(n),i.push(n),this._bounds.extend(n),this.redraw()},_setLatLngs:function(n){this._bounds=new W,this._latlngs=this._convertLatLngs(n)},_defaultShape:function(){return ln(this._latlngs)?this._latlngs:this._latlngs[0]},_convertLatLngs:function(n){for(var i=[],l=ln(n),u=0,g=n.length;u<g;u++)l?(i[u]=pt(n[u]),this._bounds.extend(i[u])):i[u]=this._convertLatLngs(n[u]);return i},_project:function(){var n=new nt;this._rings=[],this._projectLatlngs(this._latlngs,this._rings,n),this._bounds.isValid()&&n.isValid()&&(this._rawPxBounds=n,this._updateBounds())},_updateBounds:function(){var n=this._clickTolerance(),i=new X(n,n);this._rawPxBounds&&(this._pxBounds=new nt([this._rawPxBounds.min.subtract(i),this._rawPxBounds.max.add(i)]))},_projectLatlngs:function(n,i,l){var u=n[0]instanceof ct,g=n.length,E,N;if(u){for(N=[],E=0;E<g;E++)N[E]=this._map.latLngToLayerPoint(n[E]),l.extend(N[E]);i.push(N)}else for(E=0;E<g;E++)this._projectLatlngs(n[E],i,l)},_clipPoints:function(){var n=this._renderer._bounds;if(this._parts=[],!(!this._pxBounds||!this._pxBounds.intersects(n))){if(this.options.noClip){this._parts=this._rings;return}var i=this._parts,l,u,g,E,N,H,j;for(l=0,g=0,E=this._rings.length;l<E;l++)for(j=this._rings[l],u=0,N=j.length;u<N-1;u++)H=Da(j[u],j[u+1],n,u,!0),H&&(i[g]=i[g]||[],i[g].push(H[0]),(H[1]!==j[u+1]||u===N-2)&&(i[g].push(H[1]),g++))}},_simplifyPoints:function(){for(var n=this._parts,i=this.options.smoothFactor,l=0,u=n.length;l<u;l++)n[l]=Ra(n[l],i)},_update:function(){this._map&&(this._clipPoints(),this._simplifyPoints(),this._updatePath())},_updatePath:function(){this._renderer._updatePoly(this)},_containsPoint:function(n,i){var l,u,g,E,N,H,j=this._clickTolerance();if(!this._pxBounds||!this._pxBounds.contains(n))return!1;for(l=0,E=this._parts.length;l<E;l++)for(H=this._parts[l],u=0,N=H.length,g=N-1;u<N;g=u++)if(!(!i&&u===0)&&Ca(n,H[g],H[u])<=j)return!0;return!1}});function Qh(n,i){return new Rn(n,i)}Rn._flat=Ua;var Pi=Rn.extend({options:{fill:!0},isEmpty:function(){return!this._latlngs.length||!this._latlngs[0].length},getCenter:function(){if(!this._map)throw new Error("Must add layer to map before using getCenter()");return Pa(this._defaultShape(),this._map.options.crs)},_convertLatLngs:function(n){var i=Rn.prototype._convertLatLngs.call(this,n),l=i.length;return l>=2&&i[0]instanceof ct&&i[0].equals(i[l-1])&&i.pop(),i},_setLatLngs:function(n){Rn.prototype._setLatLngs.call(this,n),ln(this._latlngs)&&(this._latlngs=[this._latlngs])},_defaultShape:function(){return ln(this._latlngs[0])?this._latlngs[0]:this._latlngs[0][0]},_clipPoints:function(){var n=this._renderer._bounds,i=this.options.weight,l=new X(i,i);if(n=new nt(n.min.subtract(l),n.max.add(l)),this._parts=[],!(!this._pxBounds||!this._pxBounds.intersects(n))){if(this.options.noClip){this._parts=this._rings;return}for(var u=0,g=this._rings.length,E;u<g;u++)E=La(this._rings[u],n,!0),E.length&&this._parts.push(E)}},_updatePath:function(){this._renderer._updatePoly(this,!0)},_containsPoint:function(n){var i=!1,l,u,g,E,N,H,j,at;if(!this._pxBounds||!this._pxBounds.contains(n))return!1;for(E=0,j=this._parts.length;E<j;E++)for(l=this._parts[E],N=0,at=l.length,H=at-1;N<at;H=N++)u=l[N],g=l[H],u.y>n.y!=g.y>n.y&&n.x<(g.x-u.x)*(n.y-u.y)/(g.y-u.y)+u.x&&(i=!i);return i||Rn.prototype._containsPoint.call(this,n,!0)}});function tu(n,i){return new Pi(n,i)}var Cn=Pn.extend({initialize:function(n,i){S(this,i),this._layers={},n&&this.addData(n)},addData:function(n){var i=b(n)?n:n.features,l,u,g;if(i){for(l=0,u=i.length;l<u;l++)g=i[l],(g.geometries||g.geometry||g.features||g.coordinates)&&this.addData(g);return this}var E=this.options;if(E.filter&&!E.filter(n))return this;var N=qr(n,E);return N?(N.feature=Kr(n),N.defaultOptions=N.options,this.resetStyle(N),E.onEachFeature&&E.onEachFeature(n,N),this.addLayer(N)):this},resetStyle:function(n){return n===void 0?this.eachLayer(this.resetStyle,this):(n.options=o({},n.defaultOptions),this._setLayerStyle(n,this.options.style),this)},setStyle:function(n){return this.eachLayer(function(i){this._setLayerStyle(i,n)},this)},_setLayerStyle:function(n,i){n.setStyle&&(typeof i=="function"&&(i=i(n.feature)),n.setStyle(i))}});function qr(n,i){var l=n.type==="Feature"?n.geometry:n,u=l?l.coordinates:null,g=[],E=i&&i.pointToLayer,N=i&&i.coordsToLatLng||oo,H,j,at,Mt;if(!u&&!l)return null;switch(l.type){case"Point":return H=N(u),Ba(E,n,H,i);case"MultiPoint":for(at=0,Mt=u.length;at<Mt;at++)H=N(u[at]),g.push(Ba(E,n,H,i));return new Pn(g);case"LineString":case"MultiLineString":return j=Yr(u,l.type==="LineString"?0:1,N),new Rn(j,i);case"Polygon":case"MultiPolygon":return j=Yr(u,l.type==="Polygon"?1:2,N),new Pi(j,i);case"GeometryCollection":for(at=0,Mt=l.geometries.length;at<Mt;at++){var Ft=qr({geometry:l.geometries[at],type:"Feature",properties:n.properties},i);Ft&&g.push(Ft)}return new Pn(g);case"FeatureCollection":for(at=0,Mt=l.features.length;at<Mt;at++){var ee=qr(l.features[at],i);ee&&g.push(ee)}return new Pn(g);default:throw new Error("Invalid GeoJSON object.")}}function Ba(n,i,l,u){return n?n(i,l):new Xr(l,u&&u.markersInheritOptions&&u)}function oo(n){return new ct(n[1],n[0],n[2])}function Yr(n,i,l){for(var u=[],g=0,E=n.length,N;g<E;g++)N=i?Yr(n[g],i-1,l):(l||oo)(n[g]),u.push(N);return u}function ao(n,i){return n=pt(n),n.alt!==void 0?[v(n.lng,i),v(n.lat,i),v(n.alt,i)]:[v(n.lng,i),v(n.lat,i)]}function jr(n,i,l,u){for(var g=[],E=0,N=n.length;E<N;E++)g.push(i?jr(n[E],ln(n[E])?0:i-1,l,u):ao(n[E],u));return!i&&l&&g.length>0&&g.push(g[0].slice()),g}function Ri(n,i){return n.feature?o({},n.feature,{geometry:i}):Kr(i)}function Kr(n){return n.type==="Feature"||n.type==="FeatureCollection"?n:{type:"Feature",properties:{},geometry:n}}var lo={toGeoJSON:function(n){return Ri(this,{type:"Point",coordinates:ao(this.getLatLng(),n)})}};Xr.include(lo),so.include(lo),Zr.include(lo),Rn.include({toGeoJSON:function(n){var i=!ln(this._latlngs),l=jr(this._latlngs,i?1:0,!1,n);return Ri(this,{type:(i?"Multi":"")+"LineString",coordinates:l})}}),Pi.include({toGeoJSON:function(n){var i=!ln(this._latlngs),l=i&&!ln(this._latlngs[0]),u=jr(this._latlngs,l?2:i?1:0,!0,n);return i||(u=[u]),Ri(this,{type:(l?"Multi":"")+"Polygon",coordinates:u})}}),Ai.include({toMultiPoint:function(n){var i=[];return this.eachLayer(function(l){i.push(l.toGeoJSON(n).geometry.coordinates)}),Ri(this,{type:"MultiPoint",coordinates:i})},toGeoJSON:function(n){var i=this.feature&&this.feature.geometry&&this.feature.geometry.type;if(i==="MultiPoint")return this.toMultiPoint(n);var l=i==="GeometryCollection",u=[];return this.eachLayer(function(g){if(g.toGeoJSON){var E=g.toGeoJSON(n);if(l)u.push(E.geometry);else{var N=Kr(E);N.type==="FeatureCollection"?u.push.apply(u,N.features):u.push(N)}}}),l?Ri(this,{geometries:u,type:"GeometryCollection"}):{type:"FeatureCollection",features:u}}});function za(n,i){return new Cn(n,i)}var eu=za,$r=mn.extend({options:{opacity:1,alt:"",interactive:!1,crossOrigin:!1,errorOverlayUrl:"",zIndex:1,className:""},initialize:function(n,i,l){this._url=n,this._bounds=rt(i),S(this,l)},onAdd:function(){this._image||(this._initImage(),this.options.opacity<1&&this._updateOpacity()),this.options.interactive&&(Pt(this._image,"leaflet-interactive"),this.addInteractiveTarget(this._image)),this.getPane().appendChild(this._image),this._reset()},onRemove:function(){Ht(this._image),this.options.interactive&&this.removeInteractiveTarget(this._image)},setOpacity:function(n){return this.options.opacity=n,this._image&&this._updateOpacity(),this},setStyle:function(n){return n.opacity&&this.setOpacity(n.opacity),this},bringToFront:function(){return this._map&&Ln(this._image),this},bringToBack:function(){return this._map&&an(this._image),this},setUrl:function(n){return this._url=n,this._image&&(this._image.src=n),this},setBounds:function(n){return this._bounds=rt(n),this._map&&this._reset(),this},getEvents:function(){var n={zoom:this._reset,viewreset:this._reset};return this._zoomAnimated&&(n.zoomanim=this._animateZoom),n},setZIndex:function(n){return this.options.zIndex=n,this._updateZIndex(),this},getBounds:function(){return this._bounds},getElement:function(){return this._image},_initImage:function(){var n=this._url.tagName==="IMG",i=this._image=n?this._url:se("img");if(Pt(i,"leaflet-image-layer"),this._zoomAnimated&&Pt(i,"leaflet-zoom-animated"),this.options.className&&Pt(i,this.options.className),i.onselectstart=_,i.onmousemove=_,i.onload=h(this.fire,this,"load"),i.onerror=h(this._overlayOnError,this,"error"),(this.options.crossOrigin||this.options.crossOrigin==="")&&(i.crossOrigin=this.options.crossOrigin===!0?"":this.options.crossOrigin),this.options.zIndex&&this._updateZIndex(),n){this._url=i.src;return}i.src=this._url,i.alt=this.options.alt},_animateZoom:function(n){var i=this._map.getZoomScale(n.zoom),l=this._map._latLngBoundsToNewLayerBounds(this._bounds,n.zoom,n.center).min;li(this._image,l,i)},_reset:function(){var n=this._image,i=new nt(this._map.latLngToLayerPoint(this._bounds.getNorthWest()),this._map.latLngToLayerPoint(this._bounds.getSouthEast())),l=i.getSize();Te(n,i.min),n.style.width=l.x+"px",n.style.height=l.y+"px"},_updateOpacity:function(){He(this._image,this.options.opacity)},_updateZIndex:function(){this._image&&this.options.zIndex!==void 0&&this.options.zIndex!==null&&(this._image.style.zIndex=this.options.zIndex)},_overlayOnError:function(){this.fire("error");var n=this.options.errorOverlayUrl;n&&this._url!==n&&(this._url=n,this._image.src=n)},getCenter:function(){return this._bounds.getCenter()}}),nu=function(n,i,l){return new $r(n,i,l)},ka=$r.extend({options:{autoplay:!0,loop:!0,keepAspectRatio:!0,muted:!1,playsInline:!0},_initImage:function(){var n=this._url.tagName==="VIDEO",i=this._image=n?this._url:se("video");if(Pt(i,"leaflet-image-layer"),this._zoomAnimated&&Pt(i,"leaflet-zoom-animated"),this.options.className&&Pt(i,this.options.className),i.onselectstart=_,i.onmousemove=_,i.onloadeddata=h(this.fire,this,"load"),n){for(var l=i.getElementsByTagName("source"),u=[],g=0;g<l.length;g++)u.push(l[g].src);this._url=l.length>0?u:[i.src];return}b(this._url)||(this._url=[this._url]),!this.options.keepAspectRatio&&Object.prototype.hasOwnProperty.call(i.style,"objectFit")&&(i.style.objectFit="fill"),i.autoplay=!!this.options.autoplay,i.loop=!!this.options.loop,i.muted=!!this.options.muted,i.playsInline=!!this.options.playsInline;for(var E=0;E<this._url.length;E++){var N=se("source");N.src=this._url[E],i.appendChild(N)}}});function iu(n,i,l){return new ka(n,i,l)}var Ha=$r.extend({_initImage:function(){var n=this._image=this._url;Pt(n,"leaflet-image-layer"),this._zoomAnimated&&Pt(n,"leaflet-zoom-animated"),this.options.className&&Pt(n,this.options.className),n.onselectstart=_,n.onmousemove=_}});function ru(n,i,l){return new Ha(n,i,l)}var bn=mn.extend({options:{interactive:!1,offset:[0,0],className:"",pane:void 0,content:""},initialize:function(n,i){n&&(n instanceof ct||b(n))?(this._latlng=pt(n),S(this,i)):(S(this,n),this._source=i),this.options.content&&(this._content=this.options.content)},openOn:function(n){return n=arguments.length?n:this._source._map,n.hasLayer(this)||n.addLayer(this),this},close:function(){return this._map&&this._map.removeLayer(this),this},toggle:function(n){return this._map?this.close():(arguments.length?this._source=n:n=this._source,this._prepareOpen(),this.openOn(n._map)),this},onAdd:function(n){this._zoomAnimated=n._zoomAnimated,this._container||this._initLayout(),n._fadeAnimated&&He(this._container,0),clearTimeout(this._removeTimeout),this.getPane().appendChild(this._container),this.update(),n._fadeAnimated&&He(this._container,1),this.bringToFront(),this.options.interactive&&(Pt(this._container,"leaflet-interactive"),this.addInteractiveTarget(this._container))},onRemove:function(n){n._fadeAnimated?(He(this._container,0),this._removeTimeout=setTimeout(h(Ht,void 0,this._container),200)):Ht(this._container),this.options.interactive&&(he(this._container,"leaflet-interactive"),this.removeInteractiveTarget(this._container))},getLatLng:function(){return this._latlng},setLatLng:function(n){return this._latlng=pt(n),this._map&&(this._updatePosition(),this._adjustPan()),this},getContent:function(){return this._content},setContent:function(n){return this._content=n,this.update(),this},getElement:function(){return this._container},update:function(){this._map&&(this._container.style.visibility="hidden",this._updateContent(),this._updateLayout(),this._updatePosition(),this._container.style.visibility="",this._adjustPan())},getEvents:function(){var n={zoom:this._updatePosition,viewreset:this._updatePosition};return this._zoomAnimated&&(n.zoomanim=this._animateZoom),n},isOpen:function(){return!!this._map&&this._map.hasLayer(this)},bringToFront:function(){return this._map&&Ln(this._container),this},bringToBack:function(){return this._map&&an(this._container),this},_prepareOpen:function(n){var i=this._source;if(!i._map)return!1;if(i instanceof Pn){i=null;var l=this._source._layers;for(var u in l)if(l[u]._map){i=l[u];break}if(!i)return!1;this._source=i}if(!n)if(i.getCenter)n=i.getCenter();else if(i.getLatLng)n=i.getLatLng();else if(i.getBounds)n=i.getBounds().getCenter();else throw new Error("Unable to get source layer LatLng.");return this.setLatLng(n),this._map&&this.update(),!0},_updateContent:function(){if(this._content){var n=this._contentNode,i=typeof this._content=="function"?this._content(this._source||this):this._content;if(typeof i=="string")n.innerHTML=i;else{for(;n.hasChildNodes();)n.removeChild(n.firstChild);n.appendChild(i)}this.fire("contentupdate")}},_updatePosition:function(){if(this._map){var n=this._map.latLngToLayerPoint(this._latlng),i=z(this.options.offset),l=this._getAnchor();this._zoomAnimated?Te(this._container,n.add(l)):i=i.add(n).add(l);var u=this._containerBottom=-i.y,g=this._containerLeft=-Math.round(this._containerWidth/2)+i.x;this._container.style.bottom=u+"px",this._container.style.left=g+"px"}},_getAnchor:function(){return[0,0]}});ae.include({_initOverlay:function(n,i,l,u){var g=i;return g instanceof n||(g=new n(u).setContent(i)),l&&g.setLatLng(l),g}}),mn.include({_initOverlay:function(n,i,l,u){var g=l;return g instanceof n?(S(g,u),g._source=this):(g=i&&!u?i:new n(u,this),g.setContent(l)),g}});var Jr=bn.extend({options:{pane:"popupPane",offset:[0,7],maxWidth:300,minWidth:50,maxHeight:null,autoPan:!0,autoPanPaddingTopLeft:null,autoPanPaddingBottomRight:null,autoPanPadding:[5,5],keepInView:!1,closeButton:!0,autoClose:!0,closeOnEscapeKey:!0,className:""},openOn:function(n){return n=arguments.length?n:this._source._map,!n.hasLayer(this)&&n._popup&&n._popup.options.autoClose&&n.removeLayer(n._popup),n._popup=this,bn.prototype.openOn.call(this,n)},onAdd:function(n){bn.prototype.onAdd.call(this,n),n.fire("popupopen",{popup:this}),this._source&&(this._source.fire("popupopen",{popup:this},!0),this._source instanceof Xn||this._source.on("preclick",hi))},onRemove:function(n){bn.prototype.onRemove.call(this,n),n.fire("popupclose",{popup:this}),this._source&&(this._source.fire("popupclose",{popup:this},!0),this._source instanceof Xn||this._source.off("preclick",hi))},getEvents:function(){var n=bn.prototype.getEvents.call(this);return(this.options.closeOnClick!==void 0?this.options.closeOnClick:this._map.options.closePopupOnClick)&&(n.preclick=this.close),this.options.keepInView&&(n.moveend=this._adjustPan),n},_initLayout:function(){var n="leaflet-popup",i=this._container=se("div",n+" "+(this.options.className||"")+" leaflet-zoom-animated"),l=this._wrapper=se("div",n+"-content-wrapper",i);if(this._contentNode=se("div",n+"-content",l),_r(i),$s(this._contentNode),jt(i,"contextmenu",hi),this._tipContainer=se("div",n+"-tip-container",i),this._tip=se("div",n+"-tip",this._tipContainer),this.options.closeButton){var u=this._closeButton=se("a",n+"-close-button",i);u.setAttribute("role","button"),u.setAttribute("aria-label","Close popup"),u.href="#close",u.innerHTML='<span aria-hidden="true">&#215;</span>',jt(u,"click",function(g){Be(g),this.close()},this)}},_updateLayout:function(){var n=this._contentNode,i=n.style;i.width="",i.whiteSpace="nowrap";var l=n.offsetWidth;l=Math.min(l,this.options.maxWidth),l=Math.max(l,this.options.minWidth),i.width=l+1+"px",i.whiteSpace="",i.height="";var u=n.offsetHeight,g=this.options.maxHeight,E="leaflet-popup-scrolled";g&&u>g?(i.height=g+"px",Pt(n,E)):he(n,E),this._containerWidth=this._container.offsetWidth},_animateZoom:function(n){var i=this._map._latLngToNewLayerPoint(this._latlng,n.zoom,n.center),l=this._getAnchor();Te(this._container,i.add(l))},_adjustPan:function(){if(this.options.autoPan){if(this._map._panAnim&&this._map._panAnim.stop(),this._autopanning){this._autopanning=!1;return}var n=this._map,i=parseInt(Xt(this._container,"marginBottom"),10)||0,l=this._container.offsetHeight+i,u=this._containerWidth,g=new X(this._containerLeft,-l-this._containerBottom);g._add(ci(this._container));var E=n.layerPointToContainerPoint(g),N=z(this.options.autoPanPadding),H=z(this.options.autoPanPaddingTopLeft||N),j=z(this.options.autoPanPaddingBottomRight||N),at=n.getSize(),Mt=0,Ft=0;E.x+u+j.x>at.x&&(Mt=E.x+u-at.x+j.x),E.x-Mt-H.x<0&&(Mt=E.x-H.x),E.y+l+j.y>at.y&&(Ft=E.y+l-at.y+j.y),E.y-Ft-H.y<0&&(Ft=E.y-H.y),(Mt||Ft)&&(this.options.keepInView&&(this._autopanning=!0),n.fire("autopanstart").panBy([Mt,Ft]))}},_getAnchor:function(){return z(this._source&&this._source._getPopupAnchor?this._source._getPopupAnchor():[0,0])}}),su=function(n,i){return new Jr(n,i)};ae.mergeOptions({closePopupOnClick:!0}),ae.include({openPopup:function(n,i,l){return this._initOverlay(Jr,n,i,l).openOn(this),this},closePopup:function(n){return n=arguments.length?n:this._popup,n&&n.close(),this}}),mn.include({bindPopup:function(n,i){return this._popup=this._initOverlay(Jr,this._popup,n,i),this._popupHandlersAdded||(this.on({click:this._openPopup,keypress:this._onKeyPress,remove:this.closePopup,move:this._movePopup}),this._popupHandlersAdded=!0),this},unbindPopup:function(){return this._popup&&(this.off({click:this._openPopup,keypress:this._onKeyPress,remove:this.closePopup,move:this._movePopup}),this._popupHandlersAdded=!1,this._popup=null),this},openPopup:function(n){return this._popup&&(this instanceof Pn||(this._popup._source=this),this._popup._prepareOpen(n||this._latlng)&&this._popup.openOn(this._map)),this},closePopup:function(){return this._popup&&this._popup.close(),this},togglePopup:function(){return this._popup&&this._popup.toggle(this),this},isPopupOpen:function(){return this._popup?this._popup.isOpen():!1},setPopupContent:function(n){return this._popup&&this._popup.setContent(n),this},getPopup:function(){return this._popup},_openPopup:function(n){if(!(!this._popup||!this._map)){ui(n);var i=n.layer||n.target;if(this._popup._source===i&&!(i instanceof Xn)){this._map.hasLayer(this._popup)?this.closePopup():this.openPopup(n.latlng);return}this._popup._source=i,this.openPopup(n.latlng)}},_movePopup:function(n){this._popup.setLatLng(n.latlng)},_onKeyPress:function(n){n.originalEvent.keyCode===13&&this._openPopup(n)}});var Qr=bn.extend({options:{pane:"tooltipPane",offset:[0,0],direction:"auto",permanent:!1,sticky:!1,opacity:.9},onAdd:function(n){bn.prototype.onAdd.call(this,n),this.setOpacity(this.options.opacity),n.fire("tooltipopen",{tooltip:this}),this._source&&(this.addEventParent(this._source),this._source.fire("tooltipopen",{tooltip:this},!0))},onRemove:function(n){bn.prototype.onRemove.call(this,n),n.fire("tooltipclose",{tooltip:this}),this._source&&(this.removeEventParent(this._source),this._source.fire("tooltipclose",{tooltip:this},!0))},getEvents:function(){var n=bn.prototype.getEvents.call(this);return this.options.permanent||(n.preclick=this.close),n},_initLayout:function(){var n="leaflet-tooltip",i=n+" "+(this.options.className||"")+" leaflet-zoom-"+(this._zoomAnimated?"animated":"hide");this._contentNode=this._container=se("div",i),this._container.setAttribute("role","tooltip"),this._container.setAttribute("id","leaflet-tooltip-"+d(this))},_updateLayout:function(){},_adjustPan:function(){},_setPosition:function(n){var i,l,u=this._map,g=this._container,E=u.latLngToContainerPoint(u.getCenter()),N=u.layerPointToContainerPoint(n),H=this.options.direction,j=g.offsetWidth,at=g.offsetHeight,Mt=z(this.options.offset),Ft=this._getAnchor();H==="top"?(i=j/2,l=at):H==="bottom"?(i=j/2,l=0):H==="center"?(i=j/2,l=at/2):H==="right"?(i=0,l=at/2):H==="left"?(i=j,l=at/2):N.x<E.x?(H="right",i=0,l=at/2):(H="left",i=j+(Mt.x+Ft.x)*2,l=at/2),n=n.subtract(z(i,l,!0)).add(Mt).add(Ft),he(g,"leaflet-tooltip-right"),he(g,"leaflet-tooltip-left"),he(g,"leaflet-tooltip-top"),he(g,"leaflet-tooltip-bottom"),Pt(g,"leaflet-tooltip-"+H),Te(g,n)},_updatePosition:function(){var n=this._map.latLngToLayerPoint(this._latlng);this._setPosition(n)},setOpacity:function(n){this.options.opacity=n,this._container&&He(this._container,n)},_animateZoom:function(n){var i=this._map._latLngToNewLayerPoint(this._latlng,n.zoom,n.center);this._setPosition(i)},_getAnchor:function(){return z(this._source&&this._source._getTooltipAnchor&&!this.options.sticky?this._source._getTooltipAnchor():[0,0])}}),ou=function(n,i){return new Qr(n,i)};ae.include({openTooltip:function(n,i,l){return this._initOverlay(Qr,n,i,l).openOn(this),this},closeTooltip:function(n){return n.close(),this}}),mn.include({bindTooltip:function(n,i){return this._tooltip&&this.isTooltipOpen()&&this.unbindTooltip(),this._tooltip=this._initOverlay(Qr,this._tooltip,n,i),this._initTooltipInteractions(),this._tooltip.options.permanent&&this._map&&this._map.hasLayer(this)&&this.openTooltip(),this},unbindTooltip:function(){return this._tooltip&&(this._initTooltipInteractions(!0),this.closeTooltip(),this._tooltip=null),this},_initTooltipInteractions:function(n){if(!(!n&&this._tooltipHandlersAdded)){var i=n?"off":"on",l={remove:this.closeTooltip,move:this._moveTooltip};this._tooltip.options.permanent?l.add=this._openTooltip:(l.mouseover=this._openTooltip,l.mouseout=this.closeTooltip,l.click=this._openTooltip,this._map?this._addFocusListeners():l.add=this._addFocusListeners),this._tooltip.options.sticky&&(l.mousemove=this._moveTooltip),this[i](l),this._tooltipHandlersAdded=!n}},openTooltip:function(n){return this._tooltip&&(this instanceof Pn||(this._tooltip._source=this),this._tooltip._prepareOpen(n)&&(this._tooltip.openOn(this._map),this.getElement?this._setAriaDescribedByOnLayer(this):this.eachLayer&&this.eachLayer(this._setAriaDescribedByOnLayer,this))),this},closeTooltip:function(){if(this._tooltip)return this._tooltip.close()},toggleTooltip:function(){return this._tooltip&&this._tooltip.toggle(this),this},isTooltipOpen:function(){return this._tooltip.isOpen()},setTooltipContent:function(n){return this._tooltip&&this._tooltip.setContent(n),this},getTooltip:function(){return this._tooltip},_addFocusListeners:function(){this.getElement?this._addFocusListenersOnLayer(this):this.eachLayer&&this.eachLayer(this._addFocusListenersOnLayer,this)},_addFocusListenersOnLayer:function(n){var i=typeof n.getElement=="function"&&n.getElement();i&&(jt(i,"focus",function(){this._tooltip._source=n,this.openTooltip()},this),jt(i,"blur",this.closeTooltip,this))},_setAriaDescribedByOnLayer:function(n){var i=typeof n.getElement=="function"&&n.getElement();i&&i.setAttribute("aria-describedby",this._tooltip._container.id)},_openTooltip:function(n){if(!(!this._tooltip||!this._map)){if(this._map.dragging&&this._map.dragging.moving()&&!this._openOnceFlag){this._openOnceFlag=!0;var i=this;this._map.once("moveend",function(){i._openOnceFlag=!1,i._openTooltip(n)});return}this._tooltip._source=n.layer||n.target,this.openTooltip(this._tooltip.options.sticky?n.latlng:void 0)}},_moveTooltip:function(n){var i=n.latlng,l,u;this._tooltip.options.sticky&&n.originalEvent&&(l=this._map.mouseEventToContainerPoint(n.originalEvent),u=this._map.containerPointToLayerPoint(l),i=this._map.layerPointToLatLng(u)),this._tooltip.setLatLng(i)}});var Ga=Li.extend({options:{iconSize:[12,12],html:!1,bgPos:null,className:"leaflet-div-icon"},createIcon:function(n){var i=n&&n.tagName==="DIV"?n:document.createElement("div"),l=this.options;if(l.html instanceof Element?(on(i),i.appendChild(l.html)):i.innerHTML=l.html!==!1?l.html:"",l.bgPos){var u=z(l.bgPos);i.style.backgroundPosition=-u.x+"px "+-u.y+"px"}return this._setIconStyles(i,"icon"),i},createShadow:function(){return null}});function au(n){return new Ga(n)}Li.Default=xr;var yr=mn.extend({options:{tileSize:256,opacity:1,updateWhenIdle:bt.mobile,updateWhenZooming:!0,updateInterval:200,zIndex:1,bounds:null,minZoom:0,maxZoom:void 0,maxNativeZoom:void 0,minNativeZoom:void 0,noWrap:!1,pane:"tilePane",className:"",keepBuffer:2},initialize:function(n){S(this,n)},onAdd:function(){this._initContainer(),this._levels={},this._tiles={},this._resetView()},beforeAdd:function(n){n._addZoomLimit(this)},onRemove:function(n){this._removeAllTiles(),Ht(this._container),n._removeZoomLimit(this),this._container=null,this._tileZoom=void 0},bringToFront:function(){return this._map&&(Ln(this._container),this._setAutoZIndex(Math.max)),this},bringToBack:function(){return this._map&&(an(this._container),this._setAutoZIndex(Math.min)),this},getContainer:function(){return this._container},setOpacity:function(n){return this.options.opacity=n,this._updateOpacity(),this},setZIndex:function(n){return this.options.zIndex=n,this._updateZIndex(),this},isLoading:function(){return this._loading},redraw:function(){if(this._map){this._removeAllTiles();var n=this._clampZoom(this._map.getZoom());n!==this._tileZoom&&(this._tileZoom=n,this._updateLevels()),this._update()}return this},getEvents:function(){var n={viewprereset:this._invalidateAll,viewreset:this._resetView,zoom:this._resetView,moveend:this._onMoveEnd};return this.options.updateWhenIdle||(this._onMove||(this._onMove=f(this._onMoveEnd,this.options.updateInterval,this)),n.move=this._onMove),this._zoomAnimated&&(n.zoomanim=this._animateZoom),n},createTile:function(){return document.createElement("div")},getTileSize:function(){var n=this.options.tileSize;return n instanceof X?n:new X(n,n)},_updateZIndex:function(){this._container&&this.options.zIndex!==void 0&&this.options.zIndex!==null&&(this._container.style.zIndex=this.options.zIndex)},_setAutoZIndex:function(n){for(var i=this.getPane().children,l=-n(-1/0,1/0),u=0,g=i.length,E;u<g;u++)E=i[u].style.zIndex,i[u]!==this._container&&E&&(l=n(l,+E));isFinite(l)&&(this.options.zIndex=l+n(-1,1),this._updateZIndex())},_updateOpacity:function(){if(this._map&&!bt.ielt9){He(this._container,this.options.opacity);var n=+new Date,i=!1,l=!1;for(var u in this._tiles){var g=this._tiles[u];if(!(!g.current||!g.loaded)){var E=Math.min(1,(n-g.loaded)/200);He(g.el,E),E<1?i=!0:(g.active?l=!0:this._onOpaqueTile(g),g.active=!0)}}l&&!this._noPrune&&this._pruneTiles(),i&&(it(this._fadeFrame),this._fadeFrame=J(this._updateOpacity,this))}},_onOpaqueTile:_,_initContainer:function(){this._container||(this._container=se("div","leaflet-layer "+(this.options.className||"")),this._updateZIndex(),this.options.opacity<1&&this._updateOpacity(),this.getPane().appendChild(this._container))},_updateLevels:function(){var n=this._tileZoom,i=this.options.maxZoom;if(n!==void 0){for(var l in this._levels)l=Number(l),this._levels[l].el.children.length||l===n?(this._levels[l].el.style.zIndex=i-Math.abs(n-l),this._onUpdateLevel(l)):(Ht(this._levels[l].el),this._removeTilesAtZoom(l),this._onRemoveLevel(l),delete this._levels[l]);var u=this._levels[n],g=this._map;return u||(u=this._levels[n]={},u.el=se("div","leaflet-tile-container leaflet-zoom-animated",this._container),u.el.style.zIndex=i,u.origin=g.project(g.unproject(g.getPixelOrigin()),n).round(),u.zoom=n,this._setZoomTransform(u,g.getCenter(),g.getZoom()),_(u.el.offsetWidth),this._onCreateLevel(u)),this._level=u,u}},_onUpdateLevel:_,_onRemoveLevel:_,_onCreateLevel:_,_pruneTiles:function(){if(this._map){var n,i,l=this._map.getZoom();if(l>this.options.maxZoom||l<this.options.minZoom){this._removeAllTiles();return}for(n in this._tiles)i=this._tiles[n],i.retain=i.current;for(n in this._tiles)if(i=this._tiles[n],i.current&&!i.active){var u=i.coords;this._retainParent(u.x,u.y,u.z,u.z-5)||this._retainChildren(u.x,u.y,u.z,u.z+2)}for(n in this._tiles)this._tiles[n].retain||this._removeTile(n)}},_removeTilesAtZoom:function(n){for(var i in this._tiles)this._tiles[i].coords.z===n&&this._removeTile(i)},_removeAllTiles:function(){for(var n in this._tiles)this._removeTile(n)},_invalidateAll:function(){for(var n in this._levels)Ht(this._levels[n].el),this._onRemoveLevel(Number(n)),delete this._levels[n];this._removeAllTiles(),this._tileZoom=void 0},_retainParent:function(n,i,l,u){var g=Math.floor(n/2),E=Math.floor(i/2),N=l-1,H=new X(+g,+E);H.z=+N;var j=this._tileCoordsToKey(H),at=this._tiles[j];return at&&at.active?(at.retain=!0,!0):(at&&at.loaded&&(at.retain=!0),N>u?this._retainParent(g,E,N,u):!1)},_retainChildren:function(n,i,l,u){for(var g=2*n;g<2*n+2;g++)for(var E=2*i;E<2*i+2;E++){var N=new X(g,E);N.z=l+1;var H=this._tileCoordsToKey(N),j=this._tiles[H];if(j&&j.active){j.retain=!0;continue}else j&&j.loaded&&(j.retain=!0);l+1<u&&this._retainChildren(g,E,l+1,u)}},_resetView:function(n){var i=n&&(n.pinch||n.flyTo);this._setView(this._map.getCenter(),this._map.getZoom(),i,i)},_animateZoom:function(n){this._setView(n.center,n.zoom,!0,n.noUpdate)},_clampZoom:function(n){var i=this.options;return i.minNativeZoom!==void 0&&n<i.minNativeZoom?i.minNativeZoom:i.maxNativeZoom!==void 0&&i.maxNativeZoom<n?i.maxNativeZoom:n},_setView:function(n,i,l,u){var g=Math.round(i);this.options.maxZoom!==void 0&&g>this.options.maxZoom||this.options.minZoom!==void 0&&g<this.options.minZoom?g=void 0:g=this._clampZoom(g);var E=this.options.updateWhenZooming&&g!==this._tileZoom;(!u||E)&&(this._tileZoom=g,this._abortLoading&&this._abortLoading(),this._updateLevels(),this._resetGrid(),g!==void 0&&this._update(n),l||this._pruneTiles(),this._noPrune=!!l),this._setZoomTransforms(n,i)},_setZoomTransforms:function(n,i){for(var l in this._levels)this._setZoomTransform(this._levels[l],n,i)},_setZoomTransform:function(n,i,l){var u=this._map.getZoomScale(l,n.zoom),g=n.origin.multiplyBy(u).subtract(this._map._getNewPixelOrigin(i,l)).round();bt.any3d?li(n.el,g,u):Te(n.el,g)},_resetGrid:function(){var n=this._map,i=n.options.crs,l=this._tileSize=this.getTileSize(),u=this._tileZoom,g=this._map.getPixelWorldBounds(this._tileZoom);g&&(this._globalTileRange=this._pxBoundsToTileRange(g)),this._wrapX=i.wrapLng&&!this.options.noWrap&&[Math.floor(n.project([0,i.wrapLng[0]],u).x/l.x),Math.ceil(n.project([0,i.wrapLng[1]],u).x/l.y)],this._wrapY=i.wrapLat&&!this.options.noWrap&&[Math.floor(n.project([i.wrapLat[0],0],u).y/l.x),Math.ceil(n.project([i.wrapLat[1],0],u).y/l.y)]},_onMoveEnd:function(){!this._map||this._map._animatingZoom||this._update()},_getTiledPixelBounds:function(n){var i=this._map,l=i._animatingZoom?Math.max(i._animateToZoom,i.getZoom()):i.getZoom(),u=i.getZoomScale(l,this._tileZoom),g=i.project(n,this._tileZoom).floor(),E=i.getSize().divideBy(u*2);return new nt(g.subtract(E),g.add(E))},_update:function(n){var i=this._map;if(i){var l=this._clampZoom(i.getZoom());if(n===void 0&&(n=i.getCenter()),this._tileZoom!==void 0){var u=this._getTiledPixelBounds(n),g=this._pxBoundsToTileRange(u),E=g.getCenter(),N=[],H=this.options.keepBuffer,j=new nt(g.getBottomLeft().subtract([H,-H]),g.getTopRight().add([H,-H]));if(!(isFinite(g.min.x)&&isFinite(g.min.y)&&isFinite(g.max.x)&&isFinite(g.max.y)))throw new Error("Attempted to load an infinite number of tiles");for(var at in this._tiles){var Mt=this._tiles[at].coords;(Mt.z!==this._tileZoom||!j.contains(new X(Mt.x,Mt.y)))&&(this._tiles[at].current=!1)}if(Math.abs(l-this._tileZoom)>1){this._setView(n,l);return}for(var Ft=g.min.y;Ft<=g.max.y;Ft++)for(var ee=g.min.x;ee<=g.max.x;ee++){var Xe=new X(ee,Ft);if(Xe.z=this._tileZoom,!!this._isValidTile(Xe)){var Ce=this._tiles[this._tileCoordsToKey(Xe)];Ce?Ce.current=!0:N.push(Xe)}}if(N.sort(function(Ke,Ii){return Ke.distanceTo(E)-Ii.distanceTo(E)}),N.length!==0){this._loading||(this._loading=!0,this.fire("loading"));var cn=document.createDocumentFragment();for(ee=0;ee<N.length;ee++)this._addTile(N[ee],cn);this._level.el.appendChild(cn)}}}},_isValidTile:function(n){var i=this._map.options.crs;if(!i.infinite){var l=this._globalTileRange;if(!i.wrapLng&&(n.x<l.min.x||n.x>l.max.x)||!i.wrapLat&&(n.y<l.min.y||n.y>l.max.y))return!1}if(!this.options.bounds)return!0;var u=this._tileCoordsToBounds(n);return rt(this.options.bounds).overlaps(u)},_keyToBounds:function(n){return this._tileCoordsToBounds(this._keyToTileCoords(n))},_tileCoordsToNwSe:function(n){var i=this._map,l=this.getTileSize(),u=n.scaleBy(l),g=u.add(l),E=i.unproject(u,n.z),N=i.unproject(g,n.z);return[E,N]},_tileCoordsToBounds:function(n){var i=this._tileCoordsToNwSe(n),l=new W(i[0],i[1]);return this.options.noWrap||(l=this._map.wrapLatLngBounds(l)),l},_tileCoordsToKey:function(n){return n.x+":"+n.y+":"+n.z},_keyToTileCoords:function(n){var i=n.split(":"),l=new X(+i[0],+i[1]);return l.z=+i[2],l},_removeTile:function(n){var i=this._tiles[n];i&&(Ht(i.el),delete this._tiles[n],this.fire("tileunload",{tile:i.el,coords:this._keyToTileCoords(n)}))},_initTile:function(n){Pt(n,"leaflet-tile");var i=this.getTileSize();n.style.width=i.x+"px",n.style.height=i.y+"px",n.onselectstart=_,n.onmousemove=_,bt.ielt9&&this.options.opacity<1&&He(n,this.options.opacity)},_addTile:function(n,i){var l=this._getTilePos(n),u=this._tileCoordsToKey(n),g=this.createTile(this._wrapCoords(n),h(this._tileReady,this,n));this._initTile(g),this.createTile.length<2&&J(h(this._tileReady,this,n,null,g)),Te(g,l),this._tiles[u]={el:g,coords:n,current:!0},i.appendChild(g),this.fire("tileloadstart",{tile:g,coords:n})},_tileReady:function(n,i,l){i&&this.fire("tileerror",{error:i,tile:l,coords:n});var u=this._tileCoordsToKey(n);l=this._tiles[u],l&&(l.loaded=+new Date,this._map._fadeAnimated?(He(l.el,0),it(this._fadeFrame),this._fadeFrame=J(this._updateOpacity,this)):(l.active=!0,this._pruneTiles()),i||(Pt(l.el,"leaflet-tile-loaded"),this.fire("tileload",{tile:l.el,coords:n})),this._noTilesToLoad()&&(this._loading=!1,this.fire("load"),bt.ielt9||!this._map._fadeAnimated?J(this._pruneTiles,this):setTimeout(h(this._pruneTiles,this),250)))},_getTilePos:function(n){return n.scaleBy(this.getTileSize()).subtract(this._level.origin)},_wrapCoords:function(n){var i=new X(this._wrapX?p(n.x,this._wrapX):n.x,this._wrapY?p(n.y,this._wrapY):n.y);return i.z=n.z,i},_pxBoundsToTileRange:function(n){var i=this.getTileSize();return new nt(n.min.unscaleBy(i).floor(),n.max.unscaleBy(i).ceil().subtract([1,1]))},_noTilesToLoad:function(){for(var n in this._tiles)if(!this._tiles[n].loaded)return!1;return!0}});function lu(n){return new yr(n)}var Ci=yr.extend({options:{minZoom:0,maxZoom:18,subdomains:"abc",errorTileUrl:"",zoomOffset:0,tms:!1,zoomReverse:!1,detectRetina:!1,crossOrigin:!1,referrerPolicy:!1},initialize:function(n,i){this._url=n,i=S(this,i),i.detectRetina&&bt.retina&&i.maxZoom>0?(i.tileSize=Math.floor(i.tileSize/2),i.zoomReverse?(i.zoomOffset--,i.minZoom=Math.min(i.maxZoom,i.minZoom+1)):(i.zoomOffset++,i.maxZoom=Math.max(i.minZoom,i.maxZoom-1)),i.minZoom=Math.max(0,i.minZoom)):i.zoomReverse?i.minZoom=Math.min(i.maxZoom,i.minZoom):i.maxZoom=Math.max(i.minZoom,i.maxZoom),typeof i.subdomains=="string"&&(i.subdomains=i.subdomains.split("")),this.on("tileunload",this._onTileRemove)},setUrl:function(n,i){return this._url===n&&i===void 0&&(i=!0),this._url=n,i||this.redraw(),this},createTile:function(n,i){var l=document.createElement("img");return jt(l,"load",h(this._tileOnLoad,this,i,l)),jt(l,"error",h(this._tileOnError,this,i,l)),(this.options.crossOrigin||this.options.crossOrigin==="")&&(l.crossOrigin=this.options.crossOrigin===!0?"":this.options.crossOrigin),typeof this.options.referrerPolicy=="string"&&(l.referrerPolicy=this.options.referrerPolicy),l.alt="",l.src=this.getTileUrl(n),l},getTileUrl:function(n){var i={r:bt.retina?"@2x":"",s:this._getSubdomain(n),x:n.x,y:n.y,z:this._getZoomForUrl()};if(this._map&&!this._map.options.crs.infinite){var l=this._globalTileRange.max.y-n.y;this.options.tms&&(i.y=l),i["-y"]=l}return P(this._url,o(i,this.options))},_tileOnLoad:function(n,i){bt.ielt9?setTimeout(h(n,this,null,i),0):n(null,i)},_tileOnError:function(n,i,l){var u=this.options.errorTileUrl;u&&i.getAttribute("src")!==u&&(i.src=u),n(l,i)},_onTileRemove:function(n){n.tile.onload=null},_getZoomForUrl:function(){var n=this._tileZoom,i=this.options.maxZoom,l=this.options.zoomReverse,u=this.options.zoomOffset;return l&&(n=i-n),n+u},_getSubdomain:function(n){var i=Math.abs(n.x+n.y)%this.options.subdomains.length;return this.options.subdomains[i]},_abortLoading:function(){var n,i;for(n in this._tiles)if(this._tiles[n].coords.z!==this._tileZoom&&(i=this._tiles[n].el,i.onload=_,i.onerror=_,!i.complete)){i.src=B;var l=this._tiles[n].coords;Ht(i),delete this._tiles[n],this.fire("tileabort",{tile:i,coords:l})}},_removeTile:function(n){var i=this._tiles[n];if(i)return i.el.setAttribute("src",B),yr.prototype._removeTile.call(this,n)},_tileReady:function(n,i,l){if(!(!this._map||l&&l.getAttribute("src")===B))return yr.prototype._tileReady.call(this,n,i,l)}});function Va(n,i){return new Ci(n,i)}var Wa=Ci.extend({defaultWmsParams:{service:"WMS",request:"GetMap",layers:"",styles:"",format:"image/jpeg",transparent:!1,version:"1.1.1"},options:{crs:null,uppercase:!1},initialize:function(n,i){this._url=n;var l=o({},this.defaultWmsParams);for(var u in i)u in this.options||(l[u]=i[u]);i=S(this,i);var g=i.detectRetina&&bt.retina?2:1,E=this.getTileSize();l.width=E.x*g,l.height=E.y*g,this.wmsParams=l},onAdd:function(n){this._crs=this.options.crs||n.options.crs,this._wmsVersion=parseFloat(this.wmsParams.version);var i=this._wmsVersion>=1.3?"crs":"srs";this.wmsParams[i]=this._crs.code,Ci.prototype.onAdd.call(this,n)},getTileUrl:function(n){var i=this._tileCoordsToNwSe(n),l=this._crs,u=ot(l.project(i[0]),l.project(i[1])),g=u.min,E=u.max,N=(this._wmsVersion>=1.3&&this._crs===Oa?[g.y,g.x,E.y,E.x]:[g.x,g.y,E.x,E.y]).join(","),H=Ci.prototype.getTileUrl.call(this,n);return H+x(this.wmsParams,H,this.options.uppercase)+(this.options.uppercase?"&BBOX=":"&bbox=")+N},setParams:function(n,i){return o(this.wmsParams,n),i||this.redraw(),this}});function cu(n,i){return new Wa(n,i)}Ci.WMS=Wa,Va.wms=cu;var In=mn.extend({options:{padding:.1},initialize:function(n){S(this,n),d(this),this._layers=this._layers||{}},onAdd:function(){this._container||(this._initContainer(),Pt(this._container,"leaflet-zoom-animated")),this.getPane().appendChild(this._container),this._update(),this.on("update",this._updatePaths,this)},onRemove:function(){this.off("update",this._updatePaths,this),this._destroyContainer()},getEvents:function(){var n={viewreset:this._reset,zoom:this._onZoom,moveend:this._update,zoomend:this._onZoomEnd};return this._zoomAnimated&&(n.zoomanim=this._onAnimZoom),n},_onAnimZoom:function(n){this._updateTransform(n.center,n.zoom)},_onZoom:function(){this._updateTransform(this._map.getCenter(),this._map.getZoom())},_updateTransform:function(n,i){var l=this._map.getZoomScale(i,this._zoom),u=this._map.getSize().multiplyBy(.5+this.options.padding),g=this._map.project(this._center,i),E=u.multiplyBy(-l).add(g).subtract(this._map._getNewPixelOrigin(n,i));bt.any3d?li(this._container,E,l):Te(this._container,E)},_reset:function(){this._update(),this._updateTransform(this._center,this._zoom);for(var n in this._layers)this._layers[n]._reset()},_onZoomEnd:function(){for(var n in this._layers)this._layers[n]._project()},_updatePaths:function(){for(var n in this._layers)this._layers[n]._update()},_update:function(){var n=this.options.padding,i=this._map.getSize(),l=this._map.containerPointToLayerPoint(i.multiplyBy(-n)).round();this._bounds=new nt(l,l.add(i.multiplyBy(1+n*2)).round()),this._center=this._map.getCenter(),this._zoom=this._map.getZoom()}}),Xa=In.extend({options:{tolerance:0},getEvents:function(){var n=In.prototype.getEvents.call(this);return n.viewprereset=this._onViewPreReset,n},_onViewPreReset:function(){this._postponeUpdatePaths=!0},onAdd:function(){In.prototype.onAdd.call(this),this._draw()},_initContainer:function(){var n=this._container=document.createElement("canvas");jt(n,"mousemove",this._onMouseMove,this),jt(n,"click dblclick mousedown mouseup contextmenu",this._onClick,this),jt(n,"mouseout",this._handleMouseOut,this),n._leaflet_disable_events=!0,this._ctx=n.getContext("2d")},_destroyContainer:function(){it(this._redrawRequest),delete this._ctx,Ht(this._container),ge(this._container),delete this._container},_updatePaths:function(){if(!this._postponeUpdatePaths){var n;this._redrawBounds=null;for(var i in this._layers)n=this._layers[i],n._update();this._redraw()}},_update:function(){if(!(this._map._animatingZoom&&this._bounds)){In.prototype._update.call(this);var n=this._bounds,i=this._container,l=n.getSize(),u=bt.retina?2:1;Te(i,n.min),i.width=u*l.x,i.height=u*l.y,i.style.width=l.x+"px",i.style.height=l.y+"px",bt.retina&&this._ctx.scale(2,2),this._ctx.translate(-n.min.x,-n.min.y),this.fire("update")}},_reset:function(){In.prototype._reset.call(this),this._postponeUpdatePaths&&(this._postponeUpdatePaths=!1,this._updatePaths())},_initPath:function(n){this._updateDashArray(n),this._layers[d(n)]=n;var i=n._order={layer:n,prev:this._drawLast,next:null};this._drawLast&&(this._drawLast.next=i),this._drawLast=i,this._drawFirst=this._drawFirst||this._drawLast},_addPath:function(n){this._requestRedraw(n)},_removePath:function(n){var i=n._order,l=i.next,u=i.prev;l?l.prev=u:this._drawLast=u,u?u.next=l:this._drawFirst=l,delete n._order,delete this._layers[d(n)],this._requestRedraw(n)},_updatePath:function(n){this._extendRedrawBounds(n),n._project(),n._update(),this._requestRedraw(n)},_updateStyle:function(n){this._updateDashArray(n),this._requestRedraw(n)},_updateDashArray:function(n){if(typeof n.options.dashArray=="string"){var i=n.options.dashArray.split(/[, ]+/),l=[],u,g;for(g=0;g<i.length;g++){if(u=Number(i[g]),isNaN(u))return;l.push(u)}n.options._dashArray=l}else n.options._dashArray=n.options.dashArray},_requestRedraw:function(n){this._map&&(this._extendRedrawBounds(n),this._redrawRequest=this._redrawRequest||J(this._redraw,this))},_extendRedrawBounds:function(n){if(n._pxBounds){var i=(n.options.weight||0)+1;this._redrawBounds=this._redrawBounds||new nt,this._redrawBounds.extend(n._pxBounds.min.subtract([i,i])),this._redrawBounds.extend(n._pxBounds.max.add([i,i]))}},_redraw:function(){this._redrawRequest=null,this._redrawBounds&&(this._redrawBounds.min._floor(),this._redrawBounds.max._ceil()),this._clear(),this._draw(),this._redrawBounds=null},_clear:function(){var n=this._redrawBounds;if(n){var i=n.getSize();this._ctx.clearRect(n.min.x,n.min.y,i.x,i.y)}else this._ctx.save(),this._ctx.setTransform(1,0,0,1,0,0),this._ctx.clearRect(0,0,this._container.width,this._container.height),this._ctx.restore()},_draw:function(){var n,i=this._redrawBounds;if(this._ctx.save(),i){var l=i.getSize();this._ctx.beginPath(),this._ctx.rect(i.min.x,i.min.y,l.x,l.y),this._ctx.clip()}this._drawing=!0;for(var u=this._drawFirst;u;u=u.next)n=u.layer,(!i||n._pxBounds&&n._pxBounds.intersects(i))&&n._updatePath();this._drawing=!1,this._ctx.restore()},_updatePoly:function(n,i){if(this._drawing){var l,u,g,E,N=n._parts,H=N.length,j=this._ctx;if(H){for(j.beginPath(),l=0;l<H;l++){for(u=0,g=N[l].length;u<g;u++)E=N[l][u],j[u?"lineTo":"moveTo"](E.x,E.y);i&&j.closePath()}this._fillStroke(j,n)}}},_updateCircle:function(n){if(!(!this._drawing||n._empty())){var i=n._point,l=this._ctx,u=Math.max(Math.round(n._radius),1),g=(Math.max(Math.round(n._radiusY),1)||u)/u;g!==1&&(l.save(),l.scale(1,g)),l.beginPath(),l.arc(i.x,i.y/g,u,0,Math.PI*2,!1),g!==1&&l.restore(),this._fillStroke(l,n)}},_fillStroke:function(n,i){var l=i.options;l.fill&&(n.globalAlpha=l.fillOpacity,n.fillStyle=l.fillColor||l.color,n.fill(l.fillRule||"evenodd")),l.stroke&&l.weight!==0&&(n.setLineDash&&n.setLineDash(i.options&&i.options._dashArray||[]),n.globalAlpha=l.opacity,n.lineWidth=l.weight,n.strokeStyle=l.color,n.lineCap=l.lineCap,n.lineJoin=l.lineJoin,n.stroke())},_onClick:function(n){for(var i=this._map.mouseEventToLayerPoint(n),l,u,g=this._drawFirst;g;g=g.next)l=g.layer,l.options.interactive&&l._containsPoint(i)&&(!(n.type==="click"||n.type==="preclick")||!this._map._draggableMoved(l))&&(u=l);this._fireEvent(u?[u]:!1,n)},_onMouseMove:function(n){if(!(!this._map||this._map.dragging.moving()||this._map._animatingZoom)){var i=this._map.mouseEventToLayerPoint(n);this._handleMouseHover(n,i)}},_handleMouseOut:function(n){var i=this._hoveredLayer;i&&(he(this._container,"leaflet-interactive"),this._fireEvent([i],n,"mouseout"),this._hoveredLayer=null,this._mouseHoverThrottled=!1)},_handleMouseHover:function(n,i){if(!this._mouseHoverThrottled){for(var l,u,g=this._drawFirst;g;g=g.next)l=g.layer,l.options.interactive&&l._containsPoint(i)&&(u=l);u!==this._hoveredLayer&&(this._handleMouseOut(n),u&&(Pt(this._container,"leaflet-interactive"),this._fireEvent([u],n,"mouseover"),this._hoveredLayer=u)),this._fireEvent(this._hoveredLayer?[this._hoveredLayer]:!1,n),this._mouseHoverThrottled=!0,setTimeout(h(function(){this._mouseHoverThrottled=!1},this),32)}},_fireEvent:function(n,i,l){this._map._fireDOMEvent(i,l||i.type,n)},_bringToFront:function(n){var i=n._order;if(i){var l=i.next,u=i.prev;if(l)l.prev=u;else return;u?u.next=l:l&&(this._drawFirst=l),i.prev=this._drawLast,this._drawLast.next=i,i.next=null,this._drawLast=i,this._requestRedraw(n)}},_bringToBack:function(n){var i=n._order;if(i){var l=i.next,u=i.prev;if(u)u.next=l;else return;l?l.prev=u:u&&(this._drawLast=u),i.prev=null,i.next=this._drawFirst,this._drawFirst.prev=i,this._drawFirst=i,this._requestRedraw(n)}}});function Za(n){return bt.canvas?new Xa(n):null}var Mr=function(){try{return document.namespaces.add("lvml","urn:schemas-microsoft-com:vml"),function(n){return document.createElement("<lvml:"+n+' class="lvml">')}}catch{}return function(n){return document.createElement("<"+n+' xmlns="urn:schemas-microsoft.com:vml" class="lvml">')}}(),hu={_initContainer:function(){this._container=se("div","leaflet-vml-container")},_update:function(){this._map._animatingZoom||(In.prototype._update.call(this),this.fire("update"))},_initPath:function(n){var i=n._container=Mr("shape");Pt(i,"leaflet-vml-shape "+(this.options.className||"")),i.coordsize="1 1",n._path=Mr("path"),i.appendChild(n._path),this._updateStyle(n),this._layers[d(n)]=n},_addPath:function(n){var i=n._container;this._container.appendChild(i),n.options.interactive&&n.addInteractiveTarget(i)},_removePath:function(n){var i=n._container;Ht(i),n.removeInteractiveTarget(i),delete this._layers[d(n)]},_updateStyle:function(n){var i=n._stroke,l=n._fill,u=n.options,g=n._container;g.stroked=!!u.stroke,g.filled=!!u.fill,u.stroke?(i||(i=n._stroke=Mr("stroke")),g.appendChild(i),i.weight=u.weight+"px",i.color=u.color,i.opacity=u.opacity,u.dashArray?i.dashStyle=b(u.dashArray)?u.dashArray.join(" "):u.dashArray.replace(/( *, *)/g," "):i.dashStyle="",i.endcap=u.lineCap.replace("butt","flat"),i.joinstyle=u.lineJoin):i&&(g.removeChild(i),n._stroke=null),u.fill?(l||(l=n._fill=Mr("fill")),g.appendChild(l),l.color=u.fillColor||u.color,l.opacity=u.fillOpacity):l&&(g.removeChild(l),n._fill=null)},_updateCircle:function(n){var i=n._point.round(),l=Math.round(n._radius),u=Math.round(n._radiusY||l);this._setPath(n,n._empty()?"M0 0":"AL "+i.x+","+i.y+" "+l+","+u+" 0,"+65535*360)},_setPath:function(n,i){n._path.v=i},_bringToFront:function(n){Ln(n._container)},_bringToBack:function(n){an(n._container)}},ts=bt.vml?Mr:Gt,Sr=In.extend({_initContainer:function(){this._container=ts("svg"),this._container.setAttribute("pointer-events","none"),this._rootGroup=ts("g"),this._container.appendChild(this._rootGroup)},_destroyContainer:function(){Ht(this._container),ge(this._container),delete this._container,delete this._rootGroup,delete this._svgSize},_update:function(){if(!(this._map._animatingZoom&&this._bounds)){In.prototype._update.call(this);var n=this._bounds,i=n.getSize(),l=this._container;(!this._svgSize||!this._svgSize.equals(i))&&(this._svgSize=i,l.setAttribute("width",i.x),l.setAttribute("height",i.y)),Te(l,n.min),l.setAttribute("viewBox",[n.min.x,n.min.y,i.x,i.y].join(" ")),this.fire("update")}},_initPath:function(n){var i=n._path=ts("path");n.options.className&&Pt(i,n.options.className),n.options.interactive&&Pt(i,"leaflet-interactive"),this._updateStyle(n),this._layers[d(n)]=n},_addPath:function(n){this._rootGroup||this._initContainer(),this._rootGroup.appendChild(n._path),n.addInteractiveTarget(n._path)},_removePath:function(n){Ht(n._path),n.removeInteractiveTarget(n._path),delete this._layers[d(n)]},_updatePath:function(n){n._project(),n._update()},_updateStyle:function(n){var i=n._path,l=n.options;i&&(l.stroke?(i.setAttribute("stroke",l.color),i.setAttribute("stroke-opacity",l.opacity),i.setAttribute("stroke-width",l.weight),i.setAttribute("stroke-linecap",l.lineCap),i.setAttribute("stroke-linejoin",l.lineJoin),l.dashArray?i.setAttribute("stroke-dasharray",l.dashArray):i.removeAttribute("stroke-dasharray"),l.dashOffset?i.setAttribute("stroke-dashoffset",l.dashOffset):i.removeAttribute("stroke-dashoffset")):i.setAttribute("stroke","none"),l.fill?(i.setAttribute("fill",l.fillColor||l.color),i.setAttribute("fill-opacity",l.fillOpacity),i.setAttribute("fill-rule",l.fillRule||"evenodd")):i.setAttribute("fill","none"))},_updatePoly:function(n,i){this._setPath(n,wt(n._parts,i))},_updateCircle:function(n){var i=n._point,l=Math.max(Math.round(n._radius),1),u=Math.max(Math.round(n._radiusY),1)||l,g="a"+l+","+u+" 0 1,0 ",E=n._empty()?"M0 0":"M"+(i.x-l)+","+i.y+g+l*2+",0 "+g+-l*2+",0 ";this._setPath(n,E)},_setPath:function(n,i){n._path.setAttribute("d",i)},_bringToFront:function(n){Ln(n._path)},_bringToBack:function(n){an(n._path)}});bt.vml&&Sr.include(hu);function qa(n){return bt.svg||bt.vml?new Sr(n):null}ae.include({getRenderer:function(n){var i=n.options.renderer||this._getPaneRenderer(n.options.pane)||this.options.renderer||this._renderer;return i||(i=this._renderer=this._createRenderer()),this.hasLayer(i)||this.addLayer(i),i},_getPaneRenderer:function(n){if(n==="overlayPane"||n===void 0)return!1;var i=this._paneRenderers[n];return i===void 0&&(i=this._createRenderer({pane:n}),this._paneRenderers[n]=i),i},_createRenderer:function(n){return this.options.preferCanvas&&Za(n)||qa(n)}});var Ya=Pi.extend({initialize:function(n,i){Pi.prototype.initialize.call(this,this._boundsToLatLngs(n),i)},setBounds:function(n){return this.setLatLngs(this._boundsToLatLngs(n))},_boundsToLatLngs:function(n){return n=rt(n),[n.getSouthWest(),n.getNorthWest(),n.getNorthEast(),n.getSouthEast()]}});function uu(n,i){return new Ya(n,i)}Sr.create=ts,Sr.pointsToPath=wt,Cn.geometryToLayer=qr,Cn.coordsToLatLng=oo,Cn.coordsToLatLngs=Yr,Cn.latLngToCoords=ao,Cn.latLngsToCoords=jr,Cn.getFeature=Ri,Cn.asFeature=Kr,ae.mergeOptions({boxZoom:!0});var ja=Tn.extend({initialize:function(n){this._map=n,this._container=n._container,this._pane=n._panes.overlayPane,this._resetStateTimeout=0,n.on("unload",this._destroy,this)},addHooks:function(){jt(this._container,"mousedown",this._onMouseDown,this)},removeHooks:function(){ge(this._container,"mousedown",this._onMouseDown,this)},moved:function(){return this._moved},_destroy:function(){Ht(this._pane),delete this._pane},_resetState:function(){this._resetStateTimeout=0,this._moved=!1},_clearDeferredResetState:function(){this._resetStateTimeout!==0&&(clearTimeout(this._resetStateTimeout),this._resetStateTimeout=0)},_onMouseDown:function(n){if(!n.shiftKey||n.which!==1&&n.button!==1)return!1;this._clearDeferredResetState(),this._resetState(),fr(),Vs(),this._startPoint=this._map.mouseEventToContainerPoint(n),jt(document,{contextmenu:ui,mousemove:this._onMouseMove,mouseup:this._onMouseUp,keydown:this._onKeyDown},this)},_onMouseMove:function(n){this._moved||(this._moved=!0,this._box=se("div","leaflet-zoom-box",this._container),Pt(this._container,"leaflet-crosshair"),this._map.fire("boxzoomstart")),this._point=this._map.mouseEventToContainerPoint(n);var i=new nt(this._point,this._startPoint),l=i.getSize();Te(this._box,i.min),this._box.style.width=l.x+"px",this._box.style.height=l.y+"px"},_finish:function(){this._moved&&(Ht(this._box),he(this._container,"leaflet-crosshair")),pr(),Ws(),ge(document,{contextmenu:ui,mousemove:this._onMouseMove,mouseup:this._onMouseUp,keydown:this._onKeyDown},this)},_onMouseUp:function(n){if(!(n.which!==1&&n.button!==1)&&(this._finish(),!!this._moved)){this._clearDeferredResetState(),this._resetStateTimeout=setTimeout(h(this._resetState,this),0);var i=new W(this._map.containerPointToLatLng(this._startPoint),this._map.containerPointToLatLng(this._point));this._map.fitBounds(i).fire("boxzoomend",{boxZoomBounds:i})}},_onKeyDown:function(n){n.keyCode===27&&(this._finish(),this._clearDeferredResetState(),this._resetState())}});ae.addInitHook("addHandler","boxZoom",ja),ae.mergeOptions({doubleClickZoom:!0});var Ka=Tn.extend({addHooks:function(){this._map.on("dblclick",this._onDoubleClick,this)},removeHooks:function(){this._map.off("dblclick",this._onDoubleClick,this)},_onDoubleClick:function(n){var i=this._map,l=i.getZoom(),u=i.options.zoomDelta,g=n.originalEvent.shiftKey?l-u:l+u;i.options.doubleClickZoom==="center"?i.setZoom(g):i.setZoomAround(n.containerPoint,g)}});ae.addInitHook("addHandler","doubleClickZoom",Ka),ae.mergeOptions({dragging:!0,inertia:!0,inertiaDeceleration:3400,inertiaMaxSpeed:1/0,easeLinearity:.2,worldCopyJump:!1,maxBoundsViscosity:0});var $a=Tn.extend({addHooks:function(){if(!this._draggable){var n=this._map;this._draggable=new Wn(n._mapPane,n._container),this._draggable.on({dragstart:this._onDragStart,drag:this._onDrag,dragend:this._onDragEnd},this),this._draggable.on("predrag",this._onPreDragLimit,this),n.options.worldCopyJump&&(this._draggable.on("predrag",this._onPreDragWrap,this),n.on("zoomend",this._onZoomEnd,this),n.whenReady(this._onZoomEnd,this))}Pt(this._map._container,"leaflet-grab leaflet-touch-drag"),this._draggable.enable(),this._positions=[],this._times=[]},removeHooks:function(){he(this._map._container,"leaflet-grab"),he(this._map._container,"leaflet-touch-drag"),this._draggable.disable()},moved:function(){return this._draggable&&this._draggable._moved},moving:function(){return this._draggable&&this._draggable._moving},_onDragStart:function(){var n=this._map;if(n._stop(),this._map.options.maxBounds&&this._map.options.maxBoundsViscosity){var i=rt(this._map.options.maxBounds);this._offsetLimit=ot(this._map.latLngToContainerPoint(i.getNorthWest()).multiplyBy(-1),this._map.latLngToContainerPoint(i.getSouthEast()).multiplyBy(-1).add(this._map.getSize())),this._viscosity=Math.min(1,Math.max(0,this._map.options.maxBoundsViscosity))}else this._offsetLimit=null;n.fire("movestart").fire("dragstart"),n.options.inertia&&(this._positions=[],this._times=[])},_onDrag:function(n){if(this._map.options.inertia){var i=this._lastTime=+new Date,l=this._lastPos=this._draggable._absPos||this._draggable._newPos;this._positions.push(l),this._times.push(i),this._prunePositions(i)}this._map.fire("move",n).fire("drag",n)},_prunePositions:function(n){for(;this._positions.length>1&&n-this._times[0]>50;)this._positions.shift(),this._times.shift()},_onZoomEnd:function(){var n=this._map.getSize().divideBy(2),i=this._map.latLngToLayerPoint([0,0]);this._initialWorldOffset=i.subtract(n).x,this._worldWidth=this._map.getPixelWorldBounds().getSize().x},_viscousLimit:function(n,i){return n-(n-i)*this._viscosity},_onPreDragLimit:function(){if(!(!this._viscosity||!this._offsetLimit)){var n=this._draggable._newPos.subtract(this._draggable._startPos),i=this._offsetLimit;n.x<i.min.x&&(n.x=this._viscousLimit(n.x,i.min.x)),n.y<i.min.y&&(n.y=this._viscousLimit(n.y,i.min.y)),n.x>i.max.x&&(n.x=this._viscousLimit(n.x,i.max.x)),n.y>i.max.y&&(n.y=this._viscousLimit(n.y,i.max.y)),this._draggable._newPos=this._draggable._startPos.add(n)}},_onPreDragWrap:function(){var n=this._worldWidth,i=Math.round(n/2),l=this._initialWorldOffset,u=this._draggable._newPos.x,g=(u-i+l)%n+i-l,E=(u+i+l)%n-i-l,N=Math.abs(g+l)<Math.abs(E+l)?g:E;this._draggable._absPos=this._draggable._newPos.clone(),this._draggable._newPos.x=N},_onDragEnd:function(n){var i=this._map,l=i.options,u=!l.inertia||n.noInertia||this._times.length<2;if(i.fire("dragend",n),u)i.fire("moveend");else{this._prunePositions(+new Date);var g=this._lastPos.subtract(this._positions[0]),E=(this._lastTime-this._times[0])/1e3,N=l.easeLinearity,H=g.multiplyBy(N/E),j=H.distanceTo([0,0]),at=Math.min(l.inertiaMaxSpeed,j),Mt=H.multiplyBy(at/j),Ft=at/(l.inertiaDeceleration*N),ee=Mt.multiplyBy(-Ft/2).round();!ee.x&&!ee.y?i.fire("moveend"):(ee=i._limitOffset(ee,i.options.maxBounds),J(function(){i.panBy(ee,{duration:Ft,easeLinearity:N,noMoveStart:!0,animate:!0})}))}}});ae.addInitHook("addHandler","dragging",$a),ae.mergeOptions({keyboard:!0,keyboardPanDelta:80});var Ja=Tn.extend({keyCodes:{left:[37],right:[39],down:[40],up:[38],zoomIn:[187,107,61,171],zoomOut:[189,109,54,173]},initialize:function(n){this._map=n,this._setPanDelta(n.options.keyboardPanDelta),this._setZoomDelta(n.options.zoomDelta)},addHooks:function(){var n=this._map._container;n.tabIndex<=0&&(n.tabIndex="0"),jt(n,{focus:this._onFocus,blur:this._onBlur,mousedown:this._onMouseDown},this),this._map.on({focus:this._addHooks,blur:this._removeHooks},this)},removeHooks:function(){this._removeHooks(),ge(this._map._container,{focus:this._onFocus,blur:this._onBlur,mousedown:this._onMouseDown},this),this._map.off({focus:this._addHooks,blur:this._removeHooks},this)},_onMouseDown:function(){if(!this._focused){var n=document.body,i=document.documentElement,l=n.scrollTop||i.scrollTop,u=n.scrollLeft||i.scrollLeft;this._map._container.focus(),window.scrollTo(u,l)}},_onFocus:function(){this._focused=!0,this._map.fire("focus")},_onBlur:function(){this._focused=!1,this._map.fire("blur")},_setPanDelta:function(n){var i=this._panKeys={},l=this.keyCodes,u,g;for(u=0,g=l.left.length;u<g;u++)i[l.left[u]]=[-1*n,0];for(u=0,g=l.right.length;u<g;u++)i[l.right[u]]=[n,0];for(u=0,g=l.down.length;u<g;u++)i[l.down[u]]=[0,n];for(u=0,g=l.up.length;u<g;u++)i[l.up[u]]=[0,-1*n]},_setZoomDelta:function(n){var i=this._zoomKeys={},l=this.keyCodes,u,g;for(u=0,g=l.zoomIn.length;u<g;u++)i[l.zoomIn[u]]=n;for(u=0,g=l.zoomOut.length;u<g;u++)i[l.zoomOut[u]]=-n},_addHooks:function(){jt(document,"keydown",this._onKeyDown,this)},_removeHooks:function(){ge(document,"keydown",this._onKeyDown,this)},_onKeyDown:function(n){if(!(n.altKey||n.ctrlKey||n.metaKey)){var i=n.keyCode,l=this._map,u;if(i in this._panKeys){if(!l._panAnim||!l._panAnim._inProgress)if(u=this._panKeys[i],n.shiftKey&&(u=z(u).multiplyBy(3)),l.options.maxBounds&&(u=l._limitOffset(z(u),l.options.maxBounds)),l.options.worldCopyJump){var g=l.wrapLatLng(l.unproject(l.project(l.getCenter()).add(u)));l.panTo(g)}else l.panBy(u)}else if(i in this._zoomKeys)l.setZoom(l.getZoom()+(n.shiftKey?3:1)*this._zoomKeys[i]);else if(i===27&&l._popup&&l._popup.options.closeOnEscapeKey)l.closePopup();else return;ui(n)}}});ae.addInitHook("addHandler","keyboard",Ja),ae.mergeOptions({scrollWheelZoom:!0,wheelDebounceTime:40,wheelPxPerZoomLevel:60});var Qa=Tn.extend({addHooks:function(){jt(this._map._container,"wheel",this._onWheelScroll,this),this._delta=0},removeHooks:function(){ge(this._map._container,"wheel",this._onWheelScroll,this)},_onWheelScroll:function(n){var i=Ea(n),l=this._map.options.wheelDebounceTime;this._delta+=i,this._lastMousePos=this._map.mouseEventToContainerPoint(n),this._startTime||(this._startTime=+new Date);var u=Math.max(l-(+new Date-this._startTime),0);clearTimeout(this._timer),this._timer=setTimeout(h(this._performZoom,this),u),ui(n)},_performZoom:function(){var n=this._map,i=n.getZoom(),l=this._map.options.zoomSnap||0;n._stop();var u=this._delta/(this._map.options.wheelPxPerZoomLevel*4),g=4*Math.log(2/(1+Math.exp(-Math.abs(u))))/Math.LN2,E=l?Math.ceil(g/l)*l:g,N=n._limitZoom(i+(this._delta>0?E:-E))-i;this._delta=0,this._startTime=null,N&&(n.options.scrollWheelZoom==="center"?n.setZoom(i+N):n.setZoomAround(this._lastMousePos,i+N))}});ae.addInitHook("addHandler","scrollWheelZoom",Qa);var du=600;ae.mergeOptions({tapHold:bt.touchNative&&bt.safari&&bt.mobile,tapTolerance:15});var tl=Tn.extend({addHooks:function(){jt(this._map._container,"touchstart",this._onDown,this)},removeHooks:function(){ge(this._map._container,"touchstart",this._onDown,this)},_onDown:function(n){if(clearTimeout(this._holdTimeout),n.touches.length===1){var i=n.touches[0];this._startPos=this._newPos=new X(i.clientX,i.clientY),this._holdTimeout=setTimeout(h(function(){this._cancel(),this._isTapValid()&&(jt(document,"touchend",Be),jt(document,"touchend touchcancel",this._cancelClickPrevent),this._simulateEvent("contextmenu",i))},this),du),jt(document,"touchend touchcancel contextmenu",this._cancel,this),jt(document,"touchmove",this._onMove,this)}},_cancelClickPrevent:function n(){ge(document,"touchend",Be),ge(document,"touchend touchcancel",n)},_cancel:function(){clearTimeout(this._holdTimeout),ge(document,"touchend touchcancel contextmenu",this._cancel,this),ge(document,"touchmove",this._onMove,this)},_onMove:function(n){var i=n.touches[0];this._newPos=new X(i.clientX,i.clientY)},_isTapValid:function(){return this._newPos.distanceTo(this._startPos)<=this._map.options.tapTolerance},_simulateEvent:function(n,i){var l=new MouseEvent(n,{bubbles:!0,cancelable:!0,view:window,screenX:i.screenX,screenY:i.screenY,clientX:i.clientX,clientY:i.clientY});l._simulated=!0,i.target.dispatchEvent(l)}});ae.addInitHook("addHandler","tapHold",tl),ae.mergeOptions({touchZoom:bt.touch,bounceAtZoomLimits:!0});var el=Tn.extend({addHooks:function(){Pt(this._map._container,"leaflet-touch-zoom"),jt(this._map._container,"touchstart",this._onTouchStart,this)},removeHooks:function(){he(this._map._container,"leaflet-touch-zoom"),ge(this._map._container,"touchstart",this._onTouchStart,this)},_onTouchStart:function(n){var i=this._map;if(!(!n.touches||n.touches.length!==2||i._animatingZoom||this._zooming)){var l=i.mouseEventToContainerPoint(n.touches[0]),u=i.mouseEventToContainerPoint(n.touches[1]);this._centerPoint=i.getSize()._divideBy(2),this._startLatLng=i.containerPointToLatLng(this._centerPoint),i.options.touchZoom!=="center"&&(this._pinchStartLatLng=i.containerPointToLatLng(l.add(u)._divideBy(2))),this._startDist=l.distanceTo(u),this._startZoom=i.getZoom(),this._moved=!1,this._zooming=!0,i._stop(),jt(document,"touchmove",this._onTouchMove,this),jt(document,"touchend touchcancel",this._onTouchEnd,this),Be(n)}},_onTouchMove:function(n){if(!(!n.touches||n.touches.length!==2||!this._zooming)){var i=this._map,l=i.mouseEventToContainerPoint(n.touches[0]),u=i.mouseEventToContainerPoint(n.touches[1]),g=l.distanceTo(u)/this._startDist;if(this._zoom=i.getScaleZoom(g,this._startZoom),!i.options.bounceAtZoomLimits&&(this._zoom<i.getMinZoom()&&g<1||this._zoom>i.getMaxZoom()&&g>1)&&(this._zoom=i._limitZoom(this._zoom)),i.options.touchZoom==="center"){if(this._center=this._startLatLng,g===1)return}else{var E=l._add(u)._divideBy(2)._subtract(this._centerPoint);if(g===1&&E.x===0&&E.y===0)return;this._center=i.unproject(i.project(this._pinchStartLatLng,this._zoom).subtract(E),this._zoom)}this._moved||(i._moveStart(!0,!1),this._moved=!0),it(this._animRequest);var N=h(i._move,i,this._center,this._zoom,{pinch:!0,round:!1},void 0);this._animRequest=J(N,this,!0),Be(n)}},_onTouchEnd:function(){if(!this._moved||!this._zooming){this._zooming=!1;return}this._zooming=!1,it(this._animRequest),ge(document,"touchmove",this._onTouchMove,this),ge(document,"touchend touchcancel",this._onTouchEnd,this),this._map.options.zoomAnimation?this._map._animateZoom(this._center,this._map._limitZoom(this._zoom),!0,this._map.options.zoomSnap):this._map._resetView(this._center,this._map._limitZoom(this._zoom))}});ae.addInitHook("addHandler","touchZoom",el),ae.BoxZoom=ja,ae.DoubleClickZoom=Ka,ae.Drag=$a,ae.Keyboard=Ja,ae.ScrollWheelZoom=Qa,ae.TapHold=tl,ae.TouchZoom=el,e.Bounds=nt,e.Browser=bt,e.CRS=St,e.Canvas=Xa,e.Circle=so,e.CircleMarker=Zr,e.Class=F,e.Control=pn,e.DivIcon=Ga,e.DivOverlay=bn,e.DomEvent=Rh,e.DomUtil=Lh,e.Draggable=Wn,e.Evented=st,e.FeatureGroup=Pn,e.GeoJSON=Cn,e.GridLayer=yr,e.Handler=Tn,e.Icon=Li,e.ImageOverlay=$r,e.LatLng=ct,e.LatLngBounds=W,e.Layer=mn,e.LayerGroup=Ai,e.LineUtil=Vh,e.Map=ae,e.Marker=Xr,e.Mixin=Fh,e.Path=Xn,e.Point=X,e.PolyUtil=Bh,e.Polygon=Pi,e.Polyline=Rn,e.Popup=Jr,e.PosAnimation=Ta,e.Projection=Wh,e.Rectangle=Ya,e.Renderer=In,e.SVG=Sr,e.SVGOverlay=Ha,e.TileLayer=Ci,e.Tooltip=Qr,e.Transformation=re,e.Util=lt,e.VideoOverlay=ka,e.bind=h,e.bounds=ot,e.canvas=Za,e.circle=Jh,e.circleMarker=$h,e.control=gr,e.divIcon=au,e.extend=o,e.featureGroup=Yh,e.geoJSON=za,e.geoJson=eu,e.gridLayer=lu,e.icon=jh,e.imageOverlay=nu,e.latLng=pt,e.latLngBounds=rt,e.layerGroup=qh,e.map=Ch,e.marker=Kh,e.point=z,e.polygon=tu,e.polyline=Qh,e.popup=su,e.rectangle=uu,e.setOptions=S,e.stamp=d,e.svg=qa,e.svgOverlay=ru,e.tileLayer=Va,e.tooltip=ou,e.transformation=Z,e.version=s,e.videoOverlay=iu;var fu=window.L;e.noConflict=function(){return window.L=fu,this},window.L=e})})(ia,ia.exports);var yv=ia.exports;const Ki=xv(yv),Mv="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAABSCAMAAAAhFXfZAAAC91BMVEVMaXEzeak2f7I4g7g3g7cua5gzeKg8hJo3grY4g7c3grU0gLI2frE0daAubJc2gbQwd6QzeKk2gLMtd5sxdKIua5g1frA2f7IydaM0e6w2fq41fK01eqo3grgubJgta5cxdKI1f7AydaQydaMxc6EubJgvbJkwcZ4ubZkwcJwubZgubJcydqUydKIxapgubJctbJcubZcubJcvbJYubJcvbZkubJctbJctbZcubJg2f7AubJcrbZcubJcubJcua5g3grY0fq8ubJcubJdEkdEwhsw6i88vhswuhcsuhMtBjMgthMsrg8srgss6is8qgcs8i9A9iMYtg8spgcoogMo7hcMngMonf8olfso4gr8kfck5iM8jfMk4iM8he8k1fro7itAgesk2hs8eecgzfLcofssdeMg0hc4cd8g2hcsxeLQbdsgZdcgxeLImfcszhM0vda4xgckzhM4xg84wf8Yxgs4udKsvfcQucqhUndROmdM1fK0wcZ8vb5w0eqpQm9MzeKhXoNVcpdYydKNWn9VZotVKltJFjsIwcJ1Rms9OlslLmtH///8+kc9epdYzd6dbo9VHkMM2f7FHmNBClM8ydqVcpNY9hro3gLM9hLczealQmcw3fa46f7A8gLMxc6I3eagyc6FIldJMl9JSnNRSntNNl9JPnNJFi75UnM9ZodVKksg8kM45jc09e6ZHltFBk883gbRBh7pDk9EwcaBzn784g7dKkcY2i81Om9M7j85Llc81is09g7Q4grY/j9A0eqxKmdFFltBEjcXf6fFImdBCiLxJl9FGlNFBi78yiMxVndEvbpo6js74+vx+psPP3+o/ks5HkcpGmNCjwdZCkNDM3ehYoNJEls+lxNkxh8xHks0+jdC1zd5Lg6r+/v/H2ufz9/o3jM3t8/edvdM/k89Th61OiLBSjbZklbaTt9BfptdjmL1AicBHj8hGk9FAgK1dkLNTjLRekrdClc/k7fM0icy0y9tgp9c4jc2NtM9Dlc8zicxeXZn3AAAAQ3RSTlMAHDdTb4yPA+LtnEQmC4L2EmHqB7XA0d0sr478x4/Yd5i1zOfyPkf1sLVq4Nh3FvjxopQ2/STNuFzUwFIwxKaejILpIBEV9wAABhVJREFUeF6s1NdyFEcYBeBeoQIhRAkLlRDGrhIgY3BJL8CVeKzuyXFzzjkn5ZxzzuScg3PO8cKzu70JkO0LfxdTU//pM9vTu7Xgf6KqOVTb9X7toRrVEfBf1HTVjZccrT/2by1VV928Yty9ZbVuucdz90frG8DBjl9pVApbOstvmMuvVgaNXSfAAd6pGxpy6yxf5ph43pS/4f3uoaGm2rdu72S9xzOvMymkZFq/ptDrk90mhW7e4zl7HLzhxGWPR20xmSxJ/VqldG5m9XhaVOA1DadsNh3Pu5L2N6QtPO/32JpqQBVVk20oy/Pi2s23WEvyfHbe1thadVQttvm7Llf65gGmXK67XtupyoM7HQhmXdLS8oGWJNeOJ3C5fG5XCEJnkez3/oFdsvgJ4l2ANZwhrJKk/7OSXa+3Vw2WJMlKnGkobouYk6T0TyX30klOUnTD9HJ5qpckL3EW/w4XF3Xd0FGywXUrstrclVsqz5Pd/sXFYyDnPdrLcQODmGOK47IZb4CmibmMn+MYRzFZ5jg33ZL/EJrWcszHmANy3ARBK/IXtciJy8VsitPSdE3uuHxzougojcUdr8/32atnz/ev3f/K5wtpxUTpcaI45zusVDpYtZi+jg0oU9b3x74h7+n9ABvYEZeKaVq0sh0AtLKsFtqNBdeT0MrSzwwlq9+x6xAO4tgOtSzbCjrNQQiNvQUbUEubvzBUeGw26yDCsRHCoLkTHDa7IdOLIThs/gHvChszh2CimE8peRs47cxANI0lYNB5y1DljpOF0IhzBDPOZnDOqYYbeGKECbPzWnXludPphw5c2YBq5zlwXphIbO4VDCZ0gnPfUO1TwZoYwAs2ExPCedAu9DAjfQUjzITQb3jNj0KG2Sgt6BHaQUdYzWz+XmBktOHwanXjaSTcwwziBcuMOtwBmqPrTOxFQR/DRKKPqyur0aiW6cULYsx6tBm0jXpR/AUWR6HRq9WVW6MRhIq5jLyjbaCTDCijyYJNpCajdyobP/eTw0iexBAKkJ3gA5KcQb2zBXsIBckn+xVv8jkZSaEFHE+jFEleAEfayRU0MouNoBmB/L50Ai/HSLIHxcrpCvnhSQAuakKp2C/YbCylJjXRVy/z3+Kv/RrNcCo+WUzlVEhzKffnTQnxeN9fWF88fiNCUdSTsaufaChKWInHeysygfpIqagoakW+vV20J8uyl6TyNKEZWV4oRSPyCkWpgOLSbkCObT8o2r6tlG58HQquf6O0v50tB7JM7F4EORd2dx/K0w/KHsVkLPaoYrwgP/y7krr3SSMA4zj+OBgmjYkxcdIJQyQRKgg2viX9Hddi9UBb29LrKR7CVVEEEXWojUkXNyfTNDE14W9gbHJNuhjDettN3ZvbOvdOqCD3Jp/9l+/wJE+9PkYGjx/fqkys3S2rMozM/o2106rfMUINo6hVqz+eu/hd1c4xTg0TAfy5kV+4UG6+IthHTU9woWmxuKNbTfuCSfovBCxq7EtHqvYL4Sm6F8GVxsSXHMQ07TOi1DKtZxjWaaIyi4CXWjxPccUw8WVbMYY5wxC1mzEyXMJWkllpRloi+Kkoq69sxBTlElF6aAxYUbjXNlhlDZilDnM4U5SlN5biRsRHnbx3mbeWjEh4mEyiuJDl5XcWVmX5GvNkFgLWZM5qwsop4/AWfLhU1cR7k1VVvcYCWRkOI6Xy5gmnphCYIkvzuNYzHzosq2oNk2RtSs8khfUOfHIDgR6ysYBaMpl4uEgk2U/oJTs9AaTSwma7dT69geAE2ZpEjUsn2ieJNHeKfrI3EcAGJ2ZaNgVuC8EBctCLc57P5u5led6IOBkIYkuQMrmmjChs4VkfOerHqSBkPzZlhe06RslZ3zMjk2sscqKwY0RcjKK+LWbzd7KiHhkncs/siFJ+V5eXxD34B8nVuJEpGJNmxN2gH3vSvp7J70tF+D1Ej8qUJD1TkErAND2GZwTFg/LubvmgiBG3SOvdlsqFQrkEzJCL1rstlnVFROixZoDDSuXQFHESwVGlcuQcMb/b42NgjLowh5MTDFE3vNB5qStRIErdCQEh6pLPR92anSUb/wAIhldAaDMpGgAAAABJRU5ErkJggg==",Sv="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=",Ev="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAQAAAACach9AAACMUlEQVR4Ae3ShY7jQBAE0Aoz/f9/HTMzhg1zrdKUrJbdx+Kd2nD8VNudfsL/Th///dyQN2TH6f3y/BGpC379rV+S+qqetBOxImNQXL8JCAr2V4iMQXHGNJxeCfZXhSRBcQMfvkOWUdtfzlLgAENmZDcmo2TVmt8OSM2eXxBp3DjHSMFutqS7SbmemzBiR+xpKCNUIRkdkkYxhAkyGoBvyQFEJEefwSmmvBfJuJ6aKqKWnAkvGZOaZXTUgFqYULWNSHUckZuR1HIIimUExutRxwzOLROIG4vKmCKQt364mIlhSyzAf1m9lHZHJZrlAOMMztRRiKimp/rpdJDc9Awry5xTZCte7FHtuS8wJgeYGrex28xNTd086Dik7vUMscQOa8y4DoGtCCSkAKlNwpgNtphjrC6MIHUkR6YWxxs6Sc5xqn222mmCRFzIt8lEdKx+ikCtg91qS2WpwVfBelJCiQJwvzixfI9cxZQWgiSJelKnwBElKYtDOb2MFbhmUigbReQBV0Cg4+qMXSxXSyGUn4UbF8l+7qdSGnTC0XLCmahIgUHLhLOhpVCtw4CzYXvLQWQbJNmxoCsOKAxSgBJno75avolkRw8iIAFcsdc02e9iyCd8tHwmeSSoKTowIgvscSGZUOA7PuCN5b2BX9mQM7S0wYhMNU74zgsPBj3HU7wguAfnxxjFQGBE6pwN+GjME9zHY7zGp8wVxMShYX9NXvEWD3HbwJf4giO4CFIQxXScH1/TM+04kkBiAAAAAElFTkSuQmCC";Ki.Icon.Default.mergeOptions({iconRetinaUrl:Mv,iconUrl:Sv,shadowUrl:Ev});function Tv(){var r;return(r=window.google)!=null&&r.maps?Promise.resolve(window.google):Promise.reject(new Error("no key"))}function bv({onPinGlobe:r,onAddRoute:t,onAddDestination:e}){const s=document.getElementById("mapModal"),o=document.getElementById("mapCanvas"),a=document.getElementById("streetView"),h=document.getElementById("mapTitle"),c=document.getElementById("placeResults"),d=document.getElementById("placeSearchInput");let f=null,p="satellite",_=null,v=null,y=null,M=null,S=!1;document.getElementById("closeMap").onclick=()=>{s.classList.remove("open")},document.querySelectorAll("#mapModal .viewBtn").forEach(C=>{C.onclick=()=>b(C.dataset.mode)}),document.getElementById("placeSearchBtn").onclick=()=>D(d.value),d.addEventListener("keydown",C=>{C.key==="Enter"&&D(d.value)}),document.getElementById("nearbyBtn").onclick=()=>D("");async function x(C,U={}){f=C,h.textContent=`${C.name} — ${C.country}`,s.classList.add("open"),c.innerHTML='<div class="loading">Tip: search a place or hit “Nearby famous places”.</div>',d.value="",U.nearby&&D("");try{await Tv(),S=!0,document.getElementById("svBtnWrap").style.display="",await m(C)}catch{S=!1,document.getElementById("svBtnWrap").style.display="none",P(C)}b("satellite")}async function m(C){const U=window.google,et={lat:C.lat,lng:C.lng};_=new U.maps.Map(o,{center:et,zoom:12,mapTypeId:"satellite",streetViewControl:!1}),new U.maps.Marker({position:et,map:_,title:C.name}),v=new U.maps.StreetViewPanorama(a,{position:et,pov:{heading:34,pitch:8},zoom:1})}function P(C){y&&(y.remove(),y=null),y=Ki.map(o,{zoomControl:!0}).setView([C.lat,C.lng],11);const U=Ki.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}),et=Ki.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles © Esri"});M={osm:U,sat:et},et.addTo(y),Ki.marker([C.lat,C.lng]).addTo(y).bindPopup(C.name).openPopup(),setTimeout(()=>y.invalidateSize(),60)}function b(C){p=C,document.querySelectorAll("#mapModal .viewBtn").forEach(et=>et.classList.toggle("active",et.dataset.mode===C));const U=C==="street";a.style.display=U?"block":"none",o.style.display=U?"none":"block",S?(C==="map"&&_.setMapTypeId("roadmap"),C==="satellite"&&_.setMapTypeId("satellite"),C==="street"&&v&&v.setVisible(!0)):(C==="map"&&(M.sat.remove(),M.osm.addTo(y)),C==="satellite"&&(M.osm.remove(),M.sat.addTo(y)),setTimeout(()=>y.invalidateSize(),60))}async function D(C){if(f){c.innerHTML='<div class="loading">Searching…</div>';try{const U=await Hn.places(f.lat,f.lng,C.trim());if(!U.results.length){c.innerHTML='<div class="loading">No places found.</div>';return}c.innerHTML=U.results.map((et,w)=>`
        <div class="placeCard" data-i="${w}">
          <div class="pcMain">
            <div class="pcName">${et.name}</div>
            <div class="pcMeta">${et.category||"place"}${et.rating?" · rated "+et.rating:""} · ${U.source}</div>
          </div>
          <div class="pcBtns">
            <button data-act="focus" data-i="${w}" title="Show on map">Map</button>
            <button data-act="pin" data-i="${w}" title="Pin on globe">Pin</button>
            <button data-act="route" data-i="${w}" title="Add to route">Route</button>
            <button data-act="dest" data-i="${w}" title="Add as destination">Add</button>
          </div>
        </div>`).join(""),c.querySelectorAll("button").forEach(et=>{et.onclick=()=>{const w=U.results[+et.dataset.i],I=et.dataset.act;I==="focus"&&B(w),I==="pin"&&r(w),I==="route"&&t({id:"place:"+w.name,name:w.name,lat:w.lat,lng:w.lng}),I==="dest"&&e(w)}})}catch(U){c.innerHTML=`<div class="loading err">Search failed: ${U.message}</div>`}}}function B(C){S&&_?(_.panTo({lat:C.lat,lng:C.lng}),_.setZoom(15),new window.google.maps.Marker({position:{lat:C.lat,lng:C.lng},map:_,title:C.name}),p==="street"&&v&&v.setPosition({lat:C.lat,lng:C.lng})):y&&(y.setView([C.lat,C.lng],15),Ki.marker([C.lat,C.lng]).addTo(y).bindPopup(C.name).openPopup())}return{open:x}}function wv({globe:r}){const t=document.getElementById("routePanel"),e=document.getElementById("routeStops"),s=document.getElementById("routeSummary"),o=document.getElementById("routeBadge");let a=[],h=!0,c=!1;document.getElementById("routeToggle").onclick=()=>t.classList.toggle("open"),document.getElementById("closeRoute").onclick=()=>t.classList.remove("open"),document.getElementById("optFromNYC").onchange=v=>{h=v.target.checked,_()},document.getElementById("optOptimize").onchange=v=>{c=v.target.checked,_()},document.getElementById("clearRoute").onclick=()=>{a=[],_()};function d(v){a.some(y=>y.id===v.id)||(a.push({id:v.id,name:v.name,lat:v.lat,lng:v.lng}),t.classList.add("open"),_())}function f(v){a=a.filter(y=>y.id!==v),_()}function p(){return[...h?[{name:ho.name,lat:ho.lat,lng:ho.lng}]:[],...a.map(y=>({name:y.name,lat:y.lat,lng:y.lng}))]}async function _(){if(o.textContent=a.length,a.length===0){e.innerHTML='<div class="emptyState">No stops yet. Open a destination and hit “Add to route”, or add places from the map.</div>',s.innerHTML="",r.setRoute(null);return}const v=p();if(r.setRoute(v),e.innerHTML=a.map((y,M)=>`
      <div class="routeStop">
        <span class="rsNum">${M+1}</span>
        <span class="rsName">${y.name}</span>
        <button class="rsRemove" data-id="${y.id}">×</button>
      </div>`).join(""),e.querySelectorAll(".rsRemove").forEach(y=>y.onclick=()=>f(y.dataset.id)),v.length<2){s.innerHTML='<div class="hintSmall">Add one more stop to draw a route.</div>';return}try{const y=await Hn.planRoute(v,c,!1);c&&r.setRoute(y.stops),s.innerHTML=`
        <div class="summaryRow"><span>Stops</span><span>${y.stops.length}</span></div>
        <div class="summaryRow"><span>Total distance</span><span>${Math.round(y.total_distance_km).toLocaleString()} km</span></div>
        <div class="summaryRow total"><span>Flight time (approx)</span><span>${y.total_flight_hours} h</span></div>`}catch(y){s.innerHTML=`<div class="hintSmall err">Route calc failed: ${y.message}</div>`}}return _(),{addStop:d,getStops:()=>a.slice()}}function Av(r,t,e){const s=Math.max(1,Math.min(60,Math.round(e)||t)),o=t>0?r/t:0;return{days:s,budget:Math.round(o*s)}}function Lv(r,t){const e=Math.max(1,t||1);return r.reduce((s,o)=>s+o.budget,0)*e}function Pv(r){return r.reduce((t,e)=>t+e.days,0)}function Rv(r,t){const e=Math.max(1,t||1),s={};return r.forEach((o,a)=>{const h=o.year;(s[h]||(s[h]={year:h,items:[],subtotal:0})).items.push({...o,_idx:a}),s[h].subtotal+=o.budget*e}),Object.values(s).sort((o,a)=>o.year-a.year)}const Eh="wa_bucket";function Cv(){try{return JSON.parse(localStorage.getItem(Eh))||[]}catch{return[]}}function Iv(r){localStorage.setItem(Eh,JSON.stringify(r))}function Dv(){const r=document.getElementById("bucketDrawer"),t=document.getElementById("yearsCol"),e=document.getElementById("summaryCol"),s=document.getElementById("statCount"),o=document.getElementById("bucketBadge");let a=Cv(),h=1;document.getElementById("bucketToggle").onclick=()=>r.classList.add("open"),document.getElementById("closeDrawer").onclick=()=>r.classList.remove("open");function c(){Iv(a)}function d(M,S,x,m=M.days,P="Guest"){a.push({destId:M.id,name:M.name,country:M.country,year:S,budget:x,days:m,addedBy:P}),c(),y()}function f(M){a.splice(M,1),c(),y()}function p(M){return a.filter(S=>S.destId===M).map(S=>S.year)}function _(){const M=new Map;return a.forEach(S=>{M.has(S.destId)||M.set(S.destId,{destId:S.destId,name:S.name})}),[...M.values()]}function v(M,S){const x=a[M];if(!x)return;const m=Av(x.budget,x.days,S);x.days=m.days,x.budget=m.budget,c(),y()}function y(){if(s.textContent=a.length,o.textContent=a.length,a.length===0){t.innerHTML='<div class="emptyState">Your atlas is empty.<br>Add a destination or click a pin to plan a trip.</div>',e.innerHTML='<h4>Budget Summary</h4><div class="summaryRow total"><span>Grand total</span><span>$0</span></div>';return}const M=Rv(a,h);t.innerHTML=M.map(({year:S,items:x,subtotal:m})=>`
      <div class="yearGroup">
        <div class="yearTitle"><span>${S}</span><span>$${m.toLocaleString()}</span></div>
        ${x.map(P=>`<div class="bucketCard">
          <div><div class="bcName">${P.name}</div>
          <div class="bcMeta">${P.country} ·
            <input type="number" class="bcDaysInput" data-idx="${P._idx}" value="${P.days}" min="1" max="60"/> days ·
            $${(P.budget*h).toLocaleString()}</div>
          <div class="bcAddedBy">added by ${P.addedBy||"Guest"}</div></div>
          <button class="bcRemove" data-idx="${P._idx}">×</button></div>`).join("")}
      </div>`).join(""),t.querySelectorAll(".bcRemove").forEach(S=>S.onclick=()=>f(+S.dataset.idx)),t.querySelectorAll(".bcDaysInput").forEach(S=>{S.onclick=x=>x.stopPropagation(),S.onchange=()=>v(+S.dataset.idx,S.value)}),e.innerHTML=`<h4>Budget Summary</h4>
      <div class="summaryRow"><span>Destinations added</span><span>${a.length}</span></div>
      <div class="summaryRow"><span>Total travel days</span><span>${Pv(a)}</span></div>
      <div class="summaryRow"><span>Years spanned</span><span>${M.length}</span></div>
      <div class="summaryRow total"><span>Grand total</span><span>$${Lv(a,h).toLocaleString()}</span></div>
      <div class="peopleInput"><label>People traveling</label>
        <input type="number" id="peopleInput" value="${h}" min="1"></div>`,document.getElementById("peopleInput").onchange=S=>{h=Math.max(1,parseInt(S.target.value,10)||1),y()}}return y(),{add:d,yearsFor:p,listDestinations:_}}function Uv({onAdd:r}){const t=document.getElementById("addDestModal"),e=document.getElementById("addSearchInput"),s=document.getElementById("addResults");document.getElementById("addDestToggle").onclick=o,document.getElementById("closeAddDest").onclick=()=>t.classList.remove("open"),document.getElementById("addSearchBtn").onclick=()=>a(e.value),e.addEventListener("keydown",h=>{h.key==="Enter"&&a(e.value)});function o(){t.classList.add("open"),s.innerHTML='<div class="loading">Type a city, landmark, or place (e.g. “Kyoto”, “Machu Picchu”) and hit Search.</div>',e.value="",setTimeout(()=>e.focus(),50)}async function a(h){if(h=h.trim(),!!h){s.innerHTML='<div class="loading">Searching worldwide…</div>';try{const c=await Hn.geocode(h);if(!c.results.length){s.innerHTML='<div class="loading">No matches. Try a more specific name.</div>';return}s.innerHTML=c.results.map((d,f)=>`
        <div class="placeCard">
          <div class="pcMain">
            <div class="pcName">${d.name}</div>
            <div class="pcMeta">${d.country||d.address||""} · ${d.lat.toFixed(2)}, ${d.lng.toFixed(2)} · ${c.source}</div>
          </div>
          <button class="addOneBtn" data-i="${f}">Add</button>
        </div>`).join(""),s.querySelectorAll(".addOneBtn").forEach(d=>{d.onclick=async()=>{d.disabled=!0,d.textContent="…";try{await r(c.results[+d.dataset.i]),d.textContent="Added"}catch{d.disabled=!1,d.textContent="Retry"}}})}catch(c){s.innerHTML=`<div class="loading err">Search failed: ${c.message}. Is the backend running?</div>`}}}return{open:o}}function Nv({getBucketDestinations:r}){const t=document.getElementById("negotiationModal"),e=document.getElementById("negotiationBody");document.getElementById("negotiationToggle").onclick=()=>{t.classList.add("open"),s()},document.getElementById("closeNegotiation").onclick=()=>t.classList.remove("open");function s(){return o()}function o(){e.innerHTML=`
      <div class="negoIntro">Group trip planning runs a real multi-agent backend
        (FastAPI + LangGraph + LangChain + GraphRAG) with real accounts — that
        needs a live Python server + database, which this static demo
        (GitHub Pages) doesn't run.</div>
      <div class="negoCard">
        <h4>Run it locally to try this feature</h4>
        <div class="hintSmall">
          <code>docker compose up --build</code> — then open
          <b>http://localhost:8080</b> and click <b>Group Plan</b> again.
        </div>
      </div>`}return{open:()=>{t.classList.add("open"),s()}}}let zn=[];const Ov=r=>zn.find(t=>t.id===r),ii=dv(document.getElementById("globeCanvas"),{onSelect:r=>va(r)}),Ns=Dv(),Th=wv({globe:ii}),zc=bv({onPinGlobe:r=>ii.addCustomPin(r.lat,r.lng,"place:"+r.name),onAddRoute:r=>Th.addStop(r),onAddDestination:r=>Ah(r)}),Fv=gv({onAddBucket:(r,t,e,s,o)=>Ns.add(r,t,e,s,o),onAddRoute:r=>Th.addStop({id:r.id,name:r.name,lat:r.lat,lng:r.lng}),onOpenMap:r=>zc.open(r),onSearchNearby:r=>zc.open(r,{nearby:!0}),onRemoveDestination:r=>Bv(r),getBucketYears:r=>Ns.yearsFor(r)});Uv({onAdd:r=>Ah(r)});Nv({getBucketDestinations:()=>Ns.listDestinations()});const bh=document.getElementById("navListItems");function wh(r,t=document.querySelectorAll(".navItem").length){const e=document.createElement("div");e.className="navItem",e.dataset.id=r.id,e.innerHTML=`<span class="dot"></span>${r.name}<span class="rankTag">${r.custom?"new":String(t+1).padStart(2,"0")}</span>`,e.onclick=()=>va(r.id),bh.appendChild(e)}function va(r){const t=Ov(r);t&&(ii.setSelected(r),ii.focusOn(t.lat,t.lng),document.querySelectorAll(".navItem").forEach(e=>e.classList.toggle("active",e.dataset.id===r)),Fv.open(t))}async function Ah(r){var o;const t={name:r.name,country:r.country||(r.address?r.address.split(",").slice(-1)[0].trim():""),lat:r.lat,lng:r.lng},e=await Hn.addToAtlas(t);zn.push(e),wh(e),ii.removePin("place:"+r.name),ii.addDestination(e),document.getElementById("addDestModal").classList.remove("open");const s=new Date().getFullYear()+1;return Ns.add(e,s,e.budgetLow*e.days,e.days,((o=kc())==null?void 0:o.name)||"Guest"),va(e.id),e}async function Bv(r){var t;try{await Hn.removeFromAtlas(r.id)}catch{}zn=zn.filter(e=>e.id!==r.id),ii.removePin(r.id),(t=document.querySelector(`.navItem[data-id="${r.id}"]`))==null||t.remove()}async function zv(){try{zn=await Hn.atlas()}catch(r){console.error("Failed to load your atlas:",r),zn=[]}bh.innerHTML="",ii.addDestinations(zn),zn.forEach((r,t)=>wh(r,t)),document.getElementById("statCount").textContent=zn.length}document.getElementById("authGate").classList.add("hidden"),zv();
