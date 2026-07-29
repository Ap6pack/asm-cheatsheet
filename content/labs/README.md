# Interactive Incident-Replay Labs

Each file here is one **lab** — an interactive, machine-speed replay of an
intrusion timeline, rendered at `/labs/<slug>` on the website. A learner presses
play and watches the attack chain fall one trust boundary at a time: nodes
ignite as the agent reaches them, phase-activity bars fill, and the action
counters climb.

Labs are plain JSON, so you can contribute a whole new incident without touching
application code. CI validates every file (`pnpm validate:content` in
`website/`), so you get immediate feedback on structure.

## Two kinds of lab

- **Real incidents** (`"fictional": false`) must cite a public `source` and
  should carry a `disclaimer` making clear it is an *educational reconstruction*
  of public reporting — not a byte-for-byte forensic record. Do not invent
  non-public specifics. Use representative, clearly-illustrative commands.
- **Fictional training labs** (`"fictional": true`) invent the whole scenario.
  Use these to teach a pattern (shadow IT, cloud pivots, supply-chain) without
  any real-world sensitivity. Invented company names only.

## File format

```jsonc
{
  "slug": "my-incident",            // matches the filename and the URL
  "title": "...",
  "subtitle": "...",
  "category": "Incident Replay",
  "difficulty": "beginner|intermediate|advanced",
  "estimatedMinutes": 15,
  "fictional": true,
  "source": { "label": "...", "url": "https://..." },   // required if not fictional
  "disclaimer": "...",
  "summary": "markdown overview shown above the replay",

  "stages": [ { "id": "stage-1", "name": "...", "note": "..." } ],

  "phases": [
    // Attacker activity categories. `total` is OPTIONAL — see
    // "Action counts vs. event counts" below.
    { "id": "recon", "label": "recon", "note": "...", "total": 1200 }
  ],

  "nodes": [
    // Attack-chain graph. A node ignites when an event lists it in `ignites`.
    { "id": "ct-logs", "stageId": "stage-1", "group": "Public internet",
      "label": "Certificate transparency", "sub": "forgotten subdomains" }
  ],

  "edges": [ { "from": "ct-logs", "to": "staging-app", "label": "forgotten host" } ],

  "events": [
    // The timeline. Playing the lab advances a playhead across these in order.
    {
      "id": "e01",
      "t": "2026-03-15T08:00:00Z",   // within [meta start, meta end], ascending
      "phaseId": "recon",             // must match a phase id
      "stageId": "stage-1",           // must match a stage id
      "actions": 700,                 // OPTIONAL — only with phase totals
      "title": "Certificate-transparency sweep",
      "detail": "One or two sentences of narration.",
      "blastRadius": "public internet",
      "ignites": ["ct-logs"],         // node ids reached at this event (optional)
      "commands": ["curl -s 'https://crt.sh/?q=%25.example'"]  // representative (optional)
    }
  ],

  "lessons": [ "Defensive takeaway one.", "Defensive takeaway two." ]
}
```

## Action counts vs. event counts

A replay measures progress one of two ways, and the lab's data decides which:

- **Action-counted** — every phase declares a `total` and every event declares
  `actions`. Use this **only** when the incident's responders published action
  telemetry you can cite. The UI then counts "attacker actions".
- **Event-counted** — no phase declares a `total` and no event declares
  `actions`. The replay counts its own timeline steps instead, and the UI says
  "timeline steps". **This is the right default for most real incidents**,
  because the public record usually supports a sequence of events but not a
  per-step action tally.

Do not invent action counts to make a replay look more forensic than its
sources are. Mixing the two modes is rejected by the validator.

| | Action-counted | Event-counted |
|---|---|---|
| `phases[].total` | required on every phase | omitted everywhere |
| `events[].actions` | required on every event | omitted everywhere |
| `totalActions` | optional | not allowed |
| UI label | "attacker actions" | "timeline steps" |

## Validation rules (enforced in CI)

- `slug` matches the filename (`<slug>.json`)
- `difficulty` is one of `beginner` / `intermediate` / `advanced`
- If `fictional` is `false`, a `source` with a `url` is required
- Every event's `phaseId` and `stageId` reference a declared phase/stage
- Every id in an event's `ignites` references a declared node
- Every edge `from`/`to` references a declared node
- Event timestamps are strictly ascending
- Either **every** phase declares a `total` or **none** do
- In action-counted labs, the sum of each phase's event `actions` equals its `total`
- In event-counted labs, no event may declare `actions` and `totalActions` is rejected

## Writing a good replay

- Make the **noisy middle** visible — recon and staging usually dwarf exfil, and
  that shape is itself a lesson. Let the action counts tell that story.
- Give each event a single clear idea; the `detail` is one or two sentences.
- Ground `lessons` in the specific links of *this* chain, not generic advice.
