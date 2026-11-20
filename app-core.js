/* ============================================================
   YazFit — Core: state · onboarding · actions · reminders ·
   paywall/checkout · PWA init
   ============================================================ */
'use strict';

const LSKEY='fitpulse_v1';
let S=null;
const fired=new Set();

/* ---------- state ---------- */
function defaultState(){return{
  v:1,theme:null,units:'imperial',onboarded:false,ob:null,mpSeed:0,adjust:null,
  user:null,goal:null,plan:null,
  settings:{reminders:{meals:true,water:true,workout:true,weigh:true,sleep:true},waterHours:2,workoutTime:'18:00',weighDay:0},
  logs:{weights:[],water:{},meals:{},workouts:{}},
  sub:{tier:'free',trialEnd:0,plan:null,renews:null},
  ui:{tab:'today',openDay:0}
};}
function save(){try{localStorage.setItem(LSKEY,JSON.stringify(S));}catch(e){}}
function loadState(){
  try{S=JSON.parse(localStorage.getItem(LSKEY))||null;}catch(e){S=null;}
  if(!S||S.v!==1)S=defaultState();
  if(!S.logs)S.logs=defaultState().logs;
}
function isPro(){
  if(S.sub.tier!=='free')return true;
  return !!(S.sub.trialEnd&&Date.now()<S.sub.trialEnd);
}
/* ---------- landing (marketing home) ---------- */
function showLanding(){
  document.body.classList.add('landing-on');
  el('#landing').hidden=false;
  buildLandingTiers();
  window.scrollTo(0,0);
}
function enterApp(){
  document.body.classList.remove('landing-on');
  const l=el('#landing'); if(l)l.hidden=true;
  el('#app').classList.add('on');
  render();
}
function buildLandingTiers(){
  const box=el('#landing-tiers'); if(!box)return;
  box.innerHTML=FD.PLANS.map(p=>{
    const cur=isPro()&&S.sub.tier===p.id;
    const price=p.pm===0?'$0':('$'+p.pm+'<small>/mo</small>');
    const cta=p.id==='free'
      ?`<button class="btn wide ghost" data-act="start-journey">Start Free</button>`
      :`<button class="btn wide ${p.pop?'accent':'primary'}" data-act="plan-pick" data-plan="${p.id}" ${cur?'disabled':''}>${cur?'✓ Current plan':'Choose '+p.name}</button>`;
    return `<div class="tier ${p.pop?'pop':''}">${p.pop?'<div class="popb">MOST POPULAR</div>':''}
      <h4>${p.name}</h4>
      <div class="price">${price}</div>
      <div class="tiny muted">${p.pm===0?'Free forever':billing==='yearly'?('$'+p.py+'/yr'):('$'+(p.py/12).toFixed(2)+'/mo billed yearly · save '+Math.round((1-p.py/(p.pm*12))*100)+'%')}</div>
      <ul>${p.inc.map(f=>`<li>${f}</li>`).join('')}${p.exc.map(f=>`<li class="no">${f}</li>`).join('')}</ul>
      ${cta}</div>`;
  }).join('');
}
function computePlan(){
  const mm=FP.metrics(S.user,S.goal);
  if(S.adjust&&S.adjust.delta){
    mm.target=Math.max(1200,mm.target+S.adjust.delta);
    mm.carbs=Math.max(20,mm.carbs+Math.round(S.adjust.delta/4));
    mm.adjusted=true;
  }
  const wk=FP.workoutPlan(S.user,S.goal,mm);
  const mp=FP.mealPlan(S.user,S.goal,mm,S.mpSeed||0);
  const sch=FP.schedule(S.user,mp,wk,S.settings);
  S.plan={m:mm,wk,mp,sch,created:todayKey()};
  save();
}

/* ---------- toasts & modals ---------- */
function toast(msg,icon){
  const t=document.createElement('div');t.className='toast';
  t.innerHTML=`<span class="em">${icon||'✅'}</span><span>${msg}</span>`;
  el('#toast-root').appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),320);},4200);
}
function openModal(html){
  el('#modal-root').innerHTML=`<div class="modal">${html}</div>`;
  el('#modal-root').classList.add('on');
}
function closeModal(){el('#modal-root').classList.remove('on');el('#modal-root').innerHTML='';}

/* ---------- render ---------- */
function render(){
  const tab=S.ui.tab;
  ['today','workouts','nutrition','progress','profile'].forEach(t=>{
    const v=el('#view-'+t);if(!v)return;
    const on=t===tab;v.hidden=!on;
    if(on)v.innerHTML=VIEWS[t]();
  });
  document.querySelectorAll('.nav-item[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  // chrome
  const badge=el('#subbadge');
  if(isPro()){badge.style.display='';badge.textContent=S.sub.tier==='elite'?'ELITE':'PLUS';}
  else badge.style.display='none';
  el('#btn-pro').innerHTML=isPro()?'💎':'Go Pro';
  el('#sidepro').innerHTML=isPro()
    ?`<div class="tiny muted" style="padding:4px 6px">${S.sub.tier==='elite'?'💎 Elite active':'⚡ Plus active'} — thanks for supporting YazFit.</div>`
    :`<div class="tiny" style="padding:4px 6px"><b>⚡ Go Pro</b><br><span class="muted">Full programs, meal plans, reminders, AI coach — from $9.99/mo.</span><br><button class="btn sm accent" style="margin-top:8px;width:100%" data-act="open-paywall">See plans</button></div>`;
  if(document.body.classList.contains('landing-on'))buildLandingTiers();
}
function showTab(tab){S.ui.tab=tab;save();render();window.scrollTo({top:0});}
function rerender(){render();}

/* ---------- theme ---------- */
function applyTheme(){
  const t=S.theme||(window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
  document.body.dataset.theme=t;
}

/* ============================================================
   ONBOARDING
   ============================================================ */
const OB_GOALS=[
  {id:'lose',em:'🔥',nm:'Lose fat',ds:'Sustainable deficit, high protein, cardio included'},
  {id:'gain',em:'💪',nm:'Build muscle',ds:'Lean surplus + progressive overload'},
  {id:'stronger',em:'🏋️',nm:'Get stronger',ds:'Low reps, heavy loads, long rests'},
  {id:'recomp',em:'♻️',nm:'Recomposition',ds:'Maintenance calories, lift hard, re-shape'},
  {id:'health',em:'❤️',nm:'General health',ds:'WHO minimums, energy, longevity'}
];
function obShow(){
  let ob=S.ob;
  if(!ob){S.ob={step:0,d:{}};ob=S.ob;}
  el('#onboarding').classList.add('on');
  el('#onboarding').innerHTML=obStepHTML(ob.step);
}
function obClose(){el('#onboarding').classList.remove('on');el('#onboarding').innerHTML='';}
function obStepHTML(step){
  const d=S.ob.d;const u=S.units;
  const dots=`<div class="ob-dots">${[0,1,2,3,4,5].map(i=>`<div class="d ${i<=step?'on':''}"></div>`).join('')}</div>`;
  const nav=`<div class="ob-foot">
    ${step>0?'<button class="btn" data-act="ob-back">← Back</button>':'<button class="btn" data-act="ob-demo">⚡ Try demo profile</button>'}
    <button class="btn primary" data-act="ob-next">${step===5?'⚡ Build my plan':'Continue →'}</button></div>`;
  let body='';
  if(step===0){
    body=`<div class="ob-hero"><img class="ob-hero-img" src="assets/yazfit-hero.jpg" alt="YazFit — Train Harder, Live Better">
      <h1>Welcome to YazFit</h1>
      <p class="muted">Your personal trainer & nutritionist — built on WHO, ACSM, ISSN and CDC standards, tuned to real American life: Chipotle runs, 9-to-5 desk jobs, Starbucks runs and Sunday weigh-ins.</p>
      <ul class="welcomelist" style="text-align:left">
        <li><span class="em">🏋️</span><span><b>Custom workout program</b> — split, exercises, sets, progression & deloads for your equipment and schedule.</span></li>
        <li><span class="em">🥗</span><span><b>Auto meal plans</b> — American foods, portions in oz/cups, swaps, IF mode, eating-out guide.</span></li>
        <li><span class="em">🔔</span><span><b>Smart reminders</b> — meals, water, workouts, weigh-ins, wind-down.</span></li>
        <li><span class="em">📈</span><span><b>Adaptive AI</b> — adjusts calories weekly based on your real weigh-ins.</span></li>
      </ul></div>
      <label class="f"><span>Units</span><div class="seg">
        <button class="${u==='imperial'?'on':''}" data-act="ob-units" data-v="imperial">lbs / ft / oz (US)</button>
        <button class="${u==='metric'?'on':''}" data-act="ob-units" data-v="metric">kg / cm / g</button></div></label>
      ${nav}`;
  } else if(step===1){
    body=`<h2>👤 About you</h2><p class="muted small">Used to compute BMR (Mifflin-St Jeor) and body-fat estimate.</p>
      <label class="f"><span>First name</span><input class="in" id="ob-name" value="${esc(d.name||'')}" placeholder="e.g. John"></label>
      <label class="f"><span>Sex (affects BMR & standards)</span><div class="seg">
        <button class="${d.sex==='m'?'on':''}" data-act="ob-sex" data-v="m">Male</button>
        <button class="${d.sex==='f'?'on':''}" data-act="ob-sex" data-v="f">Female</button></div></label>
      <div class="inpair">
        <label class="f"><span>Age</span><input class="in" id="ob-age" type="number" value="${d.age||''}" placeholder="34"></label>
        <label class="f"><span>Height (${unitH()})</span>${u==='imperial'
          ?`<div class="inpair"><input class="in" id="ob-ft" type="number" value="${d.ft??5}" placeholder="ft"><input class="in" id="ob-in" type="number" value="${d.ins??10}" placeholder="in"></div>`
          :`<input class="in" id="ob-cm" type="number" value="${d.cm||''}" placeholder="178">`}</label>
      </div>
      <div class="inpair">
        <label class="f"><span>Weight (${unitW()})</span><input class="in" id="ob-w" type="number" step="0.1" value="${d.w||''}" placeholder="${u==='imperial'?'212':'96'}"></label>
        <label class="f"><span>Waist (${unitH()}) — optional</span><input class="in" id="ob-waist" type="number" step="0.5" value="${d.waist||''}" placeholder="${u==='imperial'?'42':'107'}"></label>
      </div>
      <label class="f"><span>Body fat % — optional (we estimate it if empty)</span><input class="in" id="ob-bf" type="number" value="${d.bf||''}" placeholder="e.g. 28"></label>
      ${nav}`;
  } else if(step===2){
    const gt=d.goal||'lose';
    const isLose=gt==='lose',isGain=gt==='gain';
    body=`<h2>🎯 Your goal</h2>
      <div class="goalgrid">${OB_GOALS.map(g=>`<button class="goalcard ${gt===g.id?'on':''}" data-act="ob-goal" data-v="${g.id}"><div class="em">${g.em}</div><div class="nm">${g.nm}</div><div class="ds">${g.ds}</div></button>`).join('')}</div>
      ${gt!=='health'?`<label class="f" style="margin-top:10px"><span>Target weight (${unitW()}) — healthy range suggestion: ${d._sugLo?dispWn(d._sugLo)+'–'+dispWn(d._sugHi):'—'}</span>
        <input class="in" id="ob-tw" type="number" step="0.5" value="${d.tw||''}" placeholder="${u==='imperial'?'187':'85'}"></label>`:''}
      ${isLose?`<label class="f"><span>Weekly pace: <b id="rate-v">${(d.rate||1).toFixed(2)} ${unitW()}/wk</b> — CDC safe zone 1–2 lb</span>
        <input class="slider" id="ob-rate" type="range" min="0.25" max="2" step="0.25" value="${d.rate||1}" oninput="obRateLive(this)"></label>`:''}
      ${isGain?`<label class="f"><span>Weekly gain pace: <b id="rate-v">${(d.rate||0.5).toFixed(2)} ${unitW()}/wk</b> — lean-bulk zone 0.25–0.5 lb</span>
        <input class="slider" id="ob-rate" type="range" min="0.25" max="1" step="0.25" value="${d.rate||0.5}" oninput="obRateLive(this)"></label>`:''}
      <label class="f"><span>Training days per week</span><div class="seg">${[2,3,4,5,6].map(n=>`<button class="${(d.days||4)===n?'on':''}" data-act="ob-days" data-v="${n}">${n}</button>`).join('')}</div></label>
      <div id="ob-eta" class="banner info">🧮 Fill in your target weight — I'll compute your timeline.</div>
      ${nav}`;
  } else if(step===3){
    body=`<h2>🏋️ Training & daily life</h2>
      <label class="f"><span>Experience</span><div class="seg">${[['new','New (0–6 mo)'],['some','Some (6–24 mo)'],['adv','Experienced (2+ yr)']].map(([v,t])=>`<button class="${(d.exp||'new')===v?'on':''}" data-act="ob-exp" data-v="${v}">${t}</button>`).join('')}</div></label>
      <label class="f"><span>Equipment access</span><div class="goalgrid" style="grid-template-columns:repeat(3,1fr)">
        ${[['gym','🏢','Full gym'],['home','🏠','Home dumbbells'],['bw','🤸','Bodyweight']].map(([v,e,t])=>`<button class="goalcard ${(d.equip||'gym')===v?'on':''}" data-act="ob-equip" data-v="${v}"><div class="em">${e}</div><div class="nm">${t}</div></button>`).join('')}</div></label>
      <label class="f"><span>Typical workday</span><div class="goalgrid" style="grid-template-columns:repeat(3,1fr)">
        ${[['desk','🪑','Desk job'],['feet','🚶','On my feet'],['labor','🔧','Physical labor']].map(([v,e,t])=>`<button class="goalcard ${(d.job||'desk')===v?'on':''}" data-act="ob-job" data-v="${v}"><div class="em">${e}</div><div class="nm">${t}</div></button>`).join('')}</div></label>
      <label class="f"><span>Preferred workout time</span><input class="in" id="ob-wt" type="time" value="${esc(d.wt||'18:00')}"></label>
      ${nav}`;
  } else if(step===4){
    const diet=d.diet||'none';
    body=`<h2>🍽️ Lifestyle & food</h2>
      <div class="inpair">
        <label class="f"><span>Wake time</span><input class="in" id="ob-wake" type="time" value="${esc(d.wake||'06:30')}"></label>
        <label class="f"><span>Bedtime</span><input class="in" id="ob-sleep" type="time" value="${esc(d.sleep||'22:30')}"></label>
      </div>
      <label style="display:flex;gap:10px;align-items:center;margin-bottom:12px"><input type="checkbox" id="ob-if" ${d.ifMode?'checked':''} style="width:20px;height:20px;accent-color:var(--primary)">
      <span class="small"><b>Intermittent fasting (16:8)</b> — skip breakfast, eat from noon to ~8 pm</span></label>
      <label class="f"><span>Diet style</span><div class="chips">${['none','vegetarian','vegan','keto','glutenfree','halal'].map(v=>`<button class="chip ${diet===v?'on':''}" data-act="ob-diet" data-v="${v}">${{none:'None',vegetarian:'Vegetarian',vegan:'Vegan',keto:'Keto',glutenfree:'Gluten-free',halal:'Halal'}[v]}</button>`).join('')}</div></label>
      <label class="f"><span>Allergies / exclusions</span><div class="chips">${['nuts','dairy','eggs','fish','shellfish','soy','gluten'].map(v=>`<button class="chip ${(d.all||[]).includes(v)?'on':''}" data-act="ob-allergy" data-v="${v}">${v[0].toUpperCase()+v.slice(1)}</button>`).join('')}</div></label>
      <label class="f"><span>How often do you eat out / order in?</span><div class="seg">${[['rare','Rarely'],['1-2','1–2×/wk'],['3-5','3–5×/wk'],['daily','Daily']].map(([v,t])=>`<button class="${(d.eatout||'1-2')===v?'on':''}" data-act="ob-eatout" data-v="${v}">${t}</button>`).join('')}</div></label>
      <label class="f"><span>Health flags — I'll adapt the plan</span><div class="chips">${['knee','back','shoulder','wrist','diabetes','blood pressure','pregnant','asthma'].map(v=>`<button class="chip ${(d.flags||[]).includes(v)?'on':''}" data-act="ob-flag" data-v="${v}">${v[0].toUpperCase()+v.slice(1)}</button>`).join('')}</div></label>
      <div class="banner warn">⚕️ These flags swap risky exercises and adjust nutrition, but they are <b>not</b> medical clearance. If any apply — especially diabetes, blood pressure or pregnancy — get your physician's OK first (ACSM screening).</div>
      ${nav}`;
  } else {
    const g=S.goal||{};
    body=`<h2>✅ Ready to build</h2>
      <div class="card tight small">
        <div style="padding:4px 0"><b>Name:</b> ${esc(d.name||'Athlete')} · ${d.sex==='f'?'Female':'Male'} · ${d.age||'—'} yrs</div>
        <div style="padding:4px 0"><b>Height / weight:</b> ${d._h?dispH(d._h):'—'} / ${d._w?dispW(d._w):'—'}</div>
        <div style="padding:4px 0"><b>Goal:</b> ${goalName(d.goal)} → ${d.tw?dispW(FP.lbToKg(d.tw)||d.tw):'—'} ${d.days||4}×/wk</div>
        <div style="padding:4px 0"><b>Diet:</b> ${esc(d.diet||'none')} ${d.ifMode?'· 16:8 IF':''}</div>
        <div style="padding:4px 0"><b>Equipment:</b> ${esc(d.equip||'gym')} · ${esc(d.exp||'new')}</div>
      </div>
      <div class="banner info">🧠 I'll now compute your BMR, TDEE, macros, build your weekly split and generate meal plans — then set up reminders.</div>
      ${nav}`;
  }
  return `<div class="ob-wrap"><div class="brand" style="margin-bottom:4px"><div class="logo">Y</div><span>YazFit</span></div>${dots}${body}</div>`;
}
function obRateLive(inp){
  const v=parseFloat(inp.value);const d=S.ob.d;
  el('#rate-v').textContent=v.toFixed(2)+' '+unitW()+'/wk';
  d.rate=v;
}
function obCollect(step){
  const d=S.ob.d;
  try{
    if(step===1){
      d.name=(el('#ob-name').value||'Athlete').trim().slice(0,30);
      d.age=parseInt(el('#ob-age').value,10);
      if(u_bad(d.age,13,90))return 'Enter an age between 13 and 90.';
      if(S.units==='imperial'){d.ft=parseFloat(el('#ob-ft').value)||5;d.ins=parseFloat(el('#ob-in').value)||0;d._h=FP.inToCm(d.ft*12+d.ins);}
      else{d.cm=parseFloat(el('#ob-cm').value);if(u_bad(d.cm,120,230))return 'Enter height 120–230 cm.';d._h=d.cm;}
      d.w=parseFloat(el('#ob-w').value);
      if(u_bad(d.w,60,700))return 'Enter a valid weight.';
      d._w=S.units==='imperial'?FP.lbToKg(d.w):d.w;
      d.waist=parseFloat(el('#ob-waist').value)||0;
      d._waist=d.waist?(S.units==='imperial'?FP.inToCm(d.waist):d.waist):0;
      d.bf=parseFloat(el('#ob-bf').value)||0;
    }
    if(step===2){
      if(d.goal!=='health'){
        d.tw=parseFloat(el('#ob-tw').value)||0;
        if(d.tw)d._tw=S.units==='imperial'?FP.lbToKg(d.tw):d.tw;
      }
      d.days=parseInt(d.days||4,10);
      updateEta();
    }
    if(step===3){d.wt=el('#ob-wt').value||'18:00';}
    if(step===4){d.wake=el('#ob-wake').value||'06:30';d.sleep=el('#ob-sleep').value||'22:30';d.ifMode=el('#ob-if').checked;}
  }catch(e){return 'Please fill the highlighted fields.';}
  return null;
}
function u_bad(v,lo,hi){return !v||v<lo||v>hi;}
function updateEta(){
  const d=S.ob.d,banner=el('#ob-eta');if(!banner)return;
  if(d.goal!=='health'&&d._tw&&d._w){
    const diff=Math.abs(FP.kgToLb(d._w)-FP.kgToLb(d._tw));
    const rate=d.rate||1;
    const w=Math.ceil(diff/rate);
    banner.innerHTML=`🧮 ${diff.toFixed(0)} ${unitW()} to go ≈ <b>${w} weeks</b> at ${(d.goal==='gain'?rate:rate)} ${unitW()}/wk. ${w>24?'Consider milestone goals — long timelines need checkpoints.':''}`;
  } else if(d.goal==='health'){
    banner.innerHTML='🧮 Health mode: calories at maintenance, WHO activity minimums, focus on consistency.';
  }
}
function obNext(){
  const err=obCollect(S.ob.step);
  if(err){toast(err,'⚠️');return;}
  if(S.ob.step===5){obBuild();return;}
  // suggestion for step 2 target
  if(S.ob.step===1&&S.ob.d._w){
    const m2=(S.ob.d._h/100)**2;
    const hi=24.9*m2,lo=18.5*m2;
    S.ob.d._sugLo=FP.kgToLb(S.units==='imperial'?lo:lo);
    S.ob.d._sugHi=FP.kgToLb(hi);
    if(!S.ob.d.tw){
      const curLb=FP.kgToLb(S.ob.d._w);
      S.ob.d.tw=S.units==='imperial'?Math.round(Math.max(curLb-25,hi*2.20462)):Math.round(Math.max(S.ob.d._w-11,hi));
    }
  }
  S.ob.step++;save();obShow();
}
function obBack(){if(S.ob.step>0){S.ob.step--;save();obShow();}}
function obBuild(){
  const d=S.ob.d;
  const pregnant=(d.flags||[]).includes('pregnant');
  S.user={name:d.name||'Athlete',sex:d.sex||'m',age:d.age||30,heightCm:d._h||175,weightKg:d._w||80,
    waistCm:d._waist||0,bodyFat:d.bf||0,job:d.job||'desk',experience:d.exp||'new',equipment:d.equip||'gym',
    wake:d.wake||'06:30',sleep:d.sleep||'22:30',ifMode:!!d.ifMode,diet:d.diet||'none',allergies:d.all||[],
    eatingOut:d.eatout||'1-2',flags:d.flags||[]};
  S.goal={type:pregnant?'maintain':(d.goal||'lose'),days:d.days||4,rate:d.rate||(d.goal==='gain'?0.5:1),
    targetKg:d._tw||(d.goal==='lose'?S.user.weightKg*0.9:S.user.weightKg)};
  S.onboarded=true;S.adjust=null;S.mpSeed=0;
  computePlan();
  obClose();
  enterApp();
  // trial offer
  openModal(`<div class="mhead"><h2>🎉 Your plan is ready, ${esc(S.user.name)}!</h2><button class="x" data-act="modal-close">✕</button></div>
    <div class="row small" style="margin:10px 0">
      <div class="stat" style="flex:1"><div class="v">${S.plan.m.target.toLocaleString('en-US')}</div><div class="l">kcal/day</div></div>
      <div class="stat" style="flex:1"><div class="v">${S.plan.m.protein}g</div><div class="l">protein</div></div>
      <div class="stat" style="flex:1"><div class="v">${S.goal.days}×</div><div class="l">training/wk</div></div>
    </div>
    <div class="procard">
      <b>Start your 7-day free Plus trial?</b>
      <div class="tiny muted" style="margin:6px 0 12px">Unlocks full programs, meal plans & swaps, smart reminders, progress AI and grocery lists. Then $9.99/mo — cancel anytime.</div>
      <div class="row" style="gap:8px">
        <button class="btn accent" style="flex:2" data-act="start-trial">🎁 Start free trial</button>
        <button class="btn" style="flex:1" data-act="skip-trial">Continue free</button>
      </div>
    </div>
    <div class="tiny faint" style="margin-top:12px">Demo checkout — no card required in this build. Demo-only data stays on your device.</div>`);
  toast('Plan generated — welcome aboard, '+S.user.name+'!','🎉');
}
function loadDemo(){
  S.units='imperial';
  S.user={name:'John',sex:'m',age:34,heightCm:FP.inToCm(70),weightKg:FP.lbToKg(212),waistCm:FP.inToCm(42),bodyFat:0,
    job:'desk',experience:'some',equipment:'gym',wake:'06:30',sleep:'22:30',ifMode:false,diet:'none',allergies:[],eatingOut:'1-2',flags:[]};
  S.goal={type:'lose',days:4,rate:1.25,targetKg:FP.lbToKg(187)};
  S.onboarded=true;S.adjust=null;
  computePlan();obClose();
  enterApp();
  toast('Demo profile loaded — John, 212 lb, fat-loss goal. Explore freely!','⚡');
}

/* ============================================================
   PAYWALL & CHECKOUT (demo)
   ============================================================ */
let billing='monthly';
function paywallHTML(){
  const fmt=p=>billing==='monthly'?`$${p.pm}<small>/mo</small>`:`$${p.py}<small>/yr</small>`;
  return `<div class="mhead"><h2>⚡ Choose your plan</h2><button class="x" data-act="modal-close">✕</button></div>
  <div class="seg" style="max-width:300px;margin-bottom:14px">
    <button class="${billing==='monthly'?'on':''}" data-act="billing" data-v="monthly">Monthly</button>
    <button class="${billing==='yearly'?'on':''}" data-act="billing" data-v="yearly">Yearly · save 33%</button>
  </div>
  <div class="pw-grid">${FD.PLANS.map(p=>`
    <div class="tier ${p.pop?'pop':''}">
      ${p.pop?'<div class="popb">MOST POPULAR</div>':''}
      <h4>${p.name}</h4>
      <div class="price">${p.pm===0?'$0':fmt(p)}</div>
      <div class="tiny muted">${p.pm===0?'Free forever':billing==='yearly'?'$'+(p.py/12).toFixed(2)+'/mo billed yearly':'billed monthly'}</div>
      <ul>${p.inc.map(f=>`<li>${f}</li>`).join('')}${p.exc.map(f=>`<li class="no">${f}</li>`).join('')}</ul>
      ${p.id==='free'
        ?(isPro()?'<button class="btn wide" disabled>Current option</button>':'<button class="btn wide ghost" disabled>✓ You are here</button>')
        :`<button class="btn wide ${p.pop?'accent':'primary'}" data-act="plan-pick" data-plan="${p.id}">${isPro()&&S.sub.tier===p.id?'Current plan':'Choose '+p.name}</button>`}
    </div>`).join('')}
  </div>
  <div class="tiny faint" style="margin-top:12px">7-day free trial for new Pro users · cancel anytime in Profile → Subscription. Demo checkout — wire Stripe in production.</div>`;
}
function openPaywall(){openModal(paywallHTML());}
function checkoutHTML(tierId){
  const p=FD.PLANS.find(x=>x.id===tierId);
  const price=billing==='monthly'?'$'+p.pm+'/month':'$'+p.py+'/year';
  return `<div class="mhead"><h2>💳 Checkout — ${p.name}</h2><button class="x" data-act="modal-close">✕</button></div>
  <div class="banner info">${billing==='monthly'?'$'+p.pm+' per month':'$'+p.py+' per year (save '+Math.round((1-p.py/(p.pm*12))*100)+'%)'} · 7-day free trial first · cancel anytime</div>
  <label class="f"><span>Cardholder name</span><input class="in" id="cc-name" placeholder="As on card"></label>
  <label class="f"><span>Card number</span><input class="in" id="cc-num" inputmode="numeric" placeholder="4242 4242 4242 4242" maxlength="19"></label>
  <div class="inpair">
    <label class="f"><span>Expiry</span><input class="in" id="cc-exp" placeholder="MM/YY" maxlength="5"></label>
    <label class="f"><span>CVC</span><input class="in" id="cc-cvc" inputmode="numeric" placeholder="123" maxlength="4"></label>
  </div>
  <button class="btn primary wide" data-act="checkout-confirm" data-plan="${tierId}">Start 7-day free trial — then ${price}</button>
  <div class="tiny faint" style="margin-top:10px">🔒 This is a demo form. No payment is processed and nothing is sent anywhere — in production, connect Stripe Elements / Apple Pay.</div>`;
}

/* ============================================================
   REMINDERS
   ============================================================ */
function fireReminder(e){
  const key=todayKey()+'|'+e.id;
  if(fired.has(key))return;
  fired.add(key);
  toast(e.icon+' <b>'+esc(e.label)+'</b>','🔔');
  try{
    if('Notification' in window&&Notification.permission==='granted'&&S.settings.reminders){
      new Notification('YazFit — '+(e.type||'reminder'),{body:e.label,icon:'icons/icon.svg',tag:e.id});
    }
  }catch(_){}
}
function tickReminders(){
  if(!S||!S.onboarded||!S.plan)return;
  const now=new Date(),tIdx=todayIdx();
  const evs=S.plan.sch.filter(e=>e.day==='D'||e.day===tIdx);
  for(const e of evs){
    const [h,mi]=e.time.split(':').map(Number);
    const dt=new Date();dt.setHours(h,mi,0,0);
    const late=now-dt;
    if(late>=0&&late<25*60*1000)fireReminder(e);
  }
}

/* ============================================================
   ACTIONS
   ============================================================ */
const ACT={
  nav(el_){showTab(el_.dataset.tab);},
  theme(){S.theme=document.body.dataset.theme==='dark'?'light':'dark';applyTheme();save();rerender();},
  'set-theme'(el_){S.theme=el_.dataset.v;applyTheme();save();rerender();},
  'set-units'(el_){S.units=el_.dataset.v;save();rerender();},
  'open-paywall'(){billing='monthly';openPaywall();},
  billing(el_){billing=el_.dataset.v;openModal(paywallHTML());},
  'plan-pick'(el_){openModal(checkoutHTML(el_.dataset.plan));},
  'checkout-confirm'(el_){
    const tier=el_.dataset.plan;
    const months=billing==='monthly'?1:12;
    S.sub={tier,plan:billing,trialEnd:0,renews:Date.now()+months*30*864e5};
    save();closeModal();rerender();
    toast(tier==='elite'?'💎 Elite unlocked — coach review & PDF export active!':'⚡ Plus unlocked — everything is live!','🎉');
  },
  'cancel-sub'(){
    openModal(`<div class="mhead"><h2>Cancel subscription?</h2><button class="x" data-act="modal-close">✕</button></div>
      <p class="small muted" style="margin:10px 0">You'll keep access until the end of the period, then drop to Free. Your plans and logs stay saved.</p>
      <div class="row"><button class="btn" data-act="modal-close" style="flex:1">Keep my plan</button>
      <button class="btn danger" data-act="cancel-confirm" style="flex:1">Cancel subscription</button></div>`);
  },
  'cancel-confirm'(){S.sub={tier:'free',trialEnd:0,plan:null,renews:null};save();closeModal();rerender();toast('Subscription canceled — you are on Free.','🙏');},
  'start-trial'(){S.sub.trialEnd=Date.now()+7*864e5;save();closeModal();rerender();toast('7-day Plus trial started — everything unlocked!','🎁');},
  'skip-trial'(){closeModal();},
  'log-weight-open'(){
    openModal(`<div class="mhead"><h2>⚖️ Log today's weight</h2><button class="x" data-act="modal-close">✕</button></div>
      <label class="f"><span>Weight (${unitW()}) — same scale, morning, after bathroom</span>
      <input class="in" id="mw-in" type="number" step="0.1" placeholder="${unitW()==='lb'?'212':'96'}"></label>
      <button class="btn primary wide" data-act="weight-save">Save weigh-in</button>
      <div class="tiny muted" style="margin-top:8px">Daily weight swings 1–3 lb with water, salt and carbs — the weekly average is what counts (NIH).</div>`);
  },
  'weight-save'(){
    const v=parseFloat((el('#mw-in')||el('#w-in')||{}).value);
    if(!v){toast('Enter a weight first.','⚠️');return;}
    const kg=unitW()==='lb'?FP.lbToKg(v):v;
    const tk=todayKey();
    const ex=S.logs.weights.find(w=>w.d===tk);
    if(ex)ex.kg=kg;else S.logs.weights.push({d:tk,kg});
    save();closeModal();rerender();toast('Weigh-in logged: '+dispW(kg),'⚖️');
  },
  'waist-save'(){
    const v=parseFloat((el('#waist-in')||{}).value);
    if(!v){toast('Enter a waist measurement.','⚠️');return;}
    const cm=S.units==='metric'?v:FP.inToCm(v);
    S.user.waistCm=cm;save();computePlan();rerender();toast('Waist updated — risk ratio recalculated.','📏');
  },
  'water-cup'(el_){
    const n=parseInt(el_.dataset.n,10);
    const tk=todayKey();const max=S.plan?S.plan.m.waterCups:12;
    S.logs.water[tk]=Math.max(0,Math.min(max,n));
    save();rerender();
    const c=S.logs.water[tk];
    if(c===max)toast('Hydration goal hit — 💪','💧');
  },
  'meal-toggle'(el_){el_.closest('.meal').classList.toggle('open');},
  'meal-eaten'(el_,e){
    e.stopPropagation();
    const key=el_.dataset.key,tk=todayKey();
    S.logs.meals[tk]=S.logs.meals[tk]||{};
    S.logs.meals[tk][key]=!S.logs.meals[tk][key];
    save();rerender();
    if(S.logs.meals[tk][key])toast('Meal logged — rings updated!','🍽️');
  },
  'swap-item'(el_){
    if(!isPro()){openPaywall();return;}
    const slot=el_.dataset.slot,idx=parseInt(el_.dataset.idx,10);
    const s=S.plan.mp.slots.find(x=>x.key===slot);
    if(!s)return;
    openModal(swapModalHTML(slot,idx,s.items[idx]));
  },
  'swap-pick'(el_){
    const slot=el_.dataset.slot,idx=parseInt(el_.dataset.idx,10),fid=el_.dataset.fid;
    const s=S.plan.mp.slots.find(x=>x.key===slot);const it=s.items[idx];
    const fo=FD.FOODS[fid];
    const g=Math.max(5,Math.round(it.kcal/(fo.k/100)));
    s.items[idx]={fid,n:fo.n,g,kcal:it.kcal,p:Math.round(fo.p*g/100),c:Math.round(fo.c*g/100),f:Math.round(fo.f*g/100),role:it.role};
    save();closeModal();rerender();toast('Swapped to '+fo.n+' — macros preserved.','⇄');
  },
  'regen-meals'(){
    if(!isPro()){openPaywall();return;}
    S.mpSeed=(S.mpSeed||0)+1;save();computePlan();rerender();toast('Fresh meal plan generated 🎲','🥗');
  },
  'day-toggle'(el_){
    const d=parseInt(el_.dataset.day,10);
    S.ui.openDay=S.ui.openDay===d?-1:d;
    el_.closest('.daycard').classList.toggle('open');
  },
  'ex-check'(el_,e){
    e.stopPropagation();
    const tk=todayKey(),i=parseInt(el_.dataset.i,10);
    const lg=S.logs.workouts[tk]=S.logs.workouts[tk]||{done:false,label:'',checked:{}};
    lg.checked=lg.checked||{};
    lg.checked[i]=!lg.checked[i];
    el_.classList.toggle('on');
    save();
  },
  'session-done'(){
    const tk=todayKey();
    const tIdx=todayIdx();
    const d=S.plan.wk.days.find(x=>x.i===tIdx);
    const lg=S.logs.workouts[tk];
    if(lg&&lg.done){delete S.logs.workouts[tk];toast('Session unmarked.','↩️');}
    else{S.logs.workouts[tk]={done:true,label:d?d.focus:'Session',checked:(lg&&lg.checked)||{}};toast('Session complete — great work! 🔥','🏋️');}
    save();rerender();
  },
  'ex-info'(el_,e){e.stopPropagation();openModal(exModalHTML(el_.dataset.id));},
  'print-plan'(){
    if(S.sub.tier!=='elite'){openPaywall();toast('PDF export is an Elite feature.','💎');return;}
    showTab('workouts');setTimeout(()=>window.print(),350);
  },
  'adaptive-run'(){
    const r=FP.adaptive(S.logs.weights.map(w=>({d:w.d,kg:w.kg})),S.plan.m,S.goal);
    if(!r.ok){toast(r.msg,'🤖');return;}
    S.adjust={delta:r.deltaKcal,msg:r.msg,at:todayKey()};
    if(r.deltaKcal!==0)computePlan();
    save();rerender();
    toast('AI adjustment: '+(r.deltaKcal===0?'no change needed.':(r.deltaKcal>0?'+':'')+r.deltaKcal+' kcal applied.'),'🤖');
  },
  'edit-profile-open'(){
    const u=S.user;
    openModal(`<div class="mhead"><h2>✏️ Edit profile</h2><button class="x" data-act="modal-close">✕</button></div>
      <label class="f"><span>Name</span><input class="in" id="ep-name" value="${esc(u.name)}"></label>
      <div class="inpair">
        <label class="f"><span>Age</span><input class="in" id="ep-age" type="number" value="${u.age}"></label>
        <label class="f"><span>Sex</span><select class="in" id="ep-sex"><option value="m" ${u.sex==='m'?'selected':''}>Male</option><option value="f" ${u.sex==='f'?'selected':''}>Female</option></select></label>
      </div>
      <div class="inpair">
        <label class="f"><span>Height (${unitH()})</span><input class="in" id="ep-h" type="number" step="0.5" value="${unitH()==='cm'?Math.round(u.heightCm):Math.round(FP.cmToIn(u.heightCm))}"></label>
        <label class="f"><span>Weight (${unitW()})</span><input class="in" id="ep-w" type="number" step="0.1" value="${unitW()==='lb'?Math.round(FP.kgToLb(u.weightKg)):FP.round(u.weightKg,1)}"></label>
      </div>
      <label class="f"><span>Waist (${unitH()})</span><input class="in" id="ep-waist" type="number" step="0.5" value="${u.waistCm?(unitH()==='cm'?Math.round(u.waistCm):Math.round(FP.cmToIn(u.waistCm))):''}"></label>
      <button class="btn primary wide" data-act="profile-save">Save & recalculate plan</button>`);
  },
  'profile-save'(){
    const u=S.user;
    u.name=(el('#ep-name').value||u.name).trim().slice(0,30);
    u.age=parseInt(el('#ep-age').value,10)||u.age;
    u.sex=el('#ep-sex').value;
    const h=parseFloat(el('#ep-h').value);if(h)u.heightCm=unitH()==='cm'?h:FP.inToCm(h);
    const w=parseFloat(el('#ep-w').value);if(w)u.weightKg=unitW()==='lb'?FP.lbToKg(w):w;
    const wa=parseFloat(el('#ep-waist').value);u.waistCm=wa?(unitH()==='cm'?wa:FP.inToCm(wa)):0;
    save();computePlan();closeModal();rerender();toast('Profile updated — plan recalculated.','✅');
  },
  'notif-permission'(){
    if(!('Notification' in window)){toast('This browser does not support notifications — in-app reminders still work.','ℹ️');return;}
    Notification.requestPermission().then(p=>{
      toast(p==='granted'?'Notifications enabled — reminders will pop up. 🔔':p==='denied'?'Notifications blocked — enable them in browser site settings.':'Permission dismissed.','🔔');
    });
  },
  'export-data'(){
    const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='yazfit-data-'+todayKey()+'.json';a.click();
    toast('Data exported.','⬇️');
  },
  'reset-data'(){
    openModal(`<div class="mhead"><h2>Reset everything?</h2><button class="x" data-act="modal-close">✕</button></div>
      <p class="small muted" style="margin:10px 0">Deletes profile, plans and all logs from this device. This cannot be undone.</p>
      <div class="row"><button class="btn" data-act="modal-close" style="flex:1">Keep my data</button>
      <button class="btn danger" data-act="reset-confirm" style="flex:1">Delete everything</button></div>`);
  },
  'reset-confirm'(){localStorage.removeItem(LSKEY);location.reload();},
  'modal-close'(){closeModal();},
  /* landing — instant scroll: smooth/rAF animations freeze in background tabs */
  'landing-nav'(el_){const t=el('#l-'+el_.dataset.sec);if(t)t.scrollIntoView({block:'start'});},
  'landing-top'(){window.scrollTo(0,0);},
  'open-landing'(){showLanding();},
  'start-journey'(){
    if(S.onboarded&&S.plan){enterApp();}
    else{obShow();}
  },
  'contact-send'(){
    const n=el('#lc-name'),m=el('#lc-msg');
    if(!m||!m.value.trim()){toast('Write a short message first.','✍️');return;}
    if(m.form)m.form.reset();
    toast('Thanks '+(n&&n.value.trim()?esc(n.value.trim()):'')+'! We reply within 24 hours.','📩');
  },
  /* onboarding */
  'ob-next'(){obNext();},
  'ob-back'(){obBack();},
  'ob-demo'(){loadDemo();},
  'ob-units'(el_){S.units=el_.dataset.v;save();obShow();},
  'ob-sex'(el_){S.ob.d.sex=el_.dataset.v;obShow();},
  'ob-goal'(el_){
    S.ob.d.goal=el_.dataset.v;
    S.ob.d.rate=S.ob.d.goal==='gain'?0.5:1;
    obShow();
  },
  'ob-days'(el_){S.ob.d.days=parseInt(el_.dataset.v,10);obShow();},
  'ob-exp'(el_){S.ob.d.exp=el_.dataset.v;obShow();},
  'ob-equip'(el_){S.ob.d.equip=el_.dataset.v;obShow();},
  'ob-job'(el_){S.ob.d.job=el_.dataset.v;obShow();},
  'ob-diet'(el_){S.ob.d.diet=el_.dataset.v;obShow();},
  'ob-allergy'(el_){
    const v=el_.dataset.v,a=S.ob.d.all=S.ob.d.all||[];
    const i=a.indexOf(v);if(i>=0)a.splice(i,1);else a.push(v);
    obShow();
  },
  'ob-flag'(el_){
    const v=el_.dataset.v,a=S.ob.d.flags=S.ob.d.flags||[];
    const i=a.indexOf(v);if(i>=0)a.splice(i,1);else a.push(v);
    obShow();
  },
  'ob-eatout'(el_){S.ob.d.eatout=el_.dataset.v;obShow();}
};

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]');
  if(!t)return;
  const fn=ACT[t.dataset.act];
  if(fn){e.preventDefault();fn(t,e);}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.field){
    const path=t.dataset.field.split('.');
    let o=S;for(let i=0;i<path.length-1;i++)o=o[path[i]];
    o[path[path.length-1]]=t.type==='checkbox'?t.checked:(isNaN(+t.value)?t.value:+t.value);
    save();
    if(t.dataset.recompute&&S.plan){computePlan();rerender();}
    if(t.dataset.field==='settings.waterHours')rerender();
  }
});
el('#modal-root').addEventListener('click',e=>{if(e.target.id==='modal-root')closeModal();});

/* ============================================================
   INIT
   ============================================================ */
function init(){
  loadState();
  applyTheme();
  if(S.onboarded&&S.user&&S.goal&&S.plan){
    el('#app').classList.add('on');
    render();
  } else {
    showLanding();
  }
  if('serviceWorker' in navigator&&location.protocol.startsWith('http')){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
  setInterval(tickReminders,30000);
  setTimeout(tickReminders,2500);
}
init();
