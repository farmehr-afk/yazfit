# Build YazFit-Demo.html — a single self-contained, DEMO-labeled file
# (no server/host needed, optimized images for messenger transfer).
# Inlines CSS, all JS, and photos as base64 data URIs. Injects
# window.FP_DEMO=true so the app shows DEMO badges and simulated-payment
# notices. Service worker is skipped automatically on file://.
# Usage:  python tools/build-single-file.py
import base64
import io
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "deploy" / "YazFit-Demo.html"

def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")

def jpg_datauri(p: Path, max_w: int, quality: int) -> str:
    """Resize + recompress for messenger-friendly size, then encode."""
    img = Image.open(p).convert("RGB")
    if img.width > max_w:
        img = img.resize((max_w, round(img.height * max_w / img.width)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")

def svg_uri(p: Path) -> str:
    return "data:image/svg+xml;base64," + base64.b64encode(p.read_bytes()).decode("ascii")

html = read(ROOT / "index.html")
css = read(ROOT / "styles.css")

# 1) images -> optimized data URIs
hero_bg = jpg_datauri(ROOT / "assets" / "hero-bg.jpg", max_w=720, quality=70)
hero_banner = jpg_datauri(ROOT / "assets" / "yazfit-hero.jpg", max_w=1120, quality=70)
css = css.replace('url("assets/hero-bg.jpg")', f'url("{hero_bg}")')

# 2) inline stylesheet
css_tag = "<style>\n" + css + "\n</style>"
assert '<link rel="stylesheet" href="styles.css">' in html
html = html.replace('<link rel="stylesheet" href="styles.css">', css_tag)

# 3) inline scripts (load order preserved); inject DEMO flag before app-core
for jsf in ["data.js", "engine.js", "app-views.js", "app-core.js"]:
    js = read(ROOT / jsf)
    if "</script" in js:
        sys.exit(f"FATAL: {jsf} contains </script - cannot inline safely")
    if jsf == "app-core.js":
        js = "window.FP_DEMO=true;\n" + js
    js = js.replace('src="assets/yazfit-hero.jpg"', f'src="{hero_banner}"')
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
    "<!DOCTYPE html>\n<!-- YazFit DEMO - single self-contained file, payments simulated.\n"
    "     Send it via any messenger; opens by double-click. No server needed.\n"
    "     Regenerate with: python tools/build-single-file.py -->",
    1,
)
for bad in ['src="assets/', 'href="styles.css"', '<script src=', 'href="manifest.json"']:
    if bad in html:
        sys.exit(f"FATAL: external reference remains: {bad}")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding="utf-8")
print(f"built: {OUT}  ({OUT.stat().st_size / 1024:.0f} KB, demo-labeled)")
