import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const templateDir = resolve(process.argv[2] || join(root, 'templates'));
const outputDir = resolve(process.argv[3] || join(root, 'dist'));
const componentsDir = join(root, 'components');
const includePattern = /<!--\s*include:([\w./-]+)\s*-->/g;

async function loadComponent(name) {
  const componentPath = resolve(componentsDir, name);
  if (!componentPath.startsWith(`${componentsDir}/`)) {
    throw new Error(`Invalid component path: ${name}`);
  }
  return readFile(componentPath, 'utf8');
}

async function assemble(source) {
  let result = source;
  let match;
  while ((match = includePattern.exec(result))) {
    const component = await loadComponent(match[1]);
    result = result.replace(match[0], component);
    includePattern.lastIndex = 0;
  }
  return result;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (extname(entry.name) === '.html') files.push(path);
  }
  return files;
}

const templates = await walk(templateDir);
await mkdir(outputDir, { recursive: true });
for (const template of templates) {
  const output = join(outputDir, relative(templateDir, template));
  await mkdir(resolve(output, '..'), { recursive: true });
  await writeFile(output, await assemble(await readFile(template, 'utf8')));
}

console.log(`Assembled ${templates.length} HTML page(s) into ${outputDir}`);
