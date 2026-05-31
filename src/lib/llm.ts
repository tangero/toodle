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
  model: string;
}

export async function evaluateOpenEndedAnswers(
  openRouterApiKey: string,
  courseTitle: string,
  answers: OpenEndedAnswer[],
  model = 'openrouter/auto',
): Promise<LLMEvalResult> {
  const questionsText = answers
    .map((a, i) =>
      `Otázka ${i + 1}
ID: ${a.questionId}
Maximum bodů: ${a.maxPoints}
Zadání: ${a.question}
Odpověď studenta: ${a.answer}`,
    )
    .join('\n\n');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://skola.aivefirmach.cz',
      'X-Title': 'Letni skola AI',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Jsi přísný, ale férový hodnotitel závěrečného testu. Hodnotíš v češtině.
Vrať pouze validní JSON bez markdownu a bez doprovodného textu.`,
        },
        {
          role: 'user',
          content: `Kurz: "${courseTitle}"

Ohodnoť odpovědi na otevřené otázky.

Pravidla:
- Každé hodnocení musí použít původní ID otázky.
- points_awarded musí být celé číslo od 0 do max_points.
- max_points musí odpovídat maximu u otázky.
- feedback má být krátká konkrétní zpětná vazba v češtině.
- Nevracej otázky, které nejsou uvedené níže.

Odpověz přesně v tomto JSON tvaru:
{
  "evaluations": [
    {
      "question_id": "id-otazky",
      "points_awarded": 0,
      "max_points": 1,
      "feedback": "Krátká zpětná vazba."
    }
  ]
}

${questionsText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${error}`);
  }

  const data = (await response.json()) as {
    model?: string;
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const raw = data.choices?.[0]?.message?.content ?? '';

  let evaluations: QuestionEvaluation[] = [];
  try {
    const parsed = JSON.parse(raw) as { evaluations?: QuestionEvaluation[] };
    evaluations = normalizeEvaluations(parsed.evaluations ?? [], answers);
  } catch {
    evaluations = fallbackEvaluations(answers);
  }

  return { evaluations, raw, model: data.model ?? model };
}

function normalizeEvaluations(
  evaluations: QuestionEvaluation[],
  answers: OpenEndedAnswer[],
): QuestionEvaluation[] {
  const maxPointsById = new Map(answers.map((a) => [a.questionId, a.maxPoints]));
  return evaluations
    .filter((ev) => maxPointsById.has(ev.question_id))
    .map((ev) => {
      const maxPoints = maxPointsById.get(ev.question_id)!;
      const points = Number.isFinite(ev.points_awarded)
        ? Math.round(ev.points_awarded)
        : 0;
      return {
        question_id: ev.question_id,
        points_awarded: Math.min(Math.max(points, 0), maxPoints),
        max_points: maxPoints,
        feedback: typeof ev.feedback === 'string' && ev.feedback.trim()
          ? ev.feedback.trim()
          : 'Bez slovní zpětné vazby.',
      };
    });
}

function fallbackEvaluations(answers: OpenEndedAnswer[]): QuestionEvaluation[] {
  return answers.map((a) => ({
    question_id: a.questionId,
    points_awarded: Math.floor(a.maxPoints * 0.5),
    max_points: a.maxPoints,
    feedback: 'Hodnocení nebylo možné provést automaticky.',
  }));
}
