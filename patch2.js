const fs=require('fs');
const R=String.raw;
let h=fs.readFileSync('pagina.html','utf8');
if(h.includes('id="t-edit"')){console.log('Já aplicado.');process.exit(0)}
fs.writeFileSync('pagina.bak2.html',h);
function rep(a,b){if(!h.includes(a)){console.log('⚠️ não encontrei: '+a.slice(0,45));return}h=h.replace(a,()=>b)}

rep("['auth','form','perfil']","['auth','form','perfil','edit']");
rep('onclick="abrirForm(1)"','onclick="abrirEditar()"');
rep('onclick="mostrar(passo-1)"','onclick="voltarForm()"');
rep("$('b-volt').classList.toggle('oculto',p===1);","$('b-volt').classList.toggle('oculto',p===1&&!editando);");
rep("$('b-prox').textContent=p===3?'✅ Criar perfil':'Continuar';","$('b-prox').textContent=p===3?(editando?'💾 Guardar alterações':'✅ Criar perfil'):'Continuar';");
rep("function abrirForm(p){","function abrirForm(p){editando=!!LS.get('pe_inst_'+email,null);");

rep('</style>',R`
textarea,select{width:100%;padding:13px;border:1px solid #d1d5db;border-radius:10px;font-size:16px;font-family:inherit;background:#fff}
textarea:focus,select:focus{outline:2px solid #2563eb;border-color:#2563eb}
.cp{white-space:pre-wrap}
.it{padding:12px 0;border-bottom:1px solid #e5e7eb}
.it:last-child{border:0}
.it b{display:block;font-size:17px;color:#111827}
.it span{display:block;font-size:14px;color:#6b7280;margin-top:2px}
.it p{font-size:15px;color:#374151;margin-top:6px;white-space:pre-wrap}
.it img{width:100%;border-radius:10px;margin-top:8px}
</style>`);

const htmlEdit=R`<!-- EDITAR PÁGINA -->
<div id="t-edit" class="box oculto">
  <button class="voltar" id="ed-voltar" style="margin-bottom:8px">← Perfil</button>
  <h1 id="ed-tit"></h1>
  <p class="sub" id="ed-sub"></p>
  <div id="ed-corpo"></div>
</div>

`;
rep('<!-- PERFIL ESTILO FACEBOOK -->',htmlEdit+'<!-- PERFIL ESTILO FACEBOOK -->');

const jsPerfil=R`/* ---------- PERFIL ---------- */
const ADS=[
  {t:'💻 Informática & Tablets Educativos',p:'Venda de computadores portáteis e tablets de estudo com suporte técnico.'},
  {t:'👕 Uniformes & Fardamentos',p:'Produção de fardas escolares para colégios e institutos, com a melhor qualidade de Luanda.'}
];
const ABAS=[['geral','🏠 Visão Geral'],['classes','📚 Classes'],['eventos','📅 Eventos'],['destaque','⭐ Alunos em Destaque'],['pautas','📑 Pautas']];
const TRIM=['1º Trimestre','2º Trimestre','3º Trimestre','Final'];
const SEC={
  classes:{ic:'📚',t:'Classes',novo:'Nova classe',c:[['nome','Nome da classe','text','Ex.: 7ª Classe'],['turma','Turma / Período (opcional)','text','Ex.: Turma A · Manhã'],['prof','Professor(a) (opcional)','text','']]},
  eventos:{ic:'📅',t:'Eventos',novo:'Novo evento',c:[['titulo','Título','text','Ex.: Reunião de pais'],['data','Data','date',''],['desc','Descrição (opcional)','area','']]},
  destaque:{ic:'⭐',t:'Alunos em Destaque',novo:'Novo destaque',c:[['nome','Nome do aluno','text',''],['classe','Classe','text','Ex.: 9ª Classe'],['motivo','Motivo (opcional)','text','Ex.: Melhor média do trimestre']]},
  pautas:{ic:'📑',t:'Pautas',novo:'Nova pauta',c:[['titulo','Título','text','Ex.: Pauta do 1º Trimestre'],['classe','Classe / Turma','text',''],['trim','Trimestre','sel',''],['foto','Foto da pauta (opcional)','foto','']]}
};
const GERAL_PADRAO='Bem-vindo ao painel geral da instituição de ensino.';
let adI=0,adT=null,abaAtual='geral',editando=false,gt=null;

function garantir(){['classes','eventos','destaque','pautas'].forEach(function(k){if(!Array.isArray(d[k]))d[k]=[]})}
function gravar(){clearTimeout(gt);gt=setTimeout(function(){LS.set('pe_inst_'+email,d)},400)}
function soon(n){alert(n+': será criado nas próximas partes.')}
function fdata(s){return s?s.split('-').reverse().join('/'):''}
function principal(k,it){const v=it[SEC[k].c[0][0]];return v&&String(v).trim()}
function adMostrar(){const a=ADS[adI];$('ad').innerHTML='<small>📢 PUBLICIDADE</small><h3>'+a.t+'</h3><p>'+a.p+'</p>'}

function itemHtml(k,it){
  let x='<div class="it">';
  if(k==='classes')x+='<b>'+esc(it.nome)+'</b><span>'+esc([it.turma,it.prof].filter(Boolean).join(' · '))+'</span>';
  if(k==='eventos')x+='<b>📅 '+esc(it.titulo)+'</b><span>'+esc(fdata(it.data))+'</span>'+(it.desc?'<p>'+esc(it.desc)+'</p>':'');
  if(k==='destaque')x+='<b>⭐ '+esc(it.nome)+'</b><span>'+esc(it.classe||'')+'</span>'+(it.motivo?'<p>'+esc(it.motivo)+'</p>':'');
  if(k==='pautas')x+='<b>'+esc(it.titulo)+'</b><span>'+esc([it.classe,it.trim].filter(Boolean).join(' · '))+'</span>'+(it.foto&&it.foto.indexOf('data:image/')===0?'<img src="'+it.foto+'">':'');
  return x+'</div>';
}
function abaHtml(k){
  garantir();
  const t={geral:'Visão Geral da Instituição',classes:'Classes',eventos:'Eventos',destaque:'Alunos em Destaque',pautas:'Pautas'}[k];
  let x='<h3 class="ct">'+t+'</h3>';
  if(k==='geral'){
    x+='<p class="cp">'+esc(d.geral||GERAL_PADRAO)+'</p>';
    const L=[['Nível',NIVEIS[d.nivel]],['Diretor(a)',d.diretor],['Secretário(a)',d.secretaria]];
    if(d.nivel==='iniciacao')L.push(['Professor(a)',d.professor],['Encarregados',(d.enc||[]).filter(function(v){return v.trim()}).join(', ')]);
    if(d.local)L.push(['Localização',d.local]);
    x+=L.map(function(p){return '<div class="info"><b>'+p[0]+'</b><span>'+esc(p[1])+'</span></div>'}).join('');
  }else{
    let L=d[k].filter(function(it){return principal(k,it)});
    if(k==='eventos')L.sort(function(a,b){return (a.data||'').localeCompare(b.data||'')});
    x+=L.length?L.map(function(it){return itemHtml(k,it)}).join(''):'<p class="cp">Ainda não há registos. Toque em ✏️ Editar para adicionar.</p>';
  }
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
  garantir();
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

/* ---------- EDITAR ---------- */
function reduzir(inp,max,cb){
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=function(ev){const im=new Image();im.onload=function(){
    const k=Math.min(1,max/im.width),c=document.createElement('canvas');
    c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);
    cb(c.toDataURL('image/jpeg',.7));
  };im.src=ev.target.result};
  r.readAsDataURL(f);
}
function voltarForm(){
  if(passo>1)return mostrar(passo-1);
  if(editando){d=Object.assign(vazio(),LS.get('pe_inst_'+email,{}));abrirEditar()}
}
function edBtn(box,tit,sub,fn){
  const b=document.createElement('button');b.className='nivel';
  b.innerHTML=tit+'<small>'+sub+'</small>';b.onclick=fn;box.appendChild(b);
}
function abrirEditar(){
  garantir();tela('edit');
  $('ed-tit').textContent='✏️ Editar Página';
  $('ed-sub').textContent='Escolha o que quer editar. As alterações são guardadas automaticamente.';
  $('ed-voltar').textContent='← Perfil';$('ed-voltar').onclick=function(){verPerfil()};
  const box=$('ed-corpo');box.innerHTML='';
  const g=document.createElement('div');g.className='niveis';box.appendChild(g);
  edBtn(g,'🏫 Dados da Instituição','Nome, NIF, contactos, direção, nível e fotos',function(){abrirForm(1)});
  edBtn(g,'🏠 Visão Geral','Texto de boas-vindas',edGeral);
  Object.keys(SEC).forEach(function(k){
    const n=d[k].filter(function(it){return principal(k,it)}).length;
    edBtn(g,SEC[k].ic+' '+SEC[k].t,n+(n===1?' registo':' registos'),function(){edLista(k)});
  });
}
function edGeral(){
  $('ed-tit').textContent='🏠 Visão Geral';
  $('ed-sub').textContent='Este texto aparece no topo da aba Visão Geral.';
  $('ed-voltar').textContent='← Editar';$('ed-voltar').onclick=abrirEditar;
  const box=$('ed-corpo');
  box.innerHTML='<div class="card"><label>Texto de boas-vindas</label><textarea id="ed-geral" rows="6"></textarea></div>';
  const t=$('ed-geral');t.value=d.geral||'';t.placeholder=GERAL_PADRAO;
  t.oninput=function(){d.geral=t.value;gravar()};
}
function edLista(k){
  const S=SEC[k];garantir();
  $('ed-tit').textContent=S.ic+' '+S.t;
  $('ed-sub').textContent='As alterações são guardadas automaticamente.';
  $('ed-voltar').textContent='← Editar';$('ed-voltar').onclick=abrirEditar;
  const box=$('ed-corpo');box.innerHTML='';
  if(!d[k].length){const p=document.createElement('p');p.className='sub';p.textContent='Ainda não há registos. Toque em "＋ '+S.novo+'".';box.appendChild(p)}
  d[k].forEach(function(it,i){
    const card=document.createElement('div');card.className='card';
    S.c.forEach(function(f){
      const key=f[0],tipo=f[2];
      const lb=document.createElement('label');lb.textContent=f[1];card.appendChild(lb);
      if(tipo==='foto'){
        const pv=document.createElement('div');pv.className='foto-capa';
        const fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.className='oculto';
        const pintar=function(){pv.style.backgroundImage=it.foto?'url('+it.foto+')':'';pv.textContent=it.foto?'':'Toque para escolher a foto'};
        pintar();
        pv.onclick=function(){fi.click()};
        fi.onchange=function(){reduzir(fi,900,function(u){it.foto=u;pintar();gravar()})};
        card.appendChild(pv);card.appendChild(fi);return;
      }
      let el;
      if(tipo==='area'){el=document.createElement('textarea');el.rows=3}
      else if(tipo==='sel'){el=document.createElement('select');TRIM.forEach(function(o){const op=document.createElement('option');op.textContent=o;el.appendChild(op)})}
      else{el=document.createElement('input');el.type=tipo==='date'?'date':'text'}
      el.placeholder=f[3]||'';
      el.value=it[key]||(tipo==='sel'?TRIM[0]:'');
      if(tipo==='sel')it[key]=el.value;
      el.oninput=el.onchange=function(){it[key]=el.value;gravar()};
      card.appendChild(el);
    });
    const rm=document.createElement('button');rm.className='btn sec';rm.style.color='#dc2626';rm.textContent='🗑️ Remover';
    rm.onclick=function(){if(confirm('Remover este registo?')){d[k].splice(i,1);gravar();edLista(k)}};
    card.appendChild(rm);box.appendChild(card);
  });
  const add=document.createElement('button');add.className='btn';add.textContent='＋ '+S.novo;
  add.onclick=function(){d[k].push(k==='pautas'?{trim:TRIM[0]}:{});gravar();edLista(k);window.scrollTo(0,document.body.scrollHeight)};
  const ok=document.createElement('button');ok.className='btn sec';ok.textContent='✔ Concluído';ok.onclick=abrirEditar;
  box.appendChild(add);box.appendChild(ok);
}
`;

const c=h.indexOf('/* ---------- PERFIL ---------- */'),e=h.lastIndexOf('iniciar();');
if(c<0||e<0||c>e){console.log('❌ Não encontrei os marcadores em pagina.html');process.exit(1)}
h=h.slice(0,c)+jsPerfil+h.slice(e);
fs.writeFileSync('pagina.html',h);
console.log('✅ pagina.html atualizada');
