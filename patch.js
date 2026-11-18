const fs=require('fs');
const R=String.raw;
let h=fs.readFileSync('pagina.html','utf8');
fs.writeFileSync('pagina.bak.html',h);

// Cabeçalho: seta azul + título
h=h.replace(/<header>[\s\S]*?<\/header>/,()=>R`<header>
  <button class="seta" onclick="location.href='preview.html'">←</button>
  <div class="logo">Página da Instituição</div>
</header>`);

// Estilos novos
h=h.replace('</style>',()=>R`
.seta{background:none;border:0;font-size:28px;color:#2563eb;cursor:pointer;line-height:1}
header .logo{font-size:22px}
.topo{text-align:center;padding-bottom:14px}
.avatar{margin:-55px auto 0}
.topo h1{font-size:28px;margin-top:8px}
.pf-sub{font-size:18px;color:#374151;margin-top:4px}
.pf-lin{font-size:16px;color:#6b7280;margin-top:4px}
.botoes{display:flex;gap:10px;overflow-x:auto;padding:16px}
.bt{flex:0 0 30%;min-height:64px;border:0;border-radius:14px;background:#e5e7eb;color:#111827;font-size:15px;font-weight:700;cursor:pointer;padding:8px}
.bt.azul{background:#1d4ed8;color:#fff}
.ad{margin:0 16px;background:#eff6ff;border-radius:16px;padding:16px;transition:opacity .4s}
.ad small{color:#ca8a04;font-weight:700;font-size:13px}
.ad h3{color:#1e3a8a;font-size:20px;margin:6px 0 4px}
.ad p{color:#4b5563;font-size:15px;line-height:1.4}
.abas{display:flex;overflow-x:auto;background:#fff;border-bottom:2px solid #e5e7eb;margin-top:16px;padding:0 8px}
.aba{flex:0 0 auto;border:0;background:none;padding:14px;font-size:16px;font-weight:600;color:#374151;border-bottom:3px solid transparent;cursor:pointer;white-space:nowrap}
.aba.on{color:#1d4ed8;border-bottom-color:#1d4ed8}
#aba-conteudo{background:#f8fafc}
.ct{color:#1e3a8a;font-size:20px;margin-bottom:8px}
.cp{font-size:17px;color:#374151;line-height:1.5;margin-bottom:8px}
</style>`);

// NIF: aceita também letras (ex.: 0012345678LA01)
h=h.replace(/<input id="f-nif"[^>]*>/,()=>R`<input id="f-nif" maxlength="14" autocapitalize="characters" oninput="this.value=this.value.toUpperCase().replace(/[^0-9A-Z]/g,'');sv()" placeholder="Ex.: 0012345678LA01">`);
h=h.replace(/c\('nif'.*\n/,()=>R`c('nif',/^[0-9]{9,10}([A-Z]{2}[0-9]{2,3})?$/.test(d.nif),'NIF inválido. Exemplo: 0012345678LA01');
`);

const htmlPerfil=R`<!-- PERFIL ESTILO FACEBOOK -->
<div id="t-perfil" class="oculto">
  <div class="capa" id="capa"></div>
  <div class="topo">
    <div class="avatar" id="avatar"></div>
    <h1 id="pf-nome"></h1>
    <div class="pf-sub">🏫 Escola / Instituição de Ensino</div>
    <div class="pf-lin" id="pf-nif"></div>
    <div class="pf-lin" id="pf-tel"></div>
    <div class="pf-lin" id="pf-mail"></div>
  </div>
  <div class="botoes">
    <button class="bt azul" onclick="soon('Cadastrar Aluno')">+ Cadastrar Aluno</button>
    <button class="bt" onclick="soon('Professor')">+ Professor</button>
    <button class="bt" onclick="abrirForm(1)">✏️ Editar</button>
    <button class="bt" onclick="sair()">🚪 Sair</button>
  </div>
  <div class="ad" id="ad"></div>
  <div class="abas" id="abas"></div>
  <div class="box"><div class="card" id="aba-conteudo"></div></div>
</div>
</div>

`;

const jsPerfil=R`/* ---------- PERFIL ---------- */
const ADS=[
  {t:'💻 Informática & Tablets Educativos',p:'Venda de computadores portáteis e tablets de estudo com suporte técnico.'},
  {t:'👕 Uniformes & Fardamentos',p:'Produção de fardas escolares para colégios e institutos, com a melhor qualidade de Luanda.'}
];
const ABAS=[['geral','🏠 Visão Geral'],['classes','📚 Classes'],['eventos','📅 Eventos'],['destaque','⭐ Alunos em Destaque']];
let adI=0,adT=null,abaAtual='geral';
function soon(n){alert(n+': será criado nas próximas partes.')}
function adMostrar(){const a=ADS[adI];$('ad').innerHTML='<small>📢 PUBLICIDADE</small><h3>'+a.t+'</h3><p>'+a.p+'</p>'}
function abaHtml(k){
  const t={geral:'Visão Geral da Instituição',classes:'Classes',eventos:'Eventos',destaque:'Alunos em Destaque'}[k];
  let x='<h3 class="ct">'+t+'</h3>';
  if(k==='geral'){
    x+='<p class="cp">Bem-vindo ao painel geral da instituição de ensino.</p>';
    const L=[['Nível',NIVEIS[d.nivel]],['Diretor(a)',d.diretor],['Secretário(a)',d.secretaria]];
    if(d.nivel==='iniciacao')L.push(['Professor(a)',d.professor],['Encarregados',(d.enc||[]).filter(function(v){return v.trim()}).join(', ')]);
    if(d.local)L.push(['Localização',d.local]);
    x+=L.map(function(p){return '<div class="info"><b>'+p[0]+'</b><span>'+esc(p[1])+'</span></div>'}).join('');
  }else x+='<p class="cp">Ainda sem conteúdo. Será criado numa próxima parte.</p>';
  return x;
}
function abasUI(){
  const box=$('abas');box.innerHTML='';
  ABAS.forEach(function(a){
    const b=document.createElement('button');
    b.className='aba'+(a[0]===abaAtual?' on':'');b.textContent=a[1];
    b.onclick=function(){abaAtual=a[0];abasUI()};
    box.appendChild(b);
  });
  $('aba-conteudo').innerHTML=abaHtml(abaAtual);
}
function verPerfil(){
  $('capa').style.backgroundImage='url('+d.capa+')';
  $('avatar').style.backgroundImage='url('+d.perfil+')';
  $('pf-nome').textContent=d.nome;
  $('pf-nif').textContent='NIF: '+d.nif;
  const t=d.tel?'+244 '+d.tel.slice(0,3)+' '+d.tel.slice(3,6)+' '+d.tel.slice(6):'+244 9XX XXX XXX';
  $('pf-tel').textContent='📞 Contacto: '+t;
  $('pf-mail').textContent='✉️ Email: '+email;
  adMostrar();
  if(!adT)adT=setInterval(function(){
    adI=(adI+1)%ADS.length;const el=$('ad');el.style.opacity=0;
    setTimeout(function(){adMostrar();el.style.opacity=1},400);
  },5000);
  abaAtual='geral';abasUI();tela('perfil');
}
`;

const a=h.indexOf('<!-- PERFIL ESTILO FACEBOOK -->'),b=h.indexOf('<script>');
const c=h.indexOf('/* ---------- PERFIL ---------- */'),e=h.lastIndexOf('iniciar();');
if(a<0||b<0||c<0||e<0||c>e){console.log('❌ Não encontrei os marcadores em pagina.html');process.exit(1)}
h=h.slice(0,c)+jsPerfil+h.slice(e);
h=h.slice(0,a)+htmlPerfil+h.slice(b);
fs.writeFileSync('pagina.html',h);
console.log('✅ pagina.html atualizada');
