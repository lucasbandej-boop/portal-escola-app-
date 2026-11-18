const fs=require('fs');
const R=String.raw;
let h=fs.readFileSync('pagina.html','utf8');
if(h.includes('id="t-pend"')){console.log('Já aplicado.');process.exit(0)}
if(!h.includes('id="t-pl"')){console.log('❌ Aplica primeiro os patches anteriores (até à Pesquisa restrita).');process.exit(1)}
fs.writeFileSync('pagina.bak7.html',h);
function rep(a,b){if(!h.includes(a)){console.log('⚠️ não encontrei: '+a.slice(0,45));return}h=h.replace(a,()=>b)}
function addTela(id){h=h.replace(/\['auth',[^\]]*\]/,m=>m.includes("'"+id+"'")?m:m.slice(0,-1)+",'"+id+"']")}

// Menu principal: botão de estudantes
let pv=fs.readFileSync('preview.html','utf8');
if(!pv.includes('#estudante')){
  fs.writeFileSync('preview.bak7.html',pv);
  pv=pv.replace(/(<button class="card" onclick="abrir\('Cadastramento de Professores'\)">[\s\S]*?<\/button>)/,function(m){return m+R`
      <button class="card" onclick="location.href='pagina.html#estudante'">
        <span class="icone">🎓</span>
        <span class="card-texto">Cadastramento de Estudantes</span>
      </button>`});
  fs.writeFileSync('preview.html',pv);
}

rep('Entre ou crie uma conta para gerir o perfil da sua instituição.','Área exclusiva para instituições de ensino. Depois do cadastro, a administração verifica e aprova a sua instituição.');
rep(R`setModo('criar')">Criar conta</button>`,R`setModo('criar')">Cadastrar instituição</button>`);
rep('function verPerfil(){','function verPerfilB(){');
rep('function prox(){','function proxB(){');
rep('function abrirEditar(){','function abrirEditarB(){');
rep("const inst0=LS.get('pe_inst_'+e,null);","const inst0=LS.get('pe_inst_'+e,null);");
rep("if(!LS.get('pe_inst_'+e,null)){$('pl-erro').textContent='Esta conta ainda não tem uma instituição cadastrada.';return}",
    "const inst0=LS.get('pe_inst_'+e,null);if(!inst0){$('pl-erro').textContent='Esta conta ainda não tem uma instituição cadastrada.';return}if((inst0.estado||'aprovada')!=='aprovada'){$('pl-erro').textContent='A conta desta instituição ainda não foi aprovada pela administração.';return}");
['pend','adm','te','tok'].forEach(addTela);

rep('</style>',R`
.fi-adm{width:48px;height:48px;border-radius:50%;background:#e5e7eb center/cover;flex:0 0 auto}
</style>`);

const htmlNovo=R`<!-- CADASTRO PENDENTE -->
<div id="t-pend" class="box oculto" style="text-align:center">
  <div id="pend-ic" style="font-size:64px;margin-top:16px">⏳</div>
  <h1 id="pend-tit"></h1>
  <p class="sub" id="pend-txt"></p>
  <div class="card" id="pend-info" style="text-align:left"></div>
  <button class="btn oculto" id="pend-corrigir" onclick="abrirForm(1)">✏️ Corrigir e reenviar</button>
  <button class="btn" onclick="verificarEstado()">🔄 Verificar estado</button>
  <button class="btn sec" onclick="sair()">Sair</button>
</div>

<!-- ADMINISTRAÇÃO (SIMULAÇÃO) -->
<div id="t-adm" class="box oculto">
  <div class="card" style="background:#fffbeb;border-color:#fcd34d;font-size:14px">🛠️ <b>Simulação da base de dados.</b> No app real, a administração faz isto no Supabase. Esta página serve só para testar.</div>
  <h1>Instituições</h1>
  <div id="adm-lista"></div>
  <h1 style="font-size:20px;margin-top:8px">📧 Emails enviados (simulação)</h1>
  <div id="adm-emails"></div>
</div>

<!-- CADASTRAMENTO DE ESTUDANTES -->
<div id="t-te" class="box oculto">
  <h1>🎓 Cadastramento de Estudantes</h1>
  <p class="sub">Crie a sua conta para ter acesso ao aplicativo (consultas e funções futuras). Só alunos já registados numa instituição aprovada podem criar conta.</p>
  <div class="card">
    <label>Instituição *</label>
    <select id="te-inst"></select>
    <label>Número de processo *</label>
    <input id="te-proc" inputmode="numeric" maxlength="9" placeholder="Ex.: 2026/0001" autocomplete="off">
    <label>Número do bilhete *</label>
    <input id="te-bi" maxlength="14" autocapitalize="characters" autocomplete="off" oninput="this.value=this.value.toUpperCase().replace(/[^0-9A-Z]/g,'')" placeholder="Ex.: 001234567LA041">
    <label>Email *</label>
    <input id="te-email" type="email" autocomplete="off">
    <label>Palavra-passe *</label>
    <input id="te-senha" type="password" autocomplete="new-password">
    <label>Confirmar palavra-passe *</label>
    <input id="te-senha2" type="password" autocomplete="new-password">
    <div class="erro" id="te-erro"></div>
    <button class="btn" onclick="criarContaEst()">Criar conta</button>
  </div>
</div>
<div id="t-tok" class="box oculto" style="text-align:center">
  <div style="font-size:64px;margin-top:16px">✅</div>
  <h1>Conta criada!</h1>
  <p class="sub" id="tok-txt"></p>
  <button class="btn" onclick="location.href='preview.html'">← Voltar ao Menu</button>
</div>

`;
rep('<!-- CADASTRO -->',htmlNovo+'<!-- CADASTRO -->');

const jsB=R`/* ---------- APROVAÇÃO, ADMINISTRAÇÃO E ESTUDANTES ---------- */
function outbox(){return LS.get('pe_outbox',[])}
function enviarEmail(para,assunto,texto){
  const o=outbox();
  o.unshift({para:para,assunto:assunto,texto:texto,data:new Date().toLocaleString('pt-PT')});
  LS.set('pe_outbox',o.slice(0,50));
}

/* Instituição: estado do cadastro */
function verPerfil(){
  const est=d.estado||'aprovada';
  if(est==='aprovada'){verPerfilB();return}
  const rej=est==='rejeitada';
  $('pend-ic').textContent=rej?'❌':'⏳';
  $('pend-tit').textContent=rej?'Cadastro não aprovado':'Cadastro pendente';
  $('pend-txt').textContent=rej?'A administração verificou o cadastro e precisa que corrija alguns dados. Corrija e reenvie.':'A sua instituição foi cadastrada e está a aguardar a confirmação da administração, que vai verificar se todos os requisitos foram cumpridos. Quando for aprovada, receberá um email a informar que a conta foi criada.';
  const L=[['Instituição',d.nome],['NIF',d.nif],['Nível',NIVEIS[d.nivel]],['Email da conta',email],['Enviado em',fdata(d.enviadoEm)],['Estado',rej?'Não aprovado':'Pendente']];
  if(rej&&d.motivoRej)L.push(['Motivo',d.motivoRej]);
  $('pend-info').innerHTML=L.filter(function(r){return r[1]}).map(function(r){return '<div class="info"><b>'+r[0]+'</b><span>'+esc(r[1])+'</span></div>'}).join('');
  $('pend-corrigir').classList.toggle('oculto',!rej);
  tela('pend');
}
function verificarEstado(){d=Object.assign(vazio(),LS.get('pe_inst_'+email,{}));verPerfil()}
function abrirEditar(){
  if((d.estado||'aprovada')!=='aprovada'){verPerfil();return}
  abrirEditarB();
}
function prox(){
  let novo=false;
  if(passo===3&&validar(3)&&(d.estado==='rejeitada'||(!editando&&!d.estado))){
    d.estado='pendente';d.enviadoEm=hoje();d.motivoRej='';novo=true;
  }
  proxB();
  if(novo&&LS.get('pe_inst_'+email,{}).estado==='pendente')
    enviarEmail(email,'Cadastro recebido — Portal Escola','Recebemos o cadastro da instituição "'+d.nome+'". A administração vai verificar os dados e receberá um novo email quando a conta for aprovada.');
}

/* Administração (simulação da base de dados) */
function todasInst(){
  const r=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k.indexOf('pe_inst_')===0){const v=LS.get(k,null);if(v&&v.nome)r.push({email:k.slice(8),inst:v})}
  }
  return r;
}
function requisitos(v){
  const r=[
    ['Nome da instituição',!!v.nome&&v.nome.length>=3],
    ['NIF válido',/^[0-9]{9,10}([A-Z]{2}[0-9]{2,3})?$/.test(v.nif||'')],
    ['Nº da licença (MED)',!!v.licenca],
    ['Localização (província e município)',!!(v.prov&&v.mun)],
    ['Vagas de professores e estudantes',parseInt(v.vagasProf,10)>0&&parseInt(v.vagasEst,10)>0],
    ['Diretor(a)',!!v.diretor],['Secretário(a)',!!v.secretaria],
    ['Foto de capa',!!v.capa],['Foto de perfil',!!v.perfil],
    ['Regulamento aceite',!!v.regAceite]
  ];
  if(v.nivel==='iniciacao')r.push(['Professor responsável',!!v.professor],['Encarregados',(v.enc||[]).some(function(x){return x.trim()})]);
  return r;
}
function iniciarAdmin(){
  document.querySelector('header .logo').textContent='Administração';
  admRender();
}
function admRender(){
  tela('adm');
  const cor={pendente:['#fef3c7','#92400e','⏳ Pendente'],aprovada:['#d1fae5','#065f46','✅ Aprovada'],rejeitada:['#fee2e2','#991b1b','❌ Não aprovada']};
  const ord={pendente:0,rejeitada:1,aprovada:2};
  const L=todasInst().sort(function(a,b){return ord[a.inst.estado||'aprovada']-ord[b.inst.estado||'aprovada']});
  $('adm-lista').innerHTML=L.length?L.map(function(x){
    const v=x.inst,est=v.estado||'aprovada',c=cor[est];
    const foto=(v.perfil&&v.perfil.indexOf('data:image/')===0)?' style="background-image:url('+v.perfil+')"':'';
    const info=[['NIF',v.nif],['Licença (MED)',v.licenca],['Nível',NIVEIS[v.nivel]],['Localização',locTxt(v)],['Diretor(a)',v.diretor],['Secretário(a)',v.secretaria],['Telefone',v.tel],['Vagas',(v.vagasProf||'?')+' professores · '+(v.vagasEst||'?')+' estudantes'],['Enviado em',fdata(v.enviadoEm)],['Aprovado em',fdata(v.aprovadoEm)],['Motivo da rejeição',v.motivoRej]].filter(function(r){return r[1]}).map(function(r){return '<div class="info"><b>'+r[0]+'</b><span>'+esc(r[1])+'</span></div>'}).join('');
    const req=requisitos(v).map(function(r){return '<div style="font-size:14px;color:'+(r[1]?'#065f46':'#991b1b')+'">'+(r[1]?'✔ ':'✖ ')+r[0]+'</div>'}).join('');
    let bt='';
    if(est!=='aprovada')bt+='<button class="btn verde" data-a="aprovar" data-e="'+esc(x.email)+'" style="margin-top:12px;padding:12px">✅ Aprovar</button>';
    if(est==='pendente')bt+='<button class="btn sec" data-a="rejeitar" data-e="'+esc(x.email)+'" style="padding:12px">❌ Rejeitar</button>';
    if(est==='aprovada')bt+='<button class="btn sec" data-a="pendente" data-e="'+esc(x.email)+'" style="padding:12px">↩️ Repor pendente (teste)</button>';
    return '<div class="card"><div style="display:flex;gap:12px;align-items:center"><div class="fi-adm"'+foto+'></div><div style="flex:1;min-width:0"><b>'+esc(v.nome)+'</b><br><small style="color:#6b7280">'+esc(x.email)+'</small></div><span style="background:'+c[0]+';color:'+c[1]+';font-size:12px;font-weight:700;padding:4px 8px;border-radius:12px;white-space:nowrap">'+c[2]+'</span></div>'+info+'<div style="margin-top:8px"><b style="font-size:14px">Requisitos</b>'+req+'</div>'+bt+'</div>';
  }).join(''):'<p class="sub">Ainda não há instituições cadastradas.</p>';
  const em=outbox();
  $('adm-emails').innerHTML=em.length?em.map(function(m){
    return '<div class="card" style="font-size:14px"><b>'+esc(m.assunto)+'</b><br><span style="color:#6b7280">Para: '+esc(m.para)+' · '+esc(m.data)+'</span><p style="margin-top:6px">'+esc(m.texto)+'</p></div>';
  }).join(''):'<p class="sub">Ainda não foram enviados emails.</p>';
}
function admAcao(a,em){
  const v=LS.get('pe_inst_'+em,null);if(!v)return;
  if(a==='aprovar'){
    v.estado='aprovada';v.aprovadoEm=hoje();v.motivoRej='';
    LS.set('pe_inst_'+em,v);
    enviarEmail(em,'Conta criada — Portal Escola','Olá! O cadastro da instituição "'+v.nome+'" foi verificado e aprovado pela administração. A sua conta foi criada e já pode entrar com o seu email e palavra-passe.');
    alert('✅ Aprovada. Email enviado para '+em+' (simulação).');
  }else if(a==='rejeitar'){
    const m=prompt('Motivo da rejeição (será enviado à instituição):');
    if(m===null)return;
    if(!m.trim()){alert('Escreva o motivo.');return}
    v.estado='rejeitada';v.motivoRej=m.trim();
    LS.set('pe_inst_'+em,v);
    enviarEmail(em,'Cadastro não aprovado — Portal Escola','O cadastro da instituição "'+v.nome+'" não foi aprovado. Motivo: '+m.trim()+'. Entre na sua conta, corrija os dados e reenvie.');
    alert('❌ Rejeitada. Email enviado para '+em+' (simulação).');
  }else if(a==='pendente'){
    v.estado='pendente';LS.set('pe_inst_'+em,v);
  }
  admRender();
}
$('adm-lista').addEventListener('click',function(ev){
  const b=ev.target.closest('button[data-a]');
  if(b)admAcao(b.dataset.a,b.dataset.e);
});

/* Cadastramento de estudantes (só para ter acesso ao aplicativo) */
function iniciarEst(){
  document.querySelector('header .logo').textContent='Cadastramento de Estudantes';
  const sel=$('te-inst');
  sel.innerHTML='<option value="">Escolher instituição…</option>';
  todasInst().filter(function(x){return (x.inst.estado||'aprovada')==='aprovada'}).forEach(function(x){
    const o=document.createElement('option');o.value=x.email;o.textContent=x.inst.nome;sel.appendChild(o);
  });
  tela('te');
}
async function criarContaEst(){
  const err2=function(m){$('te-erro').textContent=m};
  const t=LS.get('pe_est_tent',{n:0,bloq:0}),agora=Date.now();
  if(t.bloq>agora){err2('Demasiadas tentativas. Aguarde '+Math.ceil((t.bloq-agora)/1000)+' segundos.');return}
  const ie=$('te-inst').value;
  let q=$('te-proc').value.trim().toUpperCase().replace(/ /g,'').replace(/-/g,'/');
  if(/^[0-9]{8}$/.test(q))q=q.slice(0,4)+'/'+q.slice(4);
  const bi=$('te-bi').value.trim().toUpperCase(),em=$('te-email').value.trim().toLowerCase(),s=$('te-senha').value;
  if(!ie||!q||!bi||!em||!s){err2('Preencha todos os campos.');return}
  if(!/^\S+@\S+\.\S+$/.test(em)){err2('Email inválido.');return}
  if(s.length<6){err2('A palavra-passe deve ter no mínimo 6 caracteres.');return}
  if(s!==$('te-senha2').value){err2('As palavras-passe não coincidem.');return}
  const inst=LS.get('pe_inst_'+ie,null);
  const idx=(inst&&(inst.estado||'aprovada')==='aprovada')?(inst.alunos||[]).findIndex(function(a){return a.tipo==='medio'&&a.proc===q&&a.bi===bi&&!a.transf}):-1;
  if(idx<0){
    t.n=(t.n||0)+1;if(t.n>=5){t.bloq=agora+60000;t.n=0}
    LS.set('pe_est_tent',t);
    err2('Não encontrámos um aluno com estes dados. Confirme o número de processo e o bilhete com a secretaria da sua escola.');
    return;
  }
  const us=LS.get('pe_est_users',{});
  if(inst.alunos[idx].contaEst||us[em]){err2('Já existe uma conta para este aluno ou para este email.');return}
  us[em]={h:await hash(s),inst:ie,proc:q,criado:hoje()};
  LS.set('pe_est_users',us);
  inst.alunos[idx].contaEst=true;
  LS.set('pe_inst_'+ie,inst);
  LS.set('pe_est_tent',{n:0,bloq:0});
  $('tok-txt').textContent='A conta de '+inst.alunos[idx].nome+' foi criada. Já tem acesso ao aplicativo para consultas e funções futuras.';
  ['te-proc','te-bi','te-email','te-senha','te-senha2'].forEach(function(id){$(id).value=''});
  tela('tok');
}

`;
rep("if(location.hash==='#pesquisa')iniciarPesq();else iniciar();",jsB+"if(location.hash==='#pesquisa')iniciarPesq();else if(location.hash==='#admin')iniciarAdmin();else if(location.hash==='#estudante')iniciarEst();else iniciar();");
fs.writeFileSync('pagina.html',h);
console.log('✅ Aprovação, administração e estudantes instalados');
