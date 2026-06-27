# Advanced Scientific Calculator

A fully-featured, modern, responsive scientific calculator web application — runs entirely in the browser with no backend required.

Built with **HTML**, **CSS**, **JavaScript**, powered by **math.js** (expression engine) and **Plotly.js** (interactive graphing).

---

## 📂 Folder Structure

```
advanced-scientific-calculator/
│
├── index.html          # Main HTML layout with all 9 tabs
├── style.css           # Professional UI, dark/light theme, responsive
├── script.js           # All calculator logic (~1300 lines, well-commented)
├── README.md           # This file
└── assets/
    └── favicon.svg     # Calculator logo favicon
```

## 🚀 Setup & Running

### Option 1 — Direct file open
1. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
2. That's it — no install, no server, no build step.

### Option 2 — Local HTTP server (recommended for best experience)
```bash
# Using Python
cd advanced-scientific-calculator
python -m http.server 8000
# Open http://localhost:8000

# Using Node.js (npx)
npx serve .

# Using VS Code
# Install "Live Server" extension, right-click index.html → "Open with Live Server"
```

> **Note:** CDN resources (math.js, Plotly.js) load from `cdnjs.cloudflare.com` and `cdn.plot.ly`. An internet connection is required on first load (browsers cache these afterward).

---

## 🧮 Modules Overview

### 1. Basic Calculator (`Basic` tab)
Standard four-function calculator with extras:
- **Operations:** addition, subtraction, multiplication, division, percentage
- **Parentheses:** `( )` support
- **Backspace** and **Clear** (C)
- **Memory:** MC, MR, M+, M-, MS
- **Constants:** π, e
- **Keyboard input:** type digits, operators, Enter (=), Backspace, Esc (clear), P (π)
- **Live preview:** result updates as you type
- **Decimal operations:** full floating-point support

### 2. Scientific Calculator (`Scientific` tab)
Extended function keypad (7-column grid):
| Category | Functions |
|----------|-----------|
| Trigonometric | sin, cos, tan, csc, sec, cot (+ INV for inverse) |
| Hyperbolic | sinh, cosh, tanh (+ INV for inverse) |
| Logarithmic | log₁₀, ln, log₂ |
| Exponential | eˣ, 10ˣ, random |
| Powers | x², x³, xʸ, √, ∛, ⁿ√, x! |
| Other | \|x\|, mod, 1/x |
| Constants | π, e, i, c, G, h, k, Nₐ, qₑ |
| Format | EE (scientific notation) |

- **INV toggle:** switches trig/log/power functions to their inverses (e.g., sin→asin, x²→√x, x³→∛)
- **DEG/RAD toggle:** shared between Basic and Scientific tabs
- All trig functions respect the selected angle mode

### 3. Matrix Calculator (`Matrix` tab)
Define two matrices A and B (1×1 to 8×8), then perform:
- **Arithmetic:** A + B, A − B, A × B
- **Determinant:** det(A), det(B)
- **Inverse:** A⁻¹, B⁻¹
- **Transpose:** Aᵀ, Bᵀ
- **Rank:** rank(A), rank(B) — via Gaussian elimination
- **Eigenvalues:** eig(A)
- **Solve linear system:** A·X = B (A = coefficients, B = constants column)

### 4. Complex Number Calculator (`Complex` tab)
Enter two complex numbers z₁ = a + bi and z₂ = c + di, then:
- **Arithmetic:** z₁ + z₂, z₁ − z₂, z₁ × z₂, z₁ ÷ z₂
- **Properties:** |z₁| (modulus), arg(z₁) (argument)
- **Conjugate:** conj(z₁)
- **Conversions:** rectangular ↔ polar form
- Angle mode selectable (DEG/RAD) for argument display

### 5. Statistics Calculator (`Statistics` tab)
#### Descriptive Statistics
Enter a comma/space-separated data set → compute:
- Count, Sum, Mean, Median, Mode
- Min, Max, Range
- Population & Sample Variance and Standard Deviation
- Quartiles (Q1, Q3, IQR)

#### Linear Regression
Enter paired X/Y data → compute:
- Slope (a), Intercept (b)
- Correlation coefficient (r) and R²
- Equation: y = a·x + b

#### Probability Distributions
| Distribution | Parameters | Output |
|-------------|------------|--------|
| Binomial | n, p, k | P(X=k), P(X≤k) |
| Poisson | λ, k | P(X=k), P(X≤k) |
| Normal | μ, σ, x | PDF f(x), CDF P(X≤x) |
| Student-t | df, x | PDF f(x) |
| Chi-square | df, x | PDF f(x) |

### 6. Calculus Tools (`Calculus` tab)
| Tool | Method | Input |
|------|--------|-------|
| Numerical differentiation | Central difference (h=10⁻⁵) | f(x), x-value |
| Definite integral | Trapezoidal rule | f(x), a, b, n |
| Definite integral | Simpson's 1/3 rule | f(x), a, b, n |
| Limit | Two-sided numerical approach | f(x), x→x₀ |
| Root finding | Bisection method | f(x), a, b, tolerance |
| Root finding | Newton-Raphson method | f(x), x₀, tolerance |
| Root finding | Secant method | f(x), a, b, tolerance |

All calculus tools respect DEG/RAD mode for trigonometric functions.

### 7. Equation Solver (`Solver` tab)
| Equation Type | Method |
|--------------|--------|
| Linear: ax + b = 0 | Direct formula |
| Quadratic: ax² + bx + c = 0 | Discriminant analysis (real + complex roots) |
| Cubic: ax³ + bx² + cx + d = 0 | Companion matrix eigenvalues |
| Polynomial (any degree) | Companion matrix eigenvalues |
| System of linear equations | Parse natural notation → LU decomposition |

**System solver example:**
```
2x + y - z = 1
x - y + 2z = 4
3x + 2y + z = 7
```
→ x = 1, y = 1, z = 2

### 8. Graph Plotter (`Graph` tab)
Powered by **Plotly.js** for interactive visualization.
- **Multiple functions:** add unlimited functions, each with its own color
- **Customizable range:** set x-min, x-max, step size
- **Angle mode:** plot trig functions in DEG or RAD
- **Interactive:** zoom, pan, hover for coordinates (Plotly built-in)
- **Key points detection** (optional toggle):
  - y-intercept (if x=0 in range)
  - x-intercepts (sign-change detection)
  - Local maxima and minima
  - Intersection points between two functions
- **Controls:** Plot all, Clear graph, Reset zoom

### 9. Unit Converter (`Converter` tab)
11 categories with full bidirectional conversion:

| Category | Units |
|----------|-------|
| Length | m, km, cm, mm, μm, nm, mi, yd, ft, in, nautical mile |
| Area | m², km², cm², mm², hectare, acre, mi², ft², in² |
| Volume | L, mL, m³, cm³, gal, qt, pt, cup, fl oz, tbsp, tsp |
| Mass | kg, g, mg, tonne, lb, oz, stone, US ton |
| Time | s, ms, μs, ns, min, hr, day, week, month, year |
| Speed | m/s, km/h, mph, ft/s, knot |
| Temperature | °C, °F, K |
| Pressure | Pa, kPa, MPa, bar, atm, psi, Torr |
| Energy | J, kJ, cal, kcal, Wh, kWh, eV, BTU, ft·lbf |
| Power | W, kW, MW, mW, hp, ft·lbf/s, BTU/hr |
| Angle | degree, radian, gradian, turn, arcmin, arcsec |

### 10. History Panel
- Automatically stores every calculation result
- Click any history entry to reload it into the Basic calculator
- Persisted in `localStorage` (survives page reload)
- Clear history button
- Toggle panel visibility

### 11. Theme & Responsiveness
- **Dark / Light mode toggle** (persisted in localStorage)
- **Responsive layout:** adapts to desktop, tablet, and mobile
- Mobile: slide-out history panel, 4-column keypad
- Desktop: sidebar history panel, full-width keypad

---

## 🔬 Sample Test Cases

### Basic Calculator
| Expression | Expected Result |
|-----------|----------------|
| `2 + 3 * 4` | 14 |
| `(2 + 3) * 4` | 20 |
| `50%` | 0.5 |
| `sqrt(144)` | 12 |
| `3!` | 6 |
| `π * 4^2` | ≈50.2655 |

### Scientific (DEG mode)
| Expression | Expected Result |
|-----------|----------------|
| `sin(30)` | 0.5 |
| `cos(60)` | 0.5 |
| `tan(45)` | 1 |
| `asin(0.5)` | 30 |
| `log(100)` | 2 |
| `ln(e)` | 1 |
| `exp(0)` | 1 |

### Complex Numbers
| Operation | Input | Expected |
|-----------|-------|----------|
| z₁ + z₂ | (3+4i) + (1+2i) | 4 + 6i |
| z₁ × z₂ | (3+4i) × (1+2i) | −5 + 10i |
| \|z₁\| | \|3+4i\| | 5 |
| arg(z₁) | arg(3+4i) | ≈53.13° |

### Matrix
| Operation | Input A | Expected |
|-----------|---------|----------|
| det(A) | [[1,2],[3,4]] | −2 |
| A⁻¹ | [[1,2],[3,4]] | [[−2, 1], [1.5, −0.5]] |
| A × B | [[1,2],[3,4]] × [[5,6],[7,8]] | [[19, 22], [43, 50]] |

### Statistics
| Data | Statistic | Expected |
|------|-----------|----------|
| 2, 4, 4, 4, 5, 5, 7, 9 | Mean | 5 |
| 2, 4, 4, 4, 5, 5, 7, 9 | Median | 4.5 |
| 2, 4, 4, 4, 5, 5, 7, 9 | Mode | 4 |
| 2, 4, 4, 4, 5, 5, 7, 9 | Std Dev (pop) | ≈1.9235 |

### Calculus
| Tool | Input | Expected |
|------|-------|----------|
| f'(x) at x=1 | f(x) = x³ + 2x | 5 |
| ∫ sin(x) dx [0, π] | Trapezoidal (n=1000) | ≈2.0 |
| ∫ sin(x) dx [0, π] | Simpson's 1/3 (n=1000) | ≈2.0 |
| lim sin(x)/x → 0 | Numerical limit | ≈1.0 |
| Bisection root | f(x)=x²−4, [−5,5] | ≈−2 or ≈2 |
| Newton root | f(x)=x²−4, x₀=1 | ≈2.0 |

### Equation Solver
| Type | Coefficients | Roots |
|------|-------------|-------|
| Linear | 2x − 6 = 0 | x = 3 |
| Quadratic | x² − 5x + 6 = 0 | x = 2, x = 3 |
| Cubic | x³ − 6x² + 11x − 6 = 0 | x = 1, x = 2, x = 3 |
| System | 2x+y−z=1, x−y+2z=4, 3x+2y+z=7 | x=1, y=1, z=2 |

### Graph Plotter
| Function | Range | Check |
|----------|-------|-------|
| y = sin(x) | x ∈ [−10, 10] | Periodic wave, y-intercept = 0 |
| y = x² − 4x + 3 | x ∈ [−5, 10] | x-intercepts at x=1, x=3, min at (2,−1) |
| y = exp(−x)·sin(x) | x ∈ [0, 20] | Damped oscillation, decaying envelope |

### Unit Converter
| From → To | Expected |
|-----------|----------|
| 100 km → mi | ≈62.1371 |
| 0 °C → °F | 32 |
| 1 atm → Pa | 101325 |
| 1 hp → W | ≈745.7 |

---

## 🛠 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Structure | HTML5 | — |
| Styling | CSS3 (custom properties, Grid, Flexbox) | — |
| Logic | Vanilla JavaScript (ES2020+) | — |
| Math Engine | [math.js](https://mathjs.org/) | 12.4.1 (CDN) |
| Graphing | [Plotly.js](https://plotly.com/javascript/) | 2.32.0 (CDN) |

## 📐 Code Quality

- **Modular architecture:** each calculator module is a self-contained section with dedicated functions
- **Error handling:** all user-facing operations wrapped in `safeRun()` — catches exceptions and displays in result boxes without crashing
- **Input validation:** numeric inputs validated before processing
- **Persistent state:** theme, angle mode, memory, and history saved to `localStorage`
- **Well-commented:** each section marked with clear headers, functions documented with JSDoc-style comments
- **No external build tools:** zero dependencies to install, no Node.js required to run

## 📱 Browser Compatibility

| Browser | Supported |
|---------|-----------|
| Chrome 80+ | ✅ |
| Firefox 75+ | ✅ |
| Edge 80+ | ✅ |
| Safari 13+ | ✅ |
| Mobile Chrome | ✅ |
| Mobile Safari | ✅ |

## 📄 License

This project is provided as-is for educational and personal use. Feel free to modify and distribute.
#   a d v a n c e d - s c i e n t i f i c - c a l c u l a t o r  
 