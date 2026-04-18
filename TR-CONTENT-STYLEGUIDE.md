# TR Content Styleguide — yapayzekapratik.com

**Status:** BEST PRACTICE · Hard Rule · Stand 2026-04-18
**Gilt für:** Alle user-facing deutschen und türkischen Inhalte dieser Site
**Autorität:** DataForSEO-Verifikation (Google Türkei, April 2026) + SEO-Audit 2026-04-04

---

## TL;DR für Agenten & Daily Sessions

**Sichtbarer türkischer Text auf der Site IMMER mit korrekten Diakritika schreiben.**
**URL-Slugs, Filenames, technische Identifier IMMER ASCII.**

---

## Warum (Evidenz, nicht Meinung)

### DataForSEO Google Türkei Volumen-Split (April 2026)

| Keyword-Paar | Diakritika | ASCII | Split |
|---|---:|---:|:---:|
| **kıdem tazminatı hesaplama** | **201.000/Mo** | 8.100/Mo | **25 : 1** |
| ihbar tazminatı hesaplama | 27.100 | 27.100 | merged |
| maaş hesaplama | 90.500 | 90.500 | merged |
| müşteri takip programı | 170 | 170 | merged |
| süreç otomasyonu | 10 | 0 | only diacritics |

**Zwei Muster:**
1. **Google-normalisierte Paare** (merged) → gleicher Volumen-Pool, aber SERP-CTR leidet bei ASCII (wirkt für TR-Leser wie Tippfehler).
2. **Nicht-normalisierte Paare** (z.B. kıdem) → harter 25× Split. ASCII verliert 96% Volumen.

Da `kıdem tazminatı hesaplama` der Top-Calculator der Site ist, ist die Diakritika-Pflicht für diese Domain nicht verhandelbar.

### Sekundäre Referenzen
- John Mueller (Google Search Central): *"Use the characters and language your users actually type."*
- Turkish NLP standard: UTF-8 mit vollem ISO/IEC 10646 Subset (ş ı ğ ç ö ü İ Ş Ğ Ç Ö Ü).
- Internes SEO-Audit 2026-04-04 Issue #9: "Poor localization signals" durch gestrippte Diakritika in Titles.

---

## Regeln

### ✅ MIT Diakritika schreiben

- **Alle `<h1>`, `<h2>`, `<h3>`, `<p>`, Button-Labels, Nav-Items, CTAs, FAQ-Fragen/Antworten**
- **Meta-Titles** (`<title>`)
- **Meta-Descriptions** (`<meta name="description">`)
- **Open Graph Titles & Descriptions**
- **Schema.org `name` und `description` Felder**
- **Alt-Texte von Bildern**
- **Breadcrumb-Labels**
- **Blog-Post-Titles & -Bodies**
- **Case-Study-Titles, Challenge/Solution/Results-Sections**
- **Calculator-Prosa & Label-Texte**
- **Form-Labels, Placeholder, Validation-Messages**

### ❌ OHNE Diakritika (ASCII) lassen

- **URL-Slugs** (`/kidem-tazminati-hesaplama/`, NICHT `/kıdem-tazminatı-hesaplama/`)
- **Filenames** (`kidem-tazminati-hesaplama.astro`)
- **Canonical-URLs**
- **Redirect-Targets**
- **Astro/TS Import-Paths**
- **CSS-Klassen / IDs**
- **data-\* Attribute**
- **JSON-Keys**
- **Git-Branch-Namen**
- **Environment-Variablen**

### Spezialregeln

- **Eigennamen / Loanwords bleiben wie im Original:**
  `Istanbul` ✅ (nicht `İstanbul`, da offizielle TR-UN-Schreibweise beide zulässt, aber Latin-Standard ohne Punkt ist in DE/EN-Context üblich)
  → Exception: bei offizieller, lokaler Kommunikation `İstanbul` verwenden.
- **Markennamen bleiben wie vom Eigentümer geschrieben:**
  `Acilsatis` (Marke), `Şafak Tepecik` (Person mit ş), `Cemkimsan` (Marke).
- **Englische Fachwörter** (`SaaS`, `CRM`, `API`, `Lead`, `Workflow`, `Dashboard`, `B2B`) bleiben Englisch.
- **Zahlen & Einheiten** bleiben im TR-Format: `1.200,50 ₺`, `%45`, `5 gün`.

---

## Konversions-Cheatsheet (ASCII → TR)

| ASCII | → | TR | Beispiel |
|---|---|---|---|
| `i` | → | `ı` | kidem → **kı**dem, takip programi → takip programı |
| `u` | → | `ü` | musteri → m**ü**steri, sure → s**ü**re, kucuk → k**ü**çük |
| `o` | → | `ö` | cozum → ç**ö**züm, gorunum → g**ö**rünüm |
| `s` | → | `ş` | irket → **ş**irket, ialem → i**ş**lem, musteri → mü**ş**teri |
| `c` | → | `ç` | ozum → **ç**özüm, eitli → **ç**eşitli |
| `g` | → | `ğ` | saglik → sa**ğ**lık, yagmur → ya**ğ**mur |

### Häufige Wörter (Copy-Paste-Referenz)

```
kidem tazminati        → kıdem tazminatı
ihbar tazminati        → ihbar tazminatı
maas hesaplama         → maaş hesaplama (merged, aber ş für CTR)
musteri                → müşteri
musteri takip          → müşteri takibi / müşteri takip
sirket                 → şirket
isletme                → işletme
sureç                  → süreç
surec otomasyonu       → süreç otomasyonu
cozumler               → çözümler
cozum                  → çözüm
iletisim               → iletişim
hakkimizda             → hakkımızda
basari                 → başarı
iscilik maliyeti       → işçilik maliyeti
goruntu                → görüntü
yonetim                → yönetim
muhasebe               → muhasebe (bleibt)
fatura                 → fatura (bleibt)
vergi                  → vergi (bleibt)
satis                  → satış
pazarlama              → pazarlama (bleibt)
on muhasebe            → ön muhasebe
is                     → iş
isci                   → işçi
calisma                → çalışma
calisan                → çalışan
yapay zeka             → yapay zeka (bleibt)
otomasyon              → otomasyon (bleibt)
uretim                 → üretim
urun                   → ürün
siparis                → sipariş
donusum                → dönüşüm
```

---

## Für Daily-Agents & neue Sessions

**Wenn du neuen TR-Content generierst oder bestehenden editierst:**

1. Schreibe sofort in korrektem Türkisch (mit Diakritika).
2. Prüfe bestehende Strings auf Encoding-Drift (häufig: `i` statt `ı`, `s` statt `ş`).
3. **Ändere NIE** Slugs/URLs/Filenames nachträglich ohne Redirect-Plan.
4. Bei Zweifel: diese Datei lesen, dann arbeiten.

### Quick-Check beim Review
```bash
# Alle Body-Strings scannen die ASCII-TR Verdacht haben:
grep -rE "musteri|sirket|cozum|surec|kidem|iscilik|hakkimizda" src/pages/ src/components/ src/layouts/
```
Treffer = potenzielle Encoding-Issue. Ausnahmen: Slugs, Filenames, URLs.

---

## Audit-Historie

- **2026-04-04:** SEO Audit (Session cae0333f) — Issue #9 flaggt Stripped Diacritics in Titles. Ging im Consolidated Report unter.
- **2026-04-18:** DataForSEO-Verifikation (kıdem 25:1), Sweep ausgeführt, Styleguide etabliert.

---
