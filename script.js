
const intensityByObs = {
  'Aquecimento': { color: '#00C853', value: 0.25 },
  'Isometria':   { color: '#2979FF', value: 0.50 },
  'Aumenta a carga': { color: '#FF5252', value: 0.80 }
};
const StorageKey = 'gymState_full_improved_v1';

function loadState(){ try{return JSON.parse(localStorage.getItem(StorageKey))||{};}catch{return{};}}
function saveState(s){ localStorage.setItem(StorageKey, JSON.stringify(s)); }
function todayStr(){ const d=new Date();return d.toISOString().split('T')[0]; }

function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2000);
}

function buildTable(day, items){
  const state=loadState(); const today=todayStr();
  state[day]=state[day]||{}; state[day][today]=state[day][today]||{done:[]};
  const doneSet=new Set(state[day][today].done);

  const wrap=document.createElement('div'); wrap.className='container card';

  const h2=document.createElement('h2'); h2.textContent=day;
  const controls=document.createElement('div'); controls.className='controls';
  const progDay=document.createElement('div'); progDay.className='progress-day';
  const bar=document.createElement('div'); bar.className='bar'; progDay.appendChild(bar);
  controls.appendChild(progDay);

  const finishBtn=document.createElement('button'); finishBtn.textContent='Finalizar treino do dia';
  finishBtn.onclick=()=>{
    state[day][today].done=items.map((_,i)=>i); saveState(state);
    updateDayProgress(); markCompletedIfNeeded(); showToast('Treino concluído! ✅');
  };
  controls.appendChild(finishBtn);

  h2.appendChild(controls); wrap.appendChild(h2);

  const legend=document.createElement('div'); legend.className='legend';
  legend.innerHTML=`
    <div class="item"><span class="swatch" style="background:#00C853"></span>Aquecimento</div>
    <div class="item"><span class="swatch" style="background:#FF5252"></span>Aumenta a carga</div>
    <div class="item"><span class="swatch" style="background:#2979FF"></span>Isometria</div>`;
  wrap.appendChild(legend);

  const tableWrap=document.createElement('div'); tableWrap.className='table-wrap';
  const table=document.createElement('table');
  table.innerHTML=`<thead><tr><th></th><th>Exercício</th><th>Séries/Reps</th><th>Observações</th></tr></thead><tbody></tbody>`;
  const tbody=table.querySelector('tbody');

  function updateDayProgress(){
    const pct = (doneSet.size/items.length*100) || 0;
    bar.style.width = pct + '%';
  }
  function markCompletedIfNeeded(){
    if(doneSet.size === items.length && items.length>0){
      wrap.classList.add('completed');
    } else {
      wrap.classList.remove('completed');
    }
  }

  items.forEach((it,idx)=>{
    const tr=document.createElement('tr');

    // checkbox
    const td0=document.createElement('td');
    const box=document.createElement('div'); box.className='todo'+(doneSet.has(idx)?' checked':''); box.textContent=doneSet.has(idx)?'✓':'';
    box.onclick=()=>{
      if(doneSet.has(idx)){ doneSet.delete(idx); }
      else { doneSet.add(idx); }
      state[day][today].done=[...doneSet]; saveState(state);
      box.className='todo'+(doneSet.has(idx)?' checked':''); box.textContent=doneSet.has(idx)?'✓':'';
      updateDayProgress(); markCompletedIfNeeded();
    };
    td0.appendChild(box);

    const td1=document.createElement('td'); td1.textContent=it.exercicio||'';
    const td2=document.createElement('td'); td2.textContent=it.series||'';
    const td3=document.createElement('td');

    if(it.obs){
      const span=document.createElement('span'); span.className='badge'; span.textContent=it.obs;
      const meta=intensityByObs[it.obs]; if(meta){span.style.background=meta.color;}
      td3.appendChild(span);

      const prog=document.createElement('div'); prog.className='progress';
      const pb=document.createElement('div'); pb.className='bar';
      if(meta){ pb.style.background=meta.color; pb.style.width=(meta.value*100)+'%'; }
      prog.appendChild(pb); td3.appendChild(prog);
    }

    tr.append(td0,td1,td2,td3); tbody.appendChild(tr);
  });

  table.appendChild(tbody); tableWrap.appendChild(table); wrap.appendChild(tableWrap);

  // initial state
  updateDayProgress(); markCompletedIfNeeded();
  return wrap;
}

function render(day){
  const main=document.getElementById('content');
  main.innerHTML='';
  main.appendChild(buildTable(day, window.WORKOUTS[day]||[]));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.tab').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.day);
    };
  });
  render('Segunda');
});
