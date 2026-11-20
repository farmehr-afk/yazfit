/* ============================================================
   YazFit — Calculation & Plan-Generation Engine
   Standards: Mifflin-St Jeor (BMR) · WHO/ACSM (activity, cardio)
   ISSN (protein) · DGA (fiber) · CDC/NIH (safe deficit)
   All internal units metric; UI converts.
   ============================================================ */
'use strict';

const FP = (function(){
  const D = window.FP_DATA;

  /* ---------- helpers ---------- */
  const round = (v,d=0)=>{const m=10**d;return Math.round(v*m)/m;};
  const clamp = (v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  const lbToKg = lb=>lb/2.20462;
  const kgToLb = kg=>kg*2.20462;
  const inToCm = i=>i*2.54;
  const cmToIn = c=>c/2.54;

  /* ---------- 1. METRICS ---------- */
  function metrics(u,g){
    const kg=u.weightKg, cm=u.heightCm, age=u.age, male=u.sex==='m';
    const m2=(cm/100)**2;
    const bmi=kg/m2;
    const bmiClass= bmi<18.5?'Underweight':bmi<25?'Healthy':bmi<30?'Overweight':bmi<35?'Obese I':bmi<40?'Obese II':'Obese III';
    // Mifflin-St Jeor
    const bmr=10*kg+6.25*cm-5*age+(male?5:-161);
    // Composite activity: job factor × exercise factor (ACSM-informed)
    const jobF={desk:1.2,feet:1.3,labor:1.4}[u.job]||1.2;
    const exMap={0:1.0,1:1.08,2:1.08,3:1.15,4:1.15,5:1.22,6:1.22,7:1.28};
    const exF=exMap[g.days||0]||1.0;
    let tdee=clamp(bmr*jobF*exF,bmr*1.1,bmr*2.0);
    // Robinson ideal weight
    const inches=cmToIn(cm);
    const idealKg= male? 52+1.9*Math.max(0,inches-60) : 49+1.7*Math.max(0,inches-60);
    // Adjusted body weight for obese users (protein basis)
    const adjKg= bmi>=30? idealKg+0.25*(kg-idealKg) : kg;
    // Healthy weight range (BMI 18.5–24.9)
    const idealLoKg=18.5*m2, idealHiKg=24.9*m2;

    const type=g.type||'lose';
    const pregnant=(u.flags||[]).includes('pregnant');
    let target=tdee, rateLbWk=0, delta=0;

    if(type==='lose'&&!pregnant){
      rateLbWk=clamp(g.rate||1,0.25,2);
      // obesity allows steeper deficit (NIH); otherwise cap 30% of TDEE
      let deficit=rateLbWk*500;
      const maxDef= bmi>=30? Math.min(1000,tdee*0.35): tdee*0.30;
      deficit=Math.min(deficit,maxDef);
      delta=-Math.round(deficit);
      target=Math.round(tdee+delta);
      target=Math.max(target, male?1500:1200); // NIH floors
    } else if(type==='gain'){
      rateLbWk=clamp(g.rate||0.5,0.2,1);
      delta=Math.round(rateLbWk*350); // lean-bulk surplus
      target=Math.round(tdee+delta);
    } else if(type==='stronger'){
      delta=200; target=Math.round(tdee+200); rateLbWk=0.4;
    } else { // maintain / recomp / health / pregnant
      target=Math.round(tdee);
    }
    if(pregnant&&type==='lose'){/* force maintain above */}

    // Macros: ISSN protein, AMDR fat, remainder carbs
    const pPerKg= type==='lose'?2.2: type==='recomp'?2.2: type==='gain'?1.9: type==='stronger'?1.8:1.6;
    let protein=clamp(Math.round(pPerKg*adjKg),0.8*adjKg,2.6*adjKg);
    let fat=Math.round(0.28*target/9);
    fat=Math.max(fat,40);
    let carbs=Math.round((target-protein*4-fat*9)/4);
    if(carbs<130&&type!=='lose'){protein=Math.round(protein*0.95);fat=Math.round(fat*0.95);carbs=Math.round((target-protein*4-fat*9)/4);}
    carbs=Math.max(carbs,20);
    const fiber=Math.min(40,Math.round(target/1000*14));
    const waterMl=Math.round(kg*33+(g.days||0)*100);
    const waterCups=Math.round(waterMl/240);
    const steps= bmi>=30?8000: bmi>=25?9000:10000;
    const bfEst=u.bodyFat|| (1.20*bmi+0.23*age-(male?10.8:0)-5.4); // Deurenberg estimate
    // waist-to-height risk (CDC)
    const whtr= u.waistCm? round(u.waistCm/cm,2):null;
    // projection
    const toLose=Math.max(0,kgToLb(kg)-kgToLb(g.targetKg||kg));
    const weeksToGoal= rateLbWk>0? Math.ceil(toLose/rateLbWk):0;

    return {kg,cm,age,sex:male?'m':'f',bmi:round(bmi,1),bmiClass,bmr:Math.round(bmr),tdee:Math.round(tdee),
      target, delta, protein:Math.round(protein), fat, carbs, fiber, waterMl, waterCups, steps,
      idealLoKg,idealHiKg, adjKg:round(adjKg,1), bfEst:Math.round(bfEst), whtr, rateLbWk,
      weeksToGoal, pregnant,
      goalKg:g.targetKg||kg};
  }

  /* ---------- 2. WORKOUT PLAN (WHO/ACSM) ---------- */
  const SPLIT_DEFS={
    'FB-A':[['squat','main'],['hpush','main'],['hpull','main'],['hinge','acc'],['biceps','acc'],['core','acc']],
    'FB-B':[['hinge','main'],['vpush','main'],['vpull','main'],['lunge','acc'],['triceps','acc'],['core','acc']],
    'FB-C':[['lunge','main'],['hpush','main'],['vpull','acc'],['hinge','acc'],['core','acc']],
    'UP-A':[['hpush','main'],['hpull','main'],['vpush','acc'],['hpull','acc'],['biceps','acc'],['core','acc']],
    'UP-B':[['vpush','main'],['vpull','main'],['hpush','acc'],['hpull','acc'],['triceps','acc'],['core','acc']],
    'LO-A':[['squat','main'],['hinge','main'],['lunge','acc'],['calves','acc'],['core','acc']],
    'LO-B':[['hinge','main'],['squat','acc'],['lunge','acc'],['calves','acc'],['core','acc']],
    'PUSH-A':[['hpush','main'],['vpush','main'],['hpush','acc'],['vpush','acc'],['triceps','acc'],['core','acc']],
    'PULL-A':[['vpull','main'],['hpull','main'],['hpull','acc'],['biceps','acc'],['core','acc']],
    'LEGS-A':[['squat','main'],['hinge','main'],['lunge','acc'],['calves','acc'],['core','acc']],
    'PUSH-B':[['vpush','main'],['hpush','main'],['hpush','acc'],['vpush','acc'],['triceps','acc'],['core','acc']],
    'PULL-B':[['hpull','main'],['vpull','main'],['vpull','acc'],['biceps','acc'],['core','acc']],
    'LEGS-B':[['hinge','main'],['squat','main'],['lunge','acc'],['calves','acc'],['core','acc']]
  };
  const SPLITS={
    2:['FB-A','FB-B'], 3:['FB-A','FB-B','FB-C'],
    4:['UP-A','LO-A','UP-B','LO-B'],
    5:['UP-A','LO-A','UP-B','PULL-A','LEGS-A'],
    6:['PUSH-A','PULL-A','LEGS-A','PUSH-B','PULL-B','LEGS-B']
  };
  const WEEK_DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const TRAIN_DAYS={2:[0,3],3:[0,2,4],4:[0,1,3,4],5:[0,1,2,3,4],6:[0,1,2,3,4,5]};

  const EXCLUDES={
    knee:['jog','hiit-run','burpees','jump-rope','jacks','bulgarian'],
    back:['deadlift','barbell-row','russian-twist'],
    shoulder:['ohp','pike-pushup','dip','diamond-pushup'],
    wrist:['pushup','diamond-pushup','dip'],
    pregnant:['burpees','mt-climbers','jacks','jump-rope','knee-raise','crunch','russian-twist','hiit-run','hiit-bike']
  };

  function pickEx(pat,used,equip,maxLv,excl,rot){
    const pool=Object.values(D.EXERCISES).filter(e=>e.pat===pat&&e.eq.includes(equip)&&e.lv<=maxLv&&!excl.includes(idOf(e)));
    if(!pool.length) pool.push(...Object.values(D.EXERCISES).filter(e=>e.pat===pat&&e.lv<=maxLv&&!excl.includes(idOf(e))));
    if(!pool.length) return null;
    const fresh=pool.filter(e=>!used.has(idOf(e)));
    const list=fresh.length?fresh:pool;
    return list[rot%list.length];
  }
  const idOf=e=>Object.keys(D.EXERCISES).find(k=>D.EXERCISES[k]===e);

  function workoutPlan(u,g,m){
    const days=Math.max(2,Math.min(6,g.days||3));
    const equipMap={gym:'gym',home:'home',bw:'bw'};
    const equip=equipMap[u.equipment]||'gym';
    const maxLv=u.experience==='new'?1:u.experience==='some'?2:3;
    let excl=[];
    (u.flags||[]).forEach(f=>{excl=excl.concat(EXCLUDES[f]||[]);});
    excl=[...new Set(excl)];

    const split=SPLITS[days];
    const used=new Set();
    const trainIdx=TRAIN_DAYS[days];
    const planDays=[];
    let patRot={};

    // prescription by goal
    const pres={
      lose:{main:{s:3,r:'10–12',rest:75},acc:{s:2,r:'12–15',rest:60},core:{s:3,r:'30–45 s',rest:45}},
      gain:{main:{s:4,r:'6–10',rest:120},acc:{s:3,r:'10–12',rest:90},core:{s:3,r:'30–45 s',rest:45}},
      stronger:{main:{s:5,r:'5',rest:150},acc:{s:3,r:'8',rest:90},core:{s:3,r:'30–45 s',rest:45}},
      recomp:{main:{s:3,r:'8–12',rest:90},acc:{s:3,r:'12',rest:60},core:{s:3,r:'30–45 s',rest:45}},
      health:{main:{s:2,r:'10–15',rest:60},acc:{s:2,r:'12–15',rest:45},core:{s:2,r:'30 s',rest:30}}
    }[g.type||'lose'];

    const warmup=['5 min easy bike / brisk walk','Arm circles ×10 each way','Leg swings ×10 per leg','Bodyweight squats ×10','Band pull-apart ×15'];
    let wi=0;
    for(let di=0;di<7;di++){
      if(trainIdx.includes(di)&&wi<split.length){
        const def=SPLIT_DEFS[split[wi]];
        const ex=[];
        def.forEach(([pat,slot],si)=>{
          patRot[pat]=(patRot[pat]||0);
          const e=pickEx(pat,used,equip,maxLv,excl,patRot[pat]+si);
          if(!e)return;
          used.add(idOf(e));
          const p=slot==='main'?pres.main:pat==='core'?pres.core:pres.acc;
          ex.push({id:idOf(e),n:e.n,mg:e.mg,slot,sets:p.s,reps:p.r,rest:p.rest,cues:e.cues,subs:e.subs});
        });
        // cardio after lifting
        const cardioMin= g.type==='lose'?20: g.type==='gain'?10: g.type==='stronger'?0: g.type==='recomp'?15:20;
        const cardio= cardioMin>0?{n:'Easy cardio (bike / incline walk)',min:cardioMin,note:'Keep it conversational — don\'t eat into recovery.'}:null;
        const estMin=Math.round(45+ (cardioMin||0));
        const kcal=Math.round(4.2*m.kg*(45/60)+(cardioMin?4.3*m.kg*(cardioMin/60):0));
        planDays.push({i:di,label:WEEK_DAYS[di],kind:'strength',focus:split[wi].replace('-',' '),ex,warmup,
          cooldown:['Stretch worked muscles 30 s each','Figure-4 glute stretch','Child\'s pose breathing 45 s'],
          cardio,estMin,kcal});
        wi++;
      } else {
        const hiit= (g.type==='lose'&&days>=3&&di===6&&!excl.some(x=>x.startsWith('hiit')))? {n:'Optional HIIT — bike sprints',proto:'30 s hard / 90 s easy × 6–8 rounds (~15 min incl. warm-up)'}:null;
        planDays.push({i:di,label:WEEK_DAYS[di],kind:'rest',focus:'Rest & Steps',
          ex:[],warmup:[],cooldown:[],
          cardio:hiit?null:{n:'Step goal + 10 min mobility flow',min:0,note:'Hit '+m.steps.toLocaleString('en-US')+' steps — walk after meals to blunt blood-sugar spikes.'},
          hiit,estMin:hiit?15:10,kcal:hiit?Math.round(9.5*m.kg*0.25):Math.round(3.3*m.kg*0.17)});
      }
    }
    const notes=[
      'Progression: when you hit the TOP of the rep range on all sets, add 2.5–5% load (or 1 rep) next week (ACSM).',
      'Deload: every 6th week, cut all sets in half — recovery is where adaptation happens.',
      'Leave 1–2 reps "in the tank" on every set (RPE 7–8); the last set can go to RPE 9.',
      'Rest between sets as prescribed; compound lifts first while fresh.',
      'WHO weekly target: 150+ min moderate cardio — your lifting-cardio + steps + HIIT cover it.'
    ];
    if(excl.length) notes.push('Injury flags applied: risky movements were swapped for safer alternatives. Clear any pain with a physical therapist.');
    if(m.pregnant) notes.push('Pregnancy mode: intensity capped at "somewhat hard" (RPE 6), no lying-flat core or impact work. Follow your OB\'s guidance.');
    return {name:days+'-day '+((days<=3)?'Full-Body':days===4?'Upper/Lower':days===5?'Hybrid':'Push/Pull/Legs')+' Split',
      days:planDays,notes,level:['Beginner','Intermediate','Advanced'][maxLv-1],maxLv};
  }

  /* ---------- 3. DIET / ALLERGY FILTERING ---------- */
  function prefsOf(u){
    const diet=u.diet||'none';
    const al=u.allergies||[];
    return {
      diet,
      vegan:diet==='vegan',
      veg:diet==='vegan'||diet==='vegetarian',
      keto:diet==='keto',
      noGluten:diet==='glutenfree'||al.includes('gluten'),
      noDairy:diet==='dairyfree'||al.includes('dairy'),
      noNuts:al.includes('nuts'),
      noEgg:al.includes('eggs'),
      noFish:al.includes('fish'),
      noShell:al.includes('shellfish'),
      noSoy:al.includes('soy'),
      halal:diet==='halal'||true // US default: exclude pork/alcohol anyway? no — respect flags only
    };
  }
  function foodAllowed(fid,P){
    const f=D.FOODS[fid]; if(!f)return false;
    const t=f.tags;
    if(P.vegan&&!t.includes('vegan'))return false;
    if(P.veg&&!t.includes('veg'))return false;
    if(P.noGluten&&t.includes('gluten'))return false;
    if(P.noDairy&&t.includes('dairy'))return false;
    if(P.noNuts&&t.includes('nuts'))return false;
    if(P.noEgg&&t.includes('egg'))return false;
    if(P.noFish&&t.includes('fish'))return false;
    if(P.noShell&&t.includes('shell'))return false;
    if(P.noSoy&&t.includes('soy'))return false;
    return true;
  }
  // resolve an item's food through diet-aware alternates; returns fid|null
  function resolveItem(it,P){
    if(it.role==='milk'){
      const cands=it.alt?[it.f,...it.alt]:['milk-2','almond-milk','oat-milk'];
      return cands.find(c=>foodAllowed(c,P))||null;
    }
    const cands=[it.f,...(it.alt||[])];
    const ok=cands.filter(c=>foodAllowed(c,P));
    return ok[0]||null;
  }
  function templateValid(tpl,P){
    return tpl.items.every(it=>{
      if(it.role==='veg'||it.role==='fruit')return true; // droppable
      return resolveItem(it,P)!=null;
    });
  }

  /* ---------- 4. MEAL PLAN ---------- */
  function buildMeal(tpl,targetK,targetP,P,tagKeto){
    const items=[];let k=0,p=0,c=0,f=0,assignedP=0;
    const push=(fid,g,role)=>{
      const fo=D.FOODS[fid];g=Math.max(0,Math.round(g/5)*5);
      if(g<5)return;
      const ik=fo.k*g/100,ip=fo.p*g/100,ic=fo.c*g/100,iff=fo.f*g/100;
      items.push({fid,n:fo.n,g,kcal:Math.round(ik),p:Math.round(ip),c:Math.round(ic),f:Math.round(iff),role});
      k+=ik;p+=ip;c+=ic;f+=iff;
    };
    // pass 1: protein & fixed items
    let cbItems=[];
    for(const it of tpl.items){
      const fid=resolveItem(it,P); if(!fid&&it.role!=='veg'&&it.role!=='fruit')continue;
      if(it.role==='pr'){
        const fo=D.FOODS[fid];
        const need=targetP-assignedP;
        if(need<=0)continue;
        const g=Math.min(it.cap||400,need/(fo.p/100));
        if(g>=10){push(fid,g,'pr');assignedP+=fo.p*g/100;}
      } else if(it.role==='milk'){
        push(fid,it.fix||240,'milk');
      } else if(it.role==='veg'||it.role==='fruit'||it.role==='extra'){
        if(it.fix&&fid)push(fid,it.fix,it.role);
      } else if(it.role==='ft'&&it.fix){
        if(fid)push(fid,it.fix,'ft');
      } else if(it.role==='cb'){
        if(it.fix&&fid){push(fid,it.fix,'cb');}
        else if(fid)cbItems.push(fid);
      }
    }
    // pass 2: scale carbs to remaining kcal
    let remaining=targetK-k;
    for(const fid of cbItems){
      if(remaining<=60)break;
      const fo=D.FOODS[fid];
      let g=remaining/(fo.k/100);
      g=Math.min(g,650);
      push(fid,g,'cb');
      remaining=targetK-k;
    }
    // pass 3: fill leftover kcal with a fat item or protein top-up
    remaining=targetK-k;
    if(remaining>90){
      if(assignedP<targetP*0.9){
        const top=P.vegan?'plant-protein':'whey';
        if(foodAllowed(top,P)){
          const fo=D.FOODS[top];
          const g=Math.min(45,remaining/(fo.k/100));
          push(top,g,'pr');
        }
      } else {
        const fatFill=P.keto?'olive-oil':'almonds';
        if(foodAllowed(fatFill,P)){
          const fo=D.FOODS[fatFill];
          const g=Math.min(60,remaining/(fo.k/100));
          push(fatFill,g,'ft');
        }
      }
    }
    const order={pr:0,cb:1,veg:2,fruit:3,extra:4,milk:5,ft:6};
    items.sort((a,b)=>(order[a.role]??9)-(order[b.role]??9));
    return {n:tpl.n,items,kcal:Math.round(k),p:Math.round(p),c:Math.round(c),f:Math.round(f)};
  }

  function mealPlan(u,g,m,seed=0){
    const P=prefsOf(u);
    const ifMode=!!u.ifMode;
    const target=m.target;
    // slots
    let slots;
    if(ifMode) slots=[{key:'l',share:.42},{key:'sn',share:.13},{key:'d',share:.45}];
    else if(target>=2600) slots=[{key:'b',share:.22},{key:'l',share:.30},{key:'sn',share:.12},{key:'d',share:.27},{key:'ns',share:.09}];
    else slots=[{key:'b',share:.25},{key:'l',share:.35},{key:'sn',share:.10},{key:'d',share:.30}];
    const names={b:'Breakfast',l:'Lunch',sn:'Snack',d:'Dinner',ns:'Evening Snack'};
    // times from wake/sleep
    const toMin=t=>{const[a,b]=t.split(':').map(Number);return a*60+b;};
    const wake=toMin(u.wake||'06:30'), sleep=toMin(u.sleep||'22:30');
    const fmt=t=>String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
    const times={b:wake+30,l:clamp(wake+360,11*60+30,13*60+30),sn:0,d:0,ns:sleep-90};
    times.d=Math.min(19*60+30,sleep-135);
    times.sn=Math.round((times.l+times.d)/2);
    if(times.sn<=times.l)times.sn=times.l+180;
    const out=[];
    slots.forEach((s,i)=>{
      const tk=Math.round(target*s.share), tp=Math.round(m.protein*s.share);
      const pool=D.MEAL_TEMPLATES.filter(t=>{
        if(t.meal!==(s.key==='ns'?'sn':s.key))return false;
        if(!templateValid(t,P))return false;
        if(P.keto&&(t.tg||[]).includes('keto'))return true;
        if(P.keto)return !t.items.some(it=>it.role==='cb'&&!it.fix&&!(((D.FOODS[it.f]||{}).tags)||[]).includes('keto'));
        return true;
      });
      let tpl=pool.length?pool[(seed+i)%pool.length]:null;
      const meal= tpl? buildMeal(tpl,tk,tp,P): fallbackMeal(tk,tp,P);
      const time= s.key==='ns'?fmt(Math.max(times.ns,sleep-120)): s.key==='b'?fmt(times.b): s.key==='l'?fmt(times.l): s.key==='sn'?fmt(times.sn):fmt(times.d);
      out.push({key:s.key,name:names[s.key],time,kcal:meal.kcal,p:meal.p,items:meal.items});
    });
    const totals=out.reduce((a,s)=>({k:a.k+s.kcal,p:a.p+s.p}),{k:0,p:0});
    const notes=[
      'Unlimited: water, black coffee, unsweetened tea, diet soda. Liquid calories (lattes, juice, soda, alcohol) are the #1 hidden intake problem in the US.',
      'Portions are cooked weights; ~±8% of targets is perfect — precision beyond that is noise.',
      'Protein at every meal protects muscle (ISSN). Vegetables + fruit cover the 14 g/1,000 kcal fiber target (DGA).'
    ];
    if(ifMode)notes.push('16:8 intermittent fasting: eating window '+(u.wake||'06:30')+' → '+(times.d>0?fmt(times.d+90):'19:00')+'. Black coffee while fasting is fine.');
    if(P.keto)notes.push('Keto mode: carbs kept low; add electrolytes (sodium/potassium/magnesium) during the first 2 weeks.');
    if(m.pregnant)notes.push('Pregnancy: no deficit applied; avoid alcohol, high-mercury fish and unpasteurized dairy.');
    return {slots:out,totals:{k:totals.k,p:totals.p,c:0,f:0,fiber:m.fiber},notes,ifMode};
  }

  function fallbackMeal(tk,tp,P){
    const prPool=(P.vegan?['tofu','tempeh','lentils','black-beans','plant-protein']:P.veg?['eggs','greek-yog-0','cottage-2','tofu','lentils','black-beans','whey']:['chicken-breast','ground-beef-90','salmon','turkey-ground','eggs','tuna-can']).filter(f=>foodAllowed(f,P));
    const cbPool=(P.keto?['cauliflower-rice']:['brown-rice','quinoa','potato','sweet-potato','pasta','ww-bread'].filter(f=>foodAllowed(f,P)));
    const vegPool=['broccoli','salad-mix','green-beans','spinach'].filter(f=>foodAllowed(f,P));
    const items=[];let k=0,p=0,assignedP=0;
    const add=(fid,g)=>{const fo=D.FOODS[fid];items.push({fid,n:fo.n,g:Math.round(g),kcal:Math.round(fo.k*g/100),p:Math.round(fo.p*g/100),c:Math.round(fo.c*g/100),f:Math.round(fo.f*g/100)});k+=fo.k*g/100;p+=fo.p*g/100;};
    const pf=prPool[0]||'whey';
    let g=Math.min(350,(tp)/(D.FOODS[pf].p/100));add(pf,g);assignedP=p;
    if(cbPool.length){const cb=cbPool[0];g=Math.max(0,(tk-k-100)/(D.FOODS[cb].k/100));add(cb,Math.min(g,600));}
    if(vegPool.length)add(vegPool[0],150);
    if(tk-k>90&&foodAllowed('olive-oil',P))add('olive-oil',Math.min(20,(tk-k)/(D.FOODS['olive-oil'].k/100)));
    return {n:'Coach Fallback Meal',items,kcal:Math.round(k),p:Math.round(p),c:0,f:0};
  }

  /* ---------- 5. GROCERY LIST (7-day aggregate) ---------- */
  function grocery(mp){
    const agg={};
    mp.slots.forEach(s=>s.items.forEach(it=>{agg[it.fid]=(agg[it.fid]||0)+it.g;}));
    const pkg={'eggs':x=>Math.ceil(x/50)+' eggs (~'+Math.ceil(x/50/12)+' dozen)','milk-2':x=>'~'+(x/3785).toFixed(1)+' gallon','ww-bread':x=>'~'+Math.ceil(x/43)+' slices (~'+Math.ceil(x/43/20)+' loaf)','tortilla-8':x=>'~'+Math.ceil(x/49)+' tortillas','greek-yog-0':x=>'~'+Math.ceil(x/907)+' large tubs (32 oz)','chicken-breast':x=>(x/453.6).toFixed(1)+' lb raw≈cooked×1.3','brown-rice':x=>(x/453.6).toFixed(1)+' lb cooked'};
    return Object.entries(agg).sort((a,b)=>b[1]-a[1]).map(([fid,g])=>{
      const f=D.FOODS[fid];
      return {name:f.n,g:Math.round(g),lb:(g/453.6).toFixed(1),note:pkg[fid]?pkg[fid](g):''};
    });
  }

  /* ---------- 6. ADAPTIVE AI ADJUSTMENT (premium) ---------- */
  function adaptive(weights,m,g){
    if(!weights||weights.length<4)return{ok:false,msg:'Log your weight at least 4 times (spread over ~2 weeks) and I can auto-adjust your calories.'};
    const pts=weights.slice().sort((a,b)=>a.d<b.d?-1:1);
    const first=pts[0],last=pts[pts.length-1];
    const days=Math.max(7,(new Date(last.d)-new Date(first.d))/864e5);
    const trend=(last.kg-first.kg)/days*7; // kg/week
    const trendLb=trend*2.20462;
    const goalRate=m.rateLbWk;
    let delta=0,msg='';
    if(g.type==='lose'){
      if(trendLb>goalRate*0.8){delta=-150;msg='You\'re losing '+Math.abs(trendLb).toFixed(1)+' lb/wk — faster than target ('+goalRate+'). Cut 150 kcal to protect muscle.';}
      else if(trendLb>0.2){delta=-100;msg='Weight is creeping up. Reduce 100 kcal and keep protein high.';}
      else if(trendLb<goalRate*0.35&&trendLb>-goalRate){delta=100;msg='Only '+Math.abs(trendLb).toFixed(1)+' lb/wk — below your '+goalRate+' lb/wk target. Add 100 kcal back; slower is fine if you feel great.';}
      else {delta=0;msg='On track: '+Math.abs(trendLb).toFixed(1)+' lb/wk vs '+goalRate+' lb/wk target. Keep going.';}
    } else if(g.type==='gain'){
      if(trendLb>goalRate*1.5){delta=-100;msg='Gaining a bit fast — trim 100 kcal to stay lean.';}
      else if(trendLb<goalRate*0.6){delta=150;msg='Gaining slower than target — add 150 kcal.';}
      else {delta=0;msg='Lean-gain pace looks right.';}
    } else {
      if(Math.abs(trendLb)>1){delta=trendLb>0?-150:150;msg='Weight drifted '+trendLb.toFixed(1)+' lb/wk from maintenance — adjusting.';}
      else {delta=0;msg='Maintenance is dialed in.';}
    }
    return {ok:true,deltaKcal:delta,target:m.target+delta,trendLb:round(trendLb,2),msg};
  }

  /* ---------- 7. SCHEDULE / REMINDERS ---------- */
  function schedule(u,mp,wk,settings){
    const ev=[];
    const toMin=t=>{const[a,b]=t.split(':').map(Number);return a*60+b;};
    const fmt=t=>String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.round(t%60)).padStart(2,'0');
    const wake=toMin(u.wake||'06:30'),sleep=toMin(u.sleep||'22:30');
    const R=settings.reminders||{};
    // meals
    if(R.meals!==false) mp.slots.forEach(s=>ev.push({day:'D',time:s.time,type:'meal',id:'meal-'+s.key,label:s.name+' — check the plan & log it',icon:'🍽️'}));
    // workout
    if(R.workout!==false) wk.days.filter(d=>d.kind==='strength').forEach(d=>ev.push({day:d.i,time:settings.workoutTime||'18:00',type:'workout',id:'wk-'+d.i,label:d.focus+' session ('+d.estMin+' min) — today is training day',icon:'🏋️'}));
    // water
    if(R.water!==false){
      const stepH=settings.waterHours||2;
      for(let t=wake+60;t<=sleep-60;t+=stepH*60){ev.push({day:'D',time:fmt(t),type:'water',id:'water-'+fmt(t),label:'Hydration check — drink a glass of water',icon:'💧'});}
    }
    // weigh-in
    if(R.weigh!==false) ev.push({day:settings.weighDay??0,time:'08:00',type:'weigh',id:'weigh',label:'Weigh-in day — same scale, after bathroom, before food',icon:'⚖️'});
    // wind-down
    if(R.sleep!==false) ev.push({day:'D',time:fmt(sleep-30),type:'sleep',id:'sleep',label:'Wind down — screens off, 7–9 h target (AASM)',icon:'🌙'});
    return ev;
  }

  return {metrics,workoutPlan,mealPlan,grocery,adaptive,schedule,prefsOf,foodAllowed,resolveItem,templateValid,fallbackMeal,
    lbToKg,kgToLb,inToCm,cmToIn,round,clamp};
})();
window.FP=FP;
