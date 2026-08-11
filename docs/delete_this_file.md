

## Sudarshana-AI — Locked Architecture (v1)

**Problem statement:**
Border/remote defence areas mein surveillance data (drone, CCTV) itna zyada hai ki human operators continuously monitor nahi kar sakte, jiske karan suspicious activity detect karne mein delay hoti hai.

**Solution one-liner:**
Offline-first AI system jo video footage se objects detect + track karta hai, rule-based anomaly detection se suspicious activity flag karta hai, explainable threat score deta hai, aur ek command dashboard pe present karta hai — bina kisi cloud/API dependency ke.

**Exact detection classes (locked):**
- Person
- Vehicle
- Unknown/other object (fallback bucket — anything YOLO detects but doesn't clearly fit person/vehicle)

**Pipeline (locked flow):**
```
Video input (pre-recorded)
   ↓
YOLO detection (local)
   ↓
Object tracking (assign IDs, track movement)
   ↓
Event generation (object + location + timestamp)
   ↓
Rule-based anomaly check (zone, time, movement pattern)
   ↓
Explainable threat scoring (weighted, with reasons)
   ↓
Local database (store event + score)
   ↓
React dashboard (map, alerts, timeline, AI summary)
   ↓
[optional] Sync to central server when online
```

**Core modules (mapped to your folder structure):**
| Module | Responsibility |
|---|---|
| `ai/detection` | YOLO wrapper, runs on video frames |
| `ai/tracking` | Assigns persistent IDs across frames |
| `ai/anomaly` | Rule engine — zone/time/pattern checks |
| `ai/scoring` | Weighted threat score + reason breakdown |
| `ai/summary` | Optional GenAI natural-language event summary |

**Non-negotiables (what makes this "locked"):**
1. Detection runs 100% locally — no external API call for core pipeline
2. Threat score is always explainable — score + reasons, never a black-box number
3. GenAI (if used) is a reporting layer only, never part of the decision pipeline
4. System is decision *support*, not decision *making* — human verifies every flagged event

Ye version doc mein save kar lo (`docs/architecture.md` mein daal sakte ho) — ye ab tumhara reference point hai for everything else. 


///------------------- ADDDD this featuree------------------

Abhi sirf score hai.

Add:

0-25    LOW
26-50   MEDIUM
51-75   HIGH
76-100  CRITICAL

Dashboard pe color-coded queue.

Operator pehle CRITICAL dekhega.

Ye practical defence workflow jaisa lagta hai.

-------------------------------------------
4. AI Summary weak differentiator hai

Aaj kal sab:

Gemini summarize

kar dete hain.

Isse judge impress nahi hoga.

Better

AI Summary + Recommended Action

Example:

Summary:
Vehicle entered restricted zone.

Recommended Action:
Verify vehicle identity using nearest camera feed.

Ab AI sirf narrator nahi, assistant lagta hai.
---------------------------------------------------------
5. Missing Replay System ⭐

Ye mujhe sabse valuable addition lagta hai.

Alert pe click:

Event #204

▶ Replay Incident

Last 20 seconds ka clip.

Judge ko instantly wow factor milega.

Architecture simple rahega:

Event
↓
Timestamp
↓
Store Clip
↓
Replay
-------------------------------------------------------------