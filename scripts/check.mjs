import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const pages = ['index.html', ...(await readdir('guide')).filter(f=>f.endsWith('.html')).map(f=>`guide/${f}`)];
let links=0, images=0;
for (const page of pages) {
 const html=await readFile(page,'utf8');
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${page}: one primary heading required`);
 assert.match(html,/<html lang="en">/);
 assert.match(html,/name="viewport"/);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,`${page}: duplicate IDs`);
 for (const [,link] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
   if (/^(https?:|mailto:|data:)/.test(link)) continue;
   const [file,anchor]=link.split('#');
   const target=file?path.normalize(path.join(path.dirname(page),file)):page;
   assert((await stat(target)).isFile(),`${page}: missing ${target}`);
   if(anchor){const targetHtml=await readFile(target,'utf8');assert(targetHtml.includes(`id="${anchor}"`),`${page}: broken anchor ${link}`);}
   links++;
 }
 for (const img of html.matchAll(/<img\b[^>]+>/g)) {assert.match(img[0],/\balt="[^"]*"/);images++;}
}
const index=JSON.parse(await readFile('assets/search-index.json','utf8'));
assert.equal(index.length,14);
for(const entry of index){assert(entry.text.length>0);assert((await stat(entry.url)).isFile());}
console.log(`Checked ${pages.length} pages, ${links} local links, ${images} images, and ${index.length} search entries.`);
