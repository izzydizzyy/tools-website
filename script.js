const tools = [...document.querySelectorAll(".tool")];
const search = document.querySelector("#tool-search");
const visibleCount = document.querySelector("#visible-count");

function setStatus(element, message, type = "") {
  element.textContent = message;
  element.className = `status ${type}`.trim();
}

function copyTextFrom(id) {
  const element = document.getElementById(id);
  if (!element) return;

  const value = "value" in element ? element.value : element.textContent;

  navigator.clipboard.writeText(value).then(() => {
    const original = element.dataset.copyFlash;
    element.dataset.copyFlash = "copied";
  }).catch(() => {});
}

document.querySelectorAll(".tool-header").forEach((button) => {
  button.addEventListener("click", () => {
    const tool = button.closest(".tool");
    const isOpen = tool.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
    tool.querySelector(".toggle").textContent = isOpen ? "−" : "+";
  });
});

search.addEventListener("input", () => {
  const query = search.value.trim().toLowerCase();
  let count = 0;

  tools.forEach((tool) => {
    const haystack = tool.dataset.search.toLowerCase();
    const heading = tool.querySelector("strong").textContent.toLowerCase();
    const matches = !query || haystack.includes(query) || heading.includes(query);

    tool.hidden = !matches;
    if (matches) count++;
  });

  visibleCount.textContent = `${count} tool${count === 1 ? "" : "s"}`;
});

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;

    const text = "value" in target ? target.value : target.textContent;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      const previous = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = previous;
      }, 900);
    } catch {

    }
  });
});

const jsonInput = document.querySelector("#json-input");
const jsonStatus = document.querySelector("#json-status");

document.querySelector('[data-action="json-format"]').addEventListener("click", () => {
  try {
    const parsed = JSON.parse(jsonInput.value);
    jsonInput.value = JSON.stringify(parsed, null, 2);
    setStatus(jsonStatus, "Valid JSON.", "success");
  } catch (error) {
    setStatus(jsonStatus, error.message, "error");
  }
});

document.querySelector('[data-action="json-minify"]').addEventListener("click", () => {
  try {
    const parsed = JSON.parse(jsonInput.value);
    jsonInput.value = JSON.stringify(parsed);
    setStatus(jsonStatus, "Valid JSON.", "success");
  } catch (error) {
    setStatus(jsonStatus, error.message, "error");
  }
});

document.querySelector('[data-action="json-clear"]').addEventListener("click", () => {
  jsonInput.value = "";
  setStatus(jsonStatus, "");
});

const base64Input = document.querySelector("#base64-input");
const base64Status = document.querySelector("#base64-status");

function utf8ToBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToUtf8(value) {
  const binary = atob(value.trim());
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

document.querySelector('[data-action="base64-encode"]').addEventListener("click", () => {
  try {
    base64Input.value = utf8ToBase64(base64Input.value);
    setStatus(base64Status, "Encoded.", "success");
  } catch {
    setStatus(base64Status, "Could not encode that value.", "error");
  }
});

document.querySelector('[data-action="base64-decode"]').addEventListener("click", () => {
  try {
    base64Input.value = base64ToUtf8(base64Input.value);
    setStatus(base64Status, "Decoded.", "success");
  } catch {
    setStatus(base64Status, "That does not look like valid Base64.", "error");
  }
});

const uuidOutput = document.querySelector("#uuid-output");

document.querySelector('[data-action="uuid-generate"]').addEventListener("click", () => {
  uuidOutput.value = crypto.randomUUID();
});

const passwordLength = document.querySelector("#password-length");
const passwordSymbols = document.querySelector("#password-symbols");
const passwordOutput = document.querySelector("#password-output");

function randomIndex(max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function generatePassword(length, includeSymbols) {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*_-+=?";
  const characters = letters + numbers + (includeSymbols ? symbols : "");

  let output = "";
  for (let i = 0; i < length; i++) {
    output += characters[randomIndex(characters.length)];
  }
  return output;
}

document.querySelector('[data-action="password-generate"]').addEventListener("click", () => {
  const length = Math.max(8, Math.min(64, Number(passwordLength.value) || 20));
  passwordLength.value = length;
  passwordOutput.value = generatePassword(length, passwordSymbols.checked);
});

const timestampDate = document.querySelector("#timestamp-date");
const timestampStyle = document.querySelector("#timestamp-style");
const timestampOutput = document.querySelector("#timestamp-output");

function setDefaultTimestamp() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  timestampDate.value = now.toISOString().slice(0, 16);
}

function generateTimestamp() {
  if (!timestampDate.value) {
    timestampOutput.value = "";
    return;
  }

  const unix = Math.floor(new Date(timestampDate.value).getTime() / 1000);
  timestampOutput.value = `<t:${unix}:${timestampStyle.value}>`;
}

setDefaultTimestamp();
generateTimestamp();

timestampDate.addEventListener("input", generateTimestamp);
timestampStyle.addEventListener("change", generateTimestamp);
document.querySelector('[data-action="timestamp-generate"]').addEventListener("click", generateTimestamp);

const snowflakeInput = document.querySelector("#snowflake-input");
const snowflakeResult = document.querySelector("#snowflake-result");
const DISCORD_EPOCH = 1420070400000n;

document.querySelector('[data-action="snowflake-decode"]').addEventListener("click", () => {
  const value = snowflakeInput.value.trim();

  try {
    if (!/^\d{15,22}$/.test(value)) {
      throw new Error("Enter a valid numeric Discord snowflake.");
    }

    const snowflake = BigInt(value);
    const timestamp = (snowflake >> 22n) + DISCORD_EPOCH;
    const date = new Date(Number(timestamp));
    const unix = Math.floor(Number(timestamp) / 1000);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Could not decode that snowflake.");
    }

    snowflakeResult.classList.remove("muted");
    snowflakeResult.innerHTML = `
      <div><span>Created</span><code>${escapeHtml(date.toLocaleString())}</code></div>
      <div><span>Unix</span><code>${unix}</code></div>
      <div><span>Discord</span><code>&lt;t:${unix}:F&gt;</code></div>
    `;
  } catch (error) {
    snowflakeResult.classList.add("muted");
    snowflakeResult.textContent = error.message;
  }
});

const colorInput = document.querySelector("#color-input");
const colorPicker = document.querySelector("#color-picker");
const colorResult = document.querySelector("#color-result");

function normalizeHex(value) {
  let hex = value.trim().replace(/^#/, "");

  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex.split("").map((char) => char + char).join("");
  }

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }

  return `#${hex.toLowerCase()}`;
}

function hexToRgb(hex) {
  const value = hex.slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      default:
        h = (r - g) / delta + 4;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function updateColor() {
  const hex = normalizeHex(colorInput.value);

  if (!hex) {
    colorResult.innerHTML = '<span class="muted">Enter a valid HEX color.</span>';
    return;
  }

  colorInput.value = hex;
  colorPicker.value = hex;

  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);

  colorResult.innerHTML = `
    <div><span>HEX</span><code>${hex}</code></div>
    <div><span>RGB</span><code>rgb(${r}, ${g}, ${b})</code></div>
    <div><span>HSL</span><code>hsl(${h}, ${s}%, ${l}%)</code></div>
  `;
}

colorPicker.addEventListener("input", () => {
  colorInput.value = colorPicker.value;
  updateColor();
});

document.querySelector('[data-action="color-convert"]').addEventListener("click", updateColor);

const markdownInput = document.querySelector("#markdown-input");
const markdownPreview = document.querySelector("#markdown-preview");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value) {
  return value
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderMarkdown(source) {
  const safe = escapeHtml(source);
  const lines = safe.split("\n");

  let output = "";
  let inList = false;
  let inCode = false;

  for (const rawLine of lines) {
    const line = rawLine;

    if (line.startsWith("```")) {
      if (inList) {
        output += "</ul>";
        inList = false;
      }

      output += inCode ? "</code></pre>" : "<pre><code>";
      inCode = !inCode;
      continue;
    }

    if (inCode) {
      output += `${line}\n`;
      continue;
    }

    if (/^###\s+/.test(line)) {
      if (inList) {
        output += "</ul>";
        inList = false;
      }
      output += `<h3>${inlineMarkdown(line.replace(/^###\s+/, ""))}</h3>`;
      continue;
    }

    if (/^##\s+/.test(line)) {
      if (inList) {
        output += "</ul>";
        inList = false;
      }
      output += `<h2>${inlineMarkdown(line.replace(/^##\s+/, ""))}</h2>`;
      continue;
    }

    if (/^#\s+/.test(line)) {
      if (inList) {
        output += "</ul>";
        inList = false;
      }
      output += `<h1>${inlineMarkdown(line.replace(/^#\s+/, ""))}</h1>`;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        output += "<ul>";
        inList = true;
      }
      output += `<li>${inlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>`;
      continue;
    }

    if (inList) {
      output += "</ul>";
      inList = false;
    }

    if (!line.trim()) {
      output += "";
      continue;
    }

    output += `<p>${inlineMarkdown(line)}</p>`;
  }

  if (inList) output += "</ul>";
  if (inCode) output += "</code></pre>";

  return output;
}

markdownInput.addEventListener("input", () => {
  const value = markdownInput.value;

  if (!value.trim()) {
    markdownPreview.classList.add("muted");
    markdownPreview.textContent = "Start typing to preview Markdown.";
    return;
  }

  markdownPreview.classList.remove("muted");
  markdownPreview.innerHTML = renderMarkdown(value);
});

uuidOutput.value = crypto.randomUUID();
passwordOutput.value = generatePassword(20, true);
