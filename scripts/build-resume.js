"use strict";

// Builds a resume PDF from its JSON source using LaTeX (moderncv), replacing the
// old resumake.io website workflow. Reads src/assets/Conor-Hinchee/<name>.json,
// renders a moderncv .tex, compiles it with pdflatex, and writes <name>.pdf back
// next to the JSON so `npm run build` (build:assets) picks it up for deploy.
//
//   npm run resume                       # builds "Conor Hinchee Resume 2026"
//   npm run resume -- "Conor Hinchee Resume 2027"   # build a different file
//
// Requires a LaTeX install with pdflatex + the moderncv class. If the
// fontawesome5 package is missing, a no-op icon shim is used so the build still
// succeeds (contact/section icons are simply omitted).

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ASSETS_DIR = path.join(__dirname, "..", "src", "assets", "Conor-Hinchee");
const NAME = process.argv[2] || "Conor Hinchee Resume 2026";
const JSON_PATH = path.join(ASSETS_DIR, `${NAME}.json`);
const PDF_PATH = path.join(ASSETS_DIR, `${NAME}.pdf`);

// Title shown under the name. moderncv has no dedicated JSON field for it.
const HEADLINE = "Software Engineer";

// --- helpers ---------------------------------------------------------------

const esc = (s) => {
    if (s === undefined || s === null) return "";
    let out = String(s).replace(/\\/g, "\\textbackslash{}");
    const map = {
        "&": "\\&", "%": "\\%", "$": "\\$", "#": "\\#",
        "_": "\\_", "{": "\\{", "}": "\\}",
        "~": "\\textasciitilde{}", "^": "\\textasciicircum{}",
    };
    return out.replace(/[&%$#_{}~^]/g, (c) => map[c]);
};

const has = (cmd, args) => {
    try {
        execFileSync(cmd, args, { stdio: "ignore" });
        return true;
    } catch (_) {
        return false;
    }
};

// --- tex generation --------------------------------------------------------

const buildTex = (d) => {
    const b = d.basics || {};
    const h = d.headings || {};
    const [first, ...rest] = (b.name || "").split(" ");
    const last = rest.join(" ");
    const home = (b.website || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
    const L = [];

    L.push(
        "\\documentclass[11pt,a4paper,sans]{moderncv}",
        "\\moderncvstyle{classic}",
        "\\moderncvcolor{blue}",
        "\\usepackage[T1]{fontenc}",
        "\\usepackage[utf8]{inputenc}",
        "\\usepackage{lmodern}",
        "\\usepackage[scale=0.8]{geometry}",
        "\\setlength{\\hintscolumnwidth}{2.6cm}",
        `\\name{${esc(first)}}{${esc(last)}}`,
        `\\title{${esc(HEADLINE)}}`,
    );
    if (b.phone) L.push(`\\phone[mobile]{${esc(b.phone)}}`);
    if (b.email) L.push(`\\email{${esc(b.email)}}`);
    if (home) L.push(`\\homepage{${esc(home)}}`);
    if (b.location && b.location.address) L.push(`\\address{${esc(b.location.address)}}{}{}`);
    L.push("\\microtypesetup{protrusion=true,expansion=false}");
    L.push("\\begin{document}", "\\makecvtitle");

    if (b.summary) {
        L.push("\\section{Profile}", `\\cvitem{}{${esc(b.summary)}}`);
    }

    if (Array.isArray(d.skills) && d.skills.length) {
        L.push("\\section{Skills}");
        for (const s of d.skills) {
            const head = esc((s.name || "").replace(/:$/, ""));
            const kw = esc((s.keywords || []).join(", "));
            L.push(`\\cvitem{${head}}{${kw}}`);
        }
    }

    if (Array.isArray(d.work) && d.work.length) {
        L.push(`\\section{${esc(h.work || "Work Experience")}}`);
        for (const w of d.work) {
            const years = `${esc(w.startDate)} -- ${esc(w.endDate)}`;
            const items = w.highlights || [];
            const body = items.length
                ? "\\begin{itemize}" + items.map((it) => `\\item ${esc(it)}`).join("") + "\\end{itemize}"
                : "";
            L.push(`\\cventry{${years}}{${esc(w.position)}}{${esc(w.company)}}{${esc(w.location)}}{}{${body}}`);
        }
    }

    if (Array.isArray(d.projects) && d.projects.length) {
        L.push(`\\section{${esc(h.projects || "Projects")}}`);
        for (const p of d.projects) {
            let extra = "";
            if (p.keywords && p.keywords.length) extra += ` \\newline \\emph{${esc(p.keywords.join(", "))}}`;
            if (p.url) extra += ` \\newline \\textit{${esc(p.url.replace(/^https?:\/\//, ""))}}`;
            L.push(`\\cventry{}{${esc(p.name)}}{}{}{}{${esc(p.description)}${extra}}`);
        }
    }

    if (Array.isArray(d.education) && d.education.length) {
        L.push(`\\section{${esc(h.education || "Education")}}`);
        for (const e of d.education) {
            L.push(`\\cventry{${esc(e.endDate)}}{${esc(e.studyType)}}{${esc(e.institution)}}{${esc(e.location)}}{}{}`);
        }
    }

    L.push("\\end{document}");
    return L.join("\n");
};

// Minimal fontawesome5 replacement: defines the icon macros moderncv uses so
// compilation succeeds when the real package is absent. Icons render as nothing
// (faCircle becomes a bullet so list markers survive).
const STUB = `\\NeedsTeXFormat{LaTeX2e}
\\ProvidesPackage{fontawesome5}[local shim]
\\RequirePackage{xparse}
\\newcommand{\\fastub}[1]{\\expandafter\\NewDocumentCommand\\csname #1\\endcsname{s o}{}}
\\NewDocumentCommand{\\faCircle}{s o}{\\textbullet}
\\fastub{faAsterisk}\\fastub{faBabyCarriage}\\fastub{faBitbucket}\\fastub{faEnvelope}
\\fastub{faFax}\\fastub{faGithub}\\fastub{faGithubSquare}\\fastub{faGitlab}
\\fastub{faGlobe}\\fastub{faGlobeAfrica}\\fastub{faGlobeAmericas}\\fastub{faGlobeAsia}
\\fastub{faGlobeEurope}\\fastub{faHome}\\fastub{faInbox}\\fastub{faLinkedin}
\\fastub{faLinkedinIn}\\fastub{faMobile}\\fastub{faOrcid}\\fastub{faPhone}
\\fastub{faPrint}\\fastub{faResearchgate}\\fastub{faSkype}\\fastub{faStackOverflow}
\\fastub{faTelegram}\\fastub{faTwitter}\\fastub{faTwitterSquare}\\fastub{faWhatsapp}
\\fastub{faXing}\\fastub{faXingSquare}
\\endinput
`;

// --- main ------------------------------------------------------------------

const main = () => {
    if (!fs.existsSync(JSON_PATH)) {
        console.error(`Resume JSON not found: ${JSON_PATH}`);
        process.exit(1);
    }
    if (!has("pdflatex", ["--version"])) {
        console.error("pdflatex not found. Install a LaTeX distribution (e.g. MacTeX/BasicTeX) with the moderncv class.");
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
    const tex = buildTex(data);

    const buildDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-"));
    const texPath = path.join(buildDir, "resume.tex");
    fs.writeFileSync(texPath, tex);

    // Fall back to the icon shim only if the real package isn't installed.
    const hasFA = has("kpsewhich", ["fontawesome5.sty"]);
    if (!hasFA) {
        fs.writeFileSync(path.join(buildDir, "fontawesome5.sty"), STUB);
        console.log("Note: fontawesome5 not found, building without contact icons.");
    }

    const env = { ...process.env, TEXINPUTS: `${buildDir}:` + (process.env.TEXINPUTS || "") };
    for (let i = 0; i < 2; i++) {
        execFileSync(
            "pdflatex",
            ["-interaction=nonstopmode", "-halt-on-error", "-output-directory", buildDir, texPath],
            { env, stdio: "ignore" },
        );
    }

    fs.copyFileSync(path.join(buildDir, "resume.pdf"), PDF_PATH);
    fs.rmSync(buildDir, { recursive: true, force: true });
    console.log(`Built: ${path.relative(path.join(__dirname, ".."), PDF_PATH)}`);
};

main();
