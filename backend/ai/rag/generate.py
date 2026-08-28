# ============================================================
# SUDARSHANA-AI
# RAG + GENERATIVE AI
# ============================================================

from pathlib import Path
import os

import chromadb
from dotenv import load_dotenv
from google import genai


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parents[3]
)

ENV_FILE = PROJECT_ROOT / ".env"

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


chroma_client = (
    chromadb.PersistentClient(
        path=str(VECTOR_STORE)
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
# SURVEILLANCE EVENT
# ============================================================

event = {

    "object": "Person",

    "confidence": 0.841,

    "location": "Restricted Zone",

    "anomaly": "HIGH",

    "risk": "HIGH"
}


# ============================================================
# CREATE RAG QUERY
# ============================================================

query = f"""
A surveillance system detected the following event:

Object: {event["object"]}
Confidence: {event["confidence"]}
Location: {event["location"]}
Anomaly Level: {event["anomaly"]}
Risk Level: {event["risk"]}

What should the authorized operator review or do
according to the available surveillance SOPs and
restricted-zone guidelines?
"""


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
# BUILD CONTEXT
# ============================================================

context_parts = []


for index, document in enumerate(
    documents
):

    source = "Unknown"

    if index < len(metadatas):

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

    model="gemini-2.5-flash",

    contents=prompt
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
    "        RAG + GENAI RESPONSE"
)

print("=" * 60)

print()

print(
    "EVENT:"
)

print(
    query
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
    "AI GENERATED RESPONSE"
)

print("=" * 60)

print()

print(
    response.text
)

print()

print("=" * 60)

print(
    "        RAG GENERATION COMPLETE"
)

print("=" * 60)