const fs=require('fs');
const R=String.raw;
let h=fs.readFileSync('pagina.html','utf8');
if(h.includes('id="t-pl"')){console.log('Já aplicado.');process.exit(0)}
if(!h.includes('id="t-ver"')){console.log('❌ Aplica primeiro os patches anteriores.');process.exit(1)}
fs.writeFileSync('pagina.bak5.html',h);
function rep(a,b){if(!h.includes(a)){console.log('⚠️ não encontrei: '+a.slice(0,45));return}h=h.replace(a,()=>b)}

// Menu principal -> área de pesquisa
let pv=fs.readFileSync('preview.html','utf8');
fs.writeFileSync('preview.bak5.html',pv);
pv=pv.replace("abrir('Pesquisa de Alunos e Encarregados')","location.href='pagina.html#pesquisa'");
fs.writeFileSync('preview.html',pv);

rep("['auth','form','perfil','edit','cad','ver']","['auth','form','perfil','edit','cad','ver','pl','pb']");
rep('function verPessoa(k,i){','function verPessoaBase2(k,i){');
rep('<div class="card" id="v-docs"></div>','<div class="card" id="v-docs"></div>\n    <button class="btn oculto" id="v-back-pesq" onclick="voltarPesq()">← Nova pesquisa</button>');

const htmlNovo=R`<!-- PESQUISA RESTRITA -->
<div id="t-pl" class="box oculto">
  <h1>🔒 Acesso Restrito</h1>
  <p class="sub">Esta área é reservada a utilizadores autorizados. Entre com a sua conta para pesquisar.</p>
  <div class="card">
    <label>Email</label>
    <input id="pl-email" type="email" autocomplete="off" placeholder="exemplo@email.com">
    <label>Palavra-passe</label>
    <input id="pl-senha" type="password" autocomplete="off" onkeydown="if(event.key==='Enter')loginPesq()">
    <div class="erro" id="pl-erro"></div>
    <button class="btn" onclick="loginPesq()">Entrar</button>
  </div>
  <p class="sub" style="text-align:center;font-size:13px">Só utilizadores com conta cadastrada têm acesso.</p>
</div>

<div id="t-pb" class="box oculto">
  <div class="card" style="display:flex;align-items:center;gap:8px">
    <div style="flex:1"><b id="pb-inst"></b><br><small id="pb-user" style="color:#6b7280"></small></div>
    <button class="voltar" onclick="sairPesq('')">Terminar sessão</button>
  </div>
  <h1>🔍 Pesquisar aluno</h1>
  <p class="sub">Escreva o número de processo do aluno.</p>
  <div class="card">
    <label>Número de processo</label>
    <input id="pb-q" inputmode="numeric" maxlength="9" placeholder="Ex.: 2026/0001" autocomplete="off" onkeydown="if(event.key==='Enter')pesquisar()">
    <div class="erro" id="pb-msg"></div>
    <button class="btn" onclick="pesquisar()">🔍 Pesquisar</button>
  </div>
  <p class="sub" style="font-size:13px">🔐 A sessão termina automaticamente após 5 minutos sem atividade.</p>
</div>

`;
rep('<!-- CADASTRO -->',htmlNovo+'<!-- CADASTRO -->');

const jsNovo=R`/* ---------- PESQUISA RESTRITA ---------- */
let modoPesq=false,tInat=null;
const INATIV=300000;
function resetInat(){clearTimeout(tInat);tInat=setTimeout(function(){sairPesq('Sessão terminada por inatividade.')},INATIV)}
['click','keydown','touchstart'].forEach(function(ev){
  document.addEventListener(ev,function(){if(modoPesq)resetInat()},true);
});

function verPessoa(k,i){
  verPessoaBase2(k,i);
  const ro=modoPesq;
  $('t-ver').querySelector('.botoes').classList.toggle('oculto',ro);
  $('v-back-pesq').classList.toggle('oculto',!ro);
  const gb=$('v-transf').querySelector('button');
  if(gb)gb.classList.toggle('oculto',ro);
}
function iniciarPesq(){
  document.querySelector('header .logo').textContent='Pesquisa de Alunos';
  tela('pl');
}
async function loginPesq(){
  const t=LS.get('pe_pesq_tent',{n:0,bloq:0}),agora=Date.now();
  if(t.bloq>agora){$('pl-erro').textContent='Demasiadas tentativas. Aguarde '+Math.ceil((t.bloq-agora)/1000)+' segundos.';return}
  const e=$('pl-email').value.trim().toLowerCase(),s=$('pl-senha').value;
  const users=LS.get('pe_users',{}),hh=await hash(s);
  const ok=e&&users[e]&&users[e]===hh;
  if(!ok){
    t.n=(t.n||0)+1;
    if(t.n>=5){t.bloq=agora+60000;t.n=0}
    LS.set('pe_pesq_tent',t);
    $('pl-erro').textContent='Email ou palavra-passe incorretos, ou sem conta autorizada.';
    $('pl-senha').value='';
    return;
  }
  if(!LS.get('pe_inst_'+e,null)){$('pl-erro').textContent='Esta conta ainda não tem uma instituição cadastrada.';return}
  LS.set('pe_pesq_tent',{n:0,bloq:0});
  entrarPesq(e);
}
function entrarPesq(e){
  email=e;d=Object.assign(vazio(),LS.get('pe_inst_'+e,{}));garantir();
  modoPesq=true;
  $('pb-inst').textContent=d.nome;$('pb-user').textContent=e;
  $('pl-email').value='';$('pl-senha').value='';$('pl-erro').textContent='';
  $('pb-q').value='';$('pb-msg').textContent='';
  tela('pb');resetInat();
}
function pesquisar(){
  resetInat();
  let q=$('pb-q').value.trim().toUpperCase().replace(/ /g,'').replace(/-/g,'/');
  if(/^[0-9]{8}$/.test(q))q=q.slice(0,4)+'/'+q.slice(4);
  const msg=$('pb-msg');
  if(!/^[0-9]{4}[/][0-9]{4}$/.test(q)){msg.textContent='Escreva o número de processo completo. Exemplo: 2026/0001';return}
  const i=d.alunos.findIndex(function(a){return a.proc===q});
  if(i<0){msg.textContent='Nenhum aluno encontrado com este número de processo.';return}
  msg.textContent='';$('pb-q').value='';
  verPessoa('alunos',i);
}
function voltarPesq(){
  tela('pb');resetInat();$('pb-q').focus();
}
function sairPesq(msg){
  clearTimeout(tInat);modoPesq=false;email='';d=vazio();
  ['v-info','v-docs','v-transf'].forEach(function(id){$(id).innerHTML=''});
  $('v-foto').style.backgroundImage='';$('v-nome').textContent='';
  $('lb').classList.add('oculto');$('lb-img').removeAttribute('src');
  tela('pl');$('pl-erro').textContent=msg||'';
}

`;

const e=h.lastIndexOf('iniciar();');
if(e<0){console.log('❌ Não encontrei iniciar();');process.exit(1)}
h=h.slice(0,e)+jsNovo+"if(location.hash==='#pesquisa')iniciarPesq();else iniciar();"+h.slice(e+'iniciar();'.length);
fs.writeFileSync('pagina.html',h);
console.log('✅ Pesquisa restrita instalada');
