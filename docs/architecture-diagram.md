# Sudarshana-AI — Architecture (v1, locked)

## Problem statement

Border and remote defence areas generate large volumes of surveillance data
(drone footage, CCTV, thermal cameras, field reports). Human operators cannot
continuously monitor and analyse all of this, which delays identification of
suspicious activity and slows decision-making.

## Solution (one-liner)

An offline-first AI system that detects and tracks objects in video footage,
flags suspicious activity using a rule-based anomaly engine, produces an
explainable threat score, and presents everything on a command dashboard —
without depending on any cloud/API for the core pipeline.

## Detection classes (locked)

- Person
- Vehicle
- Unknown / other object (fallback bucket for anything detected but not
  clearly a person or vehicle)

## Pipeline (locked flow)

\`\`\`
Video input (pre-recorded)
   |
   v
YOLO detection (local)
   |
   v
Object tracking (assign IDs, track movement)
   |
   v
Event generation (object + location + timestamp)
   |
   v
Rule-based anomaly check (zone, time, movement pattern)
   |
   v
Explainable threat scoring (weighted, with reasons)
   |
   v
Local database (store event + score)
   |
   v
React dashboard (map, alerts, timeline, AI summary)
   |
   v
[optional] Sync to central server when online
\`\`\`

## Core modules

| Module           | Responsibility                                          |
|------------------|-----------------------------------------------------------|
| `ai/detection`   | YOLO wrapper, runs on video frames                       |
| `ai/tracking`    | Assigns persistent IDs across frames, tracks movement    |
| `ai/anomaly`     | Rule engine — zone / time / movement-pattern checks       |
| `ai/scoring`     | Weighted threat score with explainable reason breakdown  |
| `ai/summary`     | Optional GenAI natural-language event summary (reporting only) |

## Threat scoring model

Score is a weighted sum out of 100, always returned with its reasons:

| Reason               | Weight |
|----------------------|--------|
| Restricted zone entry| +40    |
| Unusual timestamp    | +20    |
| Abnormal movement    | +10    |
| Multiple objects      | +8     |

Bands: LOW (0-29) / MEDIUM (30-59) / HIGH (60-79) / CRITICAL (80-100)

## Non-negotiables

1. Detection and scoring run 100% locally — no external API call in the core pipeline.
2. Threat score is always explainable — score + reasons, never a black-box number.
3. GenAI (if used) is a reporting/summary layer only, never part of the decision pipeline.
4. The system provides decision **support**, not decision-making — a human verifies every flagged event.

## Tech stack

- Frontend: React, Tailwind, Leaflet/Mapbox
- Backend: FastAPI (or Node/Express), MongoDB/PostgreSQL
- AI/ML: Python, PyTorch, OpenCV, YOLO, Scikit-learn
- Optional GenAI: Gemini / Groq for situation summaries only

## Folder structure

\`\`\`
Sudarshana-AI/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── dashboard/
│       │   ├── alerts/
│       │   ├── timeline/
│       │   └── analytics/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       └── utils/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── data/
│   └── ai/
│       ├── detection/
│       ├── tracking/
│       ├── anomaly/
│       ├── scoring/
│       └── summary/
├── docs/
└── README.md
\`\`\`