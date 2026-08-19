# ============================================================
# SUDARSHANA-AI
# RAG KNOWLEDGE BASE INGESTION
# ============================================================

from pathlib import Path
import chromadb


# ============================================================
# PATHS
# ============================================================

CURRENT_DIR = Path(
    __file__
).resolve().parent

AI_DIR = CURRENT_DIR.parent

BACKEND_DIR = AI_DIR.parent

KNOWLEDGE_DIR = (
    BACKEND_DIR
    / "knowledge_base"
)

DOCUMENTS_DIR = (
    KNOWLEDGE_DIR
    / "documents"
)

VECTOR_STORE_DIR = (
    KNOWLEDGE_DIR
    / "vector_store"
)


# ============================================================
# CREATE DIRECTORIES
# ============================================================

VECTOR_STORE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# CHROMA
# ============================================================

client = chromadb.PersistentClient(
    path=str(VECTOR_STORE_DIR)
)


collection = client.get_or_create_collection(
    name="sudarshana_knowledge"
)


# ============================================================
# CHUNKING
# ============================================================

def chunk_text(
    text,
    chunk_size=800
):

    words = text.split()

    chunks = []

    for i in range(
        0,
        len(words),
        chunk_size
    ):

        chunk = " ".join(
            words[
                i:i + chunk_size
            ]
        )

        if chunk.strip():

            chunks.append(
                chunk
            )

    return chunks


# ============================================================
# INGEST DOCUMENTS
# ============================================================

def ingest_documents():

    documents = list(
        DOCUMENTS_DIR.glob(
            "*.md"
        )
    )

    if not documents:

        print(
            "No knowledge documents found."
        )

        return


    total_chunks = 0


    for document_path in documents:

        print()

        print(
            f"Processing: "
            f"{document_path.name}"
        )


        text = document_path.read_text(
            encoding="utf-8"
        )


        chunks = chunk_text(
            text
        )


        for index, chunk in enumerate(
            chunks
        ):

            document_id = (
                f"{document_path.stem}"
                f"_{index}"
            )


            collection.upsert(

                ids=[
                    document_id
                ],

                documents=[
                    chunk
                ],

                metadatas=[

                    {
                        "source":
                            document_path.name,

                        "chunk":
                            index
                    }

                ]
            )


            total_chunks += 1


    print()

    print("=" * 60)

    print(
        "SUDARSHANA-AI RAG INGESTION"
    )

    print("=" * 60)

    print(
        f"Documents : "
        f"{len(documents)}"
    )

    print(
        f"Chunks    : "
        f"{total_chunks}"
    )

    print(
        f"Vector DB : "
        f"{VECTOR_STORE_DIR}"
    )

    print("=" * 60)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    ingest_documents()