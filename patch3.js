const fs=require('fs');
const R=String.raw;
let h=fs.readFileSync('pagina.html','utf8');
if(h.includes('id="t-cad"')){console.log('Já aplicado.');process.exit(0)}
if(!h.includes('id="t-edit"')){console.log('❌ Aplica primeiro o patch anterior (Editar).');process.exit(1)}
fs.writeFileSync('pagina.bak3.html',h);
function rep(a,b){if(!h.includes(a)){console.log('⚠️ não encontrei: '+a.slice(0,45));return}h=h.replace(a,()=>b)}

rep("['auth','form','perfil','edit']","['auth','form','perfil','edit','cad','ver']");
rep("onclick=\"soon('Cadastrar Aluno')\"",'onclick="abrirCadAluno()"');
rep("onclick=\"soon('Professor')\"",'onclick="abrirCadProf()"');
rep("['pautas','📑 Pautas']];","['pautas','📑 Pautas'],['alunos','🎓 Alunos'],['professores','👨‍🏫 Professores']];");
rep("['classes','eventos','destaque','pautas'].forEach(","['classes','eventos','destaque','pautas','alunos','professores'].forEach(");
rep('function abaHtml(k){','function abaHtmlBase(k){');
rep("abaAtual='geral';abasUI();tela('perfil');","abaAtual=abaPend||'geral';abaPend=null;abasUI();tela('perfil');");

rep('</style>',R`
.pes{display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid #e5e7eb;cursor:pointer}
.pes:last-child{border:0}
.pes .fi{width:52px;height:52px;border-radius:50%;background:#e5e7eb center/cover;flex:0 0 auto}
.pes b{display:block;font-size:16px}
.pes span{font-size:13px;color:#6b7280}
#lb{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:50}
#lb img{max-width:100%;max-height:100%}
</style>`);

const htmlNovo=R`<!-- CADASTRO -->
<div id="t-cad" class="box oculto">
  <button class="voltar" id="cd-voltar" style="margin-bottom:8px">← Perfil</button>
  <h1 id="cd-tit"></h1>
  <p class="sub" id="cd-sub"></p>
  <div id="cd-corpo"></div>
</div>

<!-- PERFIL DE ALUNO / PROFESSOR -->
<div id="t-ver" class="oculto">
  <div class="capa" style="height:110px;background:#1d4ed8"></div>
  <div class="topo">
    <div class="avatar" id="v-foto"></div>
    <h1 id="v-nome"></h1>
    <div class="pf-sub" id="v-sub"></div>
  </div>
  <div class="botoes">
    <button class="bt azul" onclick="editarPessoa()">✏️ Editar</button>
    <button class="bt" onclick="voltarLista()">← Lista</button>
    <button class="bt" onclick="eliminarPessoa()">🗑️ Eliminar</button>
  </div>
  <div class="box">
    <div class="card" id="v-info"></div>
    <div class="card" id="v-docs"></div>
  </div>
</div>

<div id="lb" class="oculto" onclick="this.classList.add('oculto')"><img id="lb-img"></div>

`;
rep('<!-- EDITAR PÁGINA -->',htmlNovo+'<!-- EDITAR PÁGINA -->');

const jsNovo=R`/* ---------- ALUNOS E PROFESSORES ---------- */
const CAP=40;
const CLASSE='10ª Classe';
const LETRAS='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CURSOS=['Informática','Contabilidade e Gestão','Enfermagem','Electricidade','Construção Civil','Ciências Físicas e Biológicas','Ciências Económicas e Jurídicas','Ciências Humanas'];
const GRAUS=['Ensino Médio','Bacharelato','Licenciatura','Mestrado','Doutoramento'];
const OUT='✏️ Outro (escrever)';
const F_MEDIO=[
  {k:'nome',l:'Nome completo',t:'nome',req:1,ph:'Nome e apelido'},
  {k:'foto',l:'Foto do aluno',t:'foto',req:1},
  {k:'bi',l:'Número do bilhete',t:'bi',req:1,ph:'Ex.: 001234567LA041'},
  {k:'biCopia',l:'Cópia do bilhete',t:'doc',req:1},
  {k:'enc',l:'Nome do encarregado',t:'nome',req:1},
  {k:'tel',l:'Telefone do encarregado',t:'tel',req:1,ph:'9XXXXXXXX'},
  {k:'cert',l:'Cópia do certificado da 9ª classe',t:'doc',req:1},
  {k:'curso',l:'Curso',t:'curso',req:1}
];
const F_INIC=[
  {k:'foto',l:'Foto do aluno',t:'foto',req:1},
  {k:'nome',l:'Nome completo do estudante',t:'nome',req:1},
  {k:'nasc',l:'Data de nascimento',t:'data',req:1},
  {k:'natural',l:'Local de nascimento',t:'txt',req:1,ph:'Município / Província'},
  {k:'genero',l:'Género',t:'sel',ops:['Masculino','Feminino'],req:1},
  {k:'morada',l:'Morada / Bairro (opcional)',t:'txt'},
  {k:'obs',l:'Informação adicional do estudante (opcional)',t:'area',ph:'Saúde, alergias, observações...'},
  {k:'pai',l:'Nome completo do pai',t:'nome'},
  {k:'mae',l:'Nome completo da mãe',t:'nome'},
  {k:'prof',l:'Professor(a) responsável',t:'prof',req:1}
];
const F_PROF=[
  {k:'nome',l:'Nome completo',t:'nome',req:1,ph:'Nome e apelido'},
  {k:'foto',l:'Foto do professor',t:'foto',req:1},
  {k:'bi',l:'Número do bilhete',t:'bi',req:1,ph:'Ex.: 001234567LA041'},
  {k:'biCopia',l:'Cópia do bilhete',t:'doc',req:1},
  {k:'cert',l:'Cópia do certificado',t:'doc',req:1},
  {k:'grau',l:'Grau académico',t:'sel',ops:GRAUS,req:1},
  {k:'area',l:'Área / curso de formação',t:'txt',req:1,ph:'Ex.: Matemática, Informática...'},
  {k:'estudou',l:'Onde estudou (instituição)',t:'txt',req:1},
  {k:'exp',l:'Experiência profissional (opcional)',t:'area',ph:'Onde trabalhou, cargos, anos...'}
];
let pes={k:'alunos',i:-1},cfgAtual=null,abaPend=null;

function ANO(){return new Date().getFullYear()}
function hoje(){return new Date().toISOString().slice(0,10)}
function idade(s){
  if(!s)return '';
  const n=new Date(s),t=new Date();
  let a=t.getFullYear()-n.getFullYear();
  const m=t.getMonth()-n.getMonth();
  if(m<0||(m===0&&t.getDate()<n.getDate()))a--;
  return a;
}
function erro(k,m){const e=$('er-'+k);if(e)e.textContent=m||''}
function opsProf(){
  const s=[];
  (d.professores||[]).forEach(function(p){if(p.nome&&s.indexOf(p.nome)<0)s.push(p.nome)});
  if(d.professor&&s.indexOf(d.professor)<0)s.push(d.professor);
  return s;
}
function comprimir(inp,max,q,cb){
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=function(ev){
    const im=new Image();
    im.onload=function(){
      const k=Math.min(1,max/im.width),c=document.createElement('canvas');
      c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);
      cb(c.toDataURL('image/jpeg',q));
    };
    im.onerror=function(){alert('Ficheiro inválido. Escolha uma imagem (foto).')};
    im.src=ev.target.result;
  };
  r.readAsDataURL(f);
}

/* Turma automática: 40 alunos por turma, por curso e ano */
function atribuirTurma(cur,ign){
  const ano=ANO();
  for(let l=0;l<LETRAS.length;l++){
    const L=LETRAS.charAt(l);
    const mem=d.alunos.filter(function(a,i){return i!==ign&&a.tipo==='medio'&&a.curso===cur&&a.ano===ano&&a.turma===L});
    if(mem.length<CAP){
      const usados=mem.map(function(m){return m.ordem});
      let o=1;while(usados.indexOf(o)>=0)o++;
      return {turma:L,ordem:o};
    }
  }
  return {turma:'Z',ordem:1};
}
function extraMedio(w){
  const ex=$('cd-extra');if(!ex)return;
  const cur=(w.curso||'').trim(),i=pes.i;
  const proc=w.proc||(ANO()+'/'+String((d.seqAluno||0)+1).padStart(4,'0'));
  let x='<b>🔢 Atribuição automática</b>';
  x+='<div class="info"><b>Nº de processo</b><span>'+esc(proc)+'</span></div>';
  if(cur){
    const at=(i>=0&&d.alunos[i]&&d.alunos[i].curso===cur)?{turma:d.alunos[i].turma,ordem:d.alunos[i].ordem}:atribuirTurma(cur,i);
    x+='<div class="info"><b>Turma</b><span>'+esc(CLASSE+' · '+cur+' · Turma '+at.turma)+'</span></div>';
    x+='<div class="info"><b>Nº na turma</b><span>'+at.ordem+' de '+CAP+'</span></div>';
  }else x+='<p class="cp" style="font-size:14px">Escolha o curso para ver a turma.</p>';
  ex.innerHTML=x;
}
function extraInic(w){
  const ex=$('cd-extra');if(!ex)return;
  if(!w.nasc){ex.innerHTML='🎂 Preencha a data de nascimento para calcular a idade.';return}
  const a=idade(w.nasc);
  ex.innerHTML='🎂 Idade: <b>'+a+' anos</b>'+(a>10?' ⚠️ Confirme a data de nascimento.':'');
}
function customInic(w,bad){
  if(!(w.pai||'').trim()&&!(w.mae||'').trim())bad('mae','Indique o nome do pai ou da mãe.');
}

/* Seleção com opção "Outro (escrever)" */
function selOutro(card,ops,w,key,onCh){
  const sel=document.createElement('select'),inp=document.createElement('input');
  [''].concat(ops).concat([OUT]).forEach(function(o){
    const op=document.createElement('option');op.value=o;op.textContent=o||'Escolher…';sel.appendChild(op);
  });
  const v=w[key]||'';
  if(v&&ops.indexOf(v)>=0)sel.value=v;else if(v){sel.value=OUT;inp.value=v}
  inp.placeholder='Escreva aqui';inp.style.marginTop='8px';
  const mostrar=function(){inp.classList.toggle('oculto',sel.value!==OUT)};
  mostrar();
  sel.onchange=function(){w[key]=sel.value===OUT?inp.value.trim():sel.value;mostrar();onCh()};
  inp.oninput=function(){w[key]=inp.value.trim();onCh()};
  inp.onblur=function(){inp.value=titulo(inp.value);w[key]=inp.value;onCh()};
  card.appendChild(sel);card.appendChild(inp);
}

/* Construtor genérico de formulários */
function montarForm(cfg,w,onSave,extra,custom){
  cfgAtual={cfg:cfg,w:w,custom:custom};
  const box=$('cd-corpo');box.innerHTML='';
  const card=document.createElement('div');card.className='card';box.appendChild(card);
  const onCh=function(){if(extra)extra(w)};
  cfg.forEach(function(f){
    const t=f.t;
    const lb=document.createElement('label');lb.textContent=f.l+(f.req?' *':'');card.appendChild(lb);
    if(t==='foto'||t==='doc'){
      const pv=document.createElement('div');pv.className=t==='foto'?'foto-perfil':'foto-capa';
      const fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.className='oculto';
      const pintar=function(){
        pv.style.backgroundImage=w[f.k]?'url('+w[f.k]+')':'';
        if(t==='doc'){pv.style.backgroundSize='contain';pv.style.backgroundRepeat='no-repeat';pv.style.height='180px'}
        pv.textContent=w[f.k]?'':(t==='foto'?'Foto':'Toque para enviar a cópia');
      };
      pintar();
      pv.onclick=function(){fi.click()};
      fi.onchange=function(){comprimir(fi,t==='foto'?400:900,t==='foto'?0.7:0.55,function(u){w[f.k]=u;pintar();erro(f.k,'')})};
      card.appendChild(pv);card.appendChild(fi);
    }else if(t==='curso'){
      selOutro(card,CURSOS,w,f.k,function(){erro(f.k,'');onCh()});
    }else if(t==='prof'){
      selOutro(card,opsProf(),w,f.k,function(){erro(f.k,'');onCh()});
    }else if(t==='sel'){
      const s=document.createElement('select');
      [''].concat(f.ops).forEach(function(o){const op=document.createElement('option');op.value=o;op.textContent=o||'Escolher…';s.appendChild(op)});
      s.value=w[f.k]||'';
      s.onchange=function(){w[f.k]=s.value;erro(f.k,'');onCh()};
      card.appendChild(s);
    }else{
      const el=document.createElement(t==='area'?'textarea':'input');
      if(t==='area')el.rows=3;
      if(t==='data'){el.type='date';el.max=hoje()}
      if(t==='tel'){el.inputMode='numeric';el.maxLength=9}
      if(t==='bi')el.maxLength=14;
      el.placeholder=f.ph||'';el.value=w[f.k]||'';
      el.oninput=function(){
        if(t==='tel')el.value=el.value.replace(/[^0-9]/g,'');
        if(t==='bi')el.value=el.value.toUpperCase().replace(/[^0-9A-Z]/g,'');
        w[f.k]=el.value;erro(f.k,'');onCh();
      };
      el.onchange=el.oninput;
      if(t==='nome')el.onblur=function(){el.value=titulo(el.value);w[f.k]=el.value;onCh()};
      card.appendChild(el);
    }
    const er=document.createElement('div');er.className='erro';er.id='er-'+f.k;card.appendChild(er);
  });
  if(extra){
    const ex=document.createElement('div');ex.id='cd-extra';ex.className='card';ex.style.background='#eff6ff';
    box.appendChild(ex);
  }
  const bt=document.createElement('button');bt.className='btn verde';bt.textContent='💾 Guardar';bt.onclick=onSave;
  box.appendChild(bt);
  onCh();
}
function validarForm(lista,ign){
  const c=cfgAtual,w=c.w;let ok=true,primeiro=null;
  const bad=function(k,m){erro(k,m);ok=false;if(!primeiro)primeiro=k};
  c.cfg.forEach(function(f){
    const v=w[f.k],sem=!v||!String(v).trim();
    if(f.req&&sem){bad(f.k,(f.t==='foto'||f.t==='doc')?'Envie a imagem.':'Campo obrigatório.');return}
    if(sem)return;
    if(f.t==='nome'&&v.trim().split(' ').filter(Boolean).length<2)bad(f.k,'Escreva o nome completo (nome e apelido).');
    if(f.t==='tel'&&!/^9[0-9]{8}$/.test(v))bad(f.k,'Telefone: 9 dígitos, começa por 9.');
    if(f.t==='bi'){
      if(!(v.length===14&&/^[0-9]{9,10}[A-Z]{2}[0-9]{2,3}$/.test(v)))bad(f.k,'Bilhete inválido. Exemplo: 001234567LA041');
      else if(d[lista].some(function(p,i){return i!==ign&&p.bi===v}))bad(f.k,'Já existe um registo com este bilhete.');
    }
    if(f.t==='data'&&v>hoje())bad(f.k,'A data não pode ser no futuro.');
  });
  if(c.custom)c.custom(w,bad);
  if(!ok&&primeiro){const e=$('er-'+primeiro);if(e)e.scrollIntoView({behavior:'smooth',block:'center'})}
  return ok;
}

/* ---- Aluno ---- */
function abrirCadAluno(){
  garantir();pes={k:'alunos',i:-1};
  tela('cad');
  $('cd-tit').textContent='+ Cadastrar Aluno';
  $('cd-sub').textContent='Escolha o nível do aluno.';
  $('cd-voltar').textContent='← Perfil';
  $('cd-voltar').onclick=function(){abaPend='alunos';verPerfil()};
  const box=$('cd-corpo');box.innerHTML='';
  const g=document.createElement('div');g.className='niveis';box.appendChild(g);
  edBtn(g,'🎓 Ensino Médio','Bilhete, certificado da 9ª classe, curso e turma automática',function(){formAluno('medio')});
  edBtn(g,'🧸 Iniciação','Nascimento, pais e professor responsável',function(){formAluno('iniciacao')});
}
function formAluno(tipo,idx){
  garantir();
  const i=(typeof idx==='number')?idx:-1;
  pes={k:'alunos',i:i};
  const w=i>=0?JSON.parse(JSON.stringify(d.alunos[i])):{};
  tela('cad');
  $('cd-tit').textContent=(i>=0?'✏️ Editar aluno':'+ Aluno')+' · '+(tipo==='medio'?'Ensino Médio':'Iniciação');
  $('cd-sub').textContent='Campos com * são obrigatórios.';
  $('cd-voltar').textContent='← Voltar';
  $('cd-voltar').onclick=function(){if(i>=0)verPessoa('alunos',i);else abrirCadAluno()};
  montarForm(tipo==='medio'?F_MEDIO:F_INIC,w,function(){guardarAluno(tipo)},tipo==='medio'?extraMedio:extraInic,tipo==='medio'?null:customInic);
}
function guardarAluno(tipo){
  const w=cfgAtual.w,i=pes.i;
  if(!validarForm('alunos',i))return;
  const antigo=i>=0?d.alunos[i]:null,seq0=d.seqAluno;
  w.tipo=tipo;
  if(tipo==='medio'){
    const at=(antigo&&antigo.curso===w.curso)?{turma:antigo.turma,ordem:antigo.ordem}:atribuirTurma(w.curso,i);
    w.turma=at.turma;w.ordem=at.ordem;
    if(!w.proc){d.seqAluno=(d.seqAluno||0)+1;w.proc=ANO()+'/'+String(d.seqAluno).padStart(4,'0');w.ano=ANO()}
  }
  if(i<0)w.criado=hoje();
  if(i>=0)d.alunos[i]=w;else{d.alunos.push(w);pes.i=d.alunos.length-1}
  if(!LS.set('pe_inst_'+email,d)){
    if(antigo)d.alunos[i]=antigo;else{d.alunos.pop();pes.i=-1}
    d.seqAluno=seq0;return;
  }
  verPessoa('alunos',pes.i);
}

/* ---- Professor ---- */
function abrirCadProf(idx){
  garantir();
  const i=(typeof idx==='number')?idx:-1;
  pes={k:'professores',i:i};
  const w=i>=0?JSON.parse(JSON.stringify(d.professores[i])):{};
  tela('cad');
  $('cd-tit').textContent=i>=0?'✏️ Editar professor':'+ Cadastrar Professor';
  $('cd-sub').textContent='Campos com * são obrigatórios.';
  $('cd-voltar').textContent='← Voltar';
  $('cd-voltar').onclick=function(){if(i>=0)verPessoa('professores',i);else{abaPend='professores';verPerfil()}};
  montarForm(F_PROF,w,guardarProf,null,null);
}
function guardarProf(){
  const w=cfgAtual.w,i=pes.i;
  if(!validarForm('professores',i))return;
  const antigo=i>=0?d.professores[i]:null;
  if(i<0)w.criado=hoje();
  if(i>=0)d.professores[i]=w;else{d.professores.push(w);pes.i=d.professores.length-1}
  if(!LS.set('pe_inst_'+email,d)){
    if(antigo)d.professores[i]=antigo;else{d.professores.pop();pes.i=-1}
    return;
  }
  verPessoa('professores',pes.i);
}

/* ---- Perfil do aluno / professor ---- */
function verPessoa(k,i){
  garantir();pes={k:k,i:i};
  const p=d[k][i];if(!p){verPerfil();return}
  const aluno=k==='alunos',med=aluno&&p.tipo==='medio';
  $('v-foto').style.backgroundImage=p.foto?'url('+p.foto+')':'';
  $('v-nome').textContent=p.nome;
  $('v-sub').textContent=aluno?(med?'🎓 Aluno · Ensino Médio':'🧸 Aluno · Iniciação'):'👨‍🏫 Professor(a)';
  let L=[];
  if(med)L=[['Nº de processo',p.proc],['Curso',p.curso],['Turma',CLASSE+' · Turma '+p.turma],['Nº na turma',p.ordem],['Bilhete nº',p.bi],['Encarregado',p.enc],['Telefone',p.tel]];
  else if(aluno)L=[['Data de nascimento',fdata(p.nasc)+' ('+idade(p.nasc)+' anos)'],['Local de nascimento',p.natural],['Género',p.genero],['Morada',p.morada],['Pai',p.pai],['Mãe',p.mae],['Professor(a)',p.prof],['Informação',p.obs]];
  else L=[['Grau académico',p.grau],['Formação',p.area],['Onde estudou',p.estudou],['Bilhete nº',p.bi],['Experiência',p.exp]];
  L.push(['Registado em',fdata(p.criado)]);
  $('v-info').innerHTML='<h3 class="ct">Informações</h3>'+L.filter(function(r){return r[1]!==undefined&&r[1]!==null&&r[1]!==''}).map(function(r){
    return '<div class="info"><b>'+r[0]+'</b><span>'+esc(r[1])+'</span></div>';
  }).join('');
  const docs=med?[['biCopia','Cópia do bilhete'],['cert','Certificado da 9ª classe']]:(aluno?[]:[['biCopia','Cópia do bilhete'],['cert','Certificado']]);
  const dc=$('v-docs');
  if(docs.length){
    dc.classList.remove('oculto');
    dc.innerHTML='<h3 class="ct">Documentos (toque para ampliar)</h3>'+docs.map(function(x){
      return (p[x[0]]&&p[x[0]].indexOf('data:image/')===0)?'<div class="it"><b>'+x[1]+'</b><img data-c="'+x[0]+'" src="'+p[x[0]]+'"></div>':'';
    }).join('');
    dc.onclick=function(ev){const c=ev.target.getAttribute&&ev.target.getAttribute('data-c');if(c)abrirLb(c)};
  }else dc.classList.add('oculto');
  tela('ver');
}
function abrirLb(c){
  const p=d[pes.k][pes.i];
  if(p&&p[c]){$('lb-img').src=p[c];$('lb').classList.remove('oculto')}
}
function voltarLista(){abaPend=pes.k;verPerfil()}
function editarPessoa(){
  if(pes.k==='alunos')formAluno(d.alunos[pes.i].tipo,pes.i);
  else abrirCadProf(pes.i);
}
function eliminarPessoa(){
  if(!confirm('Eliminar este registo? Esta ação não pode ser desfeita.'))return;
  d[pes.k].splice(pes.i,1);
  LS.set('pe_inst_'+email,d);
  voltarLista();
}

/* ---- Abas Alunos e Professores ---- */
function listaPessoas(k){
  garantir();
  const L=d[k],aluno=k==='alunos';
  const x='<h3 class="ct">'+(aluno?'Alunos':'Professores')+' ('+L.length+')</h3>';
  if(!L.length)return x+'<p class="cp">Ainda não há registos. Toque em '+(aluno?'"+ Cadastrar Aluno"':'"+ Professor"')+' para adicionar.</p>';
  return x+L.map(function(p,i){
    const sub=aluno?(p.tipo==='medio'?[p.curso,'Turma '+p.turma,'Proc. '+p.proc].join(' · '):'Iniciação · '+(p.prof||'')):[p.grau,p.area].filter(Boolean).join(' · ');
    const foto=(p.foto&&p.foto.indexOf('data:image/')===0)?' style="background-image:url('+p.foto+')"':'';
    return '<div class="pes" data-k="'+k+'" data-i="'+i+'"><div class="fi"'+foto+'></div><div><b>'+esc(p.nome)+'</b><span>'+esc(sub)+'</span></div></div>';
  }).join('');
}
function abaHtml(k){
  if(k==='alunos'||k==='professores')return listaPessoas(k);
  return abaHtmlBase(k);
}
$('aba-conteudo').addEventListener('click',function(ev){
  const el=ev.target.closest('.pes');
  if(el)verPessoa(el.dataset.k,parseInt(el.dataset.i,10));
});

`;

const e=h.lastIndexOf('iniciar();');
if(e<0){console.log('❌ Não encontrei iniciar();');process.exit(1)}
h=h.slice(0,e)+jsNovo+h.slice(e);
fs.writeFileSync('pagina.html',h);
console.log('✅ pagina.html atualizada');
