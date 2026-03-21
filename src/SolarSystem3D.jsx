import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

const SUN_BASE = 38, TAU = Math.PI * 2;

const PAL = {
  aatma:{h:"#ffd4a8",m:"#e07840",d:"#a04520",dp:"#4a1a08",sf:"volcanic"},
  seesha:{h:"#e8f8ff",m:"#7dd3fc",d:"#1e6fa8",dp:"#0a2a40",sf:"ice"},
  kaal:{h:"#d4b8ff",m:"#a78bfa",d:"#6d4aad",dp:"#2a1650",sf:"swirl"},
  dharma:{h:"#ffd6f7",m:"#f093fb",d:"#b050c8",dp:"#4a1055",sf:"energy"},
  moksha:{h:"#fffbe8",m:"#ffd700",d:"#c8a000",dp:"#5a4800",sf:"corona"},
  karma:{h:"#ffc8c8",m:"#ff6b6b",d:"#c82020",dp:"#4a0808",sf:"fire"},
  prema:{h:"#ffe8f0",m:"#e8a0bf",d:"#b06888",dp:"#4a2038",sf:"pulse"},
  maya:{h:"#ffd0e8",m:"#fd79a8",d:"#c03070",dp:"#3a0820",sf:"shimmer"},
};

const NOISE=`
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return noise(p)*0.5+noise(p*2.1+1.3)*0.25+noise(p*4.3+2.7)*0.125+noise(p*8.7)*0.0625;}
`;

function createLabel(text,color,fontSize=48){
  const c=document.createElement("canvas"),ctx=c.getContext("2d");c.width=256;c.height=64;
  ctx.font=`${fontSize}px Georgia,serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=color;ctx.globalAlpha=0.85;ctx.fillText(text,128,32);
  const tex=new THREE.CanvasTexture(c);tex.minFilter=THREE.LinearFilter;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.set(4,1,1);return sp;
}

// ─── Sun glow texture (high-res radial gradient with noise for organic feel) ───
function createSunGlowTexture(size=512){
  const c=document.createElement("canvas");c.width=size;c.height=size;const ctx=c.getContext("2d");
  // Multi-stop radial gradient — smooth light diffusion
  const grad=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  grad.addColorStop(0,"rgba(255,250,220,0.7)");
  grad.addColorStop(0.06,"rgba(255,230,160,0.5)");
  grad.addColorStop(0.12,"rgba(255,200,80,0.3)");
  grad.addColorStop(0.22,"rgba(255,170,50,0.15)");
  grad.addColorStop(0.35,"rgba(255,140,30,0.07)");
  grad.addColorStop(0.5,"rgba(255,110,20,0.03)");
  grad.addColorStop(0.7,"rgba(255,80,10,0.01)");
  grad.addColorStop(1,"rgba(255,60,5,0.0)");
  ctx.fillStyle=grad;ctx.fillRect(0,0,size,size);
  const tex=new THREE.CanvasTexture(c);tex.minFilter=THREE.LinearFilter;return tex;
}
// ─── Corona flare texture ───
function createFlareTexture(size=256){
  const c=document.createElement("canvas");c.width=size;c.height=size/4;const ctx=c.getContext("2d");
  const grad=ctx.createRadialGradient(size/2,size/8,0,size/2,size/8,size/2);
  grad.addColorStop(0,"rgba(255,220,120,0.5)");
  grad.addColorStop(0.15,"rgba(255,180,60,0.2)");
  grad.addColorStop(0.4,"rgba(255,130,30,0.06)");
  grad.addColorStop(1,"rgba(255,80,10,0.0)");
  ctx.fillStyle=grad;ctx.fillRect(0,0,size,size/4);
  const tex=new THREE.CanvasTexture(c);tex.minFilter=THREE.LinearFilter;return tex;
}

function createBg(){
  const mat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uRes:{value:new THREE.Vector2(1,1)}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.0);}`,
    fragmentShader:`uniform float uTime;uniform vec2 uRes;varying vec2 vUv;${NOISE}
      void main(){vec2 p=(vUv-0.5)*vec2(uRes.x/uRes.y,1.0);vec3 col=vec3(0.012,0.008,0.032);
        float n1=fbm(p*0.8+uTime*0.002),n2=fbm(p*1.1+vec2(4,2)-uTime*0.0015),n3=fbm(p*0.5+vec2(n1,n2)*0.3+uTime*0.001);
        col+=vec3(0.025,0.012,0.05)*(n1*0.8+0.2);col+=vec3(0.008,0.015,0.04)*smoothstep(0.3,0.7,n2)*0.8;
        col+=vec3(0.05,0.025,0.006)*smoothstep(1.0,0.0,length(p))*n3;
        col+=vec3(0.015,0.008,0.025)*fbm(p*2.5+uTime*0.003);
        col+=vec3(0.07,0.035,0.01)*smoothstep(0.8,0.0,length(p))*0.35;
        col*=0.7+smoothstep(1.6,0.4,length(p*1.1))*0.3;gl_FragColor=vec4(col,1.0);}`,
    depthWrite:false,depthTest:false});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);m.frustumCulled=false;m.renderOrder=-1000;return m;
}

function createStars(count){
  const pos=new Float32Array(count*3),sz=new Float32Array(count),col=new Float32Array(count*3),ph=new Float32Array(count);
  for(let i=0;i<count;i++){const r=250+Math.random()*1600,th=Math.random()*TAU,p=Math.acos(2*Math.random()-1);
    pos[i*3]=r*Math.sin(p)*Math.cos(th);pos[i*3+1]=r*Math.sin(p)*Math.sin(th);pos[i*3+2]=r*Math.cos(p);
    sz[i]=0.3+Math.random()*2.2;ph[i]=Math.random()*TAU;
    const roll=Math.random();if(roll>0.87){col[i*3]=1;col[i*3+1]=0.8;col[i*3+2]=0.4;}else if(roll>0.78){col[i*3]=0.6;col[i*3+1]=0.65;col[i*3+2]=1;}else{const w=0.92+Math.random()*0.08;col[i*3]=w;col[i*3+1]=w*0.97;col[i*3+2]=w*0.91;}}
  const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));geo.setAttribute("aSize",new THREE.BufferAttribute(sz,1));geo.setAttribute("aColor",new THREE.BufferAttribute(col,3));geo.setAttribute("aPhase",new THREE.BufferAttribute(ph,1));
  return new THREE.Points(geo,new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uPR:{value:Math.min(window.devicePixelRatio,2)}},
    vertexShader:`attribute float aSize;attribute vec3 aColor;attribute float aPhase;uniform float uTime,uPR;varying float vA;varying vec3 vC;
      void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp(aSize*uPR*(150.0/-mv.z),0.5,5.0);gl_Position=projectionMatrix*mv;vA=(0.3+aSize*0.15)*(sin(uTime*(0.3+aSize*0.2)+aPhase)*0.35+0.65);vC=aColor;}`,
    fragmentShader:`varying float vA;varying vec3 vC;void main(){float d=length(gl_PointCoord-0.5)*2.0;gl_FragColor=vec4(vC,(exp(-d*d*5.0)+exp(-d*d*1.5)*0.3)*vA);}`,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
}

function createShooters(count){
  const pos=new Float32Array(count*3),vel=new Float32Array(count*3),life=new Float32Array(count),sz=new Float32Array(count);
  for(let i=0;i<count;i++)resetSS(pos,vel,life,sz,i);
  const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));geo.setAttribute("aVel",new THREE.BufferAttribute(vel,3));geo.setAttribute("aLife",new THREE.BufferAttribute(life,1));geo.setAttribute("aSize",new THREE.BufferAttribute(sz,1));
  return new THREE.Points(geo,new THREE.ShaderMaterial({uniforms:{uPR:{value:Math.min(window.devicePixelRatio,2)}},
    vertexShader:`attribute float aLife,aSize;uniform float uPR;varying float vLife;void main(){vLife=aLife;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp(aSize*uPR*(100.0/-mv.z)*aLife,0.5,6.0);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float vLife;void main(){float d=length(gl_PointCoord-0.5)*2.0;gl_FragColor=vec4(1.0,0.95,0.85,exp(-d*d*4.0)*vLife);}`,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
}
function resetSS(p,v,l,s,i){const a=Math.random()*TAU,r=40+Math.random()*60;p[i*3]=Math.cos(a)*r;p[i*3+1]=(Math.random()-0.5)*r*0.3;p[i*3+2]=Math.sin(a)*r;const sp=0.3+Math.random()*0.5,d=a+Math.PI*0.5+(Math.random()-0.5)*0.8;v[i*3]=Math.cos(d)*sp;v[i*3+1]=(Math.random()-0.5)*0.15;v[i*3+2]=Math.sin(d)*sp;l[i]=Math.random();s[i]=1.5+Math.random()*3;}
function updateSS(pts){const p=pts.geometry.attributes.position.array,v=pts.geometry.attributes.aVel.array,l=pts.geometry.attributes.aLife.array,s=pts.geometry.attributes.aSize.array;
  for(let i=0;i<l.length;i++){p[i*3]+=v[i*3];p[i*3+1]+=v[i*3+1];p[i*3+2]+=v[i*3+2];l[i]-=0.004;if(l[i]<=0)resetSS(p,v,l,s,i);}
  pts.geometry.attributes.position.needsUpdate=true;pts.geometry.attributes.aLife.needsUpdate=true;}

// ═══════════════════════════════════════════════════════
// SUN — plasma core + sprite glow + corona flares
// ═══════════════════════════════════════════════════════
function createSun(){
  const group=new THREE.Group(),sz=SUN_BASE*0.058;

  // Core plasma sphere — animated fbm noise surface
  const coreMat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},
    vertexShader:`varying vec3 vN;varying vec2 vUv;void main(){vN=normalize(normalMatrix*normal);vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform float uTime;varying vec3 vN;varying vec2 vUv;${NOISE}
      void main(){float rim=1.0-max(dot(vN,vec3(0,0,1)),0.0);vec2 uv=vUv*5.0;
        float n1=fbm(uv+uTime*0.1),n2=fbm(uv*1.4-uTime*0.07+5.0);float n=(n1+n2)*0.5;
        vec3 col=mix(vec3(1,0.98,0.92),vec3(0.96,0.65,0.14),rim*0.6+n*0.2);
        col=mix(col,vec3(0.85,0.35,0.08),rim*rim*0.5);
        // Bright plasma spots
        for(int i=0;i<6;i++){
          float fi=float(i);
          vec2 spotUv=vUv*3.0+vec2(fi*1.7,fi*0.9)+uTime*0.03*(1.0+fi*0.15);
          float spot=smoothstep(0.62,0.67,noise(spotUv))*0.35;
          col+=vec3(1.0,0.85,0.3)*spot*(1.0-rim*0.6);
        }
        // Off-center specular highlight
        float spec=pow(max(dot(vN,normalize(vec3(0.4,0.3,1.0))),0.0),12.0)*0.4;
        col+=vec3(1.0,0.95,0.8)*spec;
        col+=vec3(0.25,0.15,0.03)*smoothstep(0.5,0.75,n)*(1.0-rim*0.5);
        gl_FragColor=vec4(col,1.0);}`,});
  group.add(new THREE.Mesh(new THREE.SphereGeometry(sz,48,48),coreMat));

  // Inner soft glow — BackSide shell, very close, smooth rim
  const innerGlow=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},
    vertexShader:`varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform float uTime;varying vec3 vN;void main(){
      float rim=1.0-max(dot(vN,vec3(0,0,1)),0.0);
      float alpha=pow(rim,1.2)*0.28*(0.88+sin(uTime*0.4)*0.12);
      vec3 col=mix(vec3(1.0,0.92,0.55),vec3(1.0,0.6,0.18),rim);
      gl_FragColor=vec4(col,alpha);}`,
    transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending});
  group.add(new THREE.Mesh(new THREE.SphereGeometry(sz*1.7,24,24),innerGlow));

  // Outer glow — Sprite (always faces camera, smooth light diffusion)
  const glowTex=createSunGlowTexture(512);
  const glowSprite=new THREE.Sprite(new THREE.SpriteMaterial({
    map:glowTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,
    color:0xffb040,opacity:1.0,
  }));
  glowSprite.scale.set(sz*16,sz*16,1);
  group.add(glowSprite);

  // Corona flares — 5 elongated Sprites rotating slowly, flickering independently
  const flareTex=createFlareTexture(256);
  const flares=[];
  for(let i=0;i<5;i++){
    const flareMat=new THREE.SpriteMaterial({
      map:flareTex,transparent:true,blending:THREE.AdditiveBlending,
      depthWrite:false,depthTest:false,color:0xffaa30,opacity:0.35,rotation:i*Math.PI*0.4,
    });
    const flare=new THREE.Sprite(flareMat);
    const len=sz*(4.5+Math.random()*2.5);
    flare.scale.set(len,len*0.12,1);
    flare.userData={flareIdx:i,baseRot:i*Math.PI*0.4,len};
    flares.push(flare);
    group.add(flare);
  }

  // Point light
  group.add(new THREE.PointLight(0xffa830,2.5,500));

  // Label
  const lbl=createLabel("SHUNYA","rgba(245,166,35,0.8)",36);lbl.position.set(0,-sz-1.8,0);lbl.scale.set(3.5,0.9,1);group.add(lbl);

  group.userData={coreMat,glowSprite,flares,baseSz:sz};return group;
}

// ─── Planet ───
function createPlanet(pd,unlocked){
  const group=new THREE.Group(),sz=pd.baseSize*0.055,color=new THREE.Color(pd.color);
  const p=PAL[pd.id]||{};const cH=new THREE.Color(p.h||"#fff"),cM=new THREE.Color(p.m||pd.color),cD=new THREE.Color(p.d||pd.color),cDp=new THREE.Color(p.dp||"#000");
  const geo=new THREE.SphereGeometry(sz,40,40);let mat;
  if(unlocked){
    let sfx="";
    if(p.sf==="volcanic")sfx=`float cr=0.0;for(int i=0;i<4;i++){float f=float(i);float cn=noise(vUv*(3.0+f)+uTime*0.02*(1.0+f*0.3));cr+=smoothstep(0.48,0.50,cn)*smoothstep(0.53,0.50,cn)*(0.3-f*0.05);}col+=vec3(1,0.55,0.15)*cr;`;
    else if(p.sf==="ice")sfx=`col+=vec3(0.6,0.85,1)*smoothstep(0.45,0.50,noise(vUv*12.0+uTime*0.01))*smoothstep(0.55,0.50,noise(vUv*12.0+uTime*0.01))*0.25;`;
    else if(p.sf==="swirl")sfx=`vec2 ct=vUv-0.5;col+=cH*sin(atan(ct.y,ct.x)*3.0+length(ct)*12.0-uTime*0.3)*0.08*(1.0-rim);`;
    else if(p.sf==="energy")sfx=`for(int i=0;i<3;i++){col+=cH*smoothstep(0.55,0.65,noise(vUv*(4.0+float(i)*2.0)+uTime*(0.04+float(i)*0.01)))*0.2;}`;
    else if(p.sf==="corona")sfx=`vec2 c2=vUv-0.5;col+=vec3(1,0.9,0.5)*sin(atan(c2.y,c2.x)*8.0+uTime*0.3)*smoothstep(0.5,0.1,length(c2))*0.12;`;
    else if(p.sf==="fire")sfx=`float fi=fbm(vUv*5.0+vec2(uTime*0.08,uTime*0.12));col+=vec3(1,0.4,0.1)*smoothstep(0.45,0.7,fi)*0.2;`;
    else if(p.sf==="pulse")sfx=`col+=cH*smoothstep(0.6,0.0,length(vUv-0.5))*(sin(uTime*0.8)*0.5+0.5)*0.15;`;
    else if(p.sf==="shimmer")sfx=`col=mix(col,mix(cM,cH,sin(vUv.x*10.0+vUv.y*8.0+uTime*0.5)*0.5+0.5),0.12*(1.0-rim*0.5));`;
    mat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},cH:{value:cH},cM:{value:cM},cD:{value:cD},cDp:{value:cDp}},
      vertexShader:`varying vec3 vN,vV;varying vec2 vUv;void main(){vN=normalize(normalMatrix*normal);vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.0);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
      fragmentShader:`uniform float uTime;uniform vec3 cH,cM,cD,cDp;varying vec3 vN,vV;varying vec2 vUv;${NOISE}
        void main(){float rim=1.0-max(dot(vN,vV),0.0);vec3 ld=normalize(vec3(-1,0.3,0.5));float light=max(dot(vN,ld),0.0)+0.15;float n=fbm(vUv*4.0+uTime*0.015);
          vec3 col=mix(cDp,cD,light*0.8+n*0.2);col=mix(col,cM,smoothstep(0.2,0.7,light)+n*0.12);col=mix(col,cH,smoothstep(0.75,1.0,light)*0.45);
          col=mix(col,cM*1.4,pow(rim,3.5)*0.35);${sfx}
          col+=vec3(1,0.95,0.85)*pow(max(dot(vN,normalize(vV+ld)),0.0),48.0)*0.35;col+=cM*pow(rim,5.0)*0.2;gl_FragColor=vec4(col,1.0);}`,});
  }else{mat=new THREE.MeshStandardMaterial({color:color.clone().multiplyScalar(0.1),emissive:color.clone().multiplyScalar(0.03),roughness:0.95,metalness:0.05});}
  group.add(new THREE.Mesh(geo,mat));
  if(unlocked){const gMat=new THREE.ShaderMaterial({uniforms:{uC:{value:color},uTime:{value:0}},
      vertexShader:`varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`uniform vec3 uC;uniform float uTime;varying vec3 vN;void main(){float rim=1.0-max(dot(vN,vec3(0,0,1)),0.0);gl_FragColor=vec4(uC*1.2,0.08*pow(rim,2.5)*(0.85+sin(uTime*0.6)*0.15));}`,
      transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending});
    group.add(new THREE.Mesh(new THREE.SphereGeometry(sz*1.8,16,16),gMat));}
  const lbl=createLabel(unlocked?pd.name:"· · ·",unlocked?pd.color:"rgba(150,140,180,0.3)",unlocked?42:36);lbl.position.set(0,-sz-1.2,0);lbl.scale.set(3,0.75,1);group.add(lbl);
  if(pd.id==="karma"&&unlocked){const rMat=new THREE.ShaderMaterial({uniforms:{uC:{value:color}},
      vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`uniform vec3 uC;varying vec2 vUv;void main(){float r=length(vUv-0.5)*2.0;float ring=smoothstep(0.0,0.15,r)*smoothstep(1.0,0.85,r);float bands=sin(r*25.0)*0.5+0.5;gl_FragColor=vec4(uC*1.2,ring*0.25*(0.5+bands*0.5));}`,
      transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
    const rMesh=new THREE.Mesh(new THREE.RingGeometry(sz*1.6,sz*2.8,64),rMat);rMesh.rotation.x=Math.PI*0.5;rMesh.rotation.z=0.3;group.add(rMesh);}
  group.userData={pd,unlocked,mat,sz};return group;
}

function createOrbit(radius,color,unlocked){
  const group=new THREE.Group(),col=new THREE.Color(color);
  if(unlocked){const c=new THREE.EllipseCurve(0,0,radius,radius,0,TAU,false,0),pts=c.getPoints(256).map(p=>new THREE.Vector3(p.x,0,p.y));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:0.12,depthWrite:false})));
    const aN=60,aP=new Float32Array(aN*3),aA=new Float32Array(aN),aG=new THREE.BufferGeometry();aG.setAttribute("position",new THREE.BufferAttribute(aP,3));aG.setAttribute("aAlpha",new THREE.BufferAttribute(aA,1));
    group.add(new THREE.Line(aG,new THREE.ShaderMaterial({uniforms:{uC:{value:col}},
      vertexShader:`attribute float aAlpha;varying float vA;void main(){vA=aAlpha;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`uniform vec3 uC;varying float vA;void main(){gl_FragColor=vec4(uC*1.3,vA);}`,
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));
    group.userData={arcGeo:aG,radius,unlocked:true};
  }else{const c=new THREE.EllipseCurve(0,0,radius,radius,0,TAU,false,0);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(128).map(p=>new THREE.Vector3(p.x,0,p.y))),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:0.04,depthWrite:false})));group.userData={unlocked:false};}
  return group;
}
function updateArc(ring,angle,radius){if(!ring.userData.unlocked||!ring.userData.arcGeo)return;const g=ring.userData.arcGeo,pos=g.attributes.position.array,alp=g.attributes.aAlpha.array,n=alp.length;
  for(let i=0;i<n;i++){const t=i/n,a=angle-1.2*t;pos[i*3]=Math.cos(a)*radius;pos[i*3+1]=0;pos[i*3+2]=Math.sin(a)*radius;const f=1-t;alp[i]=f*f*0.40;}
  g.attributes.position.needsUpdate=true;g.attributes.aAlpha.needsUpdate=true;}

function createBelt(inner,outer,count){
  const pos=new Float32Array(count*3),sz=new Float32Array(count),ph=new Float32Array(count);
  for(let i=0;i<count;i++){const a=Math.random()*TAU,r=inner+Math.random()*(outer-inner);pos[i*3]=Math.cos(a)*r;pos[i*3+1]=(Math.random()-0.5)*0.5;pos[i*3+2]=Math.sin(a)*r;sz[i]=0.02+Math.random()*0.08;ph[i]=a;}
  const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));geo.setAttribute("aSize",new THREE.BufferAttribute(sz,1));geo.setAttribute("aPhase",new THREE.BufferAttribute(ph,1));
  const group=new THREE.Group();group.add(new THREE.Points(geo,new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uPR:{value:Math.min(window.devicePixelRatio,2)}},
    vertexShader:`attribute float aSize,aPhase;uniform float uTime,uPR;varying float vA;void main(){float a=aPhase+uTime*0.012;float r=length(vec2(position.x,position.z));vec3 p=vec3(cos(a)*r,position.y,sin(a)*r);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=clamp(aSize*uPR*(80.0/-mv.z),0.4,2.5);gl_Position=projectionMatrix*mv;vA=0.15+aSize*1.0;}`,
    fragmentShader:`varying float vA;void main(){float d=length(gl_PointCoord-0.5)*2.0;gl_FragColor=vec4(0.65,0.58,0.42,smoothstep(1.0,0.3,d)*vA);}`,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));
  const lbl=createLabel("ASTEROID BELT","rgba(185,165,120,0.25)",28);const midR=(inner+outer)/2;lbl.position.set(Math.cos(Math.PI*1.3)*midR,-0.5,Math.sin(Math.PI*1.3)*midR);lbl.scale.set(5,1.2,1);group.add(lbl);return group;
}
function createMoon(){return new THREE.Mesh(new THREE.SphereGeometry(0.15,10,10),new THREE.MeshStandardMaterial({color:0xfff8e8,emissive:0xfff0d0,emissiveIntensity:0.4,roughness:0.4}));}

function setupCtrl(cam,el,opts={}){
  const s={down:false,px:0,py:0,sph:{th:opts.th||0,phi:opts.phi||1.15,r:opts.r||65},tgt:new THREE.Vector3(),dmp:{th:0,phi:0},auto:0.00015,minR:18,maxR:180,minP:0.2,maxP:Math.PI-0.2};
  const upd=()=>{const{th,phi,r}=s.sph;cam.position.set(s.tgt.x+r*Math.sin(phi)*Math.sin(th),s.tgt.y+r*Math.cos(phi),s.tgt.z+r*Math.sin(phi)*Math.cos(th));cam.lookAt(s.tgt);};
  const dw=e=>{s.down=true;s.px=e.clientX??e.touches?.[0]?.clientX??0;s.py=e.clientY??e.touches?.[0]?.clientY??0;s.dmp.th=0;s.dmp.phi=0;};
  const mv=e=>{if(!s.down)return;const x=e.clientX??e.touches?.[0]?.clientX??0,y=e.clientY??e.touches?.[0]?.clientY??0;const dx=(x-s.px)*0.004,dy=(y-s.py)*0.004;s.sph.th-=dx;s.sph.phi=Math.max(s.minP,Math.min(s.maxP,s.sph.phi-dy));s.dmp.th=-dx;s.dmp.phi=-dy;s.px=x;s.py=y;};
  const up=()=>{s.down=false;};const wh=e=>{s.sph.r=Math.max(s.minR,Math.min(s.maxR,s.sph.r+e.deltaY*0.04));};
  let lp=0;const ts=e=>{if(e.touches.length===2){lp=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}else if(e.touches.length===1)dw(e);};
  const tm=e=>{if(e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);s.sph.r=Math.max(s.minR,Math.min(s.maxR,s.sph.r+(lp-d)*0.12));lp=d;}else if(e.touches.length===1)mv(e);};
  el.addEventListener("mousedown",dw);el.addEventListener("mousemove",mv);window.addEventListener("mouseup",up);el.addEventListener("wheel",wh,{passive:true});el.addEventListener("touchstart",ts,{passive:true});el.addEventListener("touchmove",tm,{passive:true});el.addEventListener("touchend",up);
  const dispose=()=>{el.removeEventListener("mousedown",dw);el.removeEventListener("mousemove",mv);window.removeEventListener("mouseup",up);el.removeEventListener("wheel",wh);el.removeEventListener("touchstart",ts);el.removeEventListener("touchmove",tm);el.removeEventListener("touchend",up);};
  return{state:s,updateCamera:upd,dispose};
}

export default function SolarSystem3D({planets,moonCounts,sunSize,unlockedPlanets,rehesyaState,onPlanetClick,onSunClick,onRehesyaClick}){
  const mountRef=useRef(null),frameRef=useRef(null),timerRef=useRef(new THREE.Timer());
  const scnRef=useRef(null),renRef=useRef(null),camRef=useRef(null),ctrlRef=useRef(null);
  const rayRef=useRef(new THREE.Raycaster()),mvRef=useRef(new THREE.Vector2());
  const pmRef=useRef([]),sunRef=useRef(null),rehRef=useRef(null),rehRRef=useRef(null),mgRef=useRef({});
  const mcR=useRef(moonCounts),ssR=useRef(sunSize),ulR=useRef(unlockedPlanets),rsR=useRef(rehesyaState);
  useEffect(()=>{mcR.current=moonCounts;},[moonCounts]);useEffect(()=>{ssR.current=sunSize;},[sunSize]);
  useEffect(()=>{ulR.current=unlockedPlanets;},[unlockedPlanets]);useEffect(()=>{rsR.current=rehesyaState;},[rehesyaState]);

  const onClick=useCallback(e=>{
    if(!camRef.current||!scnRef.current)return;const rect=mountRef.current.getBoundingClientRect(),cx=e.clientX??e.changedTouches?.[0]?.clientX,cy=e.clientY??e.changedTouches?.[0]?.clientY;
    mvRef.current.set(((cx-rect.left)/rect.width)*2-1,-((cy-rect.top)/rect.height)*2+1);rayRef.current.setFromCamera(mvRef.current,camRef.current);
    if(sunRef.current&&rayRef.current.intersectObject(sunRef.current,true).length>0){onSunClick?.();return;}
    if(rehRef.current&&rsR.current!=="traveling"&&rayRef.current.intersectObject(rehRef.current,true).length>0){onRehesyaClick?.();return;}
    for(const pm of pmRef.current){if(rayRef.current.intersectObject(pm.g,true).length>0){onPlanetClick?.(pm.pd);return;}}
  },[onPlanetClick,onSunClick,onRehesyaClick]);

  useEffect(()=>{
    if(!mountRef.current)return;
    const box=mountRef.current,w=box.clientWidth,h=box.clientHeight,mob=w<768,dpr=Math.min(window.devicePixelRatio||1,mob?1.5:2);
    const ren=new THREE.WebGLRenderer({antialias:!mob,alpha:false,powerPreference:"high-performance"});
    ren.setSize(w,h);ren.setPixelRatio(dpr);ren.setClearColor(0x020108);ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=1.0;
    box.appendChild(ren.domElement);renRef.current=ren;
    const scene=new THREE.Scene();scnRef.current=scene;
    const cam=new THREE.PerspectiveCamera(45,w/h,0.1,3000);camRef.current=cam;
    const ctrl=setupCtrl(cam,ren.domElement,{th:0.0,phi:1.15,r:mob?80:65});ctrlRef.current=ctrl;ctrl.updateCamera();
    scene.add(new THREE.AmbientLight(0x180e28,0.4));
    const bg=createBg();bg.material.uniforms.uRes.value.set(w,h);scene.add(bg);
    const stars=createStars(mob?2000:4000);scene.add(stars);
    const shooters=createShooters(mob?8:15);scene.add(shooters);
    const sun=createSun();scene.add(sun);sunRef.current=sun;
    const belt=createBelt(390*0.04+0.5,490*0.04-0.5,mob?180:400);scene.add(belt);
    const pms=[];
    planets.forEach(pd=>{const ul=unlockedPlanets.includes(pd.id),oR=pd.baseOrbit*0.04;
      const ring=createOrbit(oR,pd.color,ul);scene.add(ring);const pg=createPlanet(pd,ul);scene.add(pg);
      const mg=new THREE.Group();const mc=moonCounts[pd.id]||0;for(let i=0;i<mc;i++)mg.add(createMoon());pg.add(mg);mgRef.current[pd.id]=mg;
      pms.push({g:pg,ring,pd,oR});});pmRef.current=pms;
    const rO=860*0.04,rR=createOrbit(rO,"#38bdf8",true);scene.add(rR);rehRRef.current=rR;
    const rG=createPlanet({id:"rehesya",name:"REHESYA",color:"#38bdf8",baseSize:13,baseOrbit:860,speed:0.00008},true);scene.add(rG);rehRef.current=rG;
    ren.domElement.addEventListener("click",onClick);ren.domElement.addEventListener("touchend",onClick,{passive:true});
    const onRsz=()=>{const nw=box.clientWidth,nh=box.clientHeight;cam.aspect=nw/nh;cam.updateProjectionMatrix();ren.setSize(nw,nh);bg.material.uniforms.uRes.value.set(nw,nh);};window.addEventListener("resize",onRsz);
    const timer=timerRef.current;
    const loop=()=>{
      frameRef.current=requestAnimationFrame(loop);timer.update();const t=timer.getElapsed();
      const c=ctrlRef.current;if(c&&!c.state.down){c.state.sph.th+=c.state.auto;c.state.dmp.th*=0.96;c.state.dmp.phi*=0.96;c.state.sph.th+=c.state.dmp.th;c.state.sph.phi+=c.state.dmp.phi;c.state.sph.phi=Math.max(c.state.minP,Math.min(c.state.maxP,c.state.sph.phi));}
      c.updateCamera();
      bg.material.uniforms.uTime.value=t;stars.material.uniforms.uTime.value=t;updateSS(shooters);belt.children[0].material.uniforms.uTime.value=t;
      // Sun — scale + update uniforms + animate glow + corona flares
      const sunScale=ssR.current/SUN_BASE;
      sun.scale.setScalar(sunScale);
      sun.children.forEach(ch=>{if(ch.material?.uniforms?.uTime)ch.material.uniforms.uTime.value=t;});
      if(sun.userData.glowSprite){
        const pulse=1.0+Math.sin(t*0.35)*0.06+Math.sin(t*0.8)*0.03;
        const baseSz=sun.userData.baseSz;
        sun.userData.glowSprite.scale.set(baseSz*16*pulse,baseSz*16*pulse,1);
      }
      // Corona flares — rotate slowly, flicker independently
      if(sun.userData.flares){sun.userData.flares.forEach(fl=>{
        const i=fl.userData.flareIdx;
        const rot=fl.userData.baseRot+t*0.025;
        fl.material.rotation=rot;
        const flicker=0.2+Math.sin(t*0.7+i*2.5)*0.08+Math.sin(t*1.3+i*4.0)*0.06+Math.sin(t*0.3+i*1.1)*0.04;
        fl.material.opacity=flicker;
      });}
      pms.forEach(pm=>{const angle=t*pm.pd.speed*50;
        pm.g.position.set(Math.cos(angle)*pm.oR,0,Math.sin(angle)*pm.oR);
        const pulse=1.0+Math.sin(t*0.8+pm.pd.baseOrbit*0.01)*0.02;pm.g.children[0].scale.setScalar(pulse);pm.g.children[0].rotation.y+=0.003;
        if(pm.g.userData.mat?.uniforms?.uTime)pm.g.userData.mat.uniforms.uTime.value=t;
        pm.g.children.forEach(ch=>{if(ch.material?.uniforms?.uTime)ch.material.uniforms.uTime.value=t;});
        updateArc(pm.ring,angle,pm.oR);
        const mg=mgRef.current[pm.pd.id];if(mg){const mc=mcR.current[pm.pd.id]||0;
          while(mg.children.length<mc)mg.add(createMoon());while(mg.children.length>mc){const r=mg.children.pop();r.geometry.dispose();r.material.dispose();}
          const s=pm.g.userData.sz||0.6;mg.children.forEach((mn,i)=>{const ma=t*(1.0+i*0.2)+(i*TAU)/Math.max(mc,1),md=s*2.0+i*0.25;mn.position.set(Math.cos(ma)*md,Math.sin(ma*0.5)*md*0.25,Math.sin(ma)*md);});}
      });
      if(rehRef.current){const rA=t*0.00008*50;rehRef.current.position.set(Math.cos(rA)*rO,0,Math.sin(rA)*rO);rehRef.current.children[0].rotation.y+=0.002;
        updateArc(rehRRef.current,rA,rO);const rs=rsR.current,cs=rehRef.current.scale.x;
        rehRef.current.scale.setScalar(THREE.MathUtils.lerp(cs,rs==="traveling"?0.01:1,0.02));rehRef.current.visible=cs>0.02;if(rehRRef.current)rehRRef.current.visible=cs>0.02;
        if(rs==="answered"&&rehRef.current.userData.mat?.uniforms?.cH)rehRef.current.userData.mat.uniforms.cH.value.lerp(new THREE.Color(0xffd700),0.02);
        rehRef.current.children.forEach(ch=>{if(ch.material?.uniforms?.uTime)ch.material.uniforms.uTime.value=t;});}
      ren.render(scene,cam);};
    loop();
    return()=>{cancelAnimationFrame(frameRef.current);ctrl.dispose();ren.domElement.removeEventListener("click",onClick);ren.domElement.removeEventListener("touchend",onClick);window.removeEventListener("resize",onRsz);ren.dispose();
      scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});
      if(box.contains(ren.domElement))box.removeChild(ren.domElement);};
  },[]);
  return <div ref={mountRef} style={{position:"fixed",inset:0,zIndex:0,background:"#020108",touchAction:"none"}} />;
}
