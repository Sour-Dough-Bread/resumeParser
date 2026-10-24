import os
import sys

# Configure UTF-8 for Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import uvicorn
from backend.ollama_service import is_ollama_alive, get_installed_models


def main():
    print("=" * 65)
    print("  🚀 ResuGemma 4 — ATS Resume Parser & Optimizer")
    print("  Powered by Google Gemma 4 via local Ollama API")
    print("  Template: Jake's Resume Standard (ATS Optimized)")
    print("=" * 65)

    if not is_ollama_alive():
        print("\n[!] WARNING: Ollama does not seem to be running on http://localhost:11434")
        print("    Please run 'ollama serve' in your terminal if not already running.\n")
    else:
        print("\n[✓] Ollama daemon is ONLINE.")
        models = get_installed_models()
        model_names = [m.get("name") for m in models]
        print(f"[✓] Available models in Ollama: {', '.join(model_names) if model_names else 'None'}")
        if any("gemma4" in m.lower() for m in model_names):
            print("[✓] Found 'gemma4:latest' — Ready for ATS resume parsing & tailoring!\n")
        else:
            print("[!] Note: 'gemma4:latest' not found in model list. Defaulting to available model or pull with: ollama pull gemma4\n")

    port = 8000
    host = "127.0.0.1"
    url = f"http://{host}:{port}"
    print(f"[*] Starting ResuGemma Web UI at: {url}")
    print("[*] Open your browser and navigate to the link above.\n")

    uvicorn.run(
        "backend.app:app", 
        host=host, 
        port=port, 
        reload=False,
        log_level="info"
    )

if __name__ == "__main__":
    main()
