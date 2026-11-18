const http=require('http'),fs=require('fs');
const OK={'/preview.html':1,'/pagina.html':1};
http.createServer((q,r)=>{
  let p=q.url.split('?')[0];if(p==='/')p='/preview.html';
  if(!OK[p]){r.statusCode=404;return r.end('404')}
  r.setHeader('Content-Type','text/html; charset=utf-8');
  r.end(fs.readFileSync(__dirname+p));
}).listen(8080,'127.0.0.1');
