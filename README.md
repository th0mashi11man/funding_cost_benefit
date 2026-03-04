# Applied IT Research Funding Financial Cost-Benefit Calculator

This application performs a detailed cost-benefit analysis on external research funding for the Department of Applied IT. It helps researchers and financial officers understand the relationship between funder coverage, departmental co-financing, and the recovery of existing salary costs.

The tool is built with **React**, **TypeScript**, and **Vite**, and is deployed automatically to GitHub Pages.

## 🚀 Getting Started

To run the application locally:

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the development server:**
    ```bash
    npm run dev
    ```
3.  **Build for production:**
    ```bash
    npm run build
    ```

## 📦 Deployment

The application is hosted on GitHub Pages. To deploy the latest changes:

```bash
npm run deploy
```

This runs the `predeploy` script (building the project) and then uses `gh-pages` to push the `dist` folder to the `gh-pages` branch.

---

## ⚙️ Configuration (config.json)

The `public/config.json` file defines the overhead policy, list of funders, and the rules for University and Faculty co-funding. The application fetches this file dynamically at runtime.

### 1) Overhead Policy

Defines the departmental indirect cost rates:

```json
"overhead": {
  "label": "2025",
  "salary_percent": 62,
  "other_percent": 52
}
```

- **label**: Short text shown in the UI badge.
- **salary_percent**: Overhead % applied to salary costs.
- **other_percent**: Overhead % applied to other direct costs.

### 2) Default Funding Scheme

```json
"defaultScheme": "vr"
```

Determines which scheme (by `id`) is selected when the page first loads.

### 3) Funding Schemes & Funder Rules

Each entry in the `schemes` array defines a funder's behavior:

#### Funder Object Modes:

1.  `"percent_overhead"`: Covers a specific % of the calculated department overhead.
2.  `"percent_total"`: Covers indirects as a percentage of the total project budget (cascading).
3.  `"absolute"`: Covers a fixed SEK amount of overhead.
4.  `"none"`: No coverage of indirect costs.
5.  `"manual"`: (Used for 'Other') allows user input in the UI.

### 4) Internal Support Rules (University / Faculty)

The `uf_rules` array defines how internal bodies co-finance the project:

- **modes**: `percent_total`, `percent_total_capped_per_year`, `fixed_per_year`.
- **notes**: Text displayed in the UI information box.

---

## 🛠 Project Structure

- `src/App.tsx`: Main UI logic and component structure.
- `src/logic/math.ts`: Core financial calculation engine.
- `src/logic/i18n.ts`: Translation dictionary for Swedish and English support.
- `public/config.json`: Externalized configuration for funders and rates.

## 📝 Legal Disclaimer

*NB: This tool is for illustrative purposes only. Always verify results with a financial officer before submitting formal applications.*
