// ---------- Math functions ----------
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return b === 0 ? null : a / b; // null signals divide by zero
}

function operate(op, a, b) {
  switch (op) {
    case "+": return add(a, b);
    case "-": return subtract(a, b);
    case "*": return multiply(a, b);
    case "/": return divide(a, b);
    default: return null;
  }
}

// ---------- State ----------
let firstNumber = null;
let operator = null;
let currentInput = "0";
let waitingForSecond = false;
let justEvaluated = false;
const MAX_LENGTH = 12;

// ---------- Elements ----------
const display = document.querySelector("#display");
const decimalBtn = document.querySelector("#decimal");

// ---------- Display helpers ----------
function updateDisplay(text = currentInput) {
  display.textContent = text;
  decimalBtn.disabled =
    !waitingForSecond && !justEvaluated && currentInput.includes(".");
}

function resetState() {
  firstNumber = null;
  operator = null;
  currentInput = "0";
  waitingForSecond = false;
  justEvaluated = false;
}

function clearAll() {
  resetState();
  updateDisplay();
}

function formatResult(n) {
  const rounded = Math.round(n * 1e8) / 1e8; // trims long decimals
  let str = String(rounded);
  if (str.length > MAX_LENGTH) str = rounded.toExponential(5);
  return str;
}

function showDivideError() {
  resetState();
  updateDisplay("Nice try, genius");
}

// ---------- Input functions ----------
function appendDigit(digit) {
  if (justEvaluated) resetState();
  if (waitingForSecond) {
    currentInput = "0";
    waitingForSecond = false;
  }
  if (currentInput.length >= MAX_LENGTH) return;
  currentInput = currentInput === "0" ? digit : currentInput + digit;
  updateDisplay();
}

function appendDecimal() {
  if (justEvaluated) resetState();
  if (waitingForSecond) {
    currentInput = "0";
    waitingForSecond = false;
  }
  if (currentInput.includes(".")) return;
  currentInput += ".";
  updateDisplay();
}

function backspace() {
  if (justEvaluated || waitingForSecond) return;
  currentInput = currentInput.slice(0, -1);
  if (currentInput === "" || currentInput === "-") currentInput = "0";
  updateDisplay();
}

function chooseOperator(nextOp) {
  // Consecutive operators: just swap the operator, don't evaluate
  if (operator !== null && waitingForSecond) {
    operator = nextOp;
    return;
  }

  if (operator !== null) {
    // Chained operation: evaluate the pair first (e.g. 12 + 7 then "-")
    const result = operate(operator, firstNumber, parseFloat(currentInput));
    if (result === null) {
      showDivideError();
      return;
    }
    currentInput = formatResult(result);
    firstNumber = parseFloat(currentInput);
  } else {
    firstNumber = parseFloat(currentInput);
  }

  operator = nextOp;
  waitingForSecond = true;
  justEvaluated = false;
  updateDisplay();
}

function equals() {
  // Ignore = if there is no operator or no second number yet
  if (operator === null || waitingForSecond) return;

  const result = operate(operator, firstNumber, parseFloat(currentInput));
  if (result === null) {
    showDivideError();
    return;
  }

  currentInput = formatResult(result);
  firstNumber = null;
  operator = null;
  justEvaluated = true;
  updateDisplay();
}

// ---------- Button listeners ----------
document.querySelectorAll("[data-digit]").forEach((btn) => {
  btn.addEventListener("click", () => appendDigit(btn.dataset.digit));
});

document.querySelectorAll("[data-op]").forEach((btn) => {
  btn.addEventListener("click", () => chooseOperator(btn.dataset.op));
});

document.querySelector("#equals").addEventListener("click", equals);
document.querySelector("#clear").addEventListener("click", clearAll);
document.querySelector("#backspace").addEventListener("click", backspace);
decimalBtn.addEventListener("click", appendDecimal);

// ---------- Keyboard support ----------
document.addEventListener("keydown", (e) => {
  if (/^[0-9]$/.test(e.key)) {
    appendDigit(e.key);
  } else if (e.key === ".") {
    appendDecimal();
  } else if (["+", "-", "*", "/"].includes(e.key)) {
    e.preventDefault();
    chooseOperator(e.key);
  } else if (e.key === "=" || e.key === "Enter") {
    e.preventDefault();
    equals();
  } else if (e.key === "Backspace") {
    backspace();
  } else if (e.key === "Escape") {
    clearAll();
  }
});

// Show the starting display
updateDisplay();