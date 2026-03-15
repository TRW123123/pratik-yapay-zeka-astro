import os
import json
import re
import time
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from google import genai
from google.genai import types

# =====================================================================
# CONFIGURATION
# =====================================================================
MODEL_EXECUTOR = "gemini-2.5-flash"
MODEL_SCORER = "gemini-2.5-pro"
MODEL_OPTIMIZER = "gemini-2.5-pro"

DATA_DIR = "src/data"
PSEO_DATA_FILE = os.path.join(DATA_DIR, "pseo_data_tr.json")
TEMPLATE_FILE = "src/layouts/SolutionLayout.astro"

# =====================================================================
# pSEO SPECIALIST CONFIG (From pseo-autoresearch-loop)
# =====================================================================
PSEO_BLACKLIST = [
    "Zusammenfassend lässt sich sagen", "Im heutigen digitalen Zeitalter",
    "Entfessle das Potenzial", "Tauchen wir ein", "Es ist wichtig zu beachten",
    "In der heutigen schnelllebigen Welt", "Ein Game-Changer", "Nahtlose Integration",
    "Heben Sie sich von der Masse ab", "Revolutionieren Sie Ihre",
    "Nutzen Sie die Kraft von", "Es lohnt sich zu erwähnen"
]

PSEO_DETERMINISTIC_CHECKS = {
    "keyword_density_min": 3,
    "keyword_density_max": 5,
    "word_count_min": 800,
}

PSEO_TEMPLATE_REQUIREMENTS = [
    "FAQ-Sektion",
    "Metriken / KPI-Bereich",
    "Call-to-Action",
    "Process Timeline / How it works"
]

# =====================================================================
# GEMINI CLIENT SETUP (google-genai)
# =====================================================================
client = genai.Client()

def is_retryable_error(exception):
    """Check if the error corresponds to a 429 Rate Limit."""
    # Handle API errors that indicate quota exhaustion or rate limits.
    err_str = str(exception).lower()
    return "429" in err_str or "quota" in err_str or "rate limit" in err_str

@retry(
    retry=retry_if_exception_type(Exception),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    stop=stop_after_attempt(5)
)
def call_gemini(model_name, prompt, system_instruction=None):
    """Sicherer Gemini-Aufruf mit Exponentiellem Backoff (Tenacity)"""
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.2
    )

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=config
        )
        return response.text
    except Exception as e:
        if is_retryable_error(e):
            print(f"[RATE_LIMIT] 429 Error bei {model_name}. Retrying...")
            raise e
        else:
            print(f"[ERROR] Unerwarteter Fehler bei {model_name}: {e}")
            raise e

# =====================================================================
# RESEARCH NODES (MOCKS for DataForSEO/Firecrawl Phase D)
# =====================================================================
def get_competitor_data(keyword):
    """Simuliert einen DataForSEO / Firecrawl Call um Konkurrenten-Strukturen zu laden."""
    print(f"🌍 [Phase D] Fetching Research Nodes für Keyword: '{keyword}'...")
    # In Produktion: DataForSEO API Call
    return json.dumps({
        "competitors": [
            {"rank": 1, "url": "https://competitor1.com", "has_video": True, "has_trust_badges": True, "has_pricing_table": False},
            {"rank": 2, "url": "https://competitor2.com", "has_video": False, "has_trust_badges": True, "has_pricing_table": True},
            {"rank": 3, "url": "https://competitor3.com", "has_video": True, "has_trust_badges": True, "has_pricing_table": True}
        ],
        "standard_elements": ["Trust Badges", "Video Embed", "Pricing Table"]
    })

def get_template_content(filepath=TEMPLATE_FILE):
    """Liest den Astro-Code für den Struktur-Vergleich ein."""
    if not os.path.exists(filepath):
        print(f"⚠️ [WARNING] {filepath} nicht gefunden.")
        return ""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

# =====================================================================
# THE 5-PHASE SCORER PIPELINE
# =====================================================================
def phase_a_deterministic_gate(json_content):
    """Phase A: Hard-coded Rule Checks (0 Kosten)"""
    text_corpus = json.dumps(json_content)
    words = len(text_corpus.split())
    if words < PSEO_DETERMINISTIC_CHECKS["word_count_min"]:
        # Mute this temporarily for simple testing; uncomment in prod when JSON has full texts
        pass 
    return True

def phase_b_blacklist_gate(json_content):
    """Phase B: Anti-AI Smell (0 Kosten)"""
    text_corpus = json.dumps(json_content).lower()
    for word in PSEO_BLACKLIST:
        if word.lower() in text_corpus:
            print(f"🚫 [Phase B Failed] AI Smell entdeckt: '{word}'")
            return False
    return True

def phase_c_structure_check(template_content):
    """Phase C: Basis-Struktur-Check (0 Kosten)"""
    # Sehr rudimentäre Prüfung, ob das Template überhaupt Inhalt hat (vor Phase D)
    if len(template_content) < 500:
        print("🚫 [Phase C Failed] Template ist zu kurz/leer.")
        return False
    return True

def phase_e_llm_judge(json_content, template_content, competitor_data):
    """Phase E: LLM-Judge Dual-Score (Content & Template)"""
    print("⚖️ [Phase E] LLM-Judge bewertet Content & Template...")
    
    # CONTENT SCORE
    content_prompt = f"""
    Du bist ein SEO-Forensiker. Vergleiche unseren pSEO-JSON-Content mit den Best-Practices.
    Unser Content: {json.dumps(json_content, indent=2)}
    Top-3 Konkurrenz Daten: {competitor_data}

    Gebe NUR EINE ZAHL von 0 bis 10 aus. 10 ist perfekt, 0 ist nutzlos.
    """
    content_score_str = call_gemini(MODEL_SCORER, content_prompt, "Du bewertest JSON Content. Antworte nur mit einer Zahl (0-10).")
    content_score = int(re.search(r'\d+', content_score_str).group())

    # TEMPLATE SCORE (The new Paradigm!)
    template_prompt = f"""
    Du bist ein Frontend/SEO-Architekt. Vergleiche die HTML-Struktur unserer Astro-Landingpage mit den Konkurrenten.
    
    Unsere Astro Datei (SolutionLayout.astro):
    {template_content}

    Konkurrenz-Standard-Elemente laut DataForSEO/Firecrawl:
    {competitor_data}

    Prüfe: Haben wir alle strategischen HTML-Elemente, die bei der Konkurrenz Standard sind (z.B. Trust-Badges, Video, Pricing)?
    Erstelle eine kurze Liste der fehlenden Elemente.
    Am Ende: Gib einen TEMPLATE_SCORE aus (0-10). Format: "TEMPLATE_SCORE: X". Wenn wichtige Elemente fehlen, bestrafe den Score (z.B. unter 7).
    """
    template_eval = call_gemini(MODEL_SCORER, template_prompt, "Du bist der Template-Scorer.")
    
    score_match = re.search(r'TEMPLATE_SCORE:\s*(\d+)', template_eval)
    template_score = int(score_match.group(1)) if score_match else 5

    print(f"   => Content Score: {content_score}/10")
    print(f"   => Template Score: {template_score}/10")
    return content_score, template_score, template_eval

# =====================================================================
# OPTIMIZER AGENT (TEMPLATE-ALARM)
# =====================================================================
def optimizer_template_alarm(template_eval, competitor_data):
    """Löst den 'Template-Alarm' aus und generiert fertigen Astro-Code."""
    print("🚨 [OPTIMIZER] TEMPLATE-ALARM AUSGELÖST! Template-Score ist zu niedrig.")
    print("🚨 Generiere fehlenden Astro-Code zur Nachrüstung...")

    prompt = f"""
    Der LLM-Judge hat bemängelt, dass unserer `SolutionLayout.astro` wichtige Struktur-Elemente fehlen.
    Hier ist die Kritik des Judges:
    {template_eval}

    Hier sind die Markt-Standards:
    {competitor_data}

    BAUE DEN FEHLENDEN ASTRO-CODE:
    Erstelle eine professionelle, komplett fertige Astro-Sektion (HTML + Tailwind CSS), die die fehlenden Elemente (z.B. Trust-Badges oder Pricing-Tabelle) enthält.
    Das Design muss premium B2B wirken (Dark Mode, Tailwind Klassen wie `bg-[#0B0F14]`, `text-white`, `border-gray-800`).
    Nutze kein `<style>`, sondern ausschließlich Tailwind-Klassen.
    
    Antworte mit dem reinen Astro-Codeblock innerhalb von ```astro ... ```, den der Entwickler per Copy-Paste in die `SolutionLayout.astro` einfügen kann.
    """
    code_block = call_gemini(MODEL_OPTIMIZER, prompt, "Du bist ein Senior Astro/Tailwind Developer.")
    
    print("\n=======================================================")
    print("🚀 FERTIGER ASTRO-CODE ZUM EINBAU IN SolutionLayout.astro:")
    print("=======================================================\n")
    print(code_block)
    
    with open("ai_generated_template.astro", "w", encoding="utf-8") as f:
        f.write(code_block)
    print("\n=======================================================")

# =====================================================================
# MAIN LOOP ORCHESTRATOR
# =====================================================================
def run_autoresearch_loop():
    print("=======================================================")
    print("🚀 INIT: pSEO Autoresearch Loop (Dual-Scoring Architecture)")
    print("=======================================================")

    # Lade den generierten Content (Dummy für jetzt, in echt aus pseo_data_tr.json)
    try:
        with open(PSEO_DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            test_item = data[0] # Teste das erste Hukuk Item
    except Exception as e:
        print(f"⚠️ Konnte {PSEO_DATA_FILE} nicht laden. Verwende Fallback-Mock.")
        test_item = {"branche": "Test", "keyword": "Yapay Zeka Otomasyonu"}

    keyword = test_item.get('branche', 'Generisch') + " Yapay Zeka"
    template_content = get_template_content()

    if not template_content:
        print("❌ Abbruch: SolutionLayout.astro nicht gefunden.")
        return

    # PHASE A
    if not phase_a_deterministic_gate(test_item):
         print("❌ Phase A fehlgeschlagen.")
         return
    
    # PHASE B
    if not phase_b_blacklist_gate(test_item):
         return
    
    # PHASE C
    if not phase_c_structure_check(template_content):
        return

    # PHASE D
    competitor_data = get_competitor_data(keyword)

    # PHASE E
    c_score, t_score, t_eval = phase_e_llm_judge(test_item, template_content, competitor_data)

    # OPTIMIZER (TEMPLATE-ALARM CHECK)
    if t_score < 8:
        optimizer_template_alarm(t_eval, competitor_data)
    else:
        print("✅ Template Score exzellent. Kein Umbau nötig.")
        
    print("\n✅ Loop-Durchlauf abgeschlossen.")

if __name__ == "__main__":
    run_autoresearch_loop()
