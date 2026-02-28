// ======= Segédfüggvények polinomokhoz =======
// Polinom reprezentáció: tömb koefficienssel, index = fok (pl. [5, -2, 3] == 3x^2 - 2x + 5)
const clone = a => a.slice();

function trim(p){
  let q = clone(p);
  while(q.length>1 && Math.abs(q[q.length-1]) < 1e-12) q.pop();
  return q;
}

function randInt(min, max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

function randPoly(maxDeg, cmin, cmax, allowZeroLeading=false){
  const deg = randInt(0, maxDeg);
  const p = Array(deg+1).fill(0).map(()=>randInt(cmin,cmax));
  if(!allowZeroLeading){
    if(Math.abs(p[deg])===0){
      p[deg] = randInt(cmin, cmax) || 1;
    }
  }
  return trim(p);
}

function add(p,q){
  const n = Math.max(p.length, q.length);
  const r = Array(n).fill(0);
  for(let i=0;i<n;i++){
    r[i] = (p[i]||0) + (q[i]||0);
  }
  return trim(r);
}
function sub(p,q){
  const n = Math.max(p.length, q.length);
  const r = Array(n).fill(0);
  for(let i=0;i<n;i++){
    r[i] = (p[i]||0) - (q[i]||0);
  }
  return trim(r);
}
function mul(p,q){
  const r = Array(p.length + q.length - 1).fill(0);
  for(let i=0;i<p.length;i++){
    for(let j=0;j<q.length;j++){
      r[i+j] += p[i]*q[j];
    }
  }
  return trim(r);
}
function divByMonomial(p, a, k){
  if(Math.abs(a) < 1e-12) throw new Error("a = 0 nem megengedett");
  if(k<0) throw new Error("k nemnegatív");
  if(p.length - 1 < k){
    return {quotient:[0], remainder:clone(p)};
  }
  const q = Array(p.length - k).fill(0);
  for(let i=0;i<p.length;i++){
    if(i>=k) q[i-k] = p[i]/a;
  }
  const r = Array(Math.min(k, p.length)).fill(0).map((_,i)=>p[i]);
  return {quotient:trim(q), remainder:trim(r)};
}
function evalAt(p, x){
  let s = 0;
  for(let i=p.length-1;i>=0;i--) s = s*x + p[i];
  return s;
}

function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b>1e-12){ const t=b; b=a%b; a=t; } return a; }

// Parszoló: "3x^2 - x + 5" -> tömb
function parsePoly(str){
  if(!str) return [0];
  let s = (str + '').replace(/\s+/g,'');
  s = s.replace(/−|—|–/g,'-');
  s = s.replace(/,/g,'.');
  if(s[0] === '-') s = '0' + s;
  s = s.replace(/-/g,'+-');
  const parts = s.split('+').filter(t=>t.length>0);
  let terms = {};
  for(const part of parts){
    let coef=0, deg=0;
    if(/[xX]/.test(part)){
      const m = part.match(/^([+-]?\d*(?:\.\d+)?)?[xX](?:\^([+-]?\d+))?$/);
      if(!m) throw new Error("Érvénytelen tag: "+part);
      const raw = m[1];
      coef = (raw==='' || raw==='+' || raw===undefined) ? 1
           : (raw==='-') ? -1
           : parseFloat(raw);
      deg = m[2]!==undefined ? parseInt(m[2],10) : 1;
    }else{
      const m = part.match(/^([+-]?\d+(?:\.\d+)?)$/);
      if(!m) throw new Error("Érvénytelen konstans: "+part);
      coef = parseFloat(m[1]);
      deg = 0;
    }
    terms[deg] = (terms[deg]||0) + coef;
  }
  const maxDeg = Math.max(0, ...Object.keys(terms).map(d=>parseInt(d,10)));
  const arr = Array(maxDeg+1).fill(0);
  for(const [d,c] of Object.entries(terms)){
    arr[parseInt(d,10)] = c;
  }
  return trim(arr);
}

function toFixedSmart(v){
  return Number.isInteger(v) ? v.toString() : (Math.round(v*100)/100).toString();
}


function toFixedSmart(v) {
  return Number.isInteger(v) ? v.toString() : (Math.round(v * 100) / 100).toString();
}


function toStringPoly(p, options = {}) {
  const { useFrac = false } = options; // (useFrac paraméter most nincs használva, későbbre meghagyva)
  let s = '';
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i];
    if (Math.abs(c) < 1e-12) continue;
    const showPlus = s.length > 0;

    if (i === 0) {
      const sign = c >= 0 ? (showPlus ? ' + ' : '') : ' - ';
      s += sign + toFixedSmart(Math.abs(c));
    } else if (i === 1) {
      const sign = c >= 0 ? (showPlus ? ' + ' : '') : ' - ';
      const mag = Math.abs(c);
      s += sign + (Math.abs(mag - 1) < 1e-12 ? 'x' : (toFixedSmart(mag) + 'x'));
    } else {
      const sign = c >= 0 ? (showPlus ? ' + ' : '') : ' - ';
      const mag = Math.abs(c);
      s += sign + (Math.abs(mag - 1) < 1e-12 ? ('x^' + i) : (toFixedSmart(mag) + 'x^' + i));
    }
  }
  return s || '0';
}


function similarPoly(p,q){
  const n = Math.max(p.length, q.length);
  for(let i=0;i<n;i++){
    const a = p[i]||0, b=q[i]||0;
    if(Math.abs(a-b) > 1e-8) return false;
  }
  return true;
}

// ======= UI/Állapot =======
const opEl = document.getElementById('op');
const degEl = document.getElementById('deg');
const cminEl = document.getElementById('coefMin');
const cmaxEl = document.getElementById('coefMax');
const monoAEl = document.getElementById('monoA');
const monoKEl = document.getElementById('monoK');
const evalREl = document.getElementById('evalR');

const monomOpts = document.getElementById('monomOpts');
const evalOpts = document.getElementById('evalOpts');

const genBtn = document.getElementById('genBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const showBtn = document.getElementById('showBtn');
const resetBtn = document.getElementById('resetBtn');
const checkBtn = document.getElementById('checkBtn');

const taskEl = document.getElementById('task');
const ansEl = document.getElementById('answer');
const feedEl = document.getElementById('feedback');
const solEl = document.getElementById('solution');

let P=[3,-2,1], Q=[-1,0,2], currentOp='add', currentSolution=null;

function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }

function refreshOptionPanels(){
  if(opEl.value === 'divm'){ show(monomOpts); } else { hide(monomOpts); }
  if(opEl.value === 'eval'){ show(evalOpts); } else { hide(evalOpts); }
}
opEl.addEventListener('change', ()=>{ refreshOptionPanels(); generateNewTask(false); });

function genPQ(){
  const maxDeg = Math.max(0, Math.min(5, parseInt(degEl.value||'3',10)));
  const cmin = parseInt(cminEl.value||'-5',10);
  const cmax = parseInt(cmaxEl.value||'5',10);
  P = randPoly(maxDeg, cmin, cmax);
  Q = randPoly(maxDeg, cmin, cmax);
}

function buildTaskText(){
  const pS = 'P(x) = ' + toStringPoly(P);
  const qS = (currentOp==='add'||currentOp==='sub'||currentOp==='mul') ? ('; Q(x) = ' + toStringPoly(Q)) : '';
  let opS='';
  switch(currentOp){
    case 'add': opS = 'Számítsd ki: P(x) + Q(x)'; break;
    case 'sub': opS = 'Számítsd ki: P(x) − Q(x)'; break;
    case 'mul': opS = 'Számítsd ki: P(x) · Q(x)'; break;
    case 'divm': opS = `Számítsd ki: P(x) ÷ (${monoAEl.value}·x^${monoKEl.value}) (hányados + maradék)`; break;
    case 'eval': opS = `Számítsd ki: P(${evalREl.value})`; break;
  }
  return opS + '\n' + pS + qS;
}

function calcSolution(){
  switch(currentOp){
    case 'add': return add(P,Q);
    case 'sub': return sub(P,Q);
    case 'mul': return mul(P,Q);
    case 'divm': {
      const a = parseFloat((monoAEl.value||'1').replace(',','.'));
      const k = parseInt(monoKEl.value||'1',10);
      return divByMonomial(P, a, k);
    }
    case 'eval': {
      const r = parseFloat((evalREl.value||'0').replace(',','.'));
      return evalAt(P, r);
    }
  }
}

function renderTask(){
  taskEl.textContent = buildTaskText();
}

function renderSolution(){
  const sol = calcSolution();
  let s='';
  if(currentOp==='divm'){
    s = 'Hányados: ' + toStringPoly(sol.quotient) + '; Maradék: ' + toStringPoly(sol.remainder);
  }else if(currentOp==='eval'){
    s = 'Érték: ' + (Number.isInteger(sol)? sol : (Math.round(sol*100)/100));
  }else{
    s = toStringPoly(sol);
  }
  solEl.textContent = s;
}

function generateNewTask(changeOpToo=true){
  if(changeOpToo) currentOp = opEl.value;
  genPQ();
  renderTask();
  currentSolution = calcSolution();
  hide(solEl);
  solEl.textContent='';
  feedEl.textContent = '–';
  ansEl.value='';
}

function shufflePQ(){
  genPQ();
  renderTask();
  currentSolution = calcSolution();
  hide(solEl);
  solEl.textContent='';
  feedEl.textContent = '–';
  ansEl.value='';
}

function normalizeAnswer(s){
  try{
    if(currentOp==='eval'){
      return parseFloat((s||'').toString().replace(/\s+/g,'').replace(/,/g,'.'));
    }
    if(currentOp==='divm'){
      const txt = (s||'').toString().replace(/\s+/g,'').replace(/；/g,';').toLowerCase();
      let parts = txt.split(';').map(x=>x.trim()).filter(Boolean);
      if(parts.length===1){
        const hMatch = txt.match(/h[=:\-]?([^;]+)(;|$)/);
        const mMatch = txt.match(/m[=:\-]?([^;]+)$/);
        if(hMatch && mMatch) parts=[hMatch[1], mMatch[1]];
      }
      if(parts.length!==2) throw new Error("Add meg így: hányados ; maradék");
      return {q: trim(parsePoly(parts[0])), r: trim(parsePoly(parts[1]))};
    }
    return trim(parsePoly(s));
  }catch(e){
    throw e;
  }
}

function check(){
  try{
    const user = normalizeAnswer(ansEl.value);
    let ok=false, msg='';
    if(currentOp==='divm'){
      ok = similarPoly(user.q, currentSolution.quotient) && similarPoly(user.r, currentSolution.remainder);
      msg = ok ? '✔ Helyes: egyezik a hányados és a maradék.' :
                 '✖ Nem egyezik. Tipp: rendezd csökkenő fokszám szerint és egyszerűsítsd a tagokat.';
      feedEl.innerHTML = (ok? '<span class="ok">'+msg+'</span>' : '<span class="bad">'+msg+'</span>') +
                         '<div class="mt-8">Te: H: '+toStringPoly(user.q)+'; M: '+toStringPoly(user.r)+'</div>';
    }else if(currentOp==='eval'){
      const correct = calcSolution();
      ok = Math.abs((+user) - correct) < 1e-8;
      msg = ok ? '✔ Helyes érték.' : '✖ Nem helyes érték.';
      feedEl.innerHTML = (ok? '<span class="ok">'+msg+'</span>' : '<span class="bad">'+msg+'</span>') +
                         '<div class="mt-8">Te: '+user+'; Helyes: '+(Number.isInteger(correct)?correct:Math.round(correct*100)/100)+'</div>';
    }else{
      ok = similarPoly(user, currentSolution);
      msg = ok ? '✔ Helyes polinom.' :
          '✖ Nem egyezik. Ellenőrizd az azonos fokszámú tagok összevonását és a jeleket.';
      feedEl.innerHTML = (ok? '<span class="ok">'+msg+'</span>' : '<span class="bad">'+msg+'</span>') +
                         '<div class="mt-8">Te: '+toStringPoly(user)+'<br/>Helyes: '+toStringPoly(currentSolution)+'</div>';
    }
  }catch(e){
    feedEl.innerHTML = '<span class="bad">Hiba a válasz értelmezésében: '+e.message+'</span>';
  }
}

// Események
document.addEventListener('keydown', (ev)=>{
  if(ev.key==='Enter'){ ev.preventDefault(); check(); }
});
document.getElementById('genBtn').addEventListener('click', ()=>generateNewTask(true));
document.getElementById('shuffleBtn').addEventListener('click', shufflePQ);
document.getElementById('showBtn').addEventListener('click', ()=>{
  renderSolution(); show(solEl);
});
document.getElementById('resetBtn').addEventListener('click', ()=>{
  ansEl.value=''; feedEl.textContent='–'; hide(solEl);
});
document.getElementById('checkBtn').addEventListener('click', check);

// opció panel frissítés és első feladat
refreshOptionPanels();
generateNewTask(true);
