// Serve only an existing production artifact. This never builds or deploys.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
const root=resolve(process.argv[2]||'dist'), port=Number(process.argv[3]||4187);
createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
  const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(relative(root,file).startsWith('..')){res.writeHead(403).end();return;}
  res.setHeader('Content-Type', {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webm':'video/webm'}[extname(file)]||'application/octet-stream');
  res.end(await readFile(file));
 }catch{res.writeHead(404).end();}
}).listen(port,'127.0.0.1',()=>console.log(`Existing review artifact: http://127.0.0.1:${port}`));
