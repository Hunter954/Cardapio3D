import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('./public/', import.meta.url));
const vendor = fileURLToPath(new URL('./node_modules/three/build/', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
export const server = http.createServer(async (req,res) => {
  res.setHeader('Permissions-Policy','camera=(self), xr-spatial-tracking=(self), microphone=()');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405); return res.end();}
  let url;
  try {url = decodeURIComponent(new URL(req.url,'http://localhost').pathname);} catch {res.writeHead(400); return res.end();}
  if (url === '/health') {res.setHeader('Content-Type','application/json'); return res.end(req.method === 'HEAD' ? undefined : JSON.stringify({status:'ok',app:'cardapio3d'}));}
  const isVendor = ['/vendor/three.module.js','/vendor/three.core.js'].includes(url);
  const base = isVendor ? vendor : root;
  const file = path.resolve(base, isVendor ? path.basename(url) : '.' + (url === '/' ? '/index.html' : url));
  if (path.relative(base,file).startsWith('..') || path.isAbsolute(path.relative(base,file))) {res.writeHead(403); return res.end();}
  try {
    const content = await readFile(file);
    res.setHeader('Content-Type',types[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control',isVendor ? 'public, max-age=86400' : 'no-cache');
    res.writeHead(200); res.end(req.method === 'HEAD' ? undefined : content);
  } catch {res.writeHead(404);res.end('Não encontrado');}
});
if (process.argv[1] === fileURLToPath(import.meta.url)) server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('cardapio3d ready'));
