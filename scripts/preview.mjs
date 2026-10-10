import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {build,root} from './build.mjs';
await build();
const dir=path.join(root,'dist');const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=path.resolve(dir,'.'+pathname);
    if(!file.startsWith(dir+path.sep)&&file!==dir){res.writeHead(403);res.end('Forbidden');return;}
    if(file===dir)file=path.join(dir,'index.html');
    if(!path.extname(file))file+='.html';
    const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(dir,'404.html')));}
}).listen(port,'0.0.0.0',()=>console.log(`Vista previa: http://localhost:${port}`));
