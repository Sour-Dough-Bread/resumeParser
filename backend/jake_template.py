import re
from typing import Dict, Any, List

def escape_latex(text: str) -> str:
    """Escape special LaTeX characters so the generated .tex is 100% compile-safe."""
    if not text:
        return ""
    # Map of special chars
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    # Process backslash first if needed, but usually we just escape the common symbols
    pattern = re.compile(r'([&%$#_{}~^])')
    return pattern.sub(lambda m: replacements.get(m.group(1), m.group(1)), str(text))

def generate_jake_latex(data: Dict[str, Any]) -> str:
    """
    Generates authentic Jake's Resume LaTeX document.
    Based on Jake Gutierrez's popular ATS-optimized LaTeX template.
    """
    contact = data.get("contact", {})
    name = escape_latex(contact.get("name", "Your Name"))
    phone = escape_latex(contact.get("phone", ""))
    email = escape_latex(contact.get("email", ""))
    linkedin = escape_latex(contact.get("linkedin", ""))
    github = escape_latex(contact.get("github", ""))
    portfolio = escape_latex(contact.get("portfolio", ""))
    location = escape_latex(contact.get("location", ""))
    
    # Build header contact items
    contact_items = []
    if phone:
        contact_items.append(f"\\small {phone}")
    if email:
        contact_items.append(f"\\href{{mailto:{email}}}{{\\underline{{{email}}}}}")
    if linkedin:
        clean_li = linkedin.replace("https://", "").replace("http://", "")
        contact_items.append(f"\\href{{{linkedin}}}{{\\underline{{{clean_li}}}}}")
    if github:
        clean_gh = github.replace("https://", "").replace("http://", "")
        contact_items.append(f"\\href{{{github}}}{{\\underline{{{clean_gh}}}}}")
    if portfolio:
        clean_pf = portfolio.replace("https://", "").replace("http://", "")
        contact_items.append(f"\\href{{{portfolio}}}{{\\underline{{{clean_pf}}}}}")
    if location and not (linkedin or github):
        contact_items.append(f"\\small {location}")
        
    contact_line = " $|$ ".join(contact_items)

    latex_code = [
r"""%-------------------------
% Resume in Latex
% Author : Jake Gutierrez (Optimized by Gemma 4 ATS Tailor)
% License : MIT
%------------------------

\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{} % clear all header and footer fields
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Adjust margins
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\pdfgentounicode=1

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\begin{document}

%----------HEADING----------
\begin{center}
    \textbf{\Huge \scshape """ + name + r"""} \\ \vspace{1pt}
    """ + contact_line + r"""
\end{center}
"""
    ]

    # SUMMARY (Optional ATS Summary)
    summary = data.get("summary", "")
    if summary and summary.strip():
        latex_code.append(r"""
%-----------SUMMARY-----------
\section{Professional Summary}
\small{""" + escape_latex(summary.strip()) + r"""}
\vspace{-5pt}
""")

    # EDUCATION
    education = data.get("education", [])
    if education:
        latex_code.append(r"""
%-----------EDUCATION-----------
\section{Education}
  \resumeSubHeadingListStart
""")
        for edu in education:
            school = escape_latex(edu.get("institution", "University"))
            loc = escape_latex(edu.get("location", ""))
            degree = escape_latex(edu.get("degree", "Degree"))
            dates = escape_latex(edu.get("dates", ""))
            gpa_coursework = []
            if edu.get("gpa"):
                gpa_coursework.append(f"GPA: {escape_latex(edu.get('gpa'))}")
            if edu.get("coursework"):
                gpa_coursework.append(f"Relevant Coursework: {escape_latex(edu.get('coursework'))}")
            
            subline = degree
            if gpa_coursework:
                subline += f" ({', '.join(gpa_coursework)})"
                
            latex_code.append(f"    \\resumeSubheading{{{school}}}{{{loc}}}{{{subline}}}{{{dates}}}\n")
        latex_code.append(r"  \resumeSubHeadingListEnd")

    # EXPERIENCE
    experience = data.get("experience", [])
    if experience:
        latex_code.append(r"""
%-----------EXPERIENCE-----------
\section{Experience}
  \resumeSubHeadingListStart
""")
        for exp in experience:
            title = escape_latex(exp.get("title", "Role"))
            company = escape_latex(exp.get("company", "Company"))
            loc = escape_latex(exp.get("location", ""))
            dates = escape_latex(exp.get("dates", ""))
            bullets = exp.get("bullets", [])

            latex_code.append(f"    \\resumeSubheading{{{title}}}{{{dates}}}{{{company}}}{{{loc}}}\n")
            if bullets:
                latex_code.append("      \\resumeItemListStart\n")
                for bullet in bullets:
                    # Allow **bolding** to translate to \textbf{...}
                    formatted_bullet = escape_latex(bullet)
                    # Convert markdown bold to latex
                    formatted_bullet = re.sub(r'\*\*(.*?)\*\*', r'\\textbf{\1}', formatted_bullet)
                    latex_code.append(f"        \\resumeItem{{{formatted_bullet}}}\n")
                latex_code.append("      \\resumeItemListEnd\n")
        latex_code.append(r"  \resumeSubHeadingListEnd")

    # PROJECTS
    projects = data.get("projects", [])
    if projects:
        latex_code.append(r"""
%-----------PROJECTS-----------
\section{Projects}
  \resumeSubHeadingListStart
""")
        for proj in projects:
            p_name = escape_latex(proj.get("name", "Project"))
            tools = escape_latex(proj.get("technologies", ""))
            dates = escape_latex(proj.get("dates", ""))
            bullets = proj.get("bullets", [])
            
            heading_title = f"\\textbf{{{p_name}}}"
            if tools:
                heading_title += f" $|$ \\emph{{{tools}}}"
            
            latex_code.append(f"    \\resumeProjectHeading{{{heading_title}}}{{{dates}}}\n")
            if bullets:
                latex_code.append("      \\resumeItemListStart\n")
                for bullet in bullets:
                    formatted_bullet = escape_latex(bullet)
                    formatted_bullet = re.sub(r'\*\*(.*?)\*\*', r'\\textbf{\1}', formatted_bullet)
                    latex_code.append(f"        \\resumeItem{{{formatted_bullet}}}\n")
                latex_code.append("      \\resumeItemListEnd\n")
        latex_code.append(r"  \resumeSubHeadingListEnd")

    # TECHNICAL SKILLS
    skills = data.get("skills", {})
    if skills:
        latex_code.append(r"""
%-----------TECHNICAL SKILLS-----------
\section{Technical Skills}
 \begin{itemize}[leftmargin=0.15in, label={}]
    \small{\item{
""")
        skill_lines = []
        if isinstance(skills, dict):
            for category, items in skills.items():
                cat_title = escape_latex(category.replace("_", " ").title())
                if isinstance(items, list):
                    item_str = escape_latex(", ".join(items))
                else:
                    item_str = escape_latex(str(items))
                if item_str.strip():
                    skill_lines.append(f"     \\textbf{{{cat_title}}}: {{{item_str}}} \\\\")
        elif isinstance(skills, list):
            skill_lines.append(f"     \\textbf{{Skills}}: {{{escape_latex(', '.join(skills))}}} \\\\")

        latex_code.append("\n".join(skill_lines))
        latex_code.append(r"""
    }}
 \end{itemize}
""")

    # CERTIFICATIONS (if any)
    certs = data.get("certifications", [])
    if certs:
        latex_code.append(r"""
%-----------CERTIFICATIONS-----------
\section{Certifications}
 \begin{itemize}[leftmargin=0.15in, label={}]
    \small{\item{
""")
        cert_lines = []
        for c in certs:
            if isinstance(c, dict):
                c_name = escape_latex(c.get("name", ""))
                c_issuer = escape_latex(c.get("issuer", ""))
                c_date = escape_latex(c.get("date", ""))
                line = f"     \\textbf{{{c_name}}}"
                if c_issuer:
                    line += f" -- {c_issuer}"
                if c_date:
                    line += f" ({c_date})"
                cert_lines.append(line + " \\\\")
            else:
                cert_lines.append(f"     {escape_latex(str(c))} \\\\")
        latex_code.append("\n".join(cert_lines))
        latex_code.append(r"""
    }}
 \end{itemize}
""")

    latex_code.append(r"""
%-------------------------------------------
\end{document}
""")

    return "\n".join(latex_code)


def generate_jake_markdown(data: Dict[str, Any]) -> str:
    """Generate clean Markdown representation of the resume."""
    contact = data.get("contact", {})
    name = contact.get("name", "Your Name")
    
    parts = []
    # Contact bar
    contact_parts = []
    for k in ["phone", "email", "linkedin", "github", "portfolio", "location"]:
        v = contact.get(k)
        if v:
            contact_parts.append(v)
    
    parts.append(f"# {name}")
    parts.append(" | ".join(contact_parts))
    parts.append("\n---\n")

    if data.get("summary"):
        parts.append(f"## Professional Summary\n{data['summary']}\n")

    if data.get("education"):
        parts.append("## Education")
        for edu in data["education"]:
            parts.append(f"**{edu.get('institution', '')}** — *{edu.get('location', '')}*  ")
            parts.append(f"*{edu.get('degree', '')}* | {edu.get('dates', '')}\n")

    if data.get("experience"):
        parts.append("## Experience")
        for exp in data["experience"]:
            parts.append(f"**{exp.get('title', '')}** | {exp.get('dates', '')}  ")
            parts.append(f"*{exp.get('company', '')}* — *{exp.get('location', '')}*\n")
            for b in exp.get("bullets", []):
                parts.append(f"- {b}")
            parts.append("")

    if data.get("projects"):
        parts.append("## Projects")
        for proj in data["projects"]:
            parts.append(f"**{proj.get('name', '')}** | *{proj.get('technologies', '')}* ({proj.get('dates', '')})")
            for b in proj.get("bullets", []):
                parts.append(f"- {b}")
            parts.append("")

    if data.get("skills"):
        parts.append("## Technical Skills")
        for cat, items in data["skills"].items():
            if isinstance(items, list):
                parts.append(f"- **{cat.replace('_', ' ').title()}**: {', '.join(items)}")
            else:
                parts.append(f"- **{cat.replace('_', ' ').title()}**: {items}")

    return "\n".join(parts)
