"""Download first-party imagery from the public Dental Atelier site as WebP.

Requires Pillow: python -m pip install Pillow
Run from any directory: python scripts/download_site_images.py
Original source files are converted in memory and are not written to disk.
"""

from __future__ import annotations

import io
import json
import re
import sys
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

BASE_URL = "https://www.dentalatelier.co/"
KNOWN_PAGES = [
    "about-us.html",
    "products-and-materials.html",
    "services.html",
    "portfolio.html",
    "faqs.html",
    "contact-us.html",
    "sexy-and-powerful-smile.html",
    "comfort-and-self-confidence.html",
    "looking-young-feeling-healthy.html",
    "facial-analysis-and-digital-smile-design.html",
    "smile-check-form.html",
]
ALLOWED_HOSTS = {"www.dentalatelier.co", "dentalatelier.co"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff"}
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "images"
MANIFEST_PATH = OUTPUT_DIR / "asset-manifest.json"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
)


@dataclass
class ImageReference:
    url: str
    page: str
    alt: str = ""
    title: str = ""


class PageParser(HTMLParser):
    def __init__(self, page_url: str) -> None:
        super().__init__(convert_charrefs=True)
        self.page_url = page_url
        self.images: list[tuple[str, str, str]] = []
        self.links: list[str] = []
        self.stylesheets: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {name.lower(): value or "" for name, value in attrs}
        if tag == "a" and attributes.get("href"):
            self.links.append(urljoin(self.page_url, attributes["href"]))
        if (
            tag == "link"
            and "stylesheet" in attributes.get("rel", "").lower()
            and attributes.get("href")
        ):
            self.stylesheets.append(urljoin(self.page_url, attributes["href"]))
        if tag in {"img", "source"}:
            src = (
                attributes.get("src")
                or attributes.get("data-src")
                or attributes.get("data-original")
            )
            if src:
                self.images.append(
                    (
                        urljoin(self.page_url, src),
                        attributes.get("alt", ""),
                        attributes.get("title", ""),
                    )
                )
            srcset = attributes.get("srcset") or attributes.get("data-srcset", "")
            for candidate in srcset.split(","):
                candidate_url = candidate.strip().split(" ")[0]
                if candidate_url:
                    self.images.append(
                        (
                            urljoin(self.page_url, candidate_url),
                            attributes.get("alt", ""),
                            attributes.get("title", ""),
                        )
                    )
        if attributes.get("style"):
            for source in re.findall(
                r"url\(\s*['\"]?([^'\")]+)", attributes["style"], flags=re.IGNORECASE
            ):
                self.images.append(
                    (
                        urljoin(self.page_url, source.strip()),
                        attributes.get("alt", ""),
                        attributes.get("title", ""),
                    )
                )


def fetch(url: str) -> tuple[bytes, str]:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
    with urlopen(request, timeout=30) as response:
        return response.read(), response.headers.get("Content-Type", "")


def is_first_party(url: str) -> bool:
    return (urlsplit(url).hostname or "").lower() in ALLOWED_HOSTS


def is_image_url(url: str) -> bool:
    return Path(unquote(urlsplit(url).path)).suffix.lower() in IMAGE_EXTENSIONS


def normalize_url(url: str) -> str:
    parts = urlsplit(url)
    host = (parts.hostname or "").lower()
    netloc = "www.dentalatelier.co" if host in ALLOWED_HOSTS else parts.netloc
    return urlunsplit(("https", netloc, parts.path, parts.query, ""))


def page_slug(url: str) -> str:
    path = Path(unquote(urlsplit(url).path)).stem.lower()
    return "home" if path in {"", ".", "index", "home"} else slugify(path)


def slugify(value: str) -> str:
    value = unquote(value).lower()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", value)).strip("-")


def filename_for(reference: ImageReference, index: int) -> str:
    path = unquote(urlsplit(reference.url).path).lower()
    slider = re.search(r"/_slider/([1-4])-([1-9])\.[a-z0-9]+$", path)
    if slider:
        section = {
            "1": "sexy-powerful-smile",
            "2": "comfort-self-confidence",
            "3": "looking-young-feeling-healthy",
            "4": "smile-check",
        }[slider.group(1)]
        return f"hero-{section}-slide-{int(slider.group(2)):02d}"
    if "logo-white" in path:
        return "brand-dental-atelier-logo-white"
    if path.endswith("/miso.jpg") or "/miso." in path:
        return "about-michal-siakel-portrait"
    lab_image = re.search(r"/lab/(\d+)\.[a-z0-9]+$", path)
    if lab_image:
        return f"about-dental-lab-photo-{int(lab_image.group(1)):02d}"
    if path.endswith("/_before.jpg"):
        return "portfolio-smile-before"
    if path.endswith("/_after.jpg"):
        return "portfolio-smile-after"
    if path.endswith("/map.png"):
        return "contact-dental-atelier-location-map"
    if path.endswith("/_design/bg.jpg"):
        return "site-background"

    label = slugify(reference.alt or reference.title)
    source_name = slugify(Path(path).stem)
    context = label or source_name
    if not context or context.isdigit():
        context = f"image-{index:02d}"
    return f"{page_slug(reference.page)}-{context}"


def collect_references() -> list[ImageReference]:
    pending = [BASE_URL, *(urljoin(BASE_URL, page) for page in KNOWN_PAGES)]
    visited: set[str] = set()
    references: dict[str, ImageReference] = {}
    css_urls: set[str] = set()

    while pending and len(visited) < 60:
        page_url = normalize_url(pending.pop(0))
        if page_url in visited or not is_first_party(page_url):
            continue
        visited.add(page_url)
        try:
            body, _ = fetch(page_url)
        except (HTTPError, URLError, TimeoutError) as error:
            print(f"Skip page {page_url}: {error}", file=sys.stderr)
            continue

        parser = PageParser(page_url)
        parser.feed(body.decode("utf-8", "ignore"))
        for src, alt, title in parser.images:
            image_url = normalize_url(src)
            if is_first_party(image_url) and is_image_url(image_url):
                references.setdefault(
                    image_url,
                    ImageReference(image_url, page_url, alt.strip(), title.strip()),
                )

        for stylesheet in parser.stylesheets:
            if is_first_party(stylesheet):
                css_urls.add(normalize_url(stylesheet))

        for link in parser.links:
            link = normalize_url(link)
            if urlsplit(link).path.startswith("/cdn-cgi/"):
                continue
            if (
                is_first_party(link)
                and urlsplit(link).path.lower().endswith((".html", ".htm"))
                and link not in visited
            ):
                pending.append(link)
            elif is_first_party(link) and is_image_url(link):
                references.setdefault(link, ImageReference(link, page_url))

    for stylesheet in sorted(css_urls):
        try:
            stylesheet_body, _ = fetch(stylesheet)
        except (HTTPError, URLError, TimeoutError) as error:
            print(f"Skip stylesheet {stylesheet}: {error}", file=sys.stderr)
            continue
        css = stylesheet_body.decode("utf-8", "ignore")
        for source in re.findall(r"url\(\s*['\"]?([^'\")]+)", css, flags=re.IGNORECASE):
            image_url = normalize_url(urljoin(stylesheet, source.strip()))
            if is_first_party(image_url) and is_image_url(image_url):
                references.setdefault(image_url, ImageReference(image_url, stylesheet))

    return list(references.values())


def convert_image(source: bytes, destination: Path) -> tuple[int, int, str]:
    with Image.open(io.BytesIO(source)) as original:
        original_format = (original.format or "unknown").upper()
        original.seek(0)
        image = ImageOps.exif_transpose(original.copy())
        if "A" in image.getbands() or "transparency" in image.info:
            image = image.convert("RGBA")
        else:
            image = image.convert("RGB")
        width, height = image.size
        image.save(destination, format="WEBP", quality=88, method=6)
        return width, height, original_format


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    previous_files: set[Path] = set()
    if MANIFEST_PATH.exists():
        try:
            previous_manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
            previous_files = {
                OUTPUT_DIR / Path(item["file"]).name
                for item in previous_manifest
                if isinstance(item, dict) and isinstance(item.get("file"), str)
            }
        except (json.JSONDecodeError, OSError):
            previous_files = set()

    references = collect_references()
    manifest: list[dict[str, object]] = []
    used_names: set[str] = set()
    failures: list[str] = []

    for index, reference in enumerate(references, start=1):
        base_name = filename_for(reference, index)
        name = base_name
        suffix = 2
        while name in used_names:
            name = f"{base_name}-{suffix:02d}"
            suffix += 1
        used_names.add(name)
        destination = OUTPUT_DIR / f"{name}.webp"

        try:
            source, content_type = fetch(reference.url)
            if not content_type.lower().startswith("image/"):
                raise ValueError(
                    f"unexpected content type: {content_type or 'missing'}"
                )
            width, height, original_format = convert_image(source, destination)
            manifest.append(
                {
                    "file": f"/images/{destination.name}",
                    "source": reference.url,
                    "page": reference.page,
                    "alt": reference.alt,
                    "width": width,
                    "height": height,
                    "sourceFormat": original_format,
                    "webpBytes": destination.stat().st_size,
                }
            )
            print(f"{destination.name} ({width}x{height})")
        except (HTTPError, URLError, TimeoutError, OSError, ValueError) as error:
            failures.append(f"{reference.url}: {error}")

    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    if not failures:
        current_files = {OUTPUT_DIR / Path(str(item["file"])).name for item in manifest}
        for stale_file in previous_files - current_files:
            if stale_file.parent == OUTPUT_DIR and stale_file.suffix.lower() == ".webp":
                stale_file.unlink(missing_ok=True)
    print(
        f"\nConverted {len(manifest)} of {len(references)} first-party images to WebP in {OUTPUT_DIR}"
    )
    if failures:
        print("\nFailed sources:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
