/**
 * Seed script pro vložení ukázkového kurzu "AI pro začátečníky".
 * 
 * Spuštění (po `npm run build` a s nastaveným prostředím):
 *   npx tsx scripts/seed.ts
 * 
 * Nebo přes wrangler:
 *   npx wrangler d1 execute skola-ai-db --file=scripts/seed.sql
 */

import { generateId } from '../src/lib/db';

// Tento skript je ukázka. V reálném nasazení bys ho spouštěl
// buď přes admin UI, nebo přes speciální admin endpoint.

const sampleCourse = {
  title: 'AI pro začátečníky',
  slug: 'ai-pro-zacatecniky',
  perex: 'Praktický 10denní emailový kurz, který tě provede světem umělé inteligence bez předchozích znalostí.',
  description_md: `# AI pro začátečníky

Vítej v kurzu, který tě naučí pracovat s AI nástroji jako profesionál.

## Co se naučíš
- Jak psát efektivní prompty
- Jak používat ChatGPT, Claude a další nástroje
- Jak AI využít v práci i osobním životě
- Základy etiky a rizik AI

Kurz je zdarma a probíhá formou denních emailů.`,
  author_name: 'Patrick Zandl',
  price_czk: 0,
  lesson_count: 5,
  delivery_mode: 'next_workday' as const,
  status: 'published' as const,
  welcome_email_md: 'Vítej v kurzu AI pro začátečníky! První lekce přijde zítra ráno.',
  completion_email_md: 'Gratulujeme k dokončení kurzu! Stáhni si certifikát z dashboardu.',
};

console.log('Seed data prepared for course:', sampleCourse.slug);
console.log('Run this data through the admin UI or create a dedicated seed endpoint.');
console.log('This file is a template for future automation.');
