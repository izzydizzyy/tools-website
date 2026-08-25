const tools = [...document.querySelectorAll(".tool")];
const search = document.querySelector("#tool-search");
const visibleCount = document.querySelector("#visible-count");

function setStatus(element, message, type = "") {
  element.textContent = message;
  element.className = `status ${type}`.trim();
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

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


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

const urlInput = document.querySelector("#url-input");
const urlStatus = document.querySelector("#url-status");

document.querySelector('[data-action="url-encode"]').addEventListener("click", () => {
  try {
    urlInput.value = encodeURIComponent(urlInput.value);
    setStatus(urlStatus, "Encoded.", "success");
  } catch {
    setStatus(urlStatus, "Could not encode that value.", "error");
  }
});

document.querySelector('[data-action="url-decode"]').addEventListener("click", () => {
  try {
    urlInput.value = decodeURIComponent(urlInput.value);
    setStatus(urlStatus, "Decoded.", "success");
  } catch {
    setStatus(urlStatus, "That does not look like a valid encoded value.", "error");
  }
});

const hashInput = document.querySelector("#hash-input");
const hashAlgo = document.querySelector("#hash-algo");
const hashOutput = document.querySelector("#hash-output");

async function sha(text, algo) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algo, bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

document.querySelector('[data-action="hash-generate"]').addEventListener("click", async () => {
  hashOutput.value = "Hashing…";
  try {
    hashOutput.value = await sha(hashInput.value, hashAlgo.value);
  } catch {
    hashOutput.value = "";
  }
});


const jwtInput = document.querySelector("#jwt-input");
const jwtResult = document.querySelector("#jwt-result");

function base64UrlToJson(segment) {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const decoded = base64ToUtf8(padded);
  return JSON.stringify(JSON.parse(decoded), null, 2);
}

document.querySelector('[data-action="jwt-decode"]').addEventListener("click", () => {
  const parts = jwtInput.value.trim().split(".");

  try {
    if (parts.length < 2) {
      throw new Error("That doesn't look like a JWT (needs header.payload.signature).");
    }

    const header = base64UrlToJson(parts[0]);
    const payload = base64UrlToJson(parts[1]);

    jwtResult.classList.remove("muted");
    jwtResult.innerHTML = `
      <div style="flex-direction:column;align-items:stretch;"><span>Header</span><pre style="white-space:pre-wrap;margin:4px 0 0;"><code>${escapeHtml(header)}</code></pre></div>
      <div style="flex-direction:column;align-items:stretch;"><span>Payload</span><pre style="white-space:pre-wrap;margin:4px 0 0;"><code>${escapeHtml(payload)}</code></pre></div>
    `;
  } catch (error) {
    jwtResult.classList.add("muted");
    jwtResult.textContent = error.message;
  }
});

const regexPattern = document.querySelector("#regex-pattern");
const regexFlags = document.querySelector("#regex-flags");
const regexText = document.querySelector("#regex-text");
const regexResult = document.querySelector("#regex-result");

document.querySelector('[data-action="regex-test"]').addEventListener("click", () => {
  try {
    if (!regexPattern.value) {
      throw new Error("Enter a pattern first.");
    }

    const flags = regexFlags.value.includes("g") ? regexFlags.value : regexFlags.value + "g";
    const re = new RegExp(regexPattern.value, flags);
    const matches = [...regexText.value.matchAll(re)];

    if (!matches.length) {
      regexResult.classList.add("muted");
      regexResult.textContent = "No matches found.";
      return;
    }

    regexResult.classList.remove("muted");
    regexResult.innerHTML = matches
      .slice(0, 50)
      .map((match, index) => `<div><span>#${index + 1}</span><code>${escapeHtml(match[0])}</code></div>`)
      .join("") + (matches.length > 50 ? `<div><span></span><code>+${matches.length - 50} more</code></div>` : "");
  } catch (error) {
    regexResult.classList.add("muted");
    regexResult.textContent = error.message;
  }
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

const embedTitle = document.querySelector("#embed-title");
const embedDescription = document.querySelector("#embed-description");
const embedColor = document.querySelector("#embed-color");
const embedColorPicker = document.querySelector("#embed-color-picker");
const embedFooter = document.querySelector("#embed-footer");
const embedOutput = document.querySelector("#embed-output");

embedColorPicker.addEventListener("input", () => {
  embedColor.value = embedColorPicker.value;
});

document.querySelector('[data-action="embed-build"]').addEventListener("click", () => {
  const hex = normalizeHex(embedColor.value) || "#7aa2f7";
  const embed = {
    embeds: [
      {
        title: embedTitle.value || undefined,
        description: embedDescription.value || undefined,
        color: parseInt(hex.slice(1), 16),
        footer: embedFooter.value ? { text: embedFooter.value } : undefined,
      },
    ],
  };

  embedOutput.value = JSON.stringify(embed, null, 2);
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

const caseInput = document.querySelector("#case-input");

function toTitleCase(value) {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function toSentenceCase(value) {
  const lower = value.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, (char) => char.toUpperCase());
}

function toWords(value) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean);
}

function toCamelCase(value) {
  const words = toWords(value).map((w) => w.toLowerCase());
  return words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

function toSnakeCase(value) {
  return toWords(value).map((w) => w.toLowerCase()).join("_");
}

function toKebabCase(value) {
  return toWords(value).map((w) => w.toLowerCase()).join("-");
}

const caseActions = {
  "case-upper": (v) => v.toUpperCase(),
  "case-lower": (v) => v.toLowerCase(),
  "case-title": toTitleCase,
  "case-sentence": toSentenceCase,
  "case-camel": toCamelCase,
  "case-snake": toSnakeCase,
  "case-kebab": toKebabCase,
};

Object.entries(caseActions).forEach(([action, fn]) => {
  document.querySelector(`[data-action="${action}"]`).addEventListener("click", () => {
    caseInput.value = fn(caseInput.value);
  });
});

const counterInput = document.querySelector("#counter-input");
const counterResult = document.querySelector("#counter-result");

function updateCounter() {
  const value = counterInput.value;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const chars = value.length;
  const noSpaces = value.replace(/\s+/g, "").length;
  const minutes = Math.max(1, Math.round(words / 200));

  counterResult.innerHTML = `
    <div><span>Words</span><code>${words}</code></div>
    <div><span>Chars</span><code>${chars}</code></div>
    <div><span>No spaces</span><code>${noSpaces}</code></div>
    <div><span>Read</span><code>${words ? minutes : 0} min</code></div>
  `;
}

counterInput.addEventListener("input", updateCounter);

const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

function loremSentence() {
  const length = 6 + randomIndex(10);
  let words = [];
  for (let i = 0; i < length; i++) {
    words.push(LOREM_WORDS[randomIndex(LOREM_WORDS.length)]);
  }
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function loremParagraph() {
  const sentences = 3 + randomIndex(4);
  let output = [];
  for (let i = 0; i < sentences; i++) {
    output.push(loremSentence());
  }
  return output.join(" ");
}

const loremCount = document.querySelector("#lorem-count");
const loremOutput = document.querySelector("#lorem-output");

document.querySelector('[data-action="lorem-generate"]').addEventListener("click", () => {
  const count = Math.max(1, Math.min(20, Number(loremCount.value) || 3));
  loremCount.value = count;

  let paragraphs = [];
  for (let i = 0; i < count; i++) {
    paragraphs.push(loremParagraph());
  }
  loremOutput.value = paragraphs.join("\n\n");
});

const slugInput = document.querySelector("#slug-input");
const slugOutput = document.querySelector("#slug-output");

function slugify(value) {
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

document.querySelector('[data-action="slug-generate"]').addEventListener("click", () => {
  slugOutput.value = slugify(slugInput.value);
});

const GITHUB_REPO = "izzydizzyy/tools-website";
const liveCommit = document.querySelector("#live-commit");
const liveBranch = document.querySelector("#live-branch");
const liveIssues = document.querySelector("#live-issues");
const liveStats = document.querySelector("#live-stats");
const liveHistory = document.querySelector("#live-history");
const liveStatus = document.querySelector("#live-status");
const liveRefresh = document.querySelector("#live-refresh");

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [label, secondsInUnit] of units) {
    const value = Math.floor(seconds / secondsInUnit);
    if (value >= 1) {
      return `${value} ${label}${value === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}

async function loadLiveUpdates() {
  setStatus(liveStatus, "Fetching latest data from GitHub…");
  liveRefresh.disabled = true;

  try {
    const [repoRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${GITHUB_REPO}`),
      fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=5`),
    ]);

    if (!repoRes.ok || !commitsRes.ok) {
      throw new Error("GitHub API request failed.");
    }

    const repo = await repoRes.json();
    const commits = await commitsRes.json();

    liveBranch.textContent = repo.default_branch || "—";
    liveBranch.classList.remove("muted");

    liveIssues.textContent = typeof repo.open_issues_count === "number" ? repo.open_issues_count : "—";
    liveIssues.classList.remove("muted");

    liveStats.textContent = `${repo.stargazers_count ?? 0} ★ / ${repo.forks_count ?? 0} 🍴`;
    liveStats.classList.remove("muted");

    if (Array.isArray(commits) && commits.length) {
      const latest = commits[0];
      const sha = latest.sha.slice(0, 7);
      const msg = (latest.commit?.message || "").split("\n")[0];

      liveCommit.classList.remove("muted");
      liveCommit.innerHTML = `<a href="${latest.html_url}" target="_blank" rel="noopener noreferrer">${escapeHtml(sha)}</a> — ${escapeHtml(msg)}`;

      liveHistory.innerHTML = commits
        .map((commit) => {
          const shortSha = commit.sha.slice(0, 7);
          const message = (commit.commit?.message || "").split("\n")[0];
          const date = commit.commit?.author?.date;
          const author = commit.commit?.author?.name || commit.author?.login || "unknown";

          return `
            <li>
              <span class="live-commit-msg">
                <a href="${commit.html_url}" target="_blank" rel="noopener noreferrer"><code>${escapeHtml(shortSha)}</code></a>
                ${escapeHtml(message)}
              </span>
              <span class="live-commit-meta">${escapeHtml(author)} · ${date ? timeAgo(date) : ""}</span>
            </li>
          `;
        })
        .join("");
    } else {
      liveHistory.innerHTML = '<li class="muted">No commits found.</li>';
    }

    setStatus(liveStatus, `Updated ${new Date().toLocaleTimeString()}.`, "success");
  } catch (error) {
    liveCommit.textContent = "Unavailable";
    liveBranch.textContent = "Unavailable";
    liveIssues.textContent = "Unavailable";
    liveStats.textContent = "Unavailable";
    liveHistory.innerHTML = '<li class="muted">Could not reach the GitHub API right now.</li>';
    setStatus(liveStatus, "Failed to load live updates. Try again in a moment.", "error");
  } finally {
    liveRefresh.disabled = false;
  }
}

liveRefresh.addEventListener("click", loadLiveUpdates);
loadLiveUpdates();

uuidOutput.value = crypto.randomUUID();
passwordOutput.value = generatePassword(20, true);
updateCounter();
