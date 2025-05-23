let chatHistory = [];

window.onload = () => {
  loadChat();
  applyDarkModeFromStorage();
};

function handleInput() {
  const inputField = document.getElementById("equation");
  const input = inputField.value.trim();
  if (!input) return;

  addMessage("user", input);
  inputField.value = "";

  const processedInput = convertToMath(input);
  const response = getResponse(processedInput || input);
  addMessage("bot", response);
}

function addMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  chatHistory.push({ sender, text });
  localStorage.setItem("jerry_chat", JSON.stringify(chatHistory));
}

function loadChat() {
  const stored = localStorage.getItem("jerry_chat");
  if (stored) {
    chatHistory = JSON.parse(stored);
    chatHistory.forEach(msg => addMessage(msg.sender, msg.text));
  }
}

function clearHistory() {
  localStorage.removeItem("jerry_chat");
  chatHistory = [];
  document.getElementById("chat-box").innerHTML = "";
}

function exportHistory() {
  const text = chatHistory.map(msg => `${msg.sender === "user" ? "You" : "Jerry"}: ${msg.text}`).join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "jerry_chat_history.txt";
  a.click();
}

function getResponse(input) {
  try {
    if (/^[\d+\-*/().\s]+$/.test(input)) {
      return solveArithmetic(input);
    } else if (/x\^2/.test(input)) {
      return solveQuadratic(input);
    } else if (/x/.test(input) && /=/.test(input)) {
      return solveLinear(input);
    } else {
      return "Hmm 🤔... I couldn't understand that. Try again!";
    }
  } catch {
    return "Something went wrong while solving that!";
  }
}

function solveArithmetic(expr) {
  const sanitized = expr.replace(/[^0-9+\-*/().]/g, "");
  const result = eval(sanitized);
  return `Answer: ${result}`;
}

function solveLinear(eq) {
  const pattern = /([+-]?\d*)x([+-]\d+)?=([+-]?\d*)x?([+-]?\d+)?/;
  const match = eq.replace(/\s+/g, "").match(pattern);
  if (!match) return "Can't understand the linear equation.";

  let [_, a, b, d, e] = match;
  a = parseCoeff(a);
  b = parseNum(b);
  d = parseCoeff(d);
  e = parseNum(e);

  const xCoeff = a - d;
  const constTerm = e - b;

  if (xCoeff === 0) {
    return constTerm === 0 ? "∞ solutions (identity)" : "No solution (contradiction)";
  }

  const x = constTerm / xCoeff;
  return `x = ${x}`;
}

function solveQuadratic(eq) {
  const pattern = /([+-]?\d*)x\^2([+-]?\d*)x([+-]?\d+)=0/;
  const match = eq.replace(/\s+/g, "").match(pattern);
  if (!match) return "Can't understand the quadratic.";

  let [_, a, b, c] = match;
  a = parseCoeff(a);
  b = parseCoeff(b);
  c = parseNum(c);

  const d = b * b - 4 * a * c;

  if (d < 0) return "No real roots.";
  const r1 = (-b + Math.sqrt(d)) / (2 * a);
  const r2 = (-b - Math.sqrt(d)) / (2 * a);
  return d === 0 ? `x = ${r1}` : `x₁ = ${r1}, x₂ = ${r2}`;
}

function parseCoeff(str) {
  if (!str || str === "+") return 1;
  if (str === "-") return -1;
  return parseFloat(str);
}

function parseNum(str) {
  return str ? parseFloat(str) : 0;
}

// Natural language to math
function convertToMath(text) {
  let converted = text
    .toLowerCase()
    .replace(/plus/g, "+")
    .replace(/minus/g, "-")
    .replace(/times|multiplied by/g, "*")
    .replace(/divided by|over/g, "/")
    .replace(/equals|is equal to/g, "=")
    .replace(/what is|solve|calculate|answer/g, "")
    .replace(/[^0-9x+*/=^.\- ]/g, "");

  return converted.trim();
}

// Dark mode logic
function toggleDarkMode() {
  const dark = document.getElementById("darkModeToggle").checked;
  document.body.classList.toggle("dark", dark);
  localStorage.setItem("jerry_theme", dark ? "dark" : "light");
}

function applyDarkModeFromStorage() {
  const saved = localStorage.getItem("jerry_theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
    document.getElementById("darkModeToggle").checked = true;
  }
}
