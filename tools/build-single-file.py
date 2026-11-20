# Build YazFit-Demo.html — a single self-contained file (no server/host needed).
# Inlines CSS, all JS, and both photos as base64 data URIs. Service worker is
# skipped automatically on file:// (guarded in app-core.js).
# Usage:  python tools/build-single-file.py
import base64
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "deploy" / "YazFit-Demo.html"

def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")

def jpg_uri(p: Path) -> str:
    return "data:image/jpeg;base64," + base64.b64encode(p.read_bytes()).decode("ascii")

def svg_uri(p: Path) -> str:
    return "data:image/svg+xml;base64," + base64.b64encode(p.read_bytes()).decode("ascii")

html = read(ROOT / "index.html")
css = read(ROOT / "styles.css")

# 1) images -> data URIs (CSS: app background + landing hero)
hero_bg = jpg_uri(ROOT / "assets" / "hero-bg.jpg")
css = css.replace('url("assets/hero-bg.jpg")', f'url("{hero_bg}")')

# 2) inline stylesheet
css_tag = "<style>\n" + css + "\n</style>"
assert '<link rel="stylesheet" href="styles.css">' in html
html = html.replace('<link rel="stylesheet" href="styles.css">', css_tag)

# 3) inline scripts (load order preserved)
for jsf in ["data.js", "engine.js", "app-views.js", "app-core.js"]:
    js = read(ROOT / jsf)
    if "</script" in js:
        sys.exit(f"FATAL: {jsf} contains </script - cannot inline safely")
    js = js.replace('src="assets/yazfit-hero.jpg"', f'src="{jpg_uri(ROOT / "assets" / "yazfit-hero.jpg")}"')
    tag = f'<script src="{jsf}"></script>'
    assert tag in html, f"missing {tag}"
    html = html.replace(tag, "<script>\n" + js + "\n</script>")

# 4) drop server/PWA-only links (file:// has no manifest / sw)
html = html.replace('<link rel="manifest" href="manifest.json">\n', "")
html = html.replace('<link rel="apple-touch-icon" href="icons/icon.svg">\n', "")
html = html.replace(
    '<link rel="icon" href="icons/icon.svg" type="image/svg+xml">',
    f'<link rel="icon" href="{svg_uri(ROOT / "icons" / "icon.svg")}" type="image/svg+xml">'
)

# 5) banner comment + integrity checks
html = html.replace(
    "<!DOCTYPE html>",
    "<!DOCTYPE html>\n<!-- YazFit portable demo - single self-contained file (no server needed).\n     Regenerate with: python tools/build-single-file.py -->",
    1,
)
for bad in ['src="assets/', 'href="styles.css"', '<script src=', 'href="manifest.json"']:
    if bad in html:
        sys.exit(f"FATAL: external reference remains: {bad}")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding="utf-8")
print(f"built: {OUT}  ({OUT.stat().st_size / 1024:.0f} KB)")
