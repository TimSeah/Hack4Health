import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourcePath = resolve(root, "TECHNICAL_TRACK_SUBMISSION.md");
const transformedPath = "/tmp/hack4health-submission-print.md";
const bodyPath = "/tmp/hack4health-submission-body.html";
const outputPath = resolve(root, "TECHNICAL_TRACK_SUBMISSION.html");

let markdown = readFileSync(sourcePath, "utf8");

markdown = markdown.replace(
  /```mermaid[\s\S]*?```/,
  `<figure class="architecture-figure">\n<img src="SubmissionAssets/architecture-pilot.svg" alt="ClinicPrep architecture with four target flows using Dataverse and a live Power Automate handoff using SharePoint">\n<figcaption>Hybrid prototype and target architecture. Handoff is live through Power Automate and SharePoint; four upstream action boundaries remain deterministic mocks.</figcaption>\n</figure>`
);

markdown = markdown.replace(
  /\$\$40 \\times \(6\\text\{-\}10\\text\{ minutes saved\}\) = 240\\text\{-\}400\\text\{ minutes\} = 4\.0\\text\{-\}6\.7\\text\{ staff-hours\}\$\$/,
  `<div class="equation">40 patients x 6-10 minutes saved = 240-400 minutes = <strong>4.0-6.7 staff-hours</strong></div>`
);

markdown = markdown.replace(
  /\$\$\\text\{Monthly benefit\} = \\frac\{\\text\{patients\} \\times \\text\{adoption\} \\times \\text\{minutes saved\}\}\{60\}[\s\S]*?\\text\{loaded staff hourly cost\}\$\$/,
  `<div class="equation"><strong>Monthly benefit</strong> = (patients x adoption x minutes saved / 60) x loaded staff hourly cost</div>`
);

markdown = markdown.replace(
  "## Appendix - Prototype Evidence",
  `<div class="appendix-break"></div>\n\n<h2 class="appendix-title">Appendix - Prototype Evidence</h2>`
);

writeFileSync(transformedPath, markdown);
execFileSync("npx", ["-y", "marked", "-i", transformedPath, "-o", bodyPath], {
  stdio: "inherit",
});

let body = readFileSync(bodyPath, "utf8");
body = body.replace(
  /(<h3>Figure A[\s\S]*?)(?=<h3>Figure A|<ul>\s*<li>Repository evidence:)/g,
  `<section class="appendix-figure">$1</section>\n`
);
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Hack4Health 2026 - Technical Track Submission</title>
<style>
  @page { size: A4 portrait; margin: 9mm 11mm 10mm; }
  * { box-sizing: border-box; }
  html { background: #fff; }
  body {
    margin: 0;
    color: #1f2933;
    font-family: "Aptos", "Segoe UI", Arial, sans-serif;
    font-size: 9pt;
    line-height: 1.24;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  h1 { margin: 0 0 2.5mm; color: #075985; font-size: 18pt; line-height: 1.05; }
  h2 {
    margin: 0 0 2mm;
    padding-bottom: 1mm;
    color: #075985;
    border-bottom: 1.5px solid #0ea5a4;
    font-size: 13pt;
    line-height: 1.1;
    break-after: avoid;
  }
  h3 { margin: 2.2mm 0 1mm; color: #0f4c5c; font-size: 10.5pt; line-height: 1.12; break-after: avoid; }
  p { margin: 1.25mm 0; }
  strong { color: #111827; }
  ul, ol { margin: 1mm 0 1.5mm 4mm; padding-left: 3.5mm; }
  li { margin: 0.45mm 0; }
  table {
    width: 100%;
    margin: 1.3mm 0 1.8mm;
    border-collapse: collapse;
    font-size: 7.6pt;
    line-height: 1.18;
    break-inside: avoid;
  }
  th, td { padding: 1.05mm 1.25mm; border: 0.6px solid #b8c4cc; vertical-align: top; }
  th { color: #0f3d4c; background: #eaf6f6; font-weight: 700; }
  tr:nth-child(even) td { background: #f8fafb; }
  code { font-family: "Cascadia Mono", Consolas, monospace; font-size: 0.92em; color: #075985; }
  blockquote { margin: 2mm 0; padding: 1.5mm 2.5mm; border-left: 3px solid #0ea5a4; background: #f0fdfa; }
  a { color: #075985; text-decoration: none; }
  .architecture-figure {
    margin: 1.5mm 0 1.8mm;
    padding: 1.5mm;
    border: 0.7px solid #b8c4cc;
    background: #fff;
    break-inside: avoid;
  }
  .architecture-figure img { display: block; width: 100%; height: auto; max-height: 72mm; object-fit: contain; }
  figcaption { margin-top: 0.8mm; color: #52616b; font-size: 7pt; text-align: center; }
  .equation {
    margin: 1.5mm auto;
    padding: 1.4mm 2mm;
    border: 0.7px solid #99c8c8;
    border-radius: 2px;
    background: #f0fdfa;
    color: #12343b;
    font-size: 8.4pt;
    text-align: center;
    break-inside: avoid;
  }
  div[style*="page-break-after"] { height: 0; break-after: page; page-break-after: always; }
  .appendix-break { height: 0; break-before: page; page-break-before: always; }
  img { max-width: 100%; height: auto; }
  .appendix-title + p { break-after: avoid; }
  .appendix-figure { margin: 2mm 0 0; break-inside: avoid; page-break-inside: avoid; }
  .appendix-figure h3 { margin-top: 0; }
  .appendix-figure img { display: block; max-height: 210mm; margin: 1.5mm auto 0; object-fit: contain; }
  body > p:last-child { margin-top: 2mm; padding: 1.5mm 2mm; background: #fff7ed; border-left: 3px solid #f59e0b; }
</style>
</head>
<body>
${body}
</body>
</html>`;

writeFileSync(outputPath, html);
console.log(`Generated ${outputPath}`);
