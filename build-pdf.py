"""Build elaf-yousf-obeid-cv.pdf from cv-print.html.

Usage:  python3 build-pdf.py          (keeps highlighted "to verify" fields)
        python3 build-pdf.py --clean  (removes the highlight, for the final version)
Requires: pip install playwright && playwright install chromium
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent
clean = "--clean" in sys.argv

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto((root / "cv-print.html").as_uri())
    page.evaluate("document.fonts.ready")
    if clean:
        page.evaluate("document.body.classList.add('clean');document.querySelectorAll('.contact li').forEach(l=>{if(l.textContent.includes('[أضف'))l.remove()})")
    page.pdf(path=str(root / "elaf-yousf-obeid-cv.pdf"), prefer_css_page_size=True,
             print_background=True)
    browser.close()
print("written:", root / "elaf-yousf-obeid-cv.pdf")
