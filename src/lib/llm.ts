import Anthropic from '@anthropic-ai/sdk';
import type { TestQuestion } from '@lib/types';

interface OpenEndedAnswer {
  questionId: string;
  question: string;
  answer: string;
  maxPoints: number;
}

interface QuestionEvaluation {
  question_id: string;
  points_awarded: number;
  max_points: number;
  feedback: string;
}

export interface LLMEvalResult {
  evaluations: QuestionEvaluation[];
  raw: string;
}

export async function evaluateOpenEndedAnswers(
  anthropicApiKey: string,
  courseTitle: string,
  answers: OpenEndedAnswer[],
): Promise<LLMEvalResult> {
  const client = new Anthropic({ apiKey: anthropicApiKey });

  const questionsText = answers
    .map((a, i) =>
      `Otázka ${i + 1} (max ${a.maxPoints} bodů): ${a.question}\nOdpověď: ${a.answer}`,
    )
    .join('\n\n');

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Jsi hodnotitel závěrečného testu kurzu "${courseTitle}". Ohodnoť následující odpovědi na otevřené otázky.

${questionsText}

Vrať POUZE validní JSON v tomto formátu (žádný jiný text):
{
  "evaluations": [
    {
      "question_id": "<id>",
      "points_awarded": <číslo>,
      "max_points": <číslo>,
      "feedback": "<krátká zpětná vazba v češtině>"
    }
  ]
}

IDs otázek: ${answers.map((a) => a.questionId).join(', ')}`,
      },
    ],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';

  let evaluations: QuestionEvaluation[] = [];
  try {
    const parsed = JSON.parse(raw) as { evaluations: QuestionEvaluation[] };
    evaluations = parsed.evaluations ?? [];
  } catch {
    // Fallback: give partial credit for each answer
    evaluations = answers.map((a) => ({
      question_id: a.questionId,
      points_awarded: Math.floor(a.maxPoints * 0.5),
      max_points: a.maxPoints,
      feedback: 'Hodnocení nebylo možné provést automaticky.',
    }));
  }

  return { evaluations, raw };
}
