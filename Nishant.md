import os
import json
import requests

# -------------------------------
# Config
# -------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", "https://gemini.internal.gateway/v1")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Endpoint (adjust if different in your infra)
ENDPOINT = f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent"

# -------------------------------
# Helper: Call Gemini LLM
# -------------------------------
def call_llm(prompt: str, code_context: str) -> str:
    """
    Calls the LLM with a combined prompt + repo context.
    Returns raw text response from Gemini.
    """
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{prompt}\n\nHere is the repo context:\n{code_context}"}
                ]
            }
        ]
    }

    response = requests.post(ENDPOINT, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()

    # Gemini returns text in nested structure
    return data["candidates"][0]["content"]["parts"][0]["text"]

# -------------------------------
# Parent DAG generator
# -------------------------------
def generate_parent_dag():
    # Step 1: Load repo context
    with open("./artifacts/gitingest.txt", "r") as f:
        repo_context = f.read()

    # Step 2: Load DAG generation prompt
    with open("./artifacts/ParentDAGprompt.txt", "r") as f:
        dag_prompt = f.read()

    # Step 3: Call LLM
    llm_response = call_llm(dag_prompt, repo_context)

    # Step 4: Expect LLM to return a JSON
    try:
        parsed_output = json.loads(llm_response)
    except json.JSONDecodeError:
        # If LLM returns non-JSON, wrap it safely
        parsed_output = {
            "graphDefinition": "",
            "nodes": {},
            "raw_output": llm_response
        }

    # Step 5: Save output JSON
    with open("./artifacts/ParentDAGoutput.json", "w") as f:
        json.dump(parsed_output, f, indent=2)

    print("✅ Parent DAG generated at ./artifacts/ParentDAGoutput.json")

if __name__ == "__main__":
    generate_parent_dag()
