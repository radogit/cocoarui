// exportSquareSVG("figure.svg");
// exportSquarePNG("figure.png");
// exportSquarePNG("figure-4x.png", 4); // publication-quality

// =======================================
//  EXPORT CLEAN SVG  (only visible nodes)
// =======================================
window.exportSVG = function(filename = "export.svg") {

    const svg = document.querySelector("svg");
    if (!svg) {
        console.error("No <svg> found on page.");
        return;
    }

    // 1) Deep clone so we can prune hidden things safely
    const clone = svg.cloneNode(true);

    // 2) Remove all elements with class "hidden" or display:none or visibility:hidden
    const isHidden = el => {
        const style = window.getComputedStyle(el);
        return (
            style.display === "none" ||
            style.visibility === "hidden" ||
            el.classList.contains("hidden")
        );
    };

    // Recursive prune
    const prune = (el) => {
        [...el.children].forEach(child => {
            if (isHidden(child)) {
                child.remove();
            } else {
                prune(child);
            }
        });
    };
    prune(clone);

    // 3) Inline all computed styles so SVG looks the same outside the browser
    inlineComputedStyles(clone);

    // 4) Serialize the final SVG
    const svgBlob = new Blob([clone.outerHTML], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    // 5) Download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    console.log("SVG exported:", filename);
};


// ==================================================
// Helper: Inline computed CSS styles into the SVG
// ==================================================
function inlineComputedStyles(svgEl) {
    const all = svgEl.querySelectorAll("*");
    all.forEach(el => {
        const computed = getComputedStyle(el);
        const style = [];

        for (let i = 0; i < computed.length; i++) {
            const prop = computed[i];
            const val = computed.getPropertyValue(prop);

            // only include relevant SVG properties (prevents bloat)
            if (prop.startsWith("stroke") ||
                prop.startsWith("fill") ||
                prop.startsWith("opacity") ||
                prop.startsWith("font") ||
                prop.startsWith("text") ||
                prop.startsWith("marker") ||
                prop.startsWith("visibility")) {
                style.push(`${prop}:${val}`);
            }
        }

        if (style.length > 0) {
            el.setAttribute("style", style.join(";"));
        }
    });
}

window.exportCroppedSVG = function(filename = "export.svg") {

    const svg = document.querySelector("svg");
    const container = document.querySelector("g.container");

    if (!svg || !container) {
        console.error("Missing <svg> or <g class='container'>");
        return;
    }

    // Clone the SVG so we can safely modify it
    const clone = svg.cloneNode(true);

    // Find container inside the clone
    const cloneContainer = clone.querySelector("g.container");

    // Compute bounding box BEFORE modifying structure
    const bbox = container.getBBox();  // content box

    // Apply cropping by setting viewBox and width/height
    clone.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    clone.setAttribute("width", bbox.width);
    clone.setAttribute("height", bbox.height);

    inlineComputedStyles(clone);

    // Serialize
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    console.log("Cropped SVG exported:", filename);
};

window.exportPNG = function(filename = "export.png", scale = 1) {
    const svg = document.querySelector("svg");
    const container = document.querySelector("g.container");

    if (!svg || !container) {
        console.error("Missing <svg> or <g class='container'>");
        return;
    }

    const bbox = container.getBBox();

    // First create a cropped SVG string
    const clone = svg.cloneNode(true);
    clone.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    clone.setAttribute("width", bbox.width);
    clone.setAttribute("height", bbox.height);

    inlineComputedStyles(clone);

    const svgString = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    // Convert SVG → Image
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = bbox.width * scale;
        canvas.height = bbox.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(blob => {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(pngUrl);
        });

        URL.revokeObjectURL(url);
    };
    img.src = url;
};

function inlineComputedStyles(svgEl) {
  svgEl.querySelectorAll("*").forEach(el => {
    const cs = getComputedStyle(el);
    const keep = [];

    for (let i = 0; i < cs.length; i++) {
      const prop = cs[i];
      if (
        prop.startsWith("fill") ||
        prop.startsWith("stroke") ||
        prop.startsWith("opacity") ||
        prop.startsWith("font") ||
        prop.startsWith("marker")
      ) {
        keep.push(`${prop}:${cs.getPropertyValue(prop)}`);
      }
    }

    if (keep.length) {
      el.setAttribute("style", keep.join(";"));
    }
  });
}
function triggerDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  a.remove();
}

function removeHiddenElements(svgEl) {
  const all = Array.from(svgEl.querySelectorAll("*"));

  all.forEach(el => {
    // If this element OR any ancestor has `.hidden`
    if (el.closest(".hidden")) {
      el.remove();
    }
  });
}

async function inlineSvgImages(svg) {
  const images = Array.from(svg.querySelectorAll("image"));

  await Promise.all(images.map(async img => {
    const href =
      img.getAttribute("href") ||
      img.getAttributeNS("http://www.w3.org/1999/xlink", "href");

    if (!href || href.startsWith("data:")) return;

    const res = await fetch(href);
    const blob = await res.blob();

    const dataUrl = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    img.setAttribute("href", dataUrl);
  }));
}

window.exportSquareSVG = async function (filename = "export-square.svg") {
  const svg = document.querySelector("svg");
  if (!svg) {
    console.error("SVG not found");
    return;
  }

  // Prefer viewBox if defined, otherwise fallback to layout size
  const vb = svg.viewBox.baseVal;
  const width  = vb && vb.width  ? vb.width  : svg.clientWidth;
  const height = vb && vb.height ? vb.height : svg.clientHeight;

  const size = Math.min(width, height);

  // Center crop
  const x = (width  - size) / 2;
  const y = (height - size) / 2;

  const clone = svg.cloneNode(true);

  clone.setAttribute("viewBox", `${x} ${y} ${size} ${size}`);
  clone.setAttribute("width",  size);
  clone.setAttribute("height", size);

  removeHiddenElements(clone);
  await inlineSvgImages(clone);
  inlineComputedStyles(clone);

  const blob = new Blob(
    [clone.outerHTML],
    { type: "image/svg+xml;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);

  console.log(`✓ Exported square SVG (${size}×${size})`);
};

window.exportSquarePNG = async function (
  filename = "export-square.png",
  scale = 1
) {
  const svg = document.querySelector("svg");
  if (!svg) {
    console.error("SVG not found");
    return;
  }

  const vb = svg.viewBox.baseVal;
  const width  = vb && vb.width  ? vb.width  : svg.clientWidth;
  const height = vb && vb.height ? vb.height : svg.clientHeight;

  const size = Math.min(width, height);
  const x = (width  - size) / 2;
  const y = (height - size) / 2;

  const clone = svg.cloneNode(true);
  clone.setAttribute("viewBox", `${x} ${y} ${size} ${size}`);
  clone.setAttribute("width",  size);
  clone.setAttribute("height", size);

  removeHiddenElements(clone);
  await inlineSvgImages(clone);
  inlineComputedStyles(clone);

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width  = size * scale;
    canvas.height = size * scale;

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(blob => {
      const pngUrl = URL.createObjectURL(blob);
      triggerDownload(pngUrl, filename);
      URL.revokeObjectURL(pngUrl);
    });

    URL.revokeObjectURL(url);
  };

  img.src = url;
};
