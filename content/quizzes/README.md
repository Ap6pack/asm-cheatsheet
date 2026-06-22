# Module Quizzes

Each learning module has a knowledge-check quiz, rendered on the module's page
at `/learn/module-N`. Quizzes are plain JSON so anyone can contribute questions
without touching application code.

## File format

One file per module: `module-<id>.json`, where `<id>` matches the module number
in [learning_guide.md](../resources/learning_guide.md).

```json
{
  "moduleId": 1,
  "passingScore": 70,
  "questions": [
    {
      "id": "m1-q1",
      "question": "The question text?",
      "options": ["First option", "Second option", "Third option", "Fourth option"],
      "correctIndex": 1,
      "explanation": "Shown after answering: why the correct option is right."
    }
  ]
}
```

Rules (enforced by CI via `pnpm validate:content` in `website/`):

- `moduleId` must match an existing learning module
- `passingScore` is a percentage from 1–100 (we use 70 by default)
- Each question needs a unique `id` (convention: `m<module>-q<number>`)
- At least 2 options; `correctIndex` is the zero-based index of the right one
- Every question needs an `explanation` — it's the teaching moment, not just an answer key

## Writing good questions

- Test understanding, not trivia: prefer "why would you use X" over "what flag does X take" (unless the flag is genuinely core, like `nmap -sV`)
- Make distractors plausible — wrong options should be things a learner might actually believe
- Keep explanations to 1–2 sentences that reinforce the concept
- Ground every question in the module's content or the linked resources
