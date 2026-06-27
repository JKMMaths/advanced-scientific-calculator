<div align="center">

# 🧮 Advanced Scientific Calculator

**A complete, browser-based scientific calculator — basic arithmetic to matrix algebra, complex numbers, statistics with interactive plots, numerical calculus, equation solving, function graphing, and unit conversion. No backend, no build step.**

[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla_ES2020+-f7df1e?logo=javascript&logoColor=black)](#)
[![math.js](https://img.shields.io/badge/math.js-12.4.1-1a1a1a?logo=math.js)](https://mathjs.org/)
[![Plotly.js](https://img.shields.io/badge/Plotly.js-2.32.0-3f4f75?logo=plotly)](https://plotly.com/javascript/)
[![License](https://img.shields.io/badge/License-MIT-6366f1)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-a855f7)](#contributing)

![Dark/Light](https://img.shields.io/badge/Theme-Dark_/_Light-8b5cf6)
![Responsive](https://img.shields.io/badge/Layout-Responsive-06b6d4)
![No Backend](https://img.shields.io/badge/Runtime-Browser_Only-10b981)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Live Demo / Quick Start](#-live-demo--quick-start)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Module Documentation](#-module-documentation)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Sample Test Cases](#-sample-test-cases)
- [Code Quality & Architecture](#-code-quality--architecture)
- [Browser Compatibility](#-browser-compatibility)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Advanced Scientific Calculator** is a feature-rich, single-page web application that consolidates the functionality of an engineering calculator, a statistics workbench, a graphing tool, and a unit converter into one polished interface. It runs entirely in the browser — open the HTML file and start computing.

It is built with **vanilla JavaScript** (no framework), styled with hand-written CSS featuring a modern **indigo/violet** design system, and powered by **math.js** for expression evaluation and **Plotly.js** for interactive visualizations.

### Why this project?

| Need | This app delivers |
|------|-------------------|
| Quick arithmetic with a history | Basic + Scientific calculators with live preview |
| Linear algebra homework | Matrix operations, eigenvalues, system solving |
| Probability & data analysis | Descriptive stats, distributions, plotting |
| Checking calculus results | Numerical derivatives, integrals, root finding |
| Visualizing functions | Interactive multi-function graph plotter |

---

## ✨ Key Features

### Nine Integrated Modules in One App

- **🟦 Basic** — Four-function arithmetic, parentheses, %, π/e, factorial, memory (MC/MR/M+/M-/MS), live result preview, full keyboard input.
- **🔬 Scientific** — Trig (+ inverses via INV toggle), hyperbolic, log₁₀/ln/log₂, exponentials, powers (x², x³, xʸ, √, ∛, ⁿ√), abs, mod, reciprocal, physical constants (c, G, h, k, Nₐ, qₑ), DEG/RAD toggle.
- **⊞ Matrix** — Add, subtract, multiply, determinant, inverse, transpose, rank, eigenvalues, and solve linear systems **AX = B** (up to 8×8).
- **ℂ Complex** — Arithmetic on z₁/z₂, modulus, argument, conjugate, and rectangular ↔ polar conversion (DEG/RAD).
- **📊 Statistics** — Descriptive stats (mean, median, mode, variance, std dev, quartiles), **interactive data plots** (histogram, box, violin, line, bar), linear regression, and probability distributions (binomial, Poisson, normal, Student-t, chi-square).
- **∫ Calculus** — Numerical differentiation (central difference), integration (trapezoidal & Simpson's 1/3), numeric limits, and root finding (bisection, Newton-Raphson, secant).
- **✓ Solver** — Linear, quadratic, cubic, general polynomial root finding, and natural-language systems of linear equations.
- **📈 Graph** — Interactive multi-function plotting with Plotly: custom ranges, DEG/RAD, auto-detected key points (intercepts, extrema, intersections), zoom, and pan.
- **↔ Converter** — 11 categories (length, area, volume, mass, time, speed, temperature, pressure, energy, power, angle) with bidirectional conversion.

### Standout Highlights

- **📐 Normal Distribution with Area Under Curve** — Compute `P(X ≤ x)` and the shaded area `P(a ≤ X ≤ b)`, rendered interactively with the curve, shaded region, and marker.
- **🎨 Modern Design System** — Indigo/violet gradient accents, glass-morphism header, depth-layered cards with accent bars, FontAwesome icons throughout, and smooth theme transitions.
- **💾 Persistent State** — Theme, angle mode, memory, and history survive page reloads via `localStorage`.
- **♿ Accessibility-Aware** — `prefers-reduced-motion` support, keyboard navigation, ARIA labels, and high-contrast themes.

---

## 🚀 Live Demo / Quick Start

### Option 1 — Open directly (zero setup)

Double-click `index.html`, or drag it into your browser. That's it.

### Option 2 — Local server (recommended)

A local server avoids any browser file-access quirks and gives the smoothest experience.

```bash
# Using Python (bundled on most systems)
cd advanced-scientific-calculator
python -m http.server 8000
# → open http://localhost:8000

# Using Node.js
npx serve .

# Using VS Code
# Install the "Live Server" extension → right-click index.html → "Open with Live Server"
```

### Option 3 — GitHub Pages

1. Push the repository to GitHub.
2. **Settings → Pages → Source: `main` branch → `/` (root)**.
3. Your calculator is live at `https://<your-username>.github.io/<repo-name>/`.

> ⚠️ **Internet connection required on first load** for the CDN dependencies (math.js, Plotly.js, FontAwesome). Browsers cache these afterward.

---

## 🛠 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Markup** | HTML5 | — | Semantic structure |
| **Styling** | CSS3 | — | Custom properties, Grid, Flexbox, glass-morphism |
| **Logic** | JavaScript | ES2020+ (vanilla) | All calculator logic — no framework |
| **Math Engine** | [math.js](https://mathjs.org/) | 12.4.1 | Expression parsing, matrices, complex numbers, eigenvalues |
| **Graphing** | [Plotly.js](https://plotly.com/javascript/) | 2.32.0 | Interactive function plots, statistical charts |
| **Icons** | [FontAwesome](https://fontawesome.com/) | 6.5.2 | UI icons across all modules |

No build tools, no bundlers, no `npm install` to run. Pure static files.

---

## 📂 Project Structure

```
advanced-scientific-calculator/
│
├── index.html              # Single-page layout: 9 tabbed panels + history sidebar
├── style.css               # Design system: indigo/violet theme, depth, responsiveness
├── script.js               # All logic (~1,900 lines, modular & commented)
├── README.md               # This file
├── assets/
│   └── favicon.svg         # Gradient brand favicon (indigo → violet)
│
└── (no other dependencies — everything else loads from CDN)
```

### File Responsibilities

- **`index.html`** — Page skeleton, the 9 module panels, history sidebar, header/footer. Loads CDN libraries and local `style.css` / `script.js`.
- **`style.css`** — CSS custom-property theming (dark + light), all component styling, animations, responsive breakpoints, and accessibility rules.
- **`script.js`** — Self-contained modules: expression evaluation (with DEG/RAD), each calculator module, Plotly rendering helpers, history, persistence, and event wiring.

---

## 📚 Module Documentation

### 1. Basic Calculator
Standard four-function calculator enhanced with parentheses, percentage, factorial, and constants.
- **Operators:** `+ − × ÷`, parentheses `( )`, percent `%`, factorial `!`
- **Constants:** π, e
- **Memory:** MC (clear), MR (recall), M+ (add), M- (subtract), MS (store) — indicator badge appears when memory is non-zero
- **Live preview:** result updates as you type
- **Keyboard:** full support (see [Keyboard Shortcuts](#-keyboard-shortcuts))

### 2. Scientific Calculator
Extended keypad with inverse-function toggle and angle modes.
- **Trigonometric:** sin, cos, tan, csc, sec, cot — press **INV** for inverses (asin, acos, …)
- **Hyperbolic:** sinh, cosh, tanh (+ inverses)
- **Logarithmic:** log₁₀, ln, log₂
- **Exponential:** eˣ, 10ˣ, EE (scientific notation), random
- **Powers:** x², x³, xʸ, √, ∛, ⁿ√
- **Other:** |x| (absolute), mod, 1/x (reciprocal), x!
- **Physical constants:** c (speed of light), G (gravitational), h (Planck), k (Boltzmann), Nₐ (Avogadro), qₑ (electron charge)
- **Angle modes:** DEG/RAD toggle shared across Basic and Scientific — all trigonometric functions respect the active mode

### 3. Matrix Calculator
Operates on two matrices, A and B (1×1 up to 8×8).
| Operation | Function |
|-----------|----------|
| A + B, A − B, A × B | Element-wise / matrix arithmetic |
| det(A), det(B) | Determinant |
| A⁻¹, B⁻¹ | Matrix inverse |
| Aᵀ, Bᵀ | Transpose |
| rank(A), rank(B) | Rank via Gaussian elimination |
| eig(A) | Eigenvalues |
| **Solve AX = B** | LU decomposition — A = coefficients, B = constants column |

### 4. Complex Number Calculator
Enter z₁ = a + bi and z₂ = c + di, then compute:
- **Arithmetic:** z₁ ± z₂, z₁ × z₂, z₁ ÷ z₂
- **Properties:** |z₁| (modulus), arg(z₁) (argument)
- **Conjugate:** conj(z₁)
- **Conversion:** rectangular ↔ polar form (DEG/RAD)

### 5. Statistics Calculator
The most feature-rich module, split into four cards:

**A. Descriptive Statistics** — paste a comma/space-separated data set:
- Count, Sum, Mean, Median, Mode
- Min, Max, Range
- Population & Sample Variance and Standard Deviation
- Quartiles (Q1, Q3) and IQR

**B. Data Plotting** — visualize the data set:
- **Histogram** (configurable bins), **Box plot**, **Violin plot**, **Line plot**, **Bar plot**
- All rendered interactively with Plotly (zoom, hover, pan)

**C. Linear Regression** — paired X/Y lists:
- Slope (a), Intercept (b), correlation coefficient (r), R²

**D. Probability Distributions:**

| Distribution | Parameters | Output |
|-------------|------------|--------|
| Binomial | n, p, k | P(X=k), P(X≤k) |
| Poisson | λ, k | P(X=k), P(X≤k) |
| **Normal** | μ, σ, x, a, b | **PDF f(x), P(X≤x), area P(a≤X≤b) + shaded curve** |
| Student-t | df, x | PDF f(x) |
| Chi-square | df, x | PDF f(x) |

The **Normal Distribution** card is a standout: it computes both point values (`P(X≤x)`) and the **area under the curve** between bounds `P(a≤X≤b)`, then renders the PDF with the region shaded and a marker at `x`.

### 6. Calculus Tools
All numerical methods respect the active DEG/RAD mode.

| Tool | Method | Inputs |
|------|--------|--------|
| Differentiation | Central difference (h = 10⁻⁵) | f(x), x-value |
| Integration | Trapezoidal rule | f(x), a, b, n intervals |
| Integration | Simpson's 1/3 rule | f(x), a, b, n intervals |
| Limit | Two-sided numerical approach | f(x), x → x₀ |
| Root finding | Bisection | f(x), [a, b], tolerance |
| Root finding | Newton-Raphson | f(x), x₀, tolerance |
| Root finding | Secant | f(x), x₀, x₁, tolerance |

### 7. Equation Solver
| Type | Form | Method |
|------|------|--------|
| Linear | ax + b = 0 | Direct |
| Quadratic | ax² + bx + c = 0 | Discriminant (real + complex roots) |
| Cubic | ax³ + bx² + cx + d = 0 | Companion-matrix eigenvalues |
| Polynomial | any degree | Companion-matrix eigenvalues |
| **System** | linear equations | Natural notation → LU decomposition |

**System solver accepts natural notation:**
```
2x + y - z = 1
x - y + 2z = 4
3x + 2y + z = 7
```
→ solves for x, y, z automatically.

### 8. Graph Plotter
Powered by **Plotly.js** for true interactivity.
- **Multiple functions** on one graph, each color-coded
- **Customizable** x-min, x-max, step size
- **DEG/RAD** aware for trig functions
- **Zoom & pan** (mouse wheel, drag), hover for coordinates
- **Key-point detection** (toggle on/off): y-intercept, x-intercepts (sign changes), local maxima/minima, and intersections between two functions
- **Clear / Reset zoom** controls

**Example plots:**
```
y = sin(x)              over [-10, 10]
y = x^2 - 4x + 3        over [-5, 10]   → x-intercepts at 1 & 3, min at (2, −1)
y = exp(-x) * sin(x)    over [0, 20]    → damped oscillation
```

### 9. Unit Converter
11 categories with full bidirectional conversion:

| Category | Sample units |
|----------|-------------|
| Length | m, km, cm, mm, mi, yd, ft, in, nautical mile |
| Area | m², km², hectare, acre, mi², ft² |
| Volume | L, mL, m³, gal, qt, pt, cup, fl oz |
| Mass | kg, g, mg, tonne, lb, oz, stone |
| Time | s, ms, min, hr, day, week, year |
| Speed | m/s, km/h, mph, knot |
| Temperature | °C, °F, K (non-linear conversion) |
| Pressure | Pa, kPa, bar, atm, psi, Torr |
| Energy | J, kJ, cal, kcal, Wh, kWh, BTU |
| Power | W, kW, MW, hp |
| Angle | degree, radian, gradian, arcmin, arcsec |

### History Panel
- Every computed result is stored automatically
- Click any entry to reload its expression into the Basic calculator
- **Clear** button wipes history
- Persisted in `localStorage` (survives reload)

---

## ⌨️ Keyboard Shortcuts

The Basic/Scientific calculators support full keyboard input, even when the input field isn't focused:

| Key | Action |
|-----|--------|
| `0`–`9`, `.` | Digits / decimal |
| `+ − * /` | Operators |
| `( )` | Parentheses |
| `^` | Power |
| `%` | Percentage |
| `!` | Factorial |
| `Enter` or `=` | Evaluate |
| `Backspace` | Delete last character |
| `Esc` | Clear all |
| `P` | Insert π |

> When typing directly in the expression field, all standard text-editing keys also work.

---

## 🧪 Sample Test Cases

### Basic & Scientific
| Expression | Mode | Expected |
|-----------|------|----------|
| `2 + 3 * 4` | — | 14 |
| `(2 + 3) * 4` | — | 20 |
| `50%` | — | 0.5 |
| `sqrt(144)` | — | 12 |
| `5!` | — | 120 |
| `sin(30)` | DEG | 0.5 |
| `cos(60)` | DEG | 0.5 |
| `tan(45)` | DEG | 1 |
| `asin(0.5)` (INV) | DEG | 30 |
| `log(100)` | — | 2 |
| `ln(e)` | — | 1 |
| `2^10` | — | 1024 |

### Matrix
| Operation | Input | Expected |
|-----------|-------|----------|
| det(A) | `[[1,2],[3,4]]` | −2 |
| A × B | `[[1,2],[3,4]]` × `[[5,6],[7,8]]` | `[[19,22],[43,50]]` |
| Solve AX=B | A=`[[2,1,-1],[1,-1,2],[3,2,1]]`, B=`[1,4,7]` | x=1, y=1, z=2 |

### Complex
| Operation | Input | Expected |
|-----------|-------|----------|
| z₁ + z₂ | (3+4i) + (1+2i) | 4 + 6i |
| z₁ × z₂ | (3+4i) × (1+2i) | −5 + 10i |
| \|z₁\| | \|3+4i\| | 5 |
| arg(z₁) | arg(3+4i) | ≈ 53.13° |

### Statistics
| Data | Statistic | Expected |
|------|-----------|----------|
| `2,4,4,4,5,5,7,9` | Mean | 5 |
| `2,4,4,4,5,5,7,9` | Median | 4.5 |
| `2,4,4,4,5,5,7,9` | Mode | 4 |
| `2,4,4,4,5,5,7,9` | Pop. Std Dev | ≈ 1.9235 |
| Normal μ=0, σ=1 | P(−1 ≤ X ≤ 1) | ≈ 0.6827 |

### Calculus
| Tool | Input | Expected |
|------|-------|----------|
| f'(x) at x=1 | f(x) = x³ + 2x | 5 |
| ∫₀^π sin(x) dx | Simpson, n=1000 | ≈ 2.0 |
| lim x→0 sin(x)/x | Numeric | ≈ 1.0 |
| Newton root | f(x)=x²−4, x₀=1 | ≈ 2.0 |

### Equation Solver
| Type | Equation | Roots |
|------|----------|-------|
| Quadratic | x² − 5x + 6 = 0 | x = 2, x = 3 |
| Cubic | x³ − 6x² + 11x − 6 = 0 | x = 1, 2, 3 |
| System | (see Matrix test above) | x=1, y=1, z=2 |

### Unit Converter
| From → To | Expected |
|-----------|----------|
| 100 km → miles | ≈ 62.14 |
| 0 °C → °F | 32 |
| 1 atm → Pa | 101,325 |
| 1 hp → W | ≈ 745.7 |

---

## 🏗 Code Quality & Architecture

- **Modular design** — Each calculator module is a self-contained section with dedicated functions (`computeStats()`, `runMatrixOp()`, `plotNormal()`, etc.).
- **Error-safe evaluation** — All user-facing operations run through a `safeRun()` wrapper that catches exceptions and displays friendly messages in result boxes — **invalid input never crashes the page**.
- **Input validation** — Numeric inputs are validated before processing; descriptive errors guide the user.
- **Reusable Plotly helpers** — Shared `plotLayout()`, `plotConfig()`, `themeColor()`, and `hexToRgba()` functions theme every chart consistently and respond to dark/light mode.
- **DEG/RAD correctness** — Angle mode is enforced via a custom evaluation scope that overrides math.js trig functions, verified to produce correct degree results.
- **Persistence** — Theme, angle mode, memory, and history saved to `localStorage`.
- **No external build** — Zero dependencies to install; opens and runs from the file system.
- **Accessibility** — `prefers-reduced-motion` media query, ARIA labels on controls, keyboard navigation.

---

## 🌐 Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome 90+ | ✅ Fully supported |
| Firefox 88+ | ✅ Fully supported |
| Edge 90+ | ✅ Fully supported |
| Safari 14+ | ✅ Fully supported |
| Mobile Chrome / Safari | ✅ Responsive layout |

> Requires an ES2020-capable browser (optional chaining, `Promise.allSettled`, etc.) and internet access for CDN libraries on first load.

---

## 🤝 Contributing

Contributions are welcome! This is a great project for adding mathematical features or practicing vanilla-JS architecture.

### Ideas for contribution
- 📈 Add 3D graphing (Plotly supports `surface` / `scatter3d`)
- 📉 Add symbolic differentiation (integrate a CAS library)
- 🧮 Add matrix eigen**vectors** (currently eigenvalues only)
- 🎨 Additional themes (e.g., solarized, nord)
- 🌍 Internationalization (i18n) of labels

### How to contribute
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please keep the vanilla-JS, no-build-tool philosophy intact.

---

## 📄 License

Released under the **MIT License**. See [LICENSE](LICENSE) for details, or just use it freely for personal, educational, or commercial purposes.

---

<div align="center">

**Built with vanilla JavaScript, math.js, and Plotly.js — runs entirely in your browser.**

⭐ If this project helped you, consider giving it a star!

</div>
