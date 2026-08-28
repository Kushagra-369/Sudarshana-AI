# ============================================================
# SUDARSHANA-AI
# RAG RETRIEVAL
# ============================================================

from pathlib import Path
import chromadb


# ============================================================
# PATHS
# ============================================================

CURRENT_DIR = Path(__file__).resolve().parent
AI_DIR = CURRENT_DIR.parent
BACKEND_DIR = AI_DIR.parent

VECTOR_STORE = (
    BACKEND_DIR
    / "knowledge_base"
    / "vector_store"
)


# ============================================================
# CONNECT TO CHROMA
# ============================================================

print()
print("=" * 60)
print("        SUDARSHANA-AI")
print("        RAG RETRIEVAL")
print("=" * 60)
print()

print(
    f"Vector store: {VECTOR_STORE}"
)


if not VECTOR_STORE.exists():

    raise FileNotFoundError(
        f"Vector store not found: {VECTOR_STORE}"
    )


client = chromadb.PersistentClient(
    path=str(VECTOR_STORE)
)


# ============================================================
# FIND COLLECTION
# ============================================================

collections = client.list_collections()


if not collections:

    raise RuntimeError(
        "No collections found in ChromaDB."
        "\nRun ingest.py first."
    )


print()
print("Available collections:")

for collection in collections:

    # Chroma versions may return either
    # collection objects or collection names.

    if hasattr(collection, "name"):

        print(
            f"- {collection.name}"
        )

    else:

        print(
            f"- {collection}"
        )


# ============================================================
# SELECT COLLECTION
# ============================================================

first_collection = collections[0]


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


collection = client.get_collection(
    name=collection_name
)


print()
print(
    f"Using collection: {collection_name}"
)


# ============================================================
# CHECK DOCUMENT COUNT
# ============================================================

document_count = collection.count()


print(
    f"Documents/chunks stored: "
    f"{document_count}"
)


if document_count == 0:

    raise RuntimeError(
        "Collection is empty. "
        "Run ingest.py first."
    )


# ============================================================
# TEST QUERY
# ============================================================

query = (
    "A person has been detected "
    "inside a restricted zone. "
    "What response procedure should "
    "the operator follow?"
)


print()
print("=" * 60)
print("QUERY")
print("=" * 60)
print(query)


# ============================================================
# RETRIEVAL
# ============================================================

results = collection.query(

    query_texts=[
        query
    ],

    n_results=min(
        3,
        document_count
    )
)


# ============================================================
# EXTRACT RESULTS
# ============================================================

documents = results.get(
    "documents",
    [[]]
)[0]

metadatas = results.get(
    "metadatas",
    [[]]
)[0]

distances = results.get(
    "distances",
    [[]]
)[0]


# ============================================================
# DISPLAY RESULTS
# ============================================================

print()
print("=" * 60)
print("RETRIEVED SOP CONTEXT")
print("=" * 60)


if not documents:

    print(
        "No relevant documents found."
    )

else:

    for index, document in enumerate(
        documents
    ):

        print()
        print(
            f"RESULT {index + 1}"
        )

        print(
            "-" * 60
        )


        # ----------------------------------------------------
        # Metadata
        # ----------------------------------------------------

        if index < len(metadatas):

            print(
                "SOURCE:"
            )

            print(
                metadatas[index]
            )


        # ----------------------------------------------------
        # Similarity distance
        # ----------------------------------------------------

        if index < len(distances):

            print()
            print(
                f"DISTANCE: "
                f"{distances[index]:.4f}"
            )


        # ----------------------------------------------------
        # Document content
        # ----------------------------------------------------

        print()
        print(
            "CONTENT:"
        )

        print(
            document
        )


# ============================================================
# COMPLETE
# ============================================================

print()
print("=" * 60)
print("        RAG RETRIEVAL COMPLETE")
print("=" * 60)
print()