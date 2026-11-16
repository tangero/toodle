#!/usr/bin/env node
/**
 * Import kurzů z docs/course-content/ do D1.
 *
 * Skript jen vygeneruje SQL, do databáze sám nezapisuje:
 *
 *   node scripts/import-courses.mjs --out /tmp/kurzy.sql                 # všechny kurzy s kartou
 *   node scripts/import-courses.mjs bezpecne-s-ai --out /tmp/kurzy.sql   # jen vybrané
 *
 *   npx wrangler d1 execute skola-ai-db --local --persist-to .wrangler/state --file /tmp/kurzy.sql
 *   npx wrangler d1 execute skola-ai-db --remote --file /tmp/kurzy.sql
 *
 * Kurz tvoří soubory <prefix>-course.md (karta kurzu), <prefix>-lesson-NN.md a volitelně
 * <prefix>-test.md s blokem ```json pod nadpisem „## questions_json“.
 *
 * SQL jde pouštět opakovaně. Kurz se páruje podle slugu, lekce podle (kurz, pozice), test podle
 * kurzu; existující řádky se přepíšou na místě, takže ID lekcí a vazby v email_log zůstávají.
 * Nový kurz vzniká jako 'draft'. Stav existujícího kurzu se nemění, publikuje se v adminu.
 * Lekce, které v souborech nejsou, skript nemaže.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ulid } from 'ulid';

const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'course-content');

const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const outPath = outIndex >= 0 ? args[outIndex + 1] : null;
const wanted = args.filter((a, i) => a !== '--out' && i !== outIndex + 1);

const files = readdirSync(CONTENT_DIR);
const prefixes = files
  .filter((f) => f.endsWith('-course.md'))
  .map((f) => f.slice(0, -'-course.md'.length))
  .filter((p) => wanted.length === 0 || wanted.includes(p));

if (prefixes.length === 0) fail('Nenašel jsem žádnou kartu kurzu (*-course.md) pro zadané prefixy.');
for (const w of wanted) if (!prefixes.includes(w)) fail(`Kurz „${w}“ nemá kartu ${w}-course.md.`);

const sql = [];
const summary = [];

for (const prefix of prefixes) {
  const course = parseCourse(read(`${prefix}-course.md`), prefix);
  const lessons = files
    .filter((f) => new RegExp(`^${escapeRegExp(prefix)}-lesson-\\d+\\.md$`).test(f))
    .sort()
    .map((f) => parseLesson(read(f), f));

  lessons.forEach((lesson, i) => {
    if (lesson.position !== i + 1) fail(`${prefix}: lekce nejdou po sobě, čekal jsem ${i + 1}, je ${lesson.position}.`);
  });
  if (lessons.length === 0) fail(`${prefix}: žádné lekce.`);

  const testFile = `${prefix}-test.md`;
  const questions = files.includes(testFile) ? parseTest(read(testFile), testFile) : null;

  const courseId = `(SELECT id FROM courses WHERE slug = ${q(course.slug)})`;

  sql.push(`-- ${course.title} (${course.slug})`);
  sql.push(
    `INSERT INTO courses (id, slug, title, perex, description_md, author_name, price_czk, lesson_count, delivery_mode, status, welcome_email_md, completion_email_md, audience, requirements, sort_order) ` +
      `VALUES (${q(ulid())}, ${q(course.slug)}, ${q(course.title)}, ${q(course.perex)}, ${q(course.description)}, ${q(course.author)}, ${course.price}, 0, ${q(course.delivery)}, 'draft', ${q(course.welcome)}, ${q(course.completion)}, ${q(course.audience)}, ${q(course.requirements)}, ${course.sortOrder}) ` +
      `ON CONFLICT(slug) DO UPDATE SET title = excluded.title, perex = excluded.perex, description_md = excluded.description_md, ` +
      `author_name = excluded.author_name, price_czk = excluded.price_czk, delivery_mode = excluded.delivery_mode, ` +
      `welcome_email_md = excluded.welcome_email_md, completion_email_md = excluded.completion_email_md, ` +
      `audience = excluded.audience, requirements = excluded.requirements, sort_order = excluded.sort_order;`,
  );
  for (const lesson of lessons) {
    sql.push(
      `INSERT INTO lessons (id, course_id, position, title, content_md, reading_minutes) ` +
        `VALUES (${q(ulid())}, ${courseId}, ${lesson.position}, ${q(lesson.title)}, ${q(lesson.html)}, ${lesson.minutes}) ` +
        `ON CONFLICT(course_id, position) DO UPDATE SET title = excluded.title, content_md = excluded.content_md, reading_minutes = excluded.reading_minutes;`,
    );
  }
  if (questions) {
    sql.push(
      `INSERT INTO tests (id, course_id, questions_json) VALUES (${q(ulid())}, ${courseId}, ${q(JSON.stringify(questions))}) ` +
        `ON CONFLICT(course_id) DO UPDATE SET questions_json = excluded.questions_json;`,
    );
  }
  sql.push(`UPDATE courses SET lesson_count = (SELECT COUNT(*) FROM lessons WHERE course_id = courses.id) WHERE slug = ${q(course.slug)};`);
  sql.push('');

  const points = questions ? questions.reduce((sum, item) => sum + item.max_points, 0) : 0;
  summary.push(
    `${course.slug}: ${lessons.length} lekcí, ${course.delivery}, ` +
      (questions ? `test ${questions.length} otázek / ${points} bodů` : 'bez testu'),
  );
}

const output = sql.join('\n');
if (outPath) {
  writeFileSync(outPath, output);
  console.error(summary.join('\n'));
  console.error(`SQL zapsáno do ${outPath}`);
} else {
  process.stdout.write(output);
}

// --- parsování -------------------------------------------------------------

function parseCourse(text, prefix) {
  const meta = parseMeta(section(text, 'Metadata'));
  const course = {
    slug: meta['Slug'],
    title: meta['Název'],
    author: meta['Autor'] ?? '',
    price: Number(meta['Cena'] ?? 0),
    delivery: meta['Doručování'],
    perex: meta['Perex'] ?? '',
    audience: meta['Pro koho'] ?? '',
    requirements: meta['Co potřebujete'] ?? '',
    sortOrder: Number(meta['Pořadí'] ?? 100),
    description: section(text, 'Popis', 'Uvítací e-mail'),
    welcome: section(text, 'Uvítací e-mail'),
    completion: section(text, 'Závěrečný e-mail'),
  };
  if (!course.slug || !/^[a-z0-9-]+$/.test(course.slug)) fail(`${prefix}: chybí nebo je neplatný Slug.`);
  if (!course.title) fail(`${prefix}: chybí Název.`);
  if (!['next_workday', 'on_click'].includes(course.delivery)) fail(`${prefix}: Doručování musí být next_workday nebo on_click.`);
  if (!Number.isInteger(course.price) || course.price < 0) fail(`${prefix}: neplatná Cena.`);
  if (!Number.isInteger(course.sortOrder)) fail(`${prefix}: Pořadí musí být celé číslo.`);
  for (const key of ['perex', 'audience', 'requirements', 'description', 'welcome', 'completion']) {
    if (!course[key]) fail(`${prefix}: karta kurzu nemá vyplněno „${key}“.`);
  }
  return course;
}

function parseLesson(text, file) {
  const meta = parseMeta(section(text, 'Metadata'));
  const body = section(text, 'Tělo e-mailu').match(/```html\n([\s\S]*?)\n```/);
  const minutes = Number.parseInt(meta['Délka čtení'] ?? '', 10);
  const position = Number(meta['Lekce']);
  if (!meta['Název']) fail(`${file}: chybí Název.`);
  if (!Number.isInteger(position) || position < 1) fail(`${file}: chybí číslo lekce.`);
  if (!Number.isInteger(minutes) || minutes < 1) fail(`${file}: chybí Délka čtení.`);
  if (!body || !body[1].trim()) fail(`${file}: chybí blok \`\`\`html s tělem e-mailu.`);
  return { position, title: meta['Název'], minutes, html: body[1].trim() };
}

function parseTest(text, file) {
  const block = section(text, 'questions_json').match(/```json\n([\s\S]*?)\n```/);
  if (!block) fail(`${file}: chybí blok \`\`\`json pod „## questions_json“.`);
  let questions;
  try {
    questions = JSON.parse(block[1]);
  } catch (err) {
    fail(`${file}: neplatný JSON (${err.message}).`);
  }
  if (!Array.isArray(questions) || questions.length === 0) fail(`${file}: test nemá otázky.`);

  const ids = new Set();
  for (const item of questions) {
    const where = `${file}, otázka ${item.id ?? '?'}`;
    if (!item.id || ids.has(item.id)) fail(`${where}: chybějící nebo opakované id.`);
    ids.add(item.id);
    if (!item.question?.trim()) fail(`${where}: chybí text otázky.`);
    if (!Number.isInteger(item.max_points) || item.max_points < 1) fail(`${where}: neplatné max_points.`);
    if (item.type === 'multiple_choice') {
      const optionIds = (item.options ?? []).map((o) => o.id);
      if (optionIds.length < 2 || new Set(optionIds).size !== optionIds.length) fail(`${where}: neplatné možnosti.`);
      if (!optionIds.includes(item.correct_option_id)) fail(`${where}: correct_option_id není mezi možnostmi.`);
    } else if (item.type !== 'open_ended') {
      fail(`${where}: neznámý typ „${item.type}“.`);
    }
  }
  return questions;
}

/** Text mezi nadpisem „## name“ a nadpisem „## until“ (nebo nejbližším dalším „## “). */
function section(text, name, until) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${name}`);
  if (start < 0) return '';
  let inFence = false;
  const out = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('```')) inFence = !inFence;
    if (!inFence && line.startsWith('## ') && (!until || line.trim() === `## ${until}`)) break;
    out.push(line);
  }
  return out.join('\n').trim();
}

function parseMeta(block) {
  const meta = {};
  for (const line of block.split('\n')) {
    const match = line.match(/^- ([^:]+):\s*(.*)$/);
    if (match && !(match[1] in meta)) meta[match[1].trim()] = match[2].trim();
  }
  return meta;
}

function read(file) {
  return readFileSync(join(CONTENT_DIR, file), 'utf8');
}

function q(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fail(message) {
  console.error(`Chyba: ${message}`);
  process.exit(1);
}
