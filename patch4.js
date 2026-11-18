const fs=require('fs');
const R=String.raw;
let h=fs.readFileSync('pagina.html','utf8');
if(h.includes('id="bt-transf"')){console.log('Já aplicado.');process.exit(0)}
if(!h.includes('id="t-ver"')){console.log('❌ Aplica primeiro o patch anterior (Alunos e Professores).');process.exit(1)}
fs.writeFileSync('pagina.bak4.html',h);
function rep(a,b){if(!h.includes(a)){console.log('⚠️ não encontrei: '+a.slice(0,45));return}h=h.replace(a,()=>b)}

rep('<button class="bt" onclick="voltarLista()">← Lista</button>',
    '<button class="bt" id="bt-transf" onclick="abrirTransf()">🔄 Transferir</button>\n    <button class="bt" onclick="voltarLista()">← Lista</button>');
rep('<div class="card" id="v-info"></div>',
    '<div class="card oculto" id="v-transf" style="background:#fffbeb;border-color:#fcd34d"></div>\n    <div class="card" id="v-info"></div>');
rep('a.turma===L}','a.turma===L&&!a.transf}');
rep('function verPessoa(k,i){','function verPessoaBase(k,i){');
rep(R`data-i="'+i+'"><div class="fi"'+foto+'>`,R`data-i="'+i+'"'+(p.transf?' style="opacity:.55"':'')+'><div class="fi"'+foto+'>`);
rep(R`esc(sub)+'</span>`,R`esc(sub)+(p.transf?' · 🔄 Transferido':'')+'</span>`);
rep(R`' ('+L.length+')</h3>'`,R`' ('+L.filter(function(p){return !p.transf}).length+')</h3>'`);

const jsNovo=R`/* ---------- TRANSFERÊNCIA ---------- */
const MOTIVOS=['Mudança de residência','Mudança de curso','Motivos familiares','Motivos financeiros','Procura de outra escola','Outro'];
const F_TRANSF=[
  {k:'destino',l:'Instituição de destino',t:'txt',req:1,ph:'Nome da escola / colégio'},
  {k:'local',l:'Localização (opcional)',t:'txt',ph:'Município / Província'},
  {k:'data',l:'Data da transferência',t:'data',req:1},
  {k:'motivo',l:'Motivo',t:'sel',ops:MOTIVOS,req:1},
  {k:'obs',l:'Observações (opcional)',t:'area'}
];

function verPessoa(k,i){
  verPessoaBase(k,i);
  const p=d[k]&&d[k][i];if(!p)return;
  const al=k==='alunos',t=al?p.transf:null;
  const bt=$('bt-transf');
  bt.classList.toggle('oculto',!al);
  bt.textContent=t?'↩️ Reativar':'🔄 Transferir';
  const c=$('v-transf');
  if(t){
    const L=[['Instituição de destino',t.destino],['Localização',t.local],['Data',fdata(t.data)],['Motivo',t.motivo],['Observações',t.obs]];
    c.innerHTML='<h3 class="ct" style="color:#b45309">🔄 Aluno transferido</h3>'+L.filter(function(r){return r[1]}).map(function(r){
      return '<div class="info"><b>'+r[0]+'</b><span>'+esc(r[1])+'</span></div>';
    }).join('')+'<button class="btn sec" onclick="imprimirGuia()">🖨️ Imprimir guia de transferência</button>';
    c.classList.remove('oculto');
    $('v-sub').textContent=$('v-sub').textContent+' · Transferido';
  }else c.classList.add('oculto');
}

function abrirTransf(){
  const i=pes.i,a=d.alunos[i];if(!a)return;
  if(a.transf){
    if(!confirm('Reativar '+a.nome+' nesta instituição?'))return;
    const antigo=a.transf,t0=a.turma,o0=a.ordem;
    delete a.transf;
    if(a.tipo==='medio'){const at=atribuirTurma(a.curso,i);a.turma=at.turma;a.ordem=at.ordem}
    if(!LS.set('pe_inst_'+email,d)){a.transf=antigo;a.turma=t0;a.ordem=o0;return}
    verPessoa('alunos',i);return;
  }
  pes={k:'alunos',i:i};
  tela('cad');
  $('cd-tit').textContent='🔄 Transferir aluno';
  $('cd-sub').textContent=a.nome+' será marcado como transferido e deixa de ocupar vaga na turma.';
  $('cd-voltar').textContent='← Voltar';
  $('cd-voltar').onclick=function(){verPessoa('alunos',i)};
  montarForm(F_TRANSF,{data:hoje()},guardarTransf,null,null);
  $('cd-corpo').lastChild.textContent='🔄 Confirmar transferência';
}
function guardarTransf(){
  const w=cfgAtual.w,i=pes.i,a=d.alunos[i];
  if(!validarForm('alunos',i))return;
  if(!confirm('Confirmar a transferência de '+a.nome+' para '+w.destino+'?'))return;
  const antigo=a.transf;
  a.transf={destino:w.destino,local:w.local||'',data:w.data,motivo:w.motivo,obs:w.obs||''};
  if(!LS.set('pe_inst_'+email,d)){if(antigo)a.transf=antigo;else delete a.transf;return}
  verPessoa('alunos',i);
}
function imprimirGuia(){
  const a=d.alunos[pes.i];if(!a||!a.transf)return;
  const t=a.transf;
  const L=[['Nome',a.nome],['Nível',a.tipo==='medio'?'Ensino Médio':'Iniciação']];
  if(a.tipo==='medio')L.push(['Nº de processo',a.proc],['Curso',a.curso],['Turma',CLASSE+' · Turma '+a.turma],['Bilhete nº',a.bi]);
  else L.push(['Data de nascimento',fdata(a.nasc)]);
  L.push(['Instituição de destino',t.destino],['Localização',t.local],['Data da transferência',fdata(t.data)],['Motivo',t.motivo],['Observações',t.obs]);
  const tr=L.filter(function(r){return r[1]}).map(function(r){return '<tr><td><b>'+r[0]+'</b></td><td>'+esc(r[1])+'</td></tr>'}).join('');
  const html='<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8"><title>Guia de Transferência</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{text-align:center;font-size:22px}h2{text-align:center;font-size:16px;font-weight:normal;margin-top:0}table{width:100%;border-collapse:collapse;margin-top:24px}td{border:1px solid #999;padding:10px;font-size:15px}.ass{display:flex;justify-content:space-around;margin-top:80px;text-align:center;font-size:14px}.ass div{border-top:1px solid #000;padding-top:6px;min-width:40%}</style></head><body><h1>'+esc(d.nome)+'</h1><h2>GUIA DE TRANSFERÊNCIA</h2><table>'+tr+'</table><div class="ass"><div>O(A) Diretor(a)<br>'+esc(d.diretor)+'</div><div>O(A) Secretário(a)<br>'+esc(d.secretaria)+'</div></div></body></html>';
  const w=window.open('','_blank');
  if(!w){alert('O navegador bloqueou a janela. Permita pop-ups e tente de novo.');return}
  w.document.write(html);w.document.close();w.focus();
  setTimeout(function(){w.print()},300);
}

`;

const e=h.lastIndexOf('iniciar();');
if(e<0){console.log('❌ Não encontrei iniciar();');process.exit(1)}
h=h.slice(0,e)+jsNovo+h.slice(e);
fs.writeFileSync('pagina.html',h);
console.log('✅ pagina.html atualizada');
