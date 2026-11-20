/* ============================================================
   YazFit — View Renderers (Today · Workouts · Nutrition ·
   Progress · Profile) + shared UI components
   ============================================================ */
'use strict';
const FD = window.FP_DATA;
const WD = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/* ---------- small helpers ---------- */
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function el(q){return document.querySelector(q);}
function todayKey(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function addDaysKey(n){const d=new Date();d.setDate(d.getDate()+n);return todayKey(d);}
function niceDate(key){const d=new Date(key+'T12:00');return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function todayIdx(){return (new Date().getDay()+6)%7;} // Mon=0
function dispWn(kg){return S.units==='metric'?FP.round(kg,1):Math.round(FP.kgToLb(kg));}
function dispW(kg){return S.units==='metric'?FP.round(kg,1)+' kg':Math.round(FP.kgToLb(kg))+' lb';}
function dispH(cm){
  if(S.units==='metric')return Math.round(cm)+' cm';
  const t=FP.cmToIn(cm),ft=Math.floor(t/12);return ft+'′'+Math.round(t-ft*12)+'″';
}
function dispG(g){
  if(S.units==='metric')return Math.round(g)+' g';
  const oz=g/28.35;
  if(oz>=16)return (oz/16).toFixed(1)+' lb';
  return (Math.round(oz*4)/4)+' oz';
}
function unitW(){return S.units==='metric'?'kg':'lb';}
function unitH(){return S.units==='metric'?'cm':'in';}

/* ---------- UI components ---------- */
function ring(pct,color,label,value){
  const C=2*Math.PI*30, off=C*(1-Math.min(1,Math.max(0,pct)));
  return `<div class="ring">
    <svg width="78" height="78" viewBox="0 0 78 78" aria-hidden="true">
      <circle cx="39" cy="39" r="30" fill="none" stroke="var(--line)" stroke-width="7"></circle>
      <circle cx="39" cy="39" r="30" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"
        stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 39 39)"></circle>
      <text x="39" y="44" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">${Math.round(pct*100)}%</text>
    </svg>
    <div class="v">${value}</div><div class="l">${label}</div>
  </div>`;
}
function stat(label,value,sub,cls){return `<div class="stat"><div class="v ${cls||''}">${value}</div><div class="l">${label}</div>${sub?`<div class="d">${sub}</div>`:''}</div>`;}
function banner(kind,icon,txt){return `<div class="banner ${kind}"><b>${icon}</b> ${txt}</div>`;}

function chartSVG(weights,targetKg){
  if(!weights||weights.length<2)return '<div class="muted center" style="padding:36px 0">📈 Log at least two weigh-ins to draw your trend.</div>';
  const pts=weights.slice().sort((a,b)=>a.d<b.d?-1:1);
  const W=640,H=250,pad=40;
  const vals=pts.map(p=>p.kg).concat([targetKg]);
  let lo=Math.min(...vals),hi=Math.max(...vals);
  if(hi-lo<2){hi+=1;lo-=1;}
  const X=i=>pad+i*(W-2*pad)/Math.max(1,pts.length-1);
  const Y=v=>H-pad-(v-lo)*(H-2*pad)/(hi-lo);
  const poly=pts.map((p,i)=>X(i).toFixed(1)+','+Y(p.kg).toFixed(1)).join(' ');
  const grid=[lo,lo+(hi-lo)/2,hi].map(v=>`<line x1="${pad}" x2="${W-pad}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="var(--line)"></line><text x="${W-pad+4}" y="${(Y(v)+4).toFixed(1)}" font-size="10" fill="var(--faint)">${dispWn(v)}</text>`).join('');
  const dots=pts.map((p,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(p.kg).toFixed(1)}" r="4.5" fill="var(--primary2)"><title>${p.d}: ${dispW(p.kg)}</title></circle>`).join('');
  const first=pts[0],last=pts[pts.length-1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weight trend">
    ${grid}
    <line x1="${pad}" x2="${W-pad}" y1="${Y(targetKg).toFixed(1)}" y2="${Y(targetKg).toFixed(1)}" stroke="var(--accent)" stroke-dasharray="6 5"></line>
    <text x="${pad}" y="${(Y(targetKg)-6).toFixed(1)}" font-size="10" fill="var(--accent)" font-weight="700">goal ${dispWn(targetKg)} ${unitW()}</text>
    <polyline points="${poly}" fill="none" stroke="var(--primary2)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></polyline>
    ${dots}
    <text x="${X(0)}" y="${H-10}" font-size="10" fill="var(--faint)">${niceDate(first.d)}</text>
    <text x="${X(pts.length-1)}" y="${H-10}" font-size="10" fill="var(--faint)" text-anchor="end">${niceDate(last.d)}</text>
  </svg>
  <div class="legend"><span><span class="k" style="background:var(--primary2)"></span>Weight</span><span><span class="k" style="background:var(--accent)"></span>Goal</span></div>`;
}

/* ---------- meal & workout components ---------- */
function isEaten(key){const tk=todayKey();return !!(S.logs.meals[tk]&&S.logs.meals[tk][key]);}
function itemRow(slotKey,it,idx){
  const swap=isPro()?`<button class="btn sm ghost" data-act="swap-item" data-slot="${slotKey}" data-idx="${idx}" title="Swap food" style="margin-left:6px">⇄</button>`:'';
  return `<div class="it"><span>${esc(it.n)}${it.role==='pr'?' <span class="pill" style="padding:1px 7px">protein</span>':''}</span>
    <span class="amt">${dispG(it.g)} · ${it.kcal} kcal · ${it.p}g P</span>${swap}</div>`;
}
function mealCard(slot,open){
  const eaten=isEaten(slot.key);
  return `<div class="meal ${open?'open':''}">
    <div class="head" data-act="meal-toggle">
      <button class="done ${eaten?'on':''}" data-act="meal-eaten" data-key="${slot.key}" aria-label="Mark ${esc(slot.name)} as eaten">${eaten?'✓':''}</button>
      <div><div class="t">${esc(slot.name)}</div><div class="time">⏰ ${slot.time}</div></div>
      <div class="meta">${slot.kcal} kcal<br>${slot.p} g protein</div>
    </div>
    <div class="items">${slot.items.map((it,i)=>itemRow(slot.key,it,i)).join('')}</div>
  </div>`;
}
function lockedBlock(inner,txt,cta){
  return `<div class="locked">${inner}<div class="lockover"><div style="font-size:1.6rem">🔒</div>
    <div class="small" style="max-width:280px">${txt}</div>
    <button class="btn sm accent" data-act="open-paywall">${cta||'Unlock with Plus'}</button></div></div>`;
}
function exRow(ex,i,interactive,checked){
  const subs=(ex.subs||[]).map(s=>FD.EXERCISES[s]?FD.EXERCISES[s].n:s).join(' · ');
  return `<div class="ex">
    <div class="top">
      ${interactive?`<button class="chk ${checked?'on':''}" data-act="ex-check" data-i="${i}" aria-label="Mark done"></button>`:''}
      <span class="nm" data-act="ex-info" data-id="${ex.id}" role="button">${esc(ex.n)}</span>
      <span class="sr">${ex.sets}×${ex.reps}</span>
    </div>
    <div class="tiny muted">rest ${ex.rest}s · ${esc(ex.mg)}</div>
    <ul class="cues">${ex.cues.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>
    ${subs?`<div class="subs tiny muted">Swap: ${esc(subs)}</div>`:''}
  </div>`;
}
function dayCard(d){
  const isOpen=S.ui.openDay===d.i||d.i===todayIdx();
  const tIdx=todayIdx();
  const isToday=d.i===tIdx;
  const log=isToday?S.logs.workouts[todayKey()]:null;
  let body='';
  if(d.kind==='strength'){
    const nEx=d.ex.length;
    const shown=isPro()?d.ex:d.ex.slice(0,3);
    body=`
      <div class="tiny muted" style="margin-bottom:8px">⏱ ${d.estMin} min · ~${d.kcal} kcal · warm-up: ${esc(d.warmup[0])}</div>
      ${shown.map((ex,i)=>exRow(ex,i,isToday,log&&log.checked&&log.checked[i])).join('')}
      ${!isPro()&&nEx>3?lockedBlock('',`${nEx-3} more exercises + cues, substitutions and full progression in this session.`,'Unlock with Plus'):''}
      ${d.cardio?`<div class="banner info" style="margin-top:10px">🏃 <b>Finisher:</b> ${esc(d.cardio.n)} — ${d.cardio.min} min. ${esc(d.cardio.note)}</div>`:''}
      <div class="tiny muted" style="margin-top:10px"><b>Cool-down:</b> ${esc(d.cooldown.join(' · '))}</div>
      ${isToday?`<button class="btn ${log&&log.done?'':'primary'} wide" style="margin-top:12px" data-act="session-done">${log&&log.done?'✓ Session complete — tap to undo':'Mark today\'s session complete'}</button>`:''}`;
  } else {
    body=`
      <div class="tiny muted">Recovery drives results: ${FP_DATA?'' : ''}${m().steps.toLocaleString('en-US')} step goal, protein on target, 7–9 h sleep.</div>
      ${d.cardio?`<div class="banner good" style="margin-top:8px">👟 ${esc(d.cardio.n)} — ${esc(d.cardio.note)}</div>`:''}
      ${d.hiit?`<div class="banner warn" style="margin-top:8px">⚡ <b>${esc(d.hiit.n)}:</b> ${esc(d.hiit.proto)}</div>`:''}
      <div class="tiny muted" style="margin-top:8px">Suggested: 10-min mobility flow — ${['cat-cow','thoracic-rot','hip-flexor-stretch','hamstring-stretch','childs-pose'].map(id=>FD.EXERCISES[id].n).join(' · ')}</div>`;
  }
  return `<div class="daycard ${d.kind} ${isOpen?'open':''}" data-day="${d.i}">
    <div class="head" data-act="day-toggle" data-day="${d.i}">
      <div class="badge">${d.label.slice(0,3)}</div>
      <div><div class="t">${esc(d.focus)}</div>
      <div class="m">${d.kind==='strength'?`${d.ex.length} exercises · ${d.estMin} min`:(d.hiit?'Optional HIIT + steps':'Recovery day')}${isToday?' · <b style="color:var(--primary2)">today</b>':''}</div></div>
    </div>
    <div class="body">${body}</div>
  </div>`;
}
function m(){return S.plan.m;}

/* ================= TODAY ================= */
function todayHTML(){
  const tk=todayKey(),u=S.user,mm=m(),mp=S.plan.mp,wk=S.plan.wk;
  const hr=new Date().getHours();
  const greet=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  const tIdx=todayIdx();
  const day=wk.days.find(d=>d.i===tIdx);
  const eaten=mp.slots.filter(s=>isEaten(s.key));
  const kc=eaten.reduce((a,s)=>a+s.kcal,0), pr=eaten.reduce((a,s)=>a+s.p,0);
  const cups=S.logs.water[tk]||0;
  const wDone=S.logs.workouts[tk]&&S.logs.workouts[tk].done;
  const streak=calcStreak();
  // today's schedule
  const evs=S.plan.sch.filter(e=>e.day==='D'||e.day===tIdx).slice().sort((a,b)=>a.time<b.time?-1:1);
  const evHtml=evs.map(e=>{
    let done=false;
    if(e.type==='meal')done=isEaten(e.id.replace('meal-',''));
    if(e.type==='water')done=cups>0;
    if(e.type==='workout')done=!!wDone;
    if(e.type==='weigh')done=!!(S.logs.weights.find(w=>w.d===tk));
    return `<div class="tl-ev ${done?'done':''}"><span class="dot"></span><span class="tt">${e.time}</span><span>${e.icon} ${esc(e.label)}</span></div>`;
  }).join('');
  const subBadge=isPro()?'':'<button class="btn sm accent" data-act="open-paywall">⚡ Go Pro — $9.99/mo</button>';
  return `
  ${subLine()}
  <div class="row" style="align-items:center;margin-bottom:14px">
    <div style="flex:2 1 220px"><h2 style="font-size:1.3rem">${greet}, ${esc(u.name)} 👋</h2>
    <div class="muted small">${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div></div>
    <div style="flex:0 0 auto">${streak?`<span class="pill good">🔥 ${streak}-day streak</span>`:''}</div>
  </div>
  <div class="rings">
    ${ring(mm.target?kc/mm.target:0,'var(--primary)','Calories',kc+' / '+mm.target)}
    ${ring(mm.protein?pr/mm.protein:0,'var(--accent)','Protein',pr+' / '+mm.protein+'g')}
    ${ring(mm.waterCups?cups/mm.waterCups:0,'var(--info)','Water',cups+' / '+mm.waterCups+' cups')}
    ${ring(day&&day.kind==='strength'?(wDone?1:0):1,'var(--success)',day&&day.kind==='strength'?'Workout':'Rest day',day&&day.kind==='strength'?(wDone?'Done':'Pending'):'Recovery')}
  </div>
  <div class="qa no-print">
    <button class="btn" data-act="log-weight-open"><span class="em">⚖️</span><span>Log weight</span><span class="tx">weekly weigh-in</span></button>
    <button class="btn" data-act="water-cup" data-n="${cups+1}"><span class="em">💧</span><span>+1 cup water</span><span class="tx">${cups} / ${mm.waterCups} today</span></button>
    <button class="btn" data-act="nav" data-tab="workouts"><span class="em">🏋️</span><span>Open workout</span><span class="tx">${esc(day.focus)}</span></button>
    <button class="btn" data-act="nav" data-tab="nutrition"><span class="em">🥗</span><span>Meal plan</span><span class="tx">${mm.target} kcal target</span></button>
  </div>
  <div class="section-title">Today's training</div>
  ${dayCard(day)}
  <div class="section-title">Meals</div>
  ${mp.slots.map(s=>mealCard(s,s.key==='b')).join('')}
  <div class="tiny muted" style="margin:6px 2px 14px">${esc(mp.notes[0])}</div>
  <div class="section-title">Reminders for today</div>
  <div class="card tight"><div class="timeline">${evHtml}</div>
    <div class="tiny muted" style="margin-top:8px">Notifications fire while the app is open. Manage in Profile → Reminders.</div></div>
  ${!isPro()?proCard():''}
  <div class="tiny faint" style="margin-top:18px">YazFit provides general fitness information, not medical advice. Consult a physician before starting any program — especially with the health flags you reported.</div>`;
}
function subLine(){
  const s=S.sub;
  if(s.tier==='elite')return banner('good','💎','Elite plan active — coach review, PDF export and macro cycling unlocked.');
  if(s.tier==='plus')return banner('good','⚡','Plus plan active — full programs, meal plans, reminders and AI adjustments unlocked.');
  if(s.trialEnd&&Date.now()<s.trialEnd){const d=Math.ceil((s.trialEnd-Date.now())/864e5);return banner('info','🎁','Free Plus trial: '+d+' day'+(d>1?'s':'')+' left. <button class="btn sm accent" data-act="open-paywall" style="margin-left:8px">Keep it — $9.99/mo</button>');}
  return '';
}
function proCard(){
  return `<div class="procard no-print">
    <div style="font-weight:800;font-size:1.05rem">⚡ Unlock YazFit Pro</div>
    <div class="small muted" style="margin:6px 0 12px">Full workout programs · auto meal plans & swaps · smart reminders · adaptive AI · grocery lists · PDF export.</div>
    <div class="row" style="gap:8px">
      <button class="btn accent" style="flex:2" data-act="open-paywall">See plans — from $9.99/mo</button>
    </div>
    <div class="tiny muted" style="margin-top:8px">7-day free trial · cancel anytime</div>
  </div>`;
}
function calcStreak(){
  let n=0;
  for(let i=0;i<30;i++){
    const tk=addDaysKey(-i);
    const any=(S.logs.water[tk]>0)||(S.logs.meals[tk]&&Object.keys(S.logs.meals[tk]).length)||(S.logs.workouts[tk]&&S.logs.workouts[tk].done);
    if(any)n++;else break;
  }
  return n;
}

/* ================= WORKOUTS ================= */
function workoutsHTML(){
  const wk=S.plan.wk,mm=m();
  return `
  ${subLine()}
  <div class="row" style="align-items:center">
    <div style="flex:2"><h2>🏋️ Your Program</h2><div class="muted small">${esc(wk.name)} · ${esc(wk.level)} level · ${esc(S.goal.days)} days/week</div></div>
    <div style="flex:0">${S.sub.tier==='elite'?'<button class="btn sm" data-act="print-plan">🖨 Export PDF</button>':'<button class="btn sm ghost" data-act="print-plan">🖨 Export PDF <span class="pill pro" style="margin-left:6px">Elite</span></button>'}</div>
  </div>
  <div class="card tight"><div class="grid2" style="gap:8px">
    ${wk.days.map(d=>`<div class="tiny" style="padding:6px 8px;border-radius:8px;background:${d.kind==='strength'?'color-mix(in srgb,var(--primary) 12%,transparent)':'color-mix(in srgb,var(--success) 10%,transparent)'}"><b>${d.label}</b> — ${esc(d.focus)}</div>`).join('')}
  </div></div>
  ${wk.notes.map(n=>'<div class="card tight small muted" style="margin-bottom:8px">💡 '+esc(n)+'</div>').join('')}
  <div class="section-title">Weekly schedule</div>
  ${wk.days.map(d=>dayCard(d)).join('')}
  <div class="card tight tiny muted">Standards applied: WHO 150–300 min aerobic + 2× strength weekly · ACSM progression & warm-up protocols · RPE autoregulation. Estimated burn uses MET values (ACSM compendium).</div>`;
}

/* ================= NUTRITION ================= */
function macroBar(label,grams,kcal,kcalShare,color){
  return `<div style="margin-bottom:10px">
    <div style="display:flex;font-size:.82rem"><b>${label}</b><span style="margin-left:auto" class="muted">${grams} g · ${kcal} kcal (${Math.round(kcalShare*100)}%)</span></div>
    <div style="height:8px;border-radius:4px;background:var(--line);overflow:hidden;margin-top:4px"><div style="height:100%;width:${Math.round(kcalShare*100)}%;background:${color}"></div></div>
  </div>`;
}
function nutritionHTML(){
  const mm=m(),mp=S.plan.mp;
  const tk=todayKey(),cups=S.logs.water[tk]||0;
  const pk=mm.protein*4, fk=mm.fat*9, ck=mm.carbs*4, T=mm.target;
  const cupsHtml=Array.from({length:mm.waterCups},(_,i)=>`<button class="cup ${i<cups?'on':''}" data-act="water-cup" data-n="${i+1}" aria-label="Set ${i+1} cups">💧</button>`).join('');
  return `
  ${subLine()}
  <h2>🥗 Nutrition Plan</h2>
  <div class="card">
    <h3>Daily targets <span class="sub">${S.adjust&&S.adjust.delta?'AI-adjusted '+S.adjust.delta+' kcal':'from your TDEE'}</span></h3>
    <div class="row" style="align-items:center">
      <div class="stat" style="flex:1"><div class="v" style="font-size:2rem">${mm.target.toLocaleString('en-US')}</div><div class="l">kcal / day</div><div class="d">TDEE ${mm.tdee.toLocaleString('en-US')} · ${S.goal.type==='lose'?'deficit':S.goal.type==='gain'||S.goal.type==='stronger'?'lean surplus':'maintenance'} ${Math.abs(mm.delta)}</div></div>
      <div class="stat" style="flex:1"><div class="v">${mm.protein}g</div><div class="l">protein</div><div class="d">ISSN: 2.2 g/kg adjusted body weight (${mm.adjKg} kg)</div></div>
      <div class="stat" style="flex:1"><div class="v">${mm.fiber}g</div><div class="l">fiber</div><div class="d">14 g / 1,000 kcal (DGA)</div></div>
      <div class="stat" style="flex:1"><div class="v">${mm.waterCups}</div><div class="l">cups water</div><div class="d">≈${(mm.waterMl/1000).toFixed(1)} L</div></div>
    </div>
    <hr class="hr">
    ${macroBar('Protein',mm.protein,pk,pk/T,'var(--accent)')}
    ${macroBar('Carbs',mm.carbs,ck,ck/T,'var(--info)')}
    ${macroBar('Fat',mm.fat,fk,fk/T,'var(--warn)')}
    <div class="tiny muted">AMDR ranges (DGA): carbs 45–65% · fat 20–35% · floors: ≥130 g carbs, ≥40 g fat. BMI ${mm.bmi} (${mm.bmiClass}).</div>
  </div>
  ${mp.ifMode?banner('info','⏳','Intermittent fasting (16:8) is on — all calories land in your eating window.'):''}
  <div class="section-title">Auto meal plan <button class="btn sm ghost" data-act="regen-meals" style="margin-left:auto">🎲 Regenerate</button></div>
  ${mp.slots.map(s=>mealCard(s,false)).join('')}
  <div class="card tight small muted">${mp.notes.map(n=>'• '+esc(n)).join('<br>')}</div>
  <div class="section-title">💧 Hydration tracker</div>
  <div class="card"><div class="watrow">${cupsHtml}</div>
    <div class="tiny muted" style="margin-top:8px">${cups} / ${mm.waterCups} cups · base 33 ml/kg + training. Urine pale-yellow = on track.</div></div>
  <div class="section-title">🍔 Eating-out survival guide (US)</div>
  ${isPro()?FD.EATING_OUT.map(r=>`
    <div class="card tight">
      <h3 style="margin-bottom:6px">${r.icon} ${esc(r.brand)} <span class="sub">~${r.kcal} kcal · ${r.p}P / ${r.c}C / ${r.f}F</span></h3>
      <div class="small">${esc(r.order)}</div>
      <div class="tiny muted" style="margin-top:6px">💡 ${esc(r.tip)} Menus change — check the official nutrition panel.</div>
    </div>`).join('')
  :lockedBlock('<div class="grid2">'+FD.EATING_OUT.slice(0,4).map(r=>`<div class="card tight small" style="margin:0">${r.icon} <b>${esc(r.brand)}</b><div class="tiny muted">~${r.kcal} kcal</div></div>`).join('')+'</div>','Macro-friendly orders at Chipotle, Starbucks, Subway, McDonald\'s, Panera and more.')}
  <div class="section-title">🛒 7-day grocery list</div>
  ${isPro()?groceryHTML():lockedBlock('<div class="card tight small" style="min-height:90px">Aggregated shopping list across your weekly meal plan…</div>','Auto-built grocery lists from your 7-day meal plan, with package-size hints.')}
  <div class="tiny faint" style="margin-top:16px">Nutrition data modeled on USDA FoodData Central values. This plan does not replace medical nutrition therapy. If you manage diabetes, hypertension, pregnancy or kidney disease, review targets with your care team.</div>`;
}
function groceryHTML(){
  const rows=FP.grocery(S.plan.mp);
  return `<div class="card"><table class="table"><tr><th>Item</th><th>7-day total</th><th>Shopping note</th></tr>
  ${rows.map(r=>`<tr><td>${esc(r.name)}</td><td><b>${dispG(r.g)}</b></td><td class="muted tiny">${esc(r.note||r.lb+' lb')}</td></tr>`).join('')}
  </table><div class="tiny muted" style="margin-top:8px">Cooked weights — packaged/raw amounts differ. Eggs shown as count, milk as gallons, bread as slices.</div></div>`;
}

/* ================= PROGRESS ================= */
function trendLbWk(){
  const w=S.logs.weights;if(w.length<2)return null;
  const pts=w.slice().sort((a,b)=>a.d<b.d?-1:1).filter(p=>(new Date()-new Date(p.d))<=21*864e5);
  if(pts.length<2)return null;
  const a=pts[0],b=pts[pts.length-1];
  const days=Math.max(5,(new Date(b.d)-new Date(a.d))/864e5);
  return (b.kg-a.kg)/days*7*2.20462;
}
function progressHTML(){
  const mm=m(),w=S.logs.weights;
  const cur=w.length?w.slice().sort((a,b)=>a.d<b.d?-1:1)[w.length-1]:null;
  const start=w.length?w.slice().sort((a,b)=>a.d<b.d?-1:1)[0]:null;
  const trend=trendLbWk();
  const changeKg=cur&&start?cur.kg-start.kg:0;
  const goalRate=mm.rateLbWk||0;
  const effRate=trend!=null?Math.abs(trend):(goalRate*2.20462);
  const remainKg=cur?Math.max(0,cur.kg-mm.goalKg):0;
  const weeksLeft=effRate>0.05&&goalRate>0?Math.ceil(FP.kgToLb(remainKg)/effRate):null;
  const projDate=weeksLeft?addDaysKey(weeksLeft*7):null;
  // adherence last 7 days
  let planned=0,done=0,mealsLogged=0,mealsPlanned=0,waterSum=0;
  for(let i=0;i<7;i++){
    const tk=addDaysKey(-i);const idx=(new Date(tk+'T12:00').getDay()+6)%7;
    const d=S.plan.wk.days.find(x=>x.i===idx);
    if(d&&d.kind==='strength'){planned++;if(S.logs.workouts[tk]&&S.logs.workouts[tk].done)done++;}
    mealsPlanned+=S.plan.mp.slots.length;
    const lg=S.logs.meals[tk];if(lg)mealsLogged+=Object.keys(lg).length;
    waterSum+=(S.logs.water[tk]||0);
  }
  const hist=Object.entries(S.logs.workouts).sort((a,b)=>a[0]<b[0]?1:-1).slice(0,8);
  const bmiCls=mm.bmi<18.5?'val-warn':mm.bmi<25?'val-good':mm.bmi<30?'val-warn':'val-bad';
  return `
  ${subLine()}
  <h2>📈 Progress</h2>
  <div class="row">
    ${stat('Current weight',cur?dispW(cur.kg):'—',cur?niceDate(cur.d):'log your first weigh-in')}
    ${stat('Change',start?((changeKg>=0?'+':'')+dispW(changeKg).replace('-','−')):'—',start?'since '+niceDate(start.d):'',changeKg<0?'val-good':'')}
    ${stat('7–21 day trend',trend!=null?((trend>=0?'+':'')+Math.abs(trend).toFixed(1)+' '+unitW()+'/wk'):'—',trend!=null?(goalRate?'target '+goalRate+' '+unitW()+'/wk':'maintenance'):'needs 2 weigh-ins',trend!=null&&goalRate&&trend<0?'val-good':'')}
    ${stat('BMI',mm.bmi,mm.bmiClass,bmiCls)}
  </div>
  <div class="card">
    <h3>Weight trend <span class="sub">goal ${dispW(mm.goalKg)}</span></h3>
    ${chartSVG(w,mm.goalKg)}
    <div class="qa no-print">
      <div style="flex:1;display:flex;gap:8px">
        <input class="in" id="w-in" type="number" step="0.1" placeholder="Today's weight (${unitW()})" style="flex:1">
        <button class="btn primary" data-act="weight-save">Log</button>
      </div>
    </div>
    ${projDate?`<div class="banner good" style="margin-top:10px">🎯 At this pace you reach ${dispW(mm.goalKg)} around <b>${new Date(projDate).toLocaleDateString('en-US',{month:'long',day:'numeric'})}</b> (${weeksLeft} weeks). ${trend!=null?'Trend overrides plan rate when they differ — trust the trend.':''}</div>`:`<div class="tiny muted" style="margin-top:8px">Projection appears once you have weigh-in history.</div>`}
  </div>
  <div class="section-title">Adherence · last 7 days</div>
  <div class="grid3">
    ${stat('Workouts',done+' / '+planned,'sessions completed')}
    ${stat('Meals logged',mealsLogged+' / '+mealsPlanned,'adherence drives results')}
    ${stat('Water avg',(waterSum/7).toFixed(1)+' cups','goal '+mm.waterCups+'/day')}
  </div>
  <div class="section-title">Workout history</div>
  <div class="card tight">
    ${hist.length?hist.map(([tk,lg])=>`<div class="tl-ev ${lg.done?'done':''}"><span class="dot"></span><span class="tt">${niceDate(tk)}</span><span>🏋️ ${esc(lg.label||'Session')}${lg.done?' — completed':''}</span></div>`).join(''):'<div class="muted small center" style="padding:14px">No sessions logged yet.</div>'}
  </div>
  <div class="section-title">🤖 Adaptive AI adjustment</div>
  ${isPro()?`<div class="card">
    ${S.adjust?banner('info','🤖','<b>'+S.adjust.msg+'</b>'):'<div class="small muted">Compares your actual weight trend against your target pace and re-balances calories — the same adjustment a coach makes at weekly check-ins.</div>'}
    <button class="btn primary" data-act="adaptive-run">Run adjustment check</button>
    <div class="tiny muted" style="margin-top:8px">Uses your last 14–21 days of weigh-ins (NIH checkpoint protocol).</div>
  </div>`:lockedBlock('<div class="card tight" style="min-height:80px">Trend analysis · calorie re-balancing · plateau breaker…</div>','Let YazFit auto-adjust your calories every week based on real weigh-in data.')}
  <div class="section-title">Measurements</div>
  <div class="card tight">
    <div style="display:flex;gap:8px;align-items:center">
      <input class="in" id="waist-in" type="number" step="0.5" placeholder="Waist today (${S.units==='metric'?'cm':'in'})" style="flex:1">
      <button class="btn" data-act="waist-save">Save</button>
    </div>
    ${mm.whtr?`<div class="tiny ${mm.whtr>=0.5?'val-warn':'val-good'}" style="margin-top:8px">Waist-to-height ratio: ${mm.whtr} — ${mm.whtr>=0.5?'≥0.5 flags elevated cardiometabolic risk (CDC) — your deficit is the treatment':'below the 0.5 risk threshold (CDC)'}</div>`:'<div class="tiny muted" style="margin-top:8px">Waist-to-height ratio &lt; 0.5 is the healthy target (CDC).</div>'}
  </div>`;
}

/* ================= PROFILE ================= */
function profileHTML(){
  const u=S.user,g=S.goal,mm=m(),s=S.sub;
  const dietNames={none:'No restrictions',vegetarian:'Vegetarian',vegan:'Vegan',keto:'Keto',glutenfree:'Gluten-free',halal:'Halal'};
  const flagsTxt=(u.flags||[]).join(', ')||'none';
  return `
  <h2>⚙️ Profile & Settings</h2>
  <div class="card">
    <h3>👤 ${esc(u.name)} <span class="sub">${u.sex==='m'?'Male':'Female'} · ${u.age} yrs</span></h3>
    <div class="row small">
      <div><b>Height:</b> ${dispH(u.heightCm)}</div><div><b>Weight:</b> ${dispW(u.weightKg)}</div>
      <div><b>Goal:</b> ${goalName(g.type)} → ${dispW(mm.goalKg)}</div><div><b>Plan:</b> ${mm.target} kcal · ${mm.protein}g P</div>
      <div><b>Diet:</b> ${dietNames[u.diet]||u.diet}</div><div><b>Training:</b> ${g.days}×/wk · ${u.equipment}</div>
      <div><b>Wake / sleep:</b> ${u.wake} / ${u.sleep}</div><div><b>Health flags:</b> ${esc(flagsTxt)}</div>
    </div>
    <button class="btn sm" style="margin-top:12px" data-act="edit-profile-open">✏️ Edit profile</button>
  </div>
  <div class="card">
    <h3>Units & appearance</h3>
    <div class="row">
      <div><div class="tiny muted" style="margin-bottom:6px">Units</div>
      <div class="seg" style="max-width:220px"><button class="${S.units==='imperial'?'on':''}" data-act="set-units" data-v="imperial">lb / ft / oz</button><button class="${S.units==='metric'?'on':''}" data-act="set-units" data-v="metric">kg / cm / g</button></div></div>
      <div><div class="tiny muted" style="margin-bottom:6px">Theme</div>
      <div class="seg" style="max-width:220px"><button class="${document.body.dataset.theme==='dark'?'on':''}" data-act="set-theme" data-v="dark">🌙 Dark</button><button class="${document.body.dataset.theme==='light'?'on':''}" data-act="set-theme" data-v="light">☀️ Light</button></div></div>
    </div>
  </div>
  <div class="card">
    <h3>🔔 Reminders</h3>
    ${remRow('meals','Meal reminders','Nudge at each planned meal time')}
    ${remRow('water','Water reminders','Every '+S.settings.waterHours+' h between waking and bedtime')}
    ${remRow('workout','Workout reminders','On training days at '+S.settings.workoutTime)}
    ${remRow('weigh','Weekly weigh-in','Sunday 8:00 AM — same conditions each time')}
    ${remRow('sleep','Wind-down reminder','30 min before bedtime')}
    <hr class="hr">
    <div class="row">
      <label class="f" style="flex:1"><span>Water every</span>
        <select class="in" data-field="settings.waterHours">
          <option value="1" ${S.settings.waterHours==1?'selected':''}>1 hour</option>
          <option value="2" ${S.settings.waterHours==2?'selected':''}>2 hours</option>
          <option value="3" ${S.settings.waterHours==3?'selected':''}>3 hours</option>
        </select></label>
      <label class="f" style="flex:1"><span>Workout time</span>
        <input class="in" type="time" data-field="settings.workoutTime" value="${S.settings.workoutTime}"></label>
      <label class="f" style="flex:1"><span>Weigh-in day</span>
        <select class="in" data-field="settings.weighDay">
          ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d,i)=>`<option value="${i}" ${S.settings.weighDay==i?'selected':''}>${d}</option>`).join('')}
        </select></label>
    </div>
    <button class="btn sm" data-act="notif-permission">🔔 ${('Notification' in window)&&Notification.permission==='granted'?'Notifications enabled':'Enable device notifications'}</button>
    <div class="tiny muted" style="margin-top:6px">${('Notification' in window)?'Works while the app is open (browser limit). On iOS: Add to Home Screen first.':'This browser does not support notifications — in-app reminders still work.'}</div>
  </div>
  <div class="card">
    <h3>💎 Subscription</h3>
    ${subStatusHTML()}
  </div>
  <div class="card">
    <h3>🩺 Health & safety</h3>
    <div class="small muted">Reported flags: ${esc(flagsTxt)}</div>
    <div class="banner danger" style="margin-top:10px">YazFit is <b>not medical advice</b> and does not diagnose or treat anything. Clear vigorous exercise with your physician — required if you have heart, metabolic (diabetes), renal or pregnancy conditions, per ACSM pre-participation screening.</div>
  </div>
  <div class="card">
    <h3>Data</h3>
    <div class="row">
      <button class="btn sm" data-act="export-data">⬇️ Export my data (JSON)</button>
      <button class="btn sm danger" data-act="reset-data">🗑 Reset everything</button>
    </div>
    <div class="tiny muted" style="margin-top:8px">All data stays on this device (localStorage). Nothing is uploaded — no account needed in this build.</div>
  </div>
  <div class="section-title">Standards & sources this app implements</div>
  <div class="card tight">${FD.STANDARDS.map(s=>`<div class="small" style="padding:6px 0;border-bottom:1px dashed var(--line)"><b>${esc(s.src)}:</b> <span class="muted">${esc(s.txt)}</span></div>`).join('')}</div>
  <div class="tiny faint center" style="margin:16px 0">YazFit v1.0 · US Edition · Built on WHO · ACSM · ISSN · CDC · NIH · DGA guidance.<br>📱 Install as an app: browser menu → “Add to Home Screen / Install”.</div>`;
}
function remRow(key,title,desc){
  return `<label style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px dashed var(--line);cursor:pointer">
    <input type="checkbox" data-field="settings.reminders.${key}" data-recompute="1" ${S.settings.reminders[key]!==false?'checked':''} style="width:20px;height:20px;accent-color:var(--primary)">
    <span><b class="small">${title}</b><br><span class="tiny muted">${desc}</span></span></label>`;
}
function subStatusHTML(){
  const s=S.sub;
  if(s.tier==='elite')return `<div class="banner good">💎 <b>Elite</b> — $19.99/mo · renews ${s.renews?new Date(s.renews).toLocaleDateString('en-US'):'—'}</div><button class="btn sm danger" data-act="cancel-sub">Cancel subscription</button>`;
  if(s.tier==='plus')return `<div class="banner good">⚡ <b>Plus</b> — $9.99/mo · renews ${s.renews?new Date(s.renews).toLocaleDateString('en-US'):'—'}</div><button class="btn sm" data-act="open-paywall">Switch to Elite</button><button class="btn sm danger" data-act="cancel-sub" style="margin-left:8px">Cancel</button>`;
  if(s.trialEnd&&Date.now()<s.trialEnd)return `<div class="banner info">🎁 <b>Plus trial</b> — ends ${new Date(s.trialEnd).toLocaleDateString('en-US')}</div><button class="btn sm accent" data-act="open-paywall">Keep Plus — $9.99/mo</button>`;
  return `<div class="small muted" style="margin-bottom:10px">You're on <b>Free</b>. Upgrade for full programs, meal plans, reminders and AI adjustments.</div><button class="btn accent" data-act="open-paywall">⚡ See Pro plans</button>`;
}
function goalName(t){return {lose:'Fat loss',gain:'Build muscle',stronger:'Get stronger',recomp:'Recomposition',health:'General health'}[t]||t;}

/* swap & exercise modals (content builders, opened by core) */
function swapModalHTML(slot,idx,item){
  const P=FP.prefsOf(S.user);
  const f=FD.FOODS[item.fid];
  const alts=Object.entries(FD.FOODS)
    .filter(([id,fo])=>id!==item.fid&&FP.foodAllowed(id,P)&&Math.abs(fo.k-f.k)/Math.max(f.k,1)<0.5&&Math.abs(fo.p-f.p)/Math.max(f.p,1)<0.7)
    .sort((a,b)=>Math.abs(a[1].k-f.k)-Math.abs(b[1].k-f.k)).slice(0,5);
  return `<div class="mhead"><h2>⇄ Swap “${esc(item.n)}”</h2><button class="x" data-act="modal-close">✕</button></div>
  <div class="small muted" style="margin-bottom:12px">Current: ${dispG(item.g)} · ${item.kcal} kcal · ${item.p}g P. Alternatives are matched on calories & protein and scaled to hit the same numbers.</div>
  ${alts.length?alts.map(([id,fo])=>`<button class="btn wide" style="justify-content:space-between;margin-bottom:8px" data-act="swap-pick" data-slot="${slot}" data-idx="${idx}" data-fid="${id}">
     <span>${esc(fo.n)}<br><span class="tiny muted">1 serving ≈ ${fo.sl}</span></span><span class="tiny">${fo.k} kcal/100g · ${fo.p}g P</span></button>`).join('')
  :'<div class="muted small">No better alternatives for your diet profile — this pick is already optimal.</div>'}`;
}
function exModalHTML(id){
  const e=FD.EXERCISES[id];
  const subs=(e.subs||[]).map(s=>FD.EXERCISES[s]?FD.EXERCISES[s].n:s);
  return `<div class="mhead"><h2>${esc(e.n)}</h2><button class="x" data-act="modal-close">✕</button></div>
  <div class="chips" style="margin-bottom:12px"><span class="pill">${esc(e.mg)}</span><span class="pill">${e.eq.join(' / ')}</span><span class="pill">level ${e.lv}</span></div>
  <b class="small">Technique cues</b>
  <ul class="cues" style="margin:8px 0 14px">${e.cues.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>
  ${subs.length?`<b class="small">Substitutions</b><div class="chips" style="margin-top:8px">${subs.map(s=>`<span class="chip">${esc(s)}</span>`).join('')}</div>`:''}`;
}
const VIEWS={today:todayHTML,workouts:workoutsHTML,nutrition:nutritionHTML,progress:progressHTML,profile:profileHTML};
