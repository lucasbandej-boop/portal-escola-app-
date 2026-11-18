const fs=require('fs');
const R=String.raw;
let h=fs.readFileSync('pagina.html','utf8');
if(h.includes('id="t-reg"')){console.log('Já aplicado.');process.exit(0)}
if(!h.includes('id="bt-transf"')){console.log('❌ Aplica primeiro os patches anteriores.');process.exit(1)}
fs.writeFileSync('pagina.bak6.html',h);
function rep(a,b){if(!h.includes(a)){console.log('⚠️ não encontrei: '+a.slice(0,45));return}h=h.replace(a,()=>b)}
function addTela(id){h=h.replace(/\['auth',[^\]]*\]/,m=>m.includes("'"+id+"'")?m:m.slice(0,-1)+",'"+id+"']")}

rep("const CAMPOS=['nome','nif','tel','local','diretor','secretaria','professor'];","const CAMPOS=['nome','nif','tel','local','diretor','secretaria','professor','licenca','prov','mun','vagasProf','vagasEst'];");
rep("const NIVEIS={iniciacao:'Iniciação',primario:'Ensino Primário',medio:'Ensino Médio'};","const NIVEIS={iniciacao:'Iniciação',primario:'Ensino Primário',secundario:'Ensino Secundário',medio:'Ensino Médio'};");
rep('function abrirForm(p){','function abrirFormA(p){');
rep('function validar(p){','function validarA(p){');
rep('function verPerfil(){','function verPerfilA(){');
rep('function abrirCadAluno(){','function abrirCadAlunoA(){');
rep('function abrirCadProf(idx){','function abrirCadProfA(idx){');
rep('function abrirTransf(){','function abrirTransfA(){');
addTela('reg');

// Passo 1: licença e localização
rep('<label>Telefone (opcional)</label>',R`<label>Nº da licença do Ministério da Educação *</label>
    <input id="f-licenca" maxlength="30" oninput="sv()" placeholder="Número da licença">
    <div class="erro" id="e-licenca"></div>
    <label>Província *</label>
    <input id="f-prov" list="dl-prov" oninput="sv()" onblur="tc(this)" placeholder="Ex.: Luanda">
    <datalist id="dl-prov"><option value="Bengo"><option value="Benguela"><option value="Bié"><option value="Cabinda"><option value="Cuando"><option value="Cubango"><option value="Cuanza Norte"><option value="Cuanza Sul"><option value="Cunene"><option value="Huambo"><option value="Huíla"><option value="Icolo e Bengo"><option value="Luanda"><option value="Lunda Norte"><option value="Lunda Sul"><option value="Malanje"><option value="Moxico"><option value="Moxico Leste"><option value="Namibe"><option value="Uíge"><option value="Zaire"></datalist>
    <div class="erro" id="e-prov"></div>
    <label>Município *</label>
    <input id="f-mun" oninput="sv()" onblur="tc(this)" placeholder="Ex.: Talatona">
    <div class="erro" id="e-mun"></div>
    <label>Telefone (opcional)</label>`);
rep('<label>Localização (opcional)</label>','<label>Bairro / Rua (opcional)</label>');
rep('placeholder="Município, bairro"','placeholder="Ex.: Bairro Talatona, Rua 12"');

// Passo 2: níveis e vagas
rep(R`<button class="nivel" data-n="primario" onclick="setNivel('primario')">📘 Ensino Primário</button>`,R`<button class="nivel" data-n="primario" onclick="setNivel('primario')">📘 Ensino Primário<small>1ª a 6ª classe</small></button>
      <button class="nivel" data-n="secundario" onclick="setNivel('secundario')">📗 Ensino Secundário<small>1.º Ciclo (7ª a 9ª classe)</small></button>`);
rep(R`<button class="nivel" data-n="medio" onclick="setNivel('medio')">🎓 Ensino Médio</button>`,R`<button class="nivel" data-n="medio" onclick="setNivel('medio')">🎓 Ensino Médio<small>2.º Ciclo (10ª classe em diante)</small></button>`);
rep('<div id="bloco-ini" class="oculto">',R`<label>Vagas para professores *</label>
    <input id="f-vagasProf" inputmode="numeric" maxlength="3" oninput="this.value=this.value.replace(/[^0-9]/g,'');sv()" placeholder="Ex.: 15">
    <div class="erro" id="e-vagasProf"></div>
    <label>Vagas para estudantes *</label>
    <input id="f-vagasEst" inputmode="numeric" maxlength="5" oninput="this.value=this.value.replace(/[^0-9]/g,'');sv()" placeholder="Ex.: 400">
    <div class="erro" id="e-vagasEst"></div>
    <small style="color:#6b7280">Número máximo que a instituição pode ter. Quando as vagas esgotam, o cadastro fecha e aparece a vermelho.</small>
    <div id="bloco-ini" class="oculto">`);

// Perfil: localização e vagas
rep('<div class="pf-lin" id="pf-mail"></div>','<div class="pf-lin" id="pf-mail"></div>\n    <div class="pf-lin" id="pf-loc"></div>');
rep('<div class="ad" id="ad"></div>','<div class="vagas" id="vagas"></div>\n  <div class="ad" id="ad"></div>');
rep("if(d.local)L.push(['Localização',d.local]);","if(d.licenca)L.push(['Licença (MED)',d.licenca]);if(locTxt(d))L.push(['Localização',locTxt(d)]);");

rep('</style>',R`
.vagas{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px 16px}
.vg{border-radius:16px;padding:14px;color:#fff;font-size:14px;font-weight:600}
.vg.ok{background:linear-gradient(135deg,#059669,#34d399)}
.vg.no{background:linear-gradient(135deg,#b91c1c,#f87171)}
.vg .n{font-size:28px;font-weight:800;margin:4px 0}
.vg small{display:block;font-size:13px;font-weight:600;opacity:.95}
.vg .bar{height:8px;background:rgba(255,255,255,.35);border-radius:8px;margin-top:10px;overflow:hidden}
.vg .bar i{display:block;height:100%;background:#fff;border-radius:8px}
#reg-txt{max-height:50vh;overflow-y:auto;font-size:15px;line-height:1.5}
#reg-txt h4{margin:14px 0 4px;color:#1e3a8a;font-size:16px}
#reg-txt h4:first-child{margin-top:0}
#reg-txt ul{padding-left:20px}
.btn:disabled{opacity:.45;cursor:not-allowed}
</style>`);

const htmlReg=R`<!-- REGULAMENTO -->
<div id="t-reg" class="box oculto">
  <h1>📜 Regulamento</h1>
  <p class="sub">Antes de cadastrar a sua instituição, leia e aceite o regulamento e a política do Portal Escola.</p>
  <div class="card" id="reg-txt" onscroll="regScroll()">
    <h4>1. Enquadramento legal</h4>
    <p>Em Angola, uma instituição de ensino privada só pode abrir e funcionar depois de ter a <b>licença do Ministério da Educação</b>, nos termos do Decreto Presidencial n.º 37/23, de 9 de Fevereiro (Regime Jurídico das Instituições Privadas e Público-Privadas de Educação Pré-Escolar e de Ensino Primário e Secundário). Funcionar sem licença é proibido.</p>
    <h4>2. Quem pode cadastrar-se</h4>
    <p>Apenas instituições de ensino legalmente constituídas: escolas e colégios licenciados pelo Ministério da Educação e instituições públicas criadas por diploma oficial. Este aplicativo <b>não é para particulares</b>.</p>
    <h4>3. Requisitos do cadastro</h4>
    <ul>
      <li>Licença válida do Ministério da Educação (indicar o número).</li>
      <li>NIF da instituição.</li>
      <li>Localização real: província, município e endereço.</li>
      <li>Diretor(a) e secretário(a) identificados.</li>
      <li>Nível de ensino autorizado: Iniciação, Primário, Secundário (1.º Ciclo) ou Médio (2.º Ciclo).</li>
      <li>Número máximo de vagas de professores e de estudantes, de acordo com a capacidade real das instalações.</li>
    </ul>
    <h4>4. Compromissos da instituição</h4>
    <ul>
      <li>Usar os planos de estudo e programas oficiais e cumprir o calendário escolar aprovado.</li>
      <li>Ter professores com as habilitações exigidas.</li>
      <li>Manter as turmas dentro dos limites legais de alunos por turma.</li>
      <li>Manter os dados atualizados e comunicar qualquer alteração.</li>
      <li>Aceitar a inspeção e a avaliação do Ministério da Educação.</li>
    </ul>
    <h4>5. Proteção de dados</h4>
    <p>Os dados de alunos, encarregados e professores só podem ser usados para a gestão escolar, em conformidade com a Lei da Proteção de Dados Pessoais (Lei n.º 22/11, de 17 de Junho). O acesso é restrito a utilizadores autorizados e é proibido partilhar ou divulgar essas informações.</p>
    <h4>6. Verificação pela administração</h4>
    <p>Depois de enviar o cadastro, ele fica <b>pendente</b>. A administração do Portal Escola verifica se todos os requisitos foram cumpridos e pode aprovar ou rejeitar (indicando o motivo). Só depois da aprovação a instituição pode usar o aplicativo e receberá um email a confirmar a criação da conta. Dados falsos podem levar à rejeição ou à suspensão da conta.</p>
    <p style="font-size:13px;color:#6b7280">Resumo informativo baseado na legislação angolana em vigor e na política do Portal Escola. Não substitui os diplomas oficiais. Versão 1.</p>
  </div>
  <p class="sub" id="reg-dica" style="font-size:13px;margin-top:10px">⬇️ Deslize até ao fim para poder aceitar.</p>
  <label style="display:flex;gap:10px;align-items:flex-start;font-weight:500">
    <input type="checkbox" id="reg-ck" disabled onchange="regOk()" style="width:22px;height:22px;padding:0;flex:0 0 auto">
    <span>Li o regulamento e concordo com a política do Portal Escola. Declaro que a instituição está legalizada e que os dados que vou fornecer são verdadeiros.</span>
  </label>
  <button class="btn" id="reg-btn" disabled onclick="aceitarReg()">✅ Aceitar e continuar</button>
  <button class="btn sec" onclick="location.href='preview.html'">Não concordo (voltar ao Menu)</button>
</div>

`;
rep('<!-- CADASTRO -->',htmlReg+'<!-- CADASTRO -->');

const jsNovo=R`/* ---------- REGULAMENTO, LOCALIZAÇÃO E VAGAS ---------- */
function locTxt(x){return [x.local,x.mun,x.prov].filter(Boolean).join(', ')}
function vagasInfo(t){
  const max=parseInt(t==='prof'?d.vagasProf:d.vagasEst,10);
  const usado=t==='prof'?(d.professores||[]).length:(d.alunos||[]).filter(function(a){return !a.transf}).length;
  if(!(max>0))return {sem:true,usado:usado};
  return {sem:false,max:max,usado:usado,livre:Math.max(0,max-usado),cheio:usado>=max};
}
function cartaoVaga(ic,tit,v){
  if(v.sem)return '';
  const pc=Math.min(100,Math.round(v.usado*100/v.max));
  const txt=v.cheio?'🚫 Vagas esgotadas':'✅ '+v.livre+(v.livre===1?' vaga disponível':' vagas disponíveis');
  return '<div class="vg '+(v.cheio?'no':'ok')+'"><div>'+ic+' '+tit+'</div><div class="n">'+v.usado+' / '+v.max+'</div><small>'+txt+'</small><div class="bar"><i style="width:'+pc+'%"></i></div></div>';
}
function renderVagas(){
  const box=$('vagas');if(!box)return;
  box.innerHTML=cartaoVaga('👨‍🏫','Professores',vagasInfo('prof'))+cartaoVaga('🎓','Estudantes',vagasInfo('est'));
}
function verPerfil(){
  verPerfilA();
  renderVagas();
  const lt=locTxt(d),el=$('pf-loc');
  if(el)el.textContent=lt?'📍 '+lt:'';
}
function abrirCadAluno(){
  if(vagasInfo('est').cheio){alert('🚫 Vagas de estudantes esgotadas ('+d.vagasEst+'). Aumente as vagas em Editar → Dados da Instituição ou transfira alunos.');return}
  abrirCadAlunoA();
}
function abrirCadProf(idx){
  if(typeof idx!=='number'&&vagasInfo('prof').cheio){alert('🚫 Vagas de professores esgotadas ('+d.vagasProf+'). Aumente as vagas em Editar → Dados da Instituição.');return}
  abrirCadProfA(idx);
}
function abrirTransf(){
  const a=d.alunos[pes.i];
  if(a&&a.transf&&vagasInfo('est').cheio){alert('🚫 Não há vagas de estudantes para reativar este aluno.');return}
  abrirTransfA();
}
function validar(p){
  let ok=validarA(p);
  const c=function(id,cond,m){if(!err(id,cond?'':m))ok=false};
  if(p===1){
    c('licenca',(d.licenca||'').length>=3,'Escreva o número da licença do Ministério da Educação.');
    c('prov',(d.prov||'').length>=3,'Indique a província.');
    c('mun',(d.mun||'').length>=3,'Indique o município.');
  }
  if(p===2){
    const vp=parseInt(d.vagasProf,10),ve=parseInt(d.vagasEst,10);
    const np=(d.professores||[]).length,ne=(d.alunos||[]).filter(function(a){return !a.transf}).length;
    c('vagasProf',vp>=Math.max(1,np)&&vp<=500,np?'Mínimo '+np+' (já tem '+np+' professores). Máximo 500.':'Indique um número entre 1 e 500.');
    c('vagasEst',ve>=Math.max(1,ne)&&ve<=20000,ne?'Mínimo '+ne+' (já tem '+ne+' estudantes). Máximo 20000.':'Indique um número entre 1 e 20000.');
  }
  return ok;
}

/* Regulamento antes do formulário */
function abrirForm(p){
  if(!LS.get('pe_inst_'+email,null)&&!LS.get('pe_reg_'+email,null)){abrirReg();return}
  abrirFormA(p);
}
function abrirReg(){
  tela('reg');
  $('reg-ck').checked=false;$('reg-ck').disabled=true;$('reg-btn').disabled=true;
  $('reg-dica').classList.remove('oculto');$('reg-txt').scrollTop=0;
  setTimeout(regScroll,80);
}
function regScroll(){
  const b=$('reg-txt');
  if(b.scrollTop+b.clientHeight>=b.scrollHeight-24){$('reg-ck').disabled=false;$('reg-dica').classList.add('oculto')}
}
function regOk(){$('reg-btn').disabled=!$('reg-ck').checked}
function aceitarReg(){
  d.regAceite=hoje();
  LS.set('pe_reg_'+email,{aceite:hoje(),versao:1});
  abrirFormA(1);
}

`;

let e=h.lastIndexOf("if(location.hash==='#pesquisa')");
if(e<0)e=h.lastIndexOf('iniciar();');
if(e<0){console.log('❌ Não encontrei o ponto de inserção.');process.exit(1)}
h=h.slice(0,e)+jsNovo+h.slice(e);
fs.writeFileSync('pagina.html',h);
console.log('✅ Formulário atualizado');
