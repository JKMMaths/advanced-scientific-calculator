/* =====================================================================
   Advanced Scientific Calculator - script.js
   All logic for: Basic, Scientific, Matrix, Complex, Statistics,
   Calculus, Equation Solver, Graph Plotter, Unit Converter, History.
   Uses math.js (expression engine) + Plotly.js (graphing).
   ===================================================================== */

'use strict';

/* =====================================================================
   GLOBAL STATE & HELPERS
   ===================================================================== */
const State = {
    angleMode: 'DEG',     // 'DEG' | 'RAD'
    invMode: false,       // inverse-function toggle for scientific keys
    memory: 0,
    lastAnswer: 0,
    history: [],          // array of {expr, result, time}
    theme: 'dark',
    historyOpen: true,
    activeKeypad: 'basic'
};

/** Shortcuts to common elements. */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Safely run a function, showing errors in a result element instead of crashing. */
function safeRun(fn, errorBox) {
    try { return fn(); }
    catch (err) {
        const msg = (err && err.message) ? err.message : String(err);
        if (errorBox) {
            errorBox.classList.add('error');
            errorBox.textContent = 'Error: ' + msg;
        }
        return undefined;
    }
}

/** Format a number nicely (avoid floating point noise). */
function fmtNum(n, digits = 10) {
    if (typeof n !== 'number') return String(n);
    if (Number.isNaN(n)) return 'NaN';
    if (!Number.isFinite(n)) return n > 0 ? '∞' : '−∞';
    if (n === 0) return '0';
    // Round to significant digits, strip trailing zeros
    const r = parseFloat(n.toPrecision(digits));
    return String(r);
}

/** Format a math.js evaluation result (could be number, complex, matrix, etc.). */
function fmtResult(val) {
    try {
        if (val && typeof val === 'object' && typeof val.re === 'number') {
            return fmtComplex(val);
        }
        if (math.typeOf && math.typeOf(val) === 'Matrix') {
            return formatMatrix(math.matrix(val).toArray());
        }
        if (Array.isArray(val)) {
            return formatMatrix(val);
        }
        if (typeof val === 'number' || typeof val === 'boolean') {
            return fmtNum(val);
        }
        if (typeof val === 'string') return val;
        return String(val);
    } catch {
        return String(val);
    }
}

/** Format a complex number from {re, im}. */
function fmtComplex(c, digits = 6) {
    const re = parseFloat(c.re.toFixed(digits));
    const im = parseFloat(c.im.toFixed(digits));
    if (im === 0) return String(re);
    if (re === 0) return im + 'i';
    return re + (im >= 0 ? ' + ' : ' − ') + Math.abs(im) + 'i';
}

/** Format a 2D array (matrix) as readable text. */
function formatMatrix(arr) {
    if (!Array.isArray(arr)) return String(arr);
    // Flatten column vector
    if (arr.length && !Array.isArray(arr[0])) {
        return '[ ' + arr.map(fmtNum).join(',  ') + ' ]';
    }
    return arr.map(row => '[ ' + row.map(v => fmtResult(v)).join(',  ') + ' ]').join('\n');
}

/* =====================================================================
   EXPRESSION EVALUATION
   The display accepts user-friendly syntax (π, ×, ÷, %, x!, °) and we
   translate it to math.js syntax before evaluation.
   ===================================================================== */

/** Translate a user expression into a math.js-parseable expression. */
function preprocessExpression(expr) {
    let s = expr;

    // Pretty operators → ASCII
    s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

    // Constants
    s = s.replace(/π/g, 'pi');
    // (Leave 'e' alone — math.js treats it as Euler's number.)

    // Percentage: "50%" → "*(50/100)" ; also "200+10%" handled by math.js via 'percentage'
    // math.js supports a "percentage" function; but to be safe convert trailing %
    s = s.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)');

    // Implicit multiplication: 2(  → 2*( , )3 → )*3 , 2π already handled, 3x style not used here
    s = s.replace(/(\d|\))\s*\(/g, '$1*(');
    s = s.replace(/\)\s*(\d)/g, ')*$1');

    // Scientific notation button "EE" → "*10^"
    s = s.replace(/EE/g, '*10^');

    // Ans → last answer
    s = s.replace(/\bAns\b/g, '(' + State.lastAnswer + ')');

    // "i" as imaginary unit — math.js handles it natively, leave it.

    return s;
}

/** Apply angle-mode handling: wrap trig args & unwrap inverse-trig results. */
function buildScope() {
    // We use math.js with custom trig that respects DEG/RAD.
    return {};
}

/**
 * Evaluate an expression string. Sets up DEG/RAD-aware trig functions.
 * Returns { value, formatted }.
 */
function evaluateExpression(expr) {
    if (!expr || !expr.trim()) return { value: 0, formatted: '0' };

    const processed = preprocessExpression(expr);

    // Configure math.js to use degrees if needed (for trig functions only).
    const isDeg = State.angleMode === 'DEG';

    // Build a configuration so trig functions interpret angles in degrees.
    const node = math.parse(processed);
    const code = node.compile();

    // We provide a custom scope where sin/cos/tan convert degrees→radians.
    const scope = Object.create(null);
    scope.pi = Math.PI;
    scope.e = Math.E;

    if (isDeg) {
        const D2R = Math.PI / 180;
        const R2D = 180 / Math.PI;
        scope.sin = (x) => Math.sin(x * D2R);
        scope.cos = (x) => Math.cos(x * D2R);
        scope.tan = (x) => Math.tan(x * D2R);
        scope.csc = (x) => 1 / Math.sin(x * D2R);
        scope.sec = (x) => 1 / Math.cos(x * D2R);
        scope.cot = (x) => 1 / Math.tan(x * D2R);
        scope.asin = (x) => Math.asin(x) * R2D;
        scope.acos = (x) => Math.acos(x) * R2D;
        scope.atan = (x) => Math.atan(x) * R2D;
        scope.acsc = (x) => Math.asin(1 / x) * R2D;
        scope.asec = (x) => Math.acos(1 / x) * R2D;
        scope.acot = (x) => (Math.PI / 2 - Math.atan(x)) * R2D;
        scope.asinh = Math.asinh;
        scope.acosh = Math.acosh;
        scope.atanh = Math.atanh;
        // Hyperbolic functions are independent of angle mode.
        scope.sinh = Math.sinh;
        scope.cosh = Math.cosh;
        scope.tanh = Math.tanh;
        scope.log = (x) => Math.log10(x);
        scope.ln = Math.log;
        scope.exp = Math.exp;
        scope.sqrt = Math.sqrt;
        scope.cbrt = Math.cbrt;
        scope.abs = Math.abs;
        scope.mod = (a, b) => a % b;
        scope.nthRoot = math.nthRoot;
        scope.factorial = factorial;
        scope.random = Math.random;
        scope.log2 = Math.log2;
    } else {
        // RAD mode — math.js defaults (radians) work directly.
        scope.sin = Math.sin;
        scope.cos = Math.cos;
        scope.tan = Math.tan;
        scope.csc = (x) => 1 / Math.sin(x);
        scope.sec = (x) => 1 / Math.cos(x);
        scope.cot = (x) => 1 / Math.tan(x);
        scope.asin = Math.asin;
        scope.acos = Math.acos;
        scope.atan = Math.atan;
        scope.acsc = (x) => Math.asin(1 / x);
        scope.asec = (x) => Math.acos(1 / x);
        scope.acot = (x) => Math.PI / 2 - Math.atan(x);
        scope.asinh = Math.asinh;
        scope.acosh = Math.acosh;
        scope.atanh = Math.atanh;
        scope.sinh = Math.sinh;
        scope.cosh = Math.cosh;
        scope.tanh = Math.tanh;
        scope.log = (x) => Math.log10(x);
        scope.ln = Math.log;
        scope.exp = Math.exp;
        scope.sqrt = Math.sqrt;
        scope.cbrt = Math.cbrt;
        scope.abs = Math.abs;
        scope.mod = (a, b) => a % b;
        scope.nthRoot = math.nthRoot;
        scope.factorial = factorial;
        scope.random = Math.random;
        scope.log2 = Math.log2;
    }

    const value = code.evaluate(scope);
    return { value, formatted: fmtResult(value) };
}

/** Integer factorial (uses math.js BigNumber for large values fallback). */
function factorial(n) {
    if (n < 0 || !Number.isFinite(n)) {
        // Let math.js handle via gamma for non-integers / negatives
        return math.gamma(n + 1);
    }
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}

/* =====================================================================
   CALCULATOR DISPLAY & KEYPAD
   ===================================================================== */

/** Returns the active calculator display objects (basic or scientific). */
function getActiveDisplay() {
    if (State.activeKeypad === 'scientific') {
        return {
            input: $('#expressionInput2'),
            result: $('#resultLine2'),
            error: $('#errorLine2'),
            angle: $('#angleToggle2')
        };
    }
    return {
        input: $('#expressionInput'),
        result: $('#resultLine'),
        error: $('#errorLine'),
        angle: $('#angleToggle')
    };
}

/** Insert text at cursor position in the active expression input. */
function insertAtCursor(text) {
    const { input } = getActiveDisplay();
    const start = input.selectionStart;
    const end = input.selectionEnd;
    // Memory/constant buttons that are commands rather than text
    if (text === 'MC') { State.memory = 0; updateMemoryIndicator(); return; }
    if (text === 'MR') { text = String(State.memory); }
    if (text === 'M+') { doMemoryOp('M+'); return; }
    if (text === 'M-') { doMemoryOp('M-'); return; }
    if (text === 'MS') { doMemoryOp('MS'); return; }

    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    const pos = start + text.length;
    input.focus();
    input.setSelectionRange(pos, pos);
    liveEvaluate();
}

/** Backspace on the active input. */
function backspace() {
    const { input } = getActiveDisplay();
    const start = input.selectionStart;
    const end = input.selectionEnd;
    if (start !== end) {
        input.value = input.value.slice(0, start) + input.value.slice(end);
        input.setSelectionRange(start, start);
    } else if (start > 0) {
        input.value = input.value.slice(0, start - 1) + input.value.slice(start);
        input.setSelectionRange(start - 1, start - 1);
    }
    input.focus();
    liveEvaluate();
}

/** Clear the active input & display. */
function clearAll() {
    const d = getActiveDisplay();
    d.input.value = '';
    d.result.textContent = '0';
    d.error.textContent = '';
    d.error.classList.remove('error');
    d.input.focus();
}

/** Live preview evaluation as the user types. */
function liveEvaluate() {
    const d = getActiveDisplay();
    d.error.textContent = '';
    d.error.classList.remove('error');
    const expr = d.input.value.trim();
    if (!expr) { d.result.textContent = '0'; return; }
    try {
        const { formatted } = evaluateExpression(expr);
        d.result.textContent = formatted;
    } catch {
        // Silent on partial expressions while typing.
        d.result.textContent = '…';
    }
}

/** Compute final result and push to history. */
function computeResult() {
    const d = getActiveDisplay();
    const expr = d.input.value.trim();
    if (!expr) return;
    let out;
    const ok = safeRun(() => {
        const { value, formatted } = evaluateExpression(expr);
        out = formatted;
        State.lastAnswer = (typeof value === 'number') ? value : 0;
        d.result.textContent = formatted;
        d.error.textContent = '';
        d.error.classList.remove('error');
    }, d.error);
    if (ok === undefined) return; // error already shown
    addHistory(expr, out);
    // Keep cursor focus for keyboard continuity
    d.input.focus();
}

/* =====================================================================
   MEMORY OPERATIONS
   ===================================================================== */
function doMemoryOp(op) {
    const d = getActiveDisplay();
    let currentVal = 0;
    try {
        const { value } = evaluateExpression(d.input.value || '0');
        currentVal = (typeof value === 'number') ? value : 0;
    } catch { /* use 0 if expression incomplete */ }
    switch (op) {
        case 'M+': State.memory += currentVal; break;
        case 'M-': State.memory -= currentVal; break;
        case 'MS': State.memory = currentVal; break;
        case 'MC': State.memory = 0; break;
    }
    updateMemoryIndicator();
}

function updateMemoryIndicator() {
    const ind1 = $('#memoryIndicator');
    const ind2 = $('#memoryIndicator2');
    [ind1, ind2].forEach(el => {
        if (!el) return;
        if (State.memory !== 0) el.classList.add('active');
        else el.classList.remove('active');
    });
}

/* =====================================================================
   ANGLE MODE TOGGLE
   ===================================================================== */
function toggleAngleMode() {
    State.angleMode = (State.angleMode === 'DEG') ? 'RAD' : 'DEG';
    const a1 = $('#angleToggle');
    const a2 = $('#angleToggle2');
    [a1, a2].forEach(b => { if (b) b.textContent = State.angleMode; });
    liveEvaluate();
}

/* =====================================================================
   INVERSE FUNCTION TOGGLE (scientific keypad)
   ===================================================================== */
function applyInvToKeypad() {
    // Map each sci button's data-insert between normal & inverse form.
    const invMap = {
        'sin(': 'asin(', 'cos(': 'acos(', 'tan(': 'atan(',
        'csc(': 'acsc(', 'sec(': 'asec(', 'cot(': 'acot(',
        'sinh(': 'asinh(', 'cosh(': 'acosh(', 'tanh(': 'atanh(',
        '^2': 'sqrt(', '^3': 'cbrt(', 'sqrt(': 'nthRoot(', '!': ''
    };
    $$('#sciKeypad .key.sci').forEach(btn => {
        const cur = btn.dataset.insert;
        // store original only once
        if (btn.dataset.orig === undefined) btn.dataset.orig = cur;
        if (State.invMode && invMap[btn.dataset.orig] !== undefined) {
            btn.dataset.insert = invMap[btn.dataset.orig];
        } else {
            btn.dataset.insert = btn.dataset.orig;
        }
    });
    const t = $('#invToggle');
    if (t) t.classList.toggle('active', State.invMode);
}

/* =====================================================================
   HISTORY
   ===================================================================== */
function addHistory(expr, result) {
    State.history.unshift({ expr, result, time: Date.now() });
    if (State.history.length > 100) State.history.pop();
    renderHistory();
    saveState();
}

function renderHistory() {
    const list = $('#historyList');
    if (!State.history.length) {
        list.innerHTML = '<li class="history-empty">No calculations yet.</li>';
        return;
    }
    list.innerHTML = '';
    State.history.forEach((h, idx) => {
        const li = document.createElement('li');
        li.innerHTML =
            `<div class="hist-expr">${escapeHtml(h.expr)}</div>` +
            `<div class="hist-result">= ${escapeHtml(h.result)}</div>`;
        li.title = 'Click to reuse this expression';
        li.addEventListener('click', () => {
            // Reuse: put expression into whichever calculator is active.
            switchTab('basic');
            const d = getActiveDisplay();
            d.input.value = h.expr;
            d.input.focus();
            liveEvaluate();
        });
        list.appendChild(li);
    });
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* =====================================================================
   TAB SWITCHING
   ===================================================================== */
function switchTab(name) {
    $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    $$('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
    // Track which calculator keypad is active for basic/scientific tabs.
    if (name === 'scientific') State.activeKeypad = 'scientific';
    else State.activeKeypad = 'basic';
    // sync angle buttons
    const a1 = $('#angleToggle'); const a2 = $('#angleToggle2');
    if (a1) a1.textContent = State.angleMode;
    if (a2) a2.textContent = State.angleMode;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =====================================================================
   THEME TOGGLE
   ===================================================================== */
function toggleTheme() {
    State.theme = (State.theme === 'dark') ? 'light' : 'dark';
    document.documentElement.dataset.theme = State.theme;
    const icon = $('#themeIcon');
    const label = $('#themeLabel');
    if (State.theme === 'dark') {
        icon.className = 'fa-solid fa-moon'; if (label) label.textContent = 'Dark';
    } else {
        icon.className = 'fa-solid fa-sun'; if (label) label.textContent = 'Light';
    }
    // re-render Plotly graphs with new template colors if visible
    if (typeof Plotly !== 'undefined' && $('#plotDiv').data) {
        replotGraph();
    }
    saveState();
}

/* =====================================================================
   PERSISTENCE (localStorage)
   ===================================================================== */
function saveState() {
    try {
        localStorage.setItem('asc_state', JSON.stringify({
            theme: State.theme,
            angleMode: State.angleMode,
            memory: State.memory,
            history: State.history.slice(0, 50)
        }));
    } catch { /* ignore quota errors */ }
}

function loadState() {
    try {
        const raw = localStorage.getItem('asc_state');
        if (!raw) return;
        const s = JSON.parse(raw);
        if (s.theme) {
            State.theme = s.theme;
            document.documentElement.dataset.theme = s.theme;
            const icon = $('#themeIcon'); const label = $('#themeLabel');
            if (State.theme === 'dark') { icon.className = 'fa-solid fa-moon'; if (label) label.textContent = 'Dark'; }
            else { icon.className = 'fa-solid fa-sun'; if (label) label.textContent = 'Light'; }
        }
        if (s.angleMode) {
            State.angleMode = s.angleMode;
            const a1 = $('#angleToggle'); const a2 = $('#angleToggle2');
            if (a1) a1.textContent = State.angleMode;
            if (a2) a2.textContent = State.angleMode;
        }
        if (typeof s.memory === 'number') State.memory = s.memory;
        if (Array.isArray(s.history)) State.history = s.history;
        updateMemoryIndicator();
        renderHistory();
    } catch { /* ignore */ }
}

/* =====================================================================
   MATRIX CALCULATOR
   ===================================================================== */
const MatrixState = { A: null, B: null };

function buildMatrixInputs(containerId, rowsId, colsId) {
    const rows = Math.max(1, Math.min(8, parseInt($(rowsId).value, 10) || 2));
    const cols = Math.max(1, Math.min(8, parseInt($(colsId).value, 10) || 2));
    const container = $(containerId);
    container.style.gridTemplateColumns = `repeat(${cols}, max-content)`;
    container.innerHTML = '';
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const inp = document.createElement('input');
            inp.type = 'number';
            inp.value = (i === j) ? 1 : 0;   // default identity-ish
            inp.step = 'any';
            inp.dataset.r = i; inp.dataset.c = j;
            container.appendChild(inp);
        }
    }
}

function readMatrix(containerId) {
    const inputs = $$(`${containerId} input`);
    if (!inputs.length) return null;
    let maxR = 0, maxC = 0;
    inputs.forEach(inp => {
        maxR = Math.max(maxR, +inp.dataset.r);
        maxC = Math.max(maxC, +inp.dataset.c);
    });
    const rows = maxR + 1, cols = maxC + 1;
    const data = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) row.push(0);
        data.push(row);
    }
    inputs.forEach(inp => {
        data[+inp.dataset.r][+inp.dataset.c] = parseFloat(inp.value) || 0;
    });
    return math.matrix(data);
}

function showMatrixResult(text, isError) {
    const box = $('#matrixResult');
    box.textContent = text;
    box.classList.toggle('error', !!isError);
}

function runMatrixOp(op) {
    const box = $('#matrixResult');
    safeRun(() => {
        const A = readMatrix('#matrixA');
        const B = readMatrix('#matrixB');
        let res;
        switch (op) {
            case 'add': res = math.add(A, B); break;
            case 'sub': res = math.subtract(A, B); break;
            case 'mul': res = math.multiply(A, B); break;
            case 'detA': res = math.det(A); break;
            case 'detB': res = math.det(B); break;
            case 'invA': res = math.inv(A); break;
            case 'invB': res = math.inv(B); break;
            case 'transA': res = math.transpose(A); break;
            case 'transB': res = math.transpose(B); break;
            case 'rankA': res = matrixRank(A.toArray()); break;
            case 'rankB': res = matrixRank(B.toArray()); break;
            case 'eigA': {
                const e = math.eigs(A);
                const vals = e.values.toArray ? e.values.toArray() : e.values;
                res = 'Eigenvalues:\n' + vals.map((v, i) => `λ${i + 1} = ${fmtResult(v)}`).join('\n');
                showMatrixResult(res); return;
            }
            default: throw new Error('Unknown matrix operation');
        }
        showMatrixResult(fmtResult(res));
    }, box);
}

/** Compute matrix rank via Gaussian elimination. */
function matrixRank(mat) {
    const A = mat.map(row => row.slice());
    const m = A.length, n = A[0].length;
    let rank = 0;
    const tol = 1e-10;
    for (let col = 0; col < n && rank < m; col++) {
        // pivot
        let pivot = rank;
        for (let r = rank + 1; r < m; r++) {
            if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
        }
        if (Math.abs(A[pivot][col]) < tol) continue;
        [A[rank], A[pivot]] = [A[pivot], A[rank]];
        for (let r = 0; r < m; r++) {
            if (r !== rank) {
                const f = A[r][col] / A[rank][col];
                for (let c = col; c < n; c++) A[r][c] -= f * A[rank][c];
            }
        }
        rank++;
    }
    return rank;
}

function solveLinearSystem() {
    const box = $('#matrixResult');
    safeRun(() => {
        const A = readMatrix('#matrixA');
        const B = readMatrix('#matrixB');
        const bArr = B.toArray();
        // Flatten B if it is a single column
        const bVec = bArr.map(r => r[0]);
        const X = math.lusolve(A, bVec);
        showMatrixResult('Solution X =\n' + formatMatrix(X.toArray()));
    }, box);
}

/* =====================================================================
   COMPLEX NUMBER CALCULATOR
   ===================================================================== */
function readComplex(rId, iId) {
    const re = parseFloat($(rId).value) || 0;
    const im = parseFloat($(iId).value) || 0;
    return math.complex(re, im);
}

function showComplexResult(text, isError) {
    const box = $('#complexResult');
    box.textContent = text;
    box.classList.toggle('error', !!isError);
}

function runComplexOp(op) {
    const box = $('#complexResult');
    safeRun(() => {
        const z1 = readComplex('#z1r', '#z1i');
        const z2 = readComplex('#z2r', '#z2i');
        let res;
        switch (op) {
            case 'add': res = math.add(z1, z2); break;
            case 'sub': res = math.subtract(z1, z2); break;
            case 'mul': res = math.multiply(z1, z2); break;
            case 'div': res = math.divide(z1, z2); break;
            case 'mod1': showComplexResult(`|z₁| = ${fmtNum(z1.toPolar().r)}`); return;
            case 'arg1': {
                const arg = z1.toPolar().phi;
                const out = ($('#complexAngleMode').value === 'deg') ? arg * 180 / Math.PI : arg;
                showComplexResult(`arg(z₁) = ${fmtNum(out)} ${$('#complexAngleMode').value}`);
                return;
            }
            case 'conj1': res = z1.conjugate(); break;
            case 'polar1': {
                const p = z1.toPolar();
                const unit = $('#complexAngleMode').value;
                const ang = (unit === 'deg') ? p.phi * 180 / Math.PI : p.phi;
                showComplexResult(`z₁ = ${fmtNum(p.r)} ∠ ${fmtNum(ang)}° (${unit})`);
                return;
            }
            case 'rect1': {
                showComplexResult(`z₁ = ${fmtComplex({ re: z1.re, im: z1.im })}`);
                return;
            }
            default: throw new Error('Unknown complex operation');
        }
        showComplexResult(fmtResult(res));
    }, box);
}

/* =====================================================================
   STATISTICS
   ===================================================================== */
function parseNumbers(text) {
    return text.split(/[\s,;]+/).map(s => parseFloat(s)).filter(n => Number.isFinite(n));
}

function computeStats() {
    const box = $('#statResult');
    safeRun(() => {
        const data = parseNumbers($('#statData').value);
        if (!data.length) throw new Error('Please enter at least one number.');
        const sorted = data.slice().sort((a, b) => a - b);
        const n = data.length;
        const mean = data.reduce((a, b) => a + b, 0) / n;
        const median = medianOf(sorted);
        const mode = modeOf(data);
        const variance = data.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
        const std = Math.sqrt(variance);
        const sampleVar = n > 1 ? (data.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : 0;
        const sampleStd = Math.sqrt(sampleVar);
        const min = sorted[0], max = sorted[n - 1];
        const range = max - min;
        const q1 = quantile(sorted, 0.25);
        const q3 = quantile(sorted, 0.75);
        const sum = data.reduce((a, b) => a + b, 0);
        const lines = [
            `Count (n)        : ${n}`,
            `Sum              : ${fmtNum(sum)}`,
            `Mean             : ${fmtNum(mean)}`,
            `Median           : ${fmtNum(median)}`,
            `Mode             : ${mode.length ? mode.map(fmtNum).join(', ') : 'none'}`,
            `Min / Max        : ${fmtNum(min)} / ${fmtNum(max)}`,
            `Range            : ${fmtNum(range)}`,
            `Variance (pop)   : ${fmtNum(variance)}`,
            `Std Dev (pop)    : ${fmtNum(std)}`,
            `Variance (sample): ${fmtNum(sampleVar)}`,
            `Std Dev (sample) : ${fmtNum(sampleStd)}`,
            `Q1 (25%)         : ${fmtNum(q1)}`,
            `Q3 (75%)         : ${fmtNum(q3)}`,
            `IQR              : ${fmtNum(q3 - q1)}`
        ];
        box.textContent = lines.join('\n');
        box.classList.remove('error');
    }, box);
}

function medianOf(sorted) {
    const n = sorted.length;
    if (n === 0) return NaN;
    const mid = Math.floor(n / 2);
    return (n % 2) ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function quantile(sorted, q) {
    const n = sorted.length;
    if (n === 0) return NaN;
    const pos = (n - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
}

function modeOf(data) {
    const counts = {};
    let max = 0;
    data.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
        if (counts[v] > max) max = counts[v];
    });
    if (max <= 1) return [];
    return Object.keys(counts).filter(k => counts[k] === max).map(Number);
}

function computeRegression() {
    const box = $('#regResult');
    safeRun(() => {
        const xs = parseNumbers($('#regX').value);
        const ys = parseNumbers($('#regY').value);
        if (xs.length !== ys.length || xs.length < 2)
            throw new Error('X and Y must have the same length (≥ 2).');
        const n = xs.length;
        const meanX = xs.reduce((a, b) => a + b, 0) / n;
        const meanY = ys.reduce((a, b) => a + b, 0) / n;
        let sxy = 0, sxx = 0, syy = 0;
        for (let i = 0; i < n; i++) {
            sxy += (xs[i] - meanX) * (ys[i] - meanY);
            sxx += (xs[i] - meanX) ** 2;
            syy += (ys[i] - meanY) ** 2;
        }
        const slope = sxy / sxx;
        const intercept = meanY - slope * meanX;
        const r = sxy / Math.sqrt(sxx * syy);
        box.textContent =
            `y = ${fmtNum(slope)}·x + ${fmtNum(intercept)}\n` +
            `Slope (a)        : ${fmtNum(slope)}\n` +
            `Intercept (b)    : ${fmtNum(intercept)}\n` +
            `Correlation (r)  : ${fmtNum(r)}\n` +
            `R²               : ${fmtNum(r * r)}`;
        box.classList.remove('error');
    }, box);
}

/* ---------- Probability distributions ---------- */

function logFactorial(n) {
    if (n < 0) return NaN;
    let r = 0;
    for (let i = 2; i <= n; i++) r += Math.log(i);
    return r;
}
function logChoose(n, k) {
    if (k < 0 || k > n) return -Infinity;
    return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
}
function binomialPmf(n, p, k) {
    if (p < 0 || p > 1) return NaN;
    return Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}
function poissonPmf(lambda, k) {
    if (lambda <= 0) return NaN;
    return Math.exp(k * Math.log(lambda) - lambda - logFactorial(k));
}
/** Standard normal pdf. */
function normalPdf(x, mu, sigma) {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
/** Standard normal CDF via erf approximation. */
function normalCdf(x, mu, sigma) {
    const z = (x - mu) / (sigma * Math.sqrt(2));
    return 0.5 * (1 + erf(z));
}
function erf(x) {
    // Abramowitz & Stegun formula 7.1.26
    const t = 1 / (1 + 0.3275911 * Math.abs(x));
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return x >= 0 ? y : -y;
}
/** Student's t pdf. */
function tPdf(x, df) {
    const coef = Math.gamma((df + 1) / 2) / (Math.sqrt(df * Math.PI) * Math.gamma(df / 2));
    return coef * Math.pow(1 + x * x / df, -(df + 1) / 2);
}
// Provide Math.gamma if missing (older engines)
if (!Math.gamma) {
    Math.gamma = function gamma(z) {
        const g = 7;
        const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
            771.32342877765313, -176.61502916214059, 12.507343278686905,
            -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
        if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
        z -= 1;
        let x = c[0];
        for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
        const t = z + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    };
}
/** Chi-square pdf. */
function chiSquarePdf(x, k) {
    if (x <= 0) return 0;
    const coef = 1 / (Math.pow(2, k / 2) * Math.gamma(k / 2));
    return coef * Math.pow(x, k / 2 - 1) * Math.exp(-x / 2);
}

function computeDistributions(which) {
    const box = $('#distResult');
    safeRun(() => {
        let out = '';
        if (which === 'bin') {
            const n = parseInt($('#binN').value, 10);
            const p = parseFloat($('#binP').value);
            const k = parseInt($('#binK').value, 10);
            const pmf = binomialPmf(n, p, k);
            // CDF P(X<=k)
            let cdf = 0;
            for (let i = 0; i <= k; i++) cdf += binomialPmf(n, p, i);
            out = `Binomial(n=${n}, p=${p})\nP(X=${k}) = ${fmtNum(pmf)}\nP(X≤${k}) = ${fmtNum(cdf)}`;
        } else if (which === 'poi') {
            const l = parseFloat($('#poiL').value);
            const k = parseInt($('#poiK').value, 10);
            const pmf = poissonPmf(l, k);
            let cdf = 0;
            for (let i = 0; i <= k; i++) cdf += poissonPmf(l, i);
            out = `Poisson(λ=${l})\nP(X=${k}) = ${fmtNum(pmf)}\nP(X≤${k}) = ${fmtNum(cdf)}`;
        } else if (which === 't') {
            const df = parseFloat($('#dfVal').value);
            const x = parseFloat($('#distX').value);
            out = `Student-t (df=${df})\nf(${x}) = ${fmtNum(tPdf(x, df))}`;
        } else if (which === 'chi') {
            const df = parseFloat($('#dfVal').value);
            const x = parseFloat($('#distX').value);
            out = `Chi-square (df=${df})\nf(${x}) = ${fmtNum(chiSquarePdf(x, df))}`;
        }
        box.textContent = out;
        box.classList.remove('error');
    }, box);
}

/* =====================================================================
   NORMAL DISTRIBUTION (dedicated card)
   PDF point value, CDF P(X≤x), area P(a≤X≤b), and curve plotting.
   ===================================================================== */

/** Read the normal-distribution parameters from the UI. */
function readNormalParams() {
    const mu = parseFloat($('#normM').value);
    const sigma = parseFloat($('#normS').value);
    if (!Number.isFinite(mu)) throw new Error('μ must be a number.');
    if (!Number.isFinite(sigma) || sigma <= 0) throw new Error('σ must be a positive number.');
    return { mu, sigma };
}

/** Compute and show the point PDF + CDF P(X≤x). */
function computeNormalPoint() {
    const box = $('#normResult');
    safeRun(() => {
        const { mu, sigma } = readNormalParams();
        const x = parseFloat($('#normX').value);
        if (!Number.isFinite(x)) throw new Error('x must be a number.');
        const pdf = normalPdf(x, mu, sigma);
        const cdf = normalCdf(x, mu, sigma);
        box.textContent =
            `Normal(μ=${fmtNum(mu)}, σ=${fmtNum(sigma)})\n` +
            `f(${fmtNum(x)})   = ${fmtNum(pdf)}\n` +
            `P(X≤${fmtNum(x)}) = ${fmtNum(cdf)}\n` +
            `P(X>${fmtNum(x)}) = ${fmtNum(1 - cdf)}`;
        box.classList.remove('error');
    }, box);
}

/** Compute and show the area P(a ≤ X ≤ b) under the normal curve. */
function computeNormalArea() {
    const box = $('#normResult');
    safeRun(() => {
        const { mu, sigma } = readNormalParams();
        const a = parseFloat($('#normA').value);
        const b = parseFloat($('#normB').value);
        if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('a and b must be numbers.');
        if (b < a) throw new Error('Upper bound b must be ≥ lower bound a.');
        const area = normalCdf(b, mu, sigma) - normalCdf(a, mu, sigma);
        box.textContent =
            `Normal(μ=${fmtNum(mu)}, σ=${fmtNum(sigma)})\n` +
            `Area  P(${fmtNum(a)} ≤ X ≤ ${fmtNum(b)}) = ${fmtNum(area)}\n` +
            `      ≈ ${(area * 100).toFixed(2)} %\n` +
            `Tail  P(X < ${fmtNum(a)}) = ${fmtNum(normalCdf(a, mu, sigma))}\n` +
            `Tail  P(X > ${fmtNum(b)}) = ${fmtNum(1 - normalCdf(b, mu, sigma))}`;
        box.classList.remove('error');
        // Also plot with the shaded region so the result is visualized.
        plotNormal(true);
    }, box);
}

/** Plot the normal PDF curve, optionally shading the [a, b] region. */
function plotNormal(shadeArea) {
    const box = $('#normResult');
    safeRun(() => {
        const { mu, sigma } = readNormalParams();
        const range = Math.max(0.5, parseFloat($('#normRange').value) || 4);
        const xMin = mu - range * sigma;
        const xMax = mu + range * sigma;
        const N = 400;
        const xs = [], ys = [];
        for (let i = 0; i <= N; i++) {
            const x = xMin + (xMax - xMin) * i / N;
            xs.push(x);
            ys.push(normalPdf(x, mu, sigma));
        }
        const traces = [{
            x: xs, y: ys, mode: 'lines', name: `N(${fmtNum(mu)}, ${fmtNum(sigma)})`,
            line: { color: themeColor('primary'), width: 2.5 },
            fill: 'tozeroy', fillcolor: themeColor('primarySoft')
        }];

        // Shaded region [a, b]
        if (shadeArea) {
            const a = parseFloat($('#normA').value);
            const b = parseFloat($('#normB').value);
            if (Number.isFinite(a) && Number.isFinite(b) && b >= a) {
                const lo = Math.max(a, xMin), hi = Math.min(b, xMax);
                const sx = [], sy = [];
                for (let i = 0; i <= N; i++) {
                    const x = xMin + (xMax - xMin) * i / N;
                    if (x >= lo && x <= hi) { sx.push(x); sy.push(normalPdf(x, mu, sigma)); }
                }
                traces.push({
                    x: sx, y: sy, mode: 'lines', name: `P(${fmtNum(a)}≤X≤${fmtNum(b)})`,
                    line: { color: themeColor('accent'), width: 0 },
                    fill: 'tozeroy', fillcolor: themeColor('accentSoft'),
                    hoverinfo: 'skip'
                });
            }
        }
        // Vertical marker at x point
        const xPoint = parseFloat($('#normX').value);
        if (Number.isFinite(xPoint) && xPoint >= xMin && xPoint <= xMax) {
            traces.push({
                x: [xPoint, xPoint],
                y: [0, normalPdf(xPoint, mu, sigma)],
                mode: 'lines', name: `x=${fmtNum(xPoint)}`,
                line: { color: themeColor('warn'), width: 1.5, dash: 'dash' },
                hoverinfo: 'skip'
            });
        }

        Plotly.newPlot('normPlotDiv', traces, plotLayout('Normal Distribution PDF'), plotConfig());
        box.classList.remove('error');
    }, box);
}

function clearNormalPlot() {
    if (document.getElementById('normPlotDiv').data) Plotly.purge('normPlotDiv');
    $('#normPlotDiv').innerHTML = '';
}

/* =====================================================================
   DATA PLOTTING (statistics)
   Histogram, box, violin, line, and bar charts via Plotly.
   ===================================================================== */

function plotStatChart() {
    safeRun(() => {
        const data = parseNumbers($('#statData').value);
        if (!data.length) throw new Error('Enter a data set in the Data set field above.');
        const type = $('#statChartType').value;
        const bins = Math.max(1, parseInt($('#statBins').value, 10) || 10);
        let trace;

        if (type === 'histogram') {
            trace = {
                x: data, type: 'histogram', name: 'Frequency',
                marker: { color: themeColor('primary'), line: { color: themeColor('elev'), width: 1 } },
                nbinsx: bins, opacity: 0.9
            };
        } else if (type === 'box') {
            trace = { x: data, type: 'box', name: 'Data', boxpoints: 'all', jitter: 0.4,
                marker: { color: themeColor('accent') }, line: { color: themeColor('primary') } };
        } else if (type === 'violin') {
            trace = { x: data, type: 'violin', name: 'Data', box: { visible: true },
                meanline: { visible: true }, points: 'all', jitter: 0.4,
                line: { color: themeColor('accent') } };
        } else if (type === 'line') {
            trace = { y: data, type: 'scatter', mode: 'lines+markers', name: 'Value',
                line: { color: themeColor('primary'), width: 2 },
                marker: { color: themeColor('accent'), size: 7 } };
        } else { // bar
            trace = { y: data, type: 'bar', name: 'Value',
                marker: { color: themeColor('primary'), line: { color: themeColor('accent'), width: 1 } } };
        }

        const title = type.charAt(0).toUpperCase() + type.slice(1) + ' Plot — ' + data.length + ' values';
        Plotly.newPlot('statPlotDiv', [trace], plotLayout(title), plotConfig());
    });
}

function clearStatChart() {
    if (document.getElementById('statPlotDiv').data) Plotly.purge('statPlotDiv');
    $('#statPlotDiv').innerHTML = '';
}

/* ---------- Shared Plotly theme helpers ---------- */

function themeColor(name) {
    const cs = getComputedStyle(document.documentElement);
    switch (name) {
        case 'primary': return cs.getPropertyValue('--primary').trim() || '#6366f1';
        case 'accent': return cs.getPropertyValue('--accent').trim() || '#a855f7';
        case 'accent-2': return cs.getPropertyValue('--accent-2').trim() || '#818cf8';
        case 'warn': return cs.getPropertyValue('--warn').trim() || '#f59e0b';
        case 'elev': return cs.getPropertyValue('--bg-elev').trim() || '#151c2e';
        case 'primarySoft': return hexToRgba(cs.getPropertyValue('--primary').trim() || '#6366f1', 0.20);
        case 'accentSoft': return hexToRgba(cs.getPropertyValue('--accent').trim() || '#a855f7', 0.35);
        default: return '#6366f1';
    }
}

function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function plotLayout(title) {
    const cs = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.dataset.theme !== 'light';
    const grid = isDark ? (cs.getPropertyValue('--border').trim() || '#2a3450') : '#dce2f0';
    const zero = isDark ? '#475388' : '#9aa3bd';
    const txt = cs.getPropertyValue('--text').trim() || '#e6e9f2';
    return {
        title: { text: title, font: { color: txt, size: 14 } },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: txt, size: 12, family: 'Inter, sans-serif' },
        xaxis: { gridcolor: grid, zerolinecolor: zero, zerolinewidth: 2, title: 'x' },
        yaxis: { gridcolor: grid, zerolinecolor: zero, zerolinewidth: 2, title: 'y' },
        margin: { l: 50, r: 18, t: 42, b: 40 },
        showlegend: true,
        legend: { bgcolor: 'rgba(0,0,0,0)', font: { color: txt } }
    };
}

function plotConfig() {
    return { responsive: true, displaylogo: false, scrollZoom: true, modeBarButtonsToRemove: ['lasso2d'] };
}

/* =====================================================================
   CALCULUS
   ===================================================================== */

/** Compile a function f(x) using math.js. */
function compileFunc(expr) {
    // preprocess: allow implicit ^ etc. Use math.js parse.
    return math.parse(expr).compile();
}

/** Evaluate f at a point, respecting graph angle mode if requested. */
function evalAt(compiled, x, useAngleMode) {
    const scope = { x };
    if (useAngleMode) {
        attachAngleFunctions(scope);
    }
    const v = compiled.evaluate(scope);
    return (typeof v === 'number') ? v : NaN;
}

function attachAngleFunctions(scope) {
    const isDeg = State.angleMode === 'DEG';
    const D2R = Math.PI / 180, R2D = 180 / Math.PI;
    if (isDeg) {
        scope.sin = (a) => Math.sin(a * D2R);
        scope.cos = (a) => Math.cos(a * D2R);
        scope.tan = (a) => Math.tan(a * D2R);
        scope.asin = (a) => Math.asin(a) * R2D;
        scope.acos = (a) => Math.acos(a) * R2D;
        scope.atan = (a) => Math.atan(a) * R2D;
    }
}

/** Numerical derivative using central difference. */
function numericalDerivative(expr, x) {
    const f = compileFunc(expr);
    const h = 1e-5;
    const scope = { x: x + h }; attachAngleFunctions(scope);
    const fh = f.evaluate(scope);
    const scope2 = { x: x - h }; attachAngleFunctions(scope2);
    const fl = f.evaluate(scope2);
    if (typeof fh !== 'number' || typeof fl !== 'number') throw new Error('Cannot differentiate (non-numeric).');
    return (fh - fl) / (2 * h);
}

/** Trapezoidal rule. */
function trapezoidal(expr, a, b, n) {
    const f = compileFunc(expr);
    n = Math.max(1, Math.floor(n));
    const h = (b - a) / n;
    let sum = 0;
    for (let i = 1; i < n; i++) {
        const scope = { x: a + i * h }; attachAngleFunctions(scope);
        sum += f.evaluate(scope);
    }
    const scopeA = { x: a }; attachAngleFunctions(scopeA);
    const scopeB = { x: b }; attachAngleFunctions(scopeB);
    return (h / 2) * (f.evaluate(scopeA) + 2 * sum + f.evaluate(scopeB));
}

/** Simpson's 1/3 rule (requires even n). */
function simpson(expr, a, b, n) {
    const f = compileFunc(expr);
    if (n % 2 !== 0) n += 1; // make even
    const h = (b - a) / n;
    let s1 = 0, s2 = 0;
    for (let i = 1; i < n; i += 2) {
        const scope = { x: a + i * h }; attachAngleFunctions(scope);
        s1 += f.evaluate(scope);
    }
    for (let i = 2; i < n; i += 2) {
        const scope = { x: a + i * h }; attachAngleFunctions(scope);
        s2 += f.evaluate(scope);
    }
    const scopeA = { x: a }; attachAngleFunctions(scopeA);
    const scopeB = { x: b }; attachAngleFunctions(scopeB);
    return (h / 3) * (f.evaluate(scopeA) + 4 * s1 + 2 * s2 + f.evaluate(scopeB));
}

/** Numeric limit (two-sided, then one-sided fallback). */
function numericLimit(expr, x0) {
    const f = compileFunc(expr);
    let prev = NaN;
    for (let k = 1; k <= 30; k++) {
        const dx = Math.pow(10, -k);
        const sr = { x: x0 + dx }; attachAngleFunctions(sr);
        const sl = { x: x0 - dx }; attachAngleFunctions(sl);
        const vr = f.evaluate(sr);
        const vl = f.evaluate(sl);
        if (typeof vr !== 'number' || typeof vl !== 'number' ||
            !Number.isFinite(vr) || !Number.isFinite(vl)) {
            // try one-sided at this resolution
        }
        const avg = (vr + vl) / 2;
        if (Number.isFinite(avg) && Math.abs(avg - prev) < 1e-6 && k > 3) return avg;
        prev = avg;
    }
    return prev;
}

/* ---------- Root finding ---------- */
function rootBisection(expr, a, b, tol, maxIter = 100) {
    const f = compileFunc(expr);
    const sA = { x: a }; attachAngleFunctions(sA);
    const sB = { x: b }; attachAngleFunctions(sB);
    let fa = f.evaluate(sA), fb = f.evaluate(sB);
    if (fa * fb > 0) throw new Error('f(a) and f(b) must have opposite signs (root not bracketed).');
    for (let i = 0; i < maxIter; i++) {
        const c = (a + b) / 2;
        const sc = { x: c }; attachAngleFunctions(sc);
        const fc = f.evaluate(sc);
        if (Math.abs(fc) < tol || (b - a) / 2 < tol) return c;
        if (fa * fc < 0) { b = c; fb = fc; } else { a = c; fa = fc; }
    }
    return (a + b) / 2;
}

function rootNewton(expr, x0, tol, maxIter = 100) {
    const f = compileFunc(expr);
    const h = 1e-6;
    let x = x0;
    for (let i = 0; i < maxIter; i++) {
        const s = { x }; attachAngleFunctions(s);
        const fx = f.evaluate(s);
        if (typeof fx !== 'number') throw new Error('Non-numeric evaluation.');
        const s2 = { x: x + h }; attachAngleFunctions(s2);
        const s3 = { x: x - h }; attachAngleFunctions(s3);
        const dfx = (f.evaluate(s2) - f.evaluate(s3)) / (2 * h);
        if (Math.abs(dfx) < 1e-14) throw new Error('Derivative too small (Newton stalled).');
        const x1 = x - fx / dfx;
        if (Math.abs(x1 - x) < tol) return x1;
        x = x1;
    }
    return x;
}

function rootSecant(expr, a, b, tol, maxIter = 100) {
    const f = compileFunc(expr);
    let x0 = a, x1 = b;
    for (let i = 0; i < maxIter; i++) {
        const s0 = { x: x0 }; attachAngleFunctions(s0);
        const s1 = { x: x1 }; attachAngleFunctions(s1);
        const f0 = f.evaluate(s0), f1 = f.evaluate(s1);
        if (Math.abs(f1) < tol) return x1;
        if (Math.abs(f1 - f0) < 1e-14) throw new Error('Secant: denominator too small.');
        const x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
        if (Math.abs(x2 - x1) < tol) return x2;
        x0 = x1; x1 = x2;
    }
    return x1;
}

/* =====================================================================
   EQUATION SOLVER
   ===================================================================== */
function solveLinearEq() {
    const box = $('#linResult');
    safeRun(() => {
        const a = parseFloat($('#linA').value);
        const b = parseFloat($('#linB').value);
        if (a === 0) {
            box.textContent = b === 0 ? 'Infinite solutions (identity).' : 'No solution.';
        } else {
            box.textContent = `x = ${fmtNum(-b / a)}`;
        }
        box.classList.remove('error');
    }, box);
}

function solveQuadraticEq() {
    const box = $('#quadResult');
    safeRun(() => {
        const a = parseFloat($('#quadA').value);
        const b = parseFloat($('#quadB').value);
        const c = parseFloat($('#quadC').value);
        if (a === 0) throw new Error('a must be non-zero for a quadratic.');
        const disc = b * b - 4 * a * c;
        let out;
        if (disc > 0) {
            const r = Math.sqrt(disc);
            out = `Two real roots:\nx₁ = ${fmtNum((-b + r) / (2 * a))}\nx₂ = ${fmtNum((-b - r) / (2 * a))}`;
        } else if (disc === 0) {
            out = `One repeated real root:\nx = ${fmtNum(-b / (2 * a))}`;
        } else {
            const r = Math.sqrt(-disc);
            const re = fmtNum(-b / (2 * a));
            const im = fmtNum(r / (2 * a));
            out = `Two complex roots:\nx₁ = ${re} + ${im}i\nx₂ = ${re} − ${im}i`;
        }
        box.textContent = out;
        box.classList.remove('error');
    }, box);
}

function solveCubicEq() {
    const box = $('#cubResult');
    safeRun(() => {
        const a = parseFloat($('#cubA').value);
        const b = parseFloat($('#cubB').value);
        const c = parseFloat($('#cubC').value);
        const d = parseFloat($('#cubD').value);
        const roots = solveCubic(a, b, c, d);
        box.textContent = 'Roots:\n' + roots.map((r, i) => `x${sub(i)} = ${fmtResult(r)}`).join('\n');
        box.classList.remove('error');
    }, box);
}
function sub(i) { return ['₁', '₂', '₃'][i] || ''; }

/** Solve cubic using Vieta's trig method for 3 real roots, else Cardano. */
function solveCubic(a, b, c, d) {
    if (a === 0) throw new Error('a must be non-zero for a cubic equation.');
    return polyRoots([a, b, c, d]);
}

/** Numeric polynomial roots via companion-matrix eigenvalues (math.js). */
function polyRoots(coeffs) {
    // coeffs highest degree first; strip leading zeros
    while (coeffs.length > 1 && Math.abs(coeffs[0]) < 1e-14) coeffs.shift();
    const n = coeffs.length - 1;
    if (n <= 0) throw new Error('Polynomial degree must be ≥ 1.');
    if (n === 1) return [-coeffs[1] / coeffs[0]];
    // Build companion matrix
    const C = [];
    for (let i = 0; i < n; i++) {
        const row = new Array(n).fill(0);
        row[n - 1] = -coeffs[coeffs.length - 1 - i] / coeffs[0];
        if (i > 0) row[i - 1] = 1;
        C.push(row);
    }
    const eig = math.eigs(math.matrix(C));
    const vals = eig.values.toArray ? eig.values.toArray() : eig.values;
    return vals.map(v => math.number(v));
}

function solvePolyEq() {
    const box = $('#polyResult');
    safeRun(() => {
        const coeffs = parseNumbers($('#polyCoeffs').value);
        if (coeffs.length < 2) throw new Error('Enter at least 2 coefficients.');
        const roots = polyRoots(coeffs);
        box.textContent = `Polynomial degree ${coeffs.length - 1} roots:\n` +
            roots.map((r, i) => `x${sub(i)} = ${fmtResult(r)}`).join('\n');
        box.classList.remove('error');
    }, box);
}

/** Parse a system of linear equations text → solve. */
function solveSystemEq() {
    const box = $('#systemResult');
    safeRun(() => {
        const lines = $('#systemEqs').value.split('\n').map(s => s.trim()).filter(Boolean);
        if (!lines.length) throw new Error('Enter at least one equation.');
        // Identify all variables
        const varSet = new Set();
        lines.forEach(line => {
            const matches = line.match(/[a-zA-Z]+/g) || [];
            matches.forEach(m => { if (m.length === 1) varSet.add(m); });
        });
        const vars = Array.from(varSet).sort();
        if (!vars.length) throw new Error('No variables (use single letters like x, y, z).');

        const A = [], B = [];
        lines.forEach(line => {
            // split into LHS = RHS
            const parts = line.split('=');
            if (parts.length !== 2) throw new Error(`Equation must contain '=': "${line}"`);
            // We compute: LHS - RHS = 0  →  Ax = -constant(LHS - RHS)
            const lhsCoeffs = parseSide(parts[0], vars);
            const rhsCoeffs = parseSide(parts[1], vars);
            const row = vars.map((_, i) => lhsCoeffs[i] - rhsCoeffs[i]);
            const constant = lhsCoeffs[vars.length] - rhsCoeffs[vars.length];
            A.push(row);
            B.push(-constant);
        });
        if (A.length !== vars.length) {
            throw new Error(`Need ${vars.length} equations for ${vars.length} variables.`);
        }
        const X = math.lusolve(math.matrix(A), B).toArray();
        const out = vars.map((v, i) => `${v} = ${fmtNum(X[i][0])}`).join('\n');
        box.textContent = out;
        box.classList.remove('error');
    }, box);
}

/** Parse one side of an equation into coefficient array [c_x, c_y, ..., const]. */
function parseSide(text, vars) {
    // Tokenize: insert + before - and split
    const normalized = text.replace(/\s+/g, '').replace(/-/g, '+-');
    const tokens = normalized.split('+').filter(Boolean);
    const coeffs = vars.map(() => 0);
    let constant = 0;
    tokens.forEach(tok => {
        if (!tok) return;
        const varMatch = tok.match(/^(-?\d*\.?\d*(?:e[-+]?\d+)?)([a-zA-Z])$/i);
        if (varMatch) {
            const v = varMatch[2].toLowerCase();
            const idx = vars.indexOf(v);
            if (idx === -1) throw new Error(`Unknown variable "${v}".`);
            const coef = varMatch[1] === '' ? 1 : (varMatch[1] === '-' ? -1 : parseFloat(varMatch[1]));
            coeffs[idx] += coef;
        } else {
            const num = parseFloat(tok);
            if (Number.isFinite(num)) constant += num;
            else throw new Error(`Cannot parse token "${tok}".`);
        }
    });
    coeffs.push(constant);
    return coeffs;
}

/* =====================================================================
   UNIT CONVERTER
   ===================================================================== */
// Each category maps unit → factor relative to a base unit.
// Temperature is handled separately (non-linear).
const UNITS = {
    length: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Micrometer: 1e-6, Nanometer: 1e-9, Mile: 1609.344, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254, 'Nautical Mile': 1852 },
    area: { 'Square Meter': 1, 'Square Kilometer': 1e6, 'Square Centimeter': 1e-4, 'Square Millimeter': 1e-6, Hectare: 1e4, Acre: 4046.8564224, 'Square Mile': 2589988.110336, 'Square Foot': 0.09290304, 'Square Inch': 0.00064516 },
    volume: { Liter: 1, Milliliter: 0.001, 'Cubic Meter': 1000, 'Cubic Centimeter': 0.001, Gallon: 3.785411784, Quart: 0.946352946, Pint: 0.473176473, Cup: 0.2365882365, 'Fluid Ounce': 0.0295735295625, Tablespoon: 0.01478676478125, Teaspoon: 0.00492892159375 },
    mass: { Kilogram: 1, Gram: 0.001, Milligram: 1e-6, 'Metric Ton': 1000, Pound: 0.45359237, Ounce: 0.028349523125, Stone: 6.35029318, 'US Ton': 907.18474, Tonne: 1000 },
    time: { Second: 1, Millisecond: 0.001, Microsecond: 1e-6, Nanosecond: 1e-9, Minute: 60, Hour: 3600, Day: 86400, Week: 604800, Month: 2629800, Year: 31557600 },
    speed: { 'Meter/second': 1, 'Kilometer/hour': 0.277777778, 'Mile/hour': 0.44704, 'Foot/second': 0.3048, Knot: 0.514444444 },
    pressure: { Pascal: 1, Kilopascal: 1000, Megapascal: 1e6, Bar: 100000, Atmosphere: 101325, PSI: 6894.757293168, Torr: 133.322368421 },
    energy: { Joule: 1, Kilojoule: 1000, Calorie: 4.184, Kilocalorie: 4184, 'Watt-hour': 3600, 'Kilowatt-hour': 3.6e6, 'Electronvolt': 1.602176634e-19, BTU: 1055.05585262, FootPound: 1.3558179483314 },
    power: { Watt: 1, Kilowatt: 1000, Megawatt: 1e6, Milliwatt: 0.001, Horsepower: 745.69987158227, 'FootPound/second': 1.3558179483314, 'BTU/hour': 0.2930710701722 },
    angle: { Degree: 1, Radian: 57.29577951308232, Gradian: 0.9, Turn: 360, Arcminute: 1 / 60, Arcsecond: 1 / 3600 }
};
// Temperature handled specially
const TEMP_UNITS = ['Celsius', 'Fahrenheit', 'Kelvin'];

function populateConverterUnits() {
    const cat = $('#convCategory').value;
    const from = $('#convFrom');
    const to = $('#convTo');
    from.innerHTML = ''; to.innerHTML = '';
    if (cat === 'temperature') {
        TEMP_UNITS.forEach(u => {
            from.appendChild(new Option(u, u));
            to.appendChild(new Option(u, u));
        });
        to.selectedIndex = 1;
    } else {
        const units = Object.keys(UNITS[cat]);
        units.forEach(u => {
            from.appendChild(new Option(u, u));
            to.appendChild(new Option(u, u));
        });
        to.selectedIndex = Math.min(1, units.length - 1);
    }
}

function convertTemperature(value, from, to) {
    let celsius;
    switch (from) {
        case 'Celsius': celsius = value; break;
        case 'Fahrenheit': celsius = (value - 32) * 5 / 9; break;
        case 'Kelvin': celsius = value - 273.15; break;
    }
    switch (to) {
        case 'Celsius': return celsius;
        case 'Fahrenheit': return celsius * 9 / 5 + 32;
        case 'Kelvin': return celsius + 273.15;
    }
}

function convertUnit() {
    const box = $('#convResult');
    safeRun(() => {
        const cat = $('#convCategory').value;
        const value = parseFloat($('#convValue').value);
        const from = $('#convFrom').value;
        const to = $('#convTo').value;
        if (Number.isNaN(value)) throw new Error('Enter a numeric value.');
        let result;
        if (cat === 'temperature') {
            result = convertTemperature(value, from, to);
        } else {
            const baseValue = value * UNITS[cat][from];
            result = baseValue / UNITS[cat][to];
        }
        box.textContent = `${fmtNum(value)} ${from} = ${fmtNum(result)} ${to}`;
        box.classList.remove('error');
    }, box);
}

/* =====================================================================
   GRAPH PLOTTER (Plotly.js)
   ===================================================================== */
let graphData = []; // current traces
let graphLayout = null;

function parseGraphFunc(expr) {
    // Allow "y = ..." prefix
    let s = expr.trim();
    s = s.replace(/^y\s*=\s*/i, '');
    return s;
}

/** Generate x array from range/step. */
function generateXs(xMin, xMax, step) {
    if (step <= 0) throw new Error('Step must be positive.');
    if (xMax <= xMin) throw new Error('x-max must be greater than x-min.');
    const xs = [];
    const count = Math.min(200000, Math.floor((xMax - xMin) / step) + 1);
    for (let i = 0; i < count; i++) xs.push(xMin + i * step);
    return xs;
}

/** Evaluate function over xs, respecting graph angle mode. */
function evaluateFunctionForPlot(compiled, xs) {
    const ys = [];
    const isDeg = $('#graphAngleMode').value === 'deg';
    const D2R = Math.PI / 180;
    xs.forEach(x => {
        const scope = { x };
        if (isDeg) {
            scope.sin = (a) => Math.sin(a * D2R);
            scope.cos = (a) => Math.cos(a * D2R);
            scope.tan = (a) => Math.tan(a * D2R);
            scope.asin = (a) => Math.asin(a);
            scope.acos = (a) => Math.acos(a);
            scope.atan = (a) => Math.atan(a);
        }
        try {
            const y = compiled.evaluate(scope);
            ys.push((typeof y === 'number' && Number.isFinite(y)) ? y : null);
        } catch {
            ys.push(null);
        }
    });
    return ys;
}

/** Find sign-change x-intercepts (roots) within data. */
function findXIntercepts(xs, ys) {
    const pts = [];
    for (let i = 1; i < ys.length; i++) {
        if (ys[i] === null || ys[i - 1] === null) continue;
        if (ys[i - 1] === 0) pts.push({ x: xs[i - 1], y: 0 });
        else if (ys[i - 1] * ys[i] < 0) {
            // linear interpolation for the crossing
            const x0 = xs[i - 1], x1 = xs[i], y0 = ys[i - 1], y1 = ys[i];
            const xc = x0 - y0 * (x1 - x0) / (y1 - y0);
            pts.push({ x: xc, y: 0 });
        }
    }
    // dedupe close points
    const out = [];
    pts.forEach(p => {
        if (!out.some(q => Math.abs(q.x - p.x) < 1e-6)) out.push(p);
    });
    return out;
}

/** Find turning points (local extrema) via sign change of slope. */
function findExtrema(xs, ys) {
    const maxima = [], minima = [];
    for (let i = 2; i < ys.length - 1; i++) {
        if ([ys[i - 1], ys[i], ys[i + 1]].some(v => v === null)) continue;
        const d1 = ys[i] - ys[i - 1];
        const d2 = ys[i + 1] - ys[i];
        if (d1 > 0 && d2 < 0) maxima.push({ x: xs[i], y: ys[i] });
        else if (d1 < 0 && d2 > 0) minima.push({ x: xs[i], y: ys[i] });
    }
    return { maxima, minima };
}

/** Plot one function row (index). */
function plotFunctionRow(rowEl, replace = false) {
    const expr = $('.func-expr', rowEl).value;
    plotSingle(expr, replace);
}

/** Plot a single expression; appends to current traces unless replace. */
function plotSingle(exprRaw, replace = false) {
    const info = $('#graphInfo');
    safeRun(() => {
        const expr = parseGraphFunc(exprRaw);
        if (!expr) throw new Error('Enter a function expression.');
        const compiled = math.parse(expr).compile();
        const xMin = parseFloat($('#xMin').value);
        const xMax = parseFloat($('#xMax').value);
        const step = parseFloat($('#xStep').value);
        const xs = generateXs(xMin, xMax, step);
        const ys = evaluateFunctionForPlot(compiled, xs);

        if (replace) graphData = [];
        const colorIdx = graphData.length;
        const trace = {
            x: xs, y: ys,
            mode: 'lines',
            name: 'y = ' + expr,
            line: { color: traceColor(colorIdx), width: 2 },
            connectgaps: false
        };
        graphData.push(trace);

        // Key points (only meaningful for the first/only trace for clarity)
        let infoText = `Plotted: y = ${expr}\nPoints: ${xs.length}`;
        if ($('#showKeyPoints').checked && graphData.length === 1) {
            const intercepts = findXIntercepts(xs, ys);
            const { maxima, minima } = findExtrema(xs, ys);
            const yIntercept = ys[0]; // y at xMin... better: evaluate at x=0 if in range
            let yInt = null;
            if (xMin <= 0 && xMax >= 0) {
                const idx = xs.reduce((best, x, i) => Math.abs(x) < Math.abs(xs[best]) ? i : best, 0);
                yInt = ys[idx];
            }
            infoText += '\n\n— Key points —';
            if (yInt !== null) infoText += `\ny-intercept  ≈ (0, ${fmtNum(yInt)})`;
            infoText += `\nx-intercepts: ${intercepts.length ? intercepts.slice(0, 10).map(p => fmtNum(p.x)).join(', ') : 'none in range'}`;
            infoText += `\nLocal maxima: ${maxima.length ? maxima.slice(0, 5).map(p => `(${fmtNum(p.x)}, ${fmtNum(p.y)})`).join(', ') : 'none'}`;
            infoText += `\nLocal minima: ${minima.length ? minima.slice(0, 5).map(p => `(${fmtNum(p.x)}, ${fmtNum(p.y)})`).join(', ') : 'none'}`;
        }
        info.textContent = infoText;
        info.classList.remove('error');

        renderPlot();
    }, info);
}

function traceColor(i) {
    const palette = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
    return palette[i % palette.length];
}

function plotAll() {
    const rows = $$('#functionList .func-row');
    if (!rows.length) return;
    graphData = [];
    rows.forEach(r => {
        const expr = $('.func-expr', r).value;
        if (expr.trim()) plotSingle(expr, false);
    });
    // Intersection analysis between first two traces
    if (graphData.length >= 2 && $('#showKeyPoints').checked) {
        findIntersections(graphData[0], graphData[1]);
    }
}

function findIntersections(t1, t2) {
    const info = $('#graphInfo');
    const pts = [];
    for (let i = 0; i < t1.x.length; i++) {
        const y1 = t1.y[i], y2 = t2.y[i];
        if (y1 === null || y2 === null) continue;
        if (i > 0) {
            const y1p = t1.y[i - 1], y2p = t2.y[i - 1];
            if (y1p !== null && y2p !== null && (y1 - y2) * (y1p - y2p) < 0) {
                // linear interp
                const x0 = t1.x[i - 1], x1 = t1.x[i];
                const denom = ((y1 - y2) - (y1p - y2p));
                const xc = Math.abs(denom) < 1e-14 ? x0 : x0 - (y1p - y2p) * (x1 - x0) / denom;
                pts.push({ x: xc, y: y1 });
            }
        }
    }
    let txt = info.textContent;
    txt += `\n\nIntersections (${t1.name} & ${t2.name}): ` +
        (pts.length ? pts.slice(0, 8).map(p => `(${fmtNum(p.x)}, ${fmtNum(p.y)})`).join(', ') : 'none');
    info.textContent = txt;
}

function renderPlot() {
    const layout = plotLayout('Function Plotter');
    graphLayout = layout;
    Plotly.newPlot('plotDiv', graphData, layout, plotConfig());
}

function replotGraph() {
    if (graphData.length) renderPlot();
}

function clearGraph() {
    graphData = [];
    Plotly.purge('plotDiv');
    $('#graphInfo').textContent = 'Graph cleared. Enter a function and click Plot.';
    $('#graphInfo').classList.remove('error');
}

function resetZoom() {
    if (graphData.length) renderPlot();
}

/* =====================================================================
   EVENT WIRING
   ===================================================================== */
function wireEvents() {
    // Tab navigation
    $$('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    // switch-link inside basic panel
    $$('.switch-link').forEach(a => {
        a.addEventListener('click', e => { e.preventDefault(); switchTab(a.dataset.tab); });
    });

    // Keypad clicks (basic + scientific)
    $$('.keypad .key').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.action === 'clear') return clearAll();
            if (btn.dataset.action === 'backspace') return backspace();
            if (btn.dataset.action === 'equals') return computeResult();
            if (btn.dataset.action === 'inv') {
                State.invMode = !State.invMode;
                applyInvToKeypad();
                return;
            }
            insertAtCursor(btn.dataset.insert);
        });
    });

    // Angle toggles (both displays share mode)
    $('#angleToggle').addEventListener('click', toggleAngleMode);
    $('#angleToggle2').addEventListener('click', toggleAngleMode);

    // Live evaluation on input
    $('#expressionInput').addEventListener('input', liveEvaluate);
    $('#expressionInput2').addEventListener('input', liveEvaluate);
    $('#expressionInput').addEventListener('keydown', onCalcKeydown);
    $('#expressionInput2').addEventListener('keydown', onCalcKeydown);

    // Global keyboard support
    document.addEventListener('keydown', onGlobalKeydown);

    // Header controls
    $('#themeToggle').addEventListener('click', toggleTheme);
    $('#historyToggle').addEventListener('click', () => {
        const p = $('#historyPanel');
        State.historyOpen = !State.historyOpen;
        p.classList.toggle('hidden', !State.historyOpen);
        p.classList.toggle('open', State.historyOpen);
    });
    $('#clearHistory').addEventListener('click', () => {
        State.history = [];
        renderHistory();
        saveState();
    });

    // ---- Matrix ----
    $('#matABuild').addEventListener('click', () => buildMatrixInputs('#matrixA', '#matARows', '#matACols'));
    $('#matBBuild').addEventListener('click', () => buildMatrixInputs('#matrixB', '#matBRows', '#matBCols'));
    $$('[data-mat]').forEach(b => b.addEventListener('click', () => runMatrixOp(b.dataset.mat)));
    $('#solveLinSystem').addEventListener('click', solveLinearSystem);

    // ---- Complex ----
    $$('[data-complex]').forEach(b => b.addEventListener('click', () => runComplexOp(b.dataset.complex)));

    // ---- Statistics ----
    $('#statCompute').addEventListener('click', computeStats);
    $('#statClear').addEventListener('click', () => { $('#statData').value = ''; $('#statResult').textContent = 'Cleared.'; });
    $('#statPlot').addEventListener('click', plotStatChart);
    $('#statPlotClear').addEventListener('click', clearStatChart);
    $('#regCompute').addEventListener('click', computeRegression);
    $('#binCompute').addEventListener('click', () => computeDistributions('bin'));
    $('#poiCompute').addEventListener('click', () => computeDistributions('poi'));
    $('#normCompute').addEventListener('click', computeNormalPoint);
    $('#normAreaCompute').addEventListener('click', computeNormalArea);
    $('#normPlot').addEventListener('click', () => plotNormal(false));
    $('#normPlotClear').addEventListener('click', clearNormalPlot);
    $('#tCompute').addEventListener('click', () => computeDistributions('t'));
    $('#chiCompute').addEventListener('click', () => computeDistributions('chi'));

    // ---- Calculus ----
    $('#derivCompute').addEventListener('click', () => {
        const box = $('#derivResult');
        safeRun(() => {
            const v = numericalDerivative($('#derivExpr').value, parseFloat($('#derivX').value));
            box.textContent = `f'(${$('#derivX').value}) ≈ ${fmtNum(v)}`;
            box.classList.remove('error');
        }, box);
    });
    $('#trapCompute').addEventListener('click', () => {
        const box = $('#intResult');
        safeRun(() => {
            const v = trapezoidal($('#intExpr').value, parseFloat($('#intA').value), parseFloat($('#intB').value), parseInt($('#intN').value, 10));
            box.textContent = `∫ f(x) dx ≈ ${fmtNum(v)}  (Trapezoidal, n=${$('#intN').value})`;
            box.classList.remove('error');
        }, box);
    });
    $('#simpCompute').addEventListener('click', () => {
        const box = $('#intResult');
        safeRun(() => {
            const v = simpson($('#intExpr').value, parseFloat($('#intA').value), parseFloat($('#intB').value), parseInt($('#intN').value, 10));
            box.textContent = `∫ f(x) dx ≈ ${fmtNum(v)}  (Simpson's 1/3, n even)`;
            box.classList.remove('error');
        }, box);
    });
    $('#limCompute').addEventListener('click', () => {
        const box = $('#limResult');
        safeRun(() => {
            const v = numericLimit($('#limExpr').value, parseFloat($('#limX').value));
            box.textContent = `lim(x→${$('#limX').value}) ≈ ${fmtNum(v)}`;
            box.classList.remove('error');
        }, box);
    });
    $('#bisectBtn').addEventListener('click', () => runRoot('bisection'));
    $('#newtonBtn').addEventListener('click', () => runRoot('newton'));
    $('#secantBtn').addEventListener('click', () => runRoot('secant'));

    // ---- Solver ----
    $('#solveLinear').addEventListener('click', solveLinearEq);
    $('#solveQuad').addEventListener('click', solveQuadraticEq);
    $('#solveCubic').addEventListener('click', solveCubicEq);
    $('#solvePoly').addEventListener('click', solvePolyEq);
    $('#solveSystem').addEventListener('click', solveSystemEq);

    // ---- Converter ----
    $('#convCategory').addEventListener('change', populateConverterUnits);
    $('#convCompute').addEventListener('click', convertUnit);

    // ---- Graph ----
    $('#addFunc').addEventListener('click', addFunctionRow);
    $('#plotAll').addEventListener('click', plotAll);
    $('#clearGraph').addEventListener('click', clearGraph);
    $('#resetZoom').addEventListener('click', resetZoom);
    // delegate plot/remove for function rows
    $('#functionList').addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const row = btn.closest('.func-row');
        if (btn.classList.contains('plotOne')) plotFunctionRow(row);
        else if (btn.classList.contains('removeFunc')) {
            if ($$('#functionList .func-row').length > 1) row.remove();
            else { $('.func-expr', row).value = ''; }
        }
    });
}

/** Root-finding UI dispatcher. */
function runRoot(method) {
    const box = $('#rootResult');
    safeRun(() => {
        const expr = $('#rootExpr').value;
        const a = parseFloat($('#rootA').value);
        const b = parseFloat($('#rootB').value);
        const tol = parseFloat($('#rootTol').value);
        let root, label;
        if (method === 'bisection') { root = rootBisection(expr, a, b, tol); label = `Bisection root in [${a}, ${b}]`; }
        else if (method === 'newton') { root = rootNewton(expr, b, tol); label = `Newton-Raphson root (x0=${b})`; }
        else { root = rootSecant(expr, a, b, tol); label = `Secant root (x0=${a}, x1=${b})`; }
        // Verify
        const f = compileFunc(expr);
        const s = { x: root }; attachAngleFunctions(s);
        const check = f.evaluate(s);
        box.textContent = `${label}:\nx ≈ ${fmtNum(root)}\nf(x) ≈ ${fmtNum(check)}`;
        box.classList.remove('error');
    }, box);
}

/** Keyboard handler inside expression inputs (Enter =, etc.). */
function onCalcKeydown(e) {
    if (e.key === 'Enter') { e.preventDefault(); computeResult(); }
}

/** Global keyboard support: digits/operators work even when a key isn't focused. */
function onGlobalKeydown(e) {
    // Ignore typing into other inputs (matrix cells, solver fields, etc.) unless it's the calc display.
    const tag = (e.target.tagName || '').toLowerCase();
    const isCalcInput = e.target.classList && e.target.classList.contains('expression-input');
    const inOtherInput = (tag === 'input' || tag === 'textarea' || tag === 'select') && !isCalcInput;
    if (inOtherInput) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const allowed = /^[0-9+\-*/().%^,! ]$/;
    if (allowed.test(e.key)) {
        // Only auto-route when not already focused in calc input
        if (!isCalcInput) {
            e.preventDefault();
            insertAtCursor(e.key);
        }
    } else if (e.key === 'Enter' || e.key === '=') {
        if (!isCalcInput) { e.preventDefault(); computeResult(); }
    } else if (e.key === 'Backspace') {
        if (!isCalcInput) { e.preventDefault(); backspace(); }
    } else if (e.key === 'Escape') {
        if (!isCalcInput) { e.preventDefault(); clearAll(); }
    } else if (e.key === 'p' || e.key === 'P') {
        // π shortcut
        if (!isCalcInput) { e.preventDefault(); insertAtCursor('π'); }
    }
}

function addFunctionRow() {
    const row = document.createElement('div');
    row.className = 'func-row';
    row.innerHTML =
        '<input type="text" class="func-expr" placeholder="f(x), e.g. cos(x)">' +
        '<button class="btn op-btn plotOne">Plot</button>' +
        '<button class="btn op-btn removeFunc">✕</button>';
    $('#functionList').appendChild(row);
    $('.func-expr', row).focus();
}

/* =====================================================================
   INITIALIZATION
   ===================================================================== */
function init() {
    // Verify libraries loaded
    if (typeof math === 'undefined') {
        document.body.innerHTML = '<p style="padding:24px;color:#ef4444;font-family:sans-serif">' +
            'Failed to load math.js from CDN. Please check your internet connection and reload.</p>';
        return;
    }

    wireEvents();
    loadState();

    // Build default matrices
    buildMatrixInputs('#matrixA', '#matARows', '#matACols');
    buildMatrixInputs('#matrixB', '#matBRows', '#matBCols');

    // Populate converter
    populateConverterUnits();

    // Apply inverse-mode mapping baseline
    applyInvToKeypad();

    // Initial history panel state (open on desktop, hidden on small screens)
    const small = window.matchMedia('(max-width: 860px)').matches;
    State.historyOpen = !small;
    $('#historyPanel').classList.toggle('hidden', !State.historyOpen);
    $('#historyPanel').classList.toggle('open', State.historyOpen);

    // Focus primary input
    $('#expressionInput').focus();

    console.log('%cAdvanced Scientific Calculator ready.', 'color:#3b82f6;font-weight:bold');
}

document.addEventListener('DOMContentLoaded', init);
