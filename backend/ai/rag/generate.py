# ============================================================
# SUDARSHANA-AI
# RAG + GENERATIVE AI
# ============================================================

from pathlib import Path
import os
import json

import chromadb
from dotenv import load_dotenv
from google import genai


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parents[3]
)

ENV_FILE = PROJECT_ROOT / ".env"

VIDEO_RESULT_FILE = (
    PROJECT_ROOT
    / "backend"
    / "runs"
    / "sudarshana"
    / "surveillance_result.json"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "backend"
    / "runs"
    / "sudarshana"
    / "ai_assessment.json"
)


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv(
    ENV_FILE
)


# ============================================================
# API KEY
# ============================================================

API_KEY = os.getenv(
    "GEMINI_API_KEY"
)


if not API_KEY:

    raise RuntimeError(
        "GEMINI_API_KEY not found.\n"
        f"Create .env at: {ENV_FILE}"
    )


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=API_KEY
)


# ============================================================
# LOAD SURVEILLANCE RESULTS
# ============================================================

if not VIDEO_RESULT_FILE.exists():

    raise FileNotFoundError(
        f"Surveillance result not found:\n"
        f"{VIDEO_RESULT_FILE}\n\n"
        "Run video_pipeline.py first."
    )


with open(
    VIDEO_RESULT_FILE,
    "r",
    encoding="utf-8"
) as file:

    surveillance_data = json.load(
        file
    )


# ============================================================
# EXTRACT EVENT DATA
# ============================================================

tracks = surveillance_data.get(
    "tracks",
    []
)


total_tracks = surveillance_data.get(
    "tracks_detected",
    len(tracks)
)


frames_processed = surveillance_data.get(
    "frames_processed",
    0
)


# Default values

event_object = "Unknown"

event_confidence = 0.0

event_anomaly = "UNKNOWN"

event_risk = "UNKNOWN"

event_track_id = "N/A"


# Extract highest-risk track

if tracks:

    selected_track = max(

        tracks,

        key=lambda track: (
            track.get(
                "risk_score",
                0
            )
        )
    )


    event_object = selected_track.get(
        "category",
        selected_track.get(
            "class_name",
            "Unknown"
        )
    )


    event_confidence = selected_track.get(
        "confidence",
        0.0
    )


    event_anomaly = selected_track.get(
        "anomaly",
        "UNKNOWN"
    )


    event_risk = selected_track.get(
        "risk_level",
        selected_track.get(
            "risk",
            "UNKNOWN"
        )
    )


    event_track_id = selected_track.get(
        "track_id",
        "N/A"
    )


# ============================================================
# CREATE EVENT OBJECT
# ============================================================

event = {

    "object": event_object,

    "confidence": event_confidence,

    "location": "Surveillance Area",

    "anomaly": event_anomaly,

    "risk": event_risk,

    "track_id": event_track_id,

    "total_tracks": total_tracks,

    "frames_processed": frames_processed
}


# ============================================================
# CREATE RAG QUERY
# ============================================================

query = f"""
A surveillance system processed a video and
identified the following event:

Track ID: {event["track_id"]}
Object: {event["object"]}
Confidence: {event["confidence"]}
Location: {event["location"]}
Anomaly Level: {event["anomaly"]}
Risk Level: {event["risk"]}

Video Context:
Total Tracks Detected: {event["total_tracks"]}
Frames Processed: {event["frames_processed"]}

What should the authorized operator review or do
according to the available surveillance SOPs,
anomaly guidelines, and restricted-zone guidelines?
"""


# ============================================================
# VECTOR DATABASE
# ============================================================

VECTOR_STORE = (
    PROJECT_ROOT
    / "backend"
    / "knowledge_base"
    / "vector_store"
)


if not VECTOR_STORE.exists():

    raise FileNotFoundError(
        f"Vector store not found: {VECTOR_STORE}"
    )


chroma_client = chromadb.PersistentClient(

    path=str(
        VECTOR_STORE
    )
)


# ============================================================
# COLLECTION
# ============================================================

collections = (
    chroma_client
    .list_collections()
)


if not collections:

    raise RuntimeError(
        "No ChromaDB collection found."
    )


first_collection = (
    collections[0]
)


if hasattr(
    first_collection,
    "name"
):

    collection_name = (
        first_collection.name
    )

else:

    collection_name = (
        first_collection
    )


collection = (
    chroma_client
    .get_collection(
        name=collection_name
    )
)


# ============================================================
# RETRIEVE RELEVANT SOPs
# ============================================================

results = collection.query(

    query_texts=[
        query
    ],

    n_results=min(
        3,
        collection.count()
    )
)


documents = results.get(
    "documents",
    [[]]
)[0]


metadatas = results.get(
    "metadatas",
    [[]]
)[0]


if not documents:

    raise RuntimeError(
        "No relevant SOP context retrieved."
    )


# ============================================================
# BUILD RAG CONTEXT
# ============================================================

context_parts = []


for index, document in enumerate(
    documents
):

    source = "Unknown"


    if index < len(
        metadatas
    ):

        source = metadatas[
            index
        ].get(
            "source",
            "Unknown"
        )


    context_parts.append(

        f"""
SOURCE: {source}

{document}
"""
    )


context = "\n".join(
    context_parts
)


# ============================================================
# GROUNDED PROMPT
# ============================================================

prompt = f"""
You are the AI decision-support assistant
for SUDARSHANA-AI.

You must answer ONLY using the supplied
SOP context.

Do not invent procedures.

Do not claim that an event proves hostile
or malicious intent.

Do not autonomously authorize operational
action.

Keep a human operator in the loop.

SURVEILLANCE EVENT
------------------
{query}

RETRIEVED SOP CONTEXT
---------------------
{context}

TASK
----
Provide a concise operator-facing assessment.

Return exactly these sections:

Assessment:
Recommended Review:
Relevant SOP:
Human Verification:
"""


# ============================================================
# GENERATE RESPONSE
# ============================================================

response = client.models.generate_content(

    model="gemini-3.6-flash",

    contents=prompt
)


ai_response = response.text


# ============================================================
# SAVE AI ASSESSMENT
# ============================================================

assessment_output = {

    "system": "SUDARSHANA-AI",

    "event": event,

    "retrieved_sources": [

        metadata.get(
            "source",
            "Unknown"
        )

        for metadata in metadatas
    ],

    "ai_assessment": ai_response
}


OUTPUT_FILE.parent.mkdir(

    parents=True,

    exist_ok=True
)


with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(

        assessment_output,

        file,

        indent=4
    )


# ============================================================
# DISPLAY
# ============================================================

print()

print("=" * 60)

print(
    "        SUDARSHANA-AI"
)

print(
    "        VIDEO + RAG + GENAI"
)

print("=" * 60)

print()

print(
    "VIDEO EVENT:"
)

print()

for key, value in event.items():

    print(
        f"{key}: {value}"
    )


print()

print(
    "RETRIEVED SOURCES:"
)


for metadata in metadatas:

    print(
        "-",
        metadata.get(
            "source",
            "Unknown"
        )
    )


print()

print("=" * 60)

print(
    "AI GENERATED ASSESSMENT"
)

print("=" * 60)

print()

print(
    ai_response
)


print()

print(
    f"Assessment JSON: {OUTPUT_FILE}"
)


print()

print("=" * 60)

print(
    "RAG PIPELINE COMPLETE"
)

print("=" * 60)