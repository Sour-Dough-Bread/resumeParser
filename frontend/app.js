/**
 * ResuGemma 4 — ATS Resume Tailor Frontend Logic
 * Integrates local Gemma 4 via Ollama with Jake's Resume Template
 */

// Application State
const state = {
    currentResumeData: null,
    currentLatex: "",
    currentMarkdown: "",
    isEditMode: false,
    activeTab: "jake",
    sampleData: null,
    isProcessing: false
};

// DOM Elements
const elements = {
    // Status & Header
    ollamaStatusText: document.getElementById("ollamaStatusText"),
    activeModelName: document.getElementById("activeModelName"),
    quickSampleBtn: document.getElementById("quickSampleBtn"),
    modelSelect: document.getElementById("modelSelect"),
    temperatureSlider: document.getElementById("temperatureSlider"),
    tempValue: document.getElementById("tempValue"),

    // Step 1: Upload & Text
    tabUploadBtn: document.getElementById("tabUploadBtn"),
    tabTextBtn: document.getElementById("tabTextBtn"),
    dropzoneArea: document.getElementById("dropzoneArea"),
    resumeFileInput: document.getElementById("resumeFileInput"),
    fileInfoBanner: document.getElementById("fileInfoBanner"),
    fileTypeBadge: document.getElementById("fileTypeBadge"),
    fileNameText: document.getElementById("fileNameText"),
    fileMetaText: document.getElementById("fileMetaText"),
    clearFileBtn: document.getElementById("clearFileBtn"),
    rawTextInputArea: document.getElementById("rawTextInputArea"),
    resumeRawText: document.getElementById("resumeRawText"),

    // Step 2: Job Description
    jobDescriptionText: document.getElementById("jobDescriptionText"),
    sampleJdAiBtn: document.getElementById("sampleJdAiBtn"),
    sampleJdBackendBtn: document.getElementById("sampleJdBackendBtn"),

    // Step 3: Process Button & Status
    processBtn: document.getElementById("processBtn"),
    processBtnText: document.getElementById("processBtnText"),
    processSpinner: document.getElementById("processSpinner"),
    aiStatusBar: document.getElementById("aiStatusBar"),
    aiStatusMessage: document.getElementById("aiStatusMessage"),

    // Step 4: ATS Analytics Card
    atsAnalyticsCard: document.getElementById("atsAnalyticsCard"),
    atsScoreValue: document.getElementById("atsScoreValue"),
    atsScoreProgressBar: document.getElementById("atsScoreProgressBar"),
    atsRatingBadge: document.getElementById("atsRatingBadge"),
    atsSummaryText: document.getElementById("atsSummaryText"),
    matchedCount: document.getElementById("matchedCount"),
    matchedKeywordsList: document.getElementById("matchedKeywordsList"),
    missingCount: document.getElementById("missingCount"),
    missingKeywordsList: document.getElementById("missingKeywordsList"),
    atsTipsList: document.getElementById("atsTipsList"),

    // Right Panel: Tabs & Actions
    viewJakeBtn: document.getElementById("viewJakeBtn"),
    viewLatexBtn: document.getElementById("viewLatexBtn"),
    viewMarkdownBtn: document.getElementById("viewMarkdownBtn"),
    viewJsonBtn: document.getElementById("viewJsonBtn"),
    toggleEditBtn: document.getElementById("toggleEditBtn"),
    editBtnText: document.getElementById("editBtnText"),
    printPdfBtn: document.getElementById("printPdfBtn"),
    downloadLatexBtn: document.getElementById("downloadLatexBtn"),

    // Views
    jakeResumePaper: document.getElementById("jakeResumePaper"),
    latexCodeView: document.getElementById("latexCodeView"),
    latexCodeContent: document.getElementById("latexCodeContent"),
    copyLatexBtn: document.getElementById("copyLatexBtn"),
    markdownCodeView: document.getElementById("markdownCodeView"),
    markdownCodeContent: document.getElementById("markdownCodeContent"),
    copyMdBtn: document.getElementById("copyMdBtn"),
    jsonCodeView: document.getElementById("jsonCodeView"),
    jsonCodeContent: document.getElementById("jsonCodeContent"),
    copyJsonBtn: document.getElementById("copyJsonBtn"),
    placeholderSampleBtn: document.getElementById("placeholderSampleBtn"),
    toastContainer: document.getElementById("toastContainer")
};

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    checkOllamaAndModels();
    loadSamples();
}

// Check Ollama status and list models
async function checkOllamaAndModels() {
    try {
        const res = await fetch("/api/models");
        const data = await res.json();

        if (data.ollama_online) {
            elements.ollamaStatusText.textContent = "Ollama Connected";
            elements.ollamaStatusText.parentElement.style.borderColor = "rgba(16, 185, 129, 0.4)";

            // Populate model options
            elements.modelSelect.innerHTML = "";
            let foundGemma = false;
            
            data.models.forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.name;
                opt.textContent = m.name;
                if (m.name.toLowerCase().includes("gemma4")) {
                    opt.selected = true;
                    foundGemma = true;
                }
                elements.modelSelect.appendChild(opt);
            });

            if (!foundGemma && data.models.length > 0) {
                // If gemma4 wasn't in list, add it as default choice
                const gemmaOpt = document.createElement("option");
                gemmaOpt.value = "gemma4:latest";
                gemmaOpt.textContent = "gemma4:latest (Default)";
                gemmaOpt.selected = true;
                elements.modelSelect.prepend(gemmaOpt);
            }

            elements.activeModelName.textContent = elements.modelSelect.value || "gemma4:latest";
        } else {
            elements.ollamaStatusText.textContent = "Ollama Offline (Start Ollama)";
            elements.ollamaStatusText.parentElement.style.borderColor = "rgba(239, 68, 68, 0.5)";
        }
    } catch (err) {
        elements.ollamaStatusText.textContent = "Backend Offline";
    }
}

// Pre-load sample resume and JD
async function loadSamples() {
    try {
        const res = await fetch("/api/samples");
        state.sampleData = await res.json();
    } catch (err) {
        console.warn("Could not load sample presets", err);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Slider
    elements.temperatureSlider.addEventListener("input", (e) => {
        elements.tempValue.textContent = e.target.value;
    });

    // Model Change
    elements.modelSelect.addEventListener("change", (e) => {
        elements.activeModelName.textContent = e.target.value;
    });

    // Tab toggle: Upload vs Raw Text
    elements.tabUploadBtn.addEventListener("click", () => {
        elements.tabUploadBtn.classList.add("active");
        elements.tabTextBtn.classList.remove("active");
        elements.dropzoneArea.classList.remove("hidden");
        elements.rawTextInputArea.classList.add("hidden");
    });

    elements.tabTextBtn.addEventListener("click", () => {
        elements.tabTextBtn.classList.add("active");
        elements.tabUploadBtn.classList.remove("active");
        elements.dropzoneArea.classList.add("hidden");
        elements.rawTextInputArea.classList.remove("hidden");
    });

    // Dropzone interactions
    elements.dropzoneArea.addEventListener("click", () => elements.resumeFileInput.click());

    elements.dropzoneArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        elements.dropzoneArea.classList.add("dragover");
    });

    elements.dropzoneArea.addEventListener("dragleave", () => {
        elements.dropzoneArea.classList.remove("dragover");
    });

    elements.dropzoneArea.addEventListener("drop", (e) => {
        e.preventDefault();
        elements.dropzoneArea.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    elements.resumeFileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Clear file
    elements.clearFileBtn.addEventListener("click", () => {
        elements.resumeFileInput.value = "";
        elements.fileInfoBanner.classList.add("hidden");
        elements.dropzoneArea.classList.remove("hidden");
        elements.resumeRawText.value = "";
        showToast("File removed", "info");
    });

    // Quick samples
    elements.quickSampleBtn.addEventListener("click", applyFullSample);
    if (elements.placeholderSampleBtn) {
        elements.placeholderSampleBtn.addEventListener("click", applyFullSample);
    }

    elements.sampleJdAiBtn.addEventListener("click", () => {
        if (state.sampleData && state.sampleData.job_descriptions.ai_fullstack) {
            elements.jobDescriptionText.value = state.sampleData.job_descriptions.ai_fullstack.description.trim();
            showToast("Loaded AI/Full-Stack Job Description", "success");
        }
    });

    elements.sampleJdBackendBtn.addEventListener("click", () => {
        if (state.sampleData && state.sampleData.job_descriptions.backend_systems) {
            elements.jobDescriptionText.value = state.sampleData.job_descriptions.backend_systems.description.trim();
            showToast("Loaded Backend Systems Job Description", "success");
        }
    });

    // Process button
    elements.processBtn.addEventListener("click", processResume);

    // View switcher tabs
    elements.viewJakeBtn.addEventListener("click", () => switchView("jake"));
    elements.viewLatexBtn.addEventListener("click", () => switchView("latex"));
    elements.viewMarkdownBtn.addEventListener("click", () => switchView("markdown"));
    elements.viewJsonBtn.addEventListener("click", () => switchView("json"));

    // Inline edit toggle
    elements.toggleEditBtn.addEventListener("click", toggleInlineEdit);

    // Export actions
    elements.printPdfBtn.addEventListener("click", () => {
        if (!state.currentResumeData) {
            showToast("Please parse or load a resume first", "error");
            return;
        }
        window.print();
    });

    elements.downloadLatexBtn.addEventListener("click", downloadLatexFile);

    // Copy buttons
    elements.copyLatexBtn.addEventListener("click", () => copyToClipboard(state.currentLatex, "LaTeX code copied!"));
    elements.copyMdBtn.addEventListener("click", () => copyToClipboard(state.currentMarkdown, "Markdown copied!"));
    elements.copyJsonBtn.addEventListener("click", () => copyToClipboard(JSON.stringify(state.currentResumeData, null, 2), "JSON copied!"));
}

// Handle File Upload
async function handleFileUpload(file) {
    const formData = new FormData();
    formData.append("file", file);

    elements.aiStatusBar.classList.remove("hidden");
    elements.aiStatusMessage.textContent = `Extracting text from ${file.name}...`;

    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || "Upload failed");
        }

        // Show banner
        elements.dropzoneArea.classList.add("hidden");
        elements.fileInfoBanner.classList.remove("hidden");
        elements.fileNameText.textContent = file.name;
        elements.fileTypeBadge.textContent = file.name.split('.').pop().toUpperCase();
        
        const charCount = (data.raw_text || "").length;
        elements.fileMetaText.textContent = `Type: ${data.metadata.type || 'Doc'} | Characters: ${charCount.toLocaleString()}`;
        
        // Populate raw text input
        elements.resumeRawText.value = data.raw_text;

        elements.aiStatusBar.classList.add("hidden");
        showToast(`Successfully extracted ${file.name}!`, "success");
    } catch (err) {
        elements.aiStatusBar.classList.add("hidden");
        showToast(err.message, "error");
    }
}

// Apply Sample Data for Instant Testing
function applyFullSample() {
    if (!state.sampleData) return;

    elements.resumeRawText.value = state.sampleData.sample_resume;
    elements.tabTextBtn.click(); // Switch to text view so user can inspect it

    if (state.sampleData.job_descriptions && state.sampleData.job_descriptions.ai_fullstack) {
        elements.jobDescriptionText.value = state.sampleData.job_descriptions.ai_fullstack.description.trim();
    }

    showToast("Sample Resume & AI Job Description Loaded!", "success");
}

// Core Process Function: Gemma 4 via Ollama
async function processResume() {
    const resumeText = elements.resumeRawText.value.trim();
    const jobDescription = elements.jobDescriptionText.value.trim();

    if (!resumeText) {
        showToast("Please upload a resume or paste resume text first.", "error");
        elements.tabTextBtn.click();
        elements.resumeRawText.focus();
        return;
    }

    // Set UI loading state
    state.isProcessing = true;
    elements.processBtn.disabled = true;
    elements.processBtnText.textContent = "Gemma 4 is Reasoning & Tailoring...";
    elements.processSpinner.classList.remove("hidden");
    elements.aiStatusBar.classList.remove("hidden");
    elements.aiStatusMessage.textContent = "Analyzing candidate experience and aligning with Job Description keywords...";

    try {
        const payload = {
            resume_text: resumeText,
            job_description: jobDescription,
            model: elements.modelSelect.value || "gemma4:latest",
            temperature: parseFloat(elements.temperatureSlider.value) || 0.2
        };

        const res = await fetch("/api/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || "Processing failed");
        }

        // Store state
        state.currentResumeData = data.resume;
        state.currentLatex = data.latex;
        state.currentMarkdown = data.markdown;

        // Render Jake's Resume Live HTML
        renderJakesResume(data.resume);

        // Render Code Views
        elements.latexCodeContent.textContent = data.latex;
        elements.markdownCodeContent.textContent = data.markdown;
        elements.jsonCodeContent.textContent = JSON.stringify(data.resume, null, 2);

        // Render ATS Analytics Scorecard
        renderAtsAnalytics(data.ats_analysis);

        // Switch to Jake's resume view
        switchView("jake");

        showToast("Resume successfully parsed & tailored to Jake's standard!", "success");
    } catch (err) {
        showToast(`Processing error: ${err.message}`, "error");
    } finally {
        state.isProcessing = false;
        elements.processBtn.disabled = false;
        elements.processBtnText.textContent = "Parse & Tailor with Gemma 4";
        elements.processSpinner.classList.add("hidden");
        elements.aiStatusBar.classList.add("hidden");
    }
}

// Render Jake's Resume HTML Representation
function renderJakesResume(data) {
    const contact = data.contact || {};
    const name = contact.name || "Candidate Name";
    
    // Contact Bar
    const contactParts = [];
    if (contact.phone) contactParts.push(`<span>${escapeHtml(contact.phone)}</span>`);
    if (contact.email) contactParts.push(`<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>`);
    if (contact.linkedin) {
        const cleanLi = contact.linkedin.replace("https://", "").replace("http://", "");
        contactParts.push(`<a href="${escapeHtml(contact.linkedin)}" target="_blank">${escapeHtml(cleanLi)}</a>`);
    }
    if (contact.github) {
        const cleanGh = contact.github.replace("https://", "").replace("http://", "");
        contactParts.push(`<a href="${escapeHtml(contact.github)}" target="_blank">${escapeHtml(cleanGh)}</a>`);
    }
    if (contact.portfolio) {
        const cleanPf = contact.portfolio.replace("https://", "").replace("http://", "");
        contactParts.push(`<a href="${escapeHtml(contact.portfolio)}" target="_blank">${escapeHtml(cleanPf)}</a>`);
    }
    if (contact.location && !contact.linkedin && !contact.github) {
        contactParts.push(`<span>${escapeHtml(contact.location)}</span>`);
    }

    const contactHtml = contactParts.join(`<span class="sep">|</span>`);

    let html = `
        <header class="jake-header">
            <h1 contenteditable="${state.isEditMode}">${escapeHtml(name)}</h1>
            <div class="jake-contact-line" contenteditable="${state.isEditMode}">${contactHtml}</div>
        </header>
    `;

    // Summary (Optional ATS Boost)
    if (data.summary && data.summary.trim()) {
        html += `
            <section class="jake-section">
                <div class="jake-section-title">Professional Summary</div>
                <p class="jake-summary-text" contenteditable="${state.isEditMode}">${formatMarkdownBold(escapeHtml(data.summary))}</p>
            </section>
        `;
    }

    // Education Section
    if (data.education && data.education.length > 0) {
        html += `
            <section class="jake-section">
                <div class="jake-section-title">Education</div>
        `;
        data.education.forEach(edu => {
            const school = escapeHtml(edu.institution || "University");
            const loc = escapeHtml(edu.location || "");
            const degree = escapeHtml(edu.degree || "Degree");
            const dates = escapeHtml(edu.dates || "");

            let extra = [];
            if (edu.gpa) extra.push(`GPA: ${escapeHtml(edu.gpa)}`);
            if (edu.coursework) extra.push(`Coursework: ${escapeHtml(edu.coursework)}`);
            const subTitle = extra.length > 0 ? `${degree} <em>(${extra.join(', ')})</em>` : degree;

            html += `
                <div class="jake-subheading">
                    <div class="jake-row top-row" contenteditable="${state.isEditMode}">
                        <div class="jake-left">${school}</div>
                        <div class="jake-right">${loc}</div>
                    </div>
                    <div class="jake-row sub-row" contenteditable="${state.isEditMode}">
                        <div class="jake-left">${subTitle}</div>
                        <div class="jake-right">${dates}</div>
                    </div>
                </div>
            `;
        });
        html += `</section>`;
    }

    // Experience Section
    if (data.experience && data.experience.length > 0) {
        html += `
            <section class="jake-section">
                <div class="jake-section-title">Experience</div>
        `;
        data.experience.forEach(exp => {
            const title = escapeHtml(exp.title || "Job Title");
            const company = escapeHtml(exp.company || "Company");
            const loc = escapeHtml(exp.location || "");
            const dates = escapeHtml(exp.dates || "");
            const bullets = exp.bullets || [];

            html += `
                <div class="jake-subheading">
                    <div class="jake-row top-row" contenteditable="${state.isEditMode}">
                        <div class="jake-left">${title}</div>
                        <div class="jake-right">${dates}</div>
                    </div>
                    <div class="jake-row sub-row" contenteditable="${state.isEditMode}">
                        <div class="jake-left">${company}</div>
                        <div class="jake-right">${loc}</div>
                    </div>
                    <ul class="jake-bullet-list">
            `;
            bullets.forEach(b => {
                html += `<li contenteditable="${state.isEditMode}">${formatMarkdownBold(escapeHtml(b))}</li>`;
            });
            html += `
                    </ul>
                </div>
            `;
        });
        html += `</section>`;
    }

    // Projects Section
    if (data.projects && data.projects.length > 0) {
        html += `
            <section class="jake-section">
                <div class="jake-section-title">Projects</div>
        `;
        data.projects.forEach(proj => {
            const pName = escapeHtml(proj.name || "Project");
            const tech = escapeHtml(proj.technologies || "");
            const dates = escapeHtml(proj.dates || "");
            const bullets = proj.bullets || [];

            const headingLeft = tech ? `<span class="jake-project-title">${pName}</span> | <span class="jake-project-tech">${tech}</span>` : `<span class="jake-project-title">${pName}</span>`;

            html += `
                <div class="jake-subheading">
                    <div class="jake-project-heading" contenteditable="${state.isEditMode}">
                        <div class="jake-left">${headingLeft}</div>
                        <div class="jake-right">${dates}</div>
                    </div>
                    <ul class="jake-bullet-list">
            `;
            bullets.forEach(b => {
                html += `<li contenteditable="${state.isEditMode}">${formatMarkdownBold(escapeHtml(b))}</li>`;
            });
            html += `
                    </ul>
                </div>
            `;
        });
        html += `</section>`;
    }

    // Technical Skills Section
    if (data.skills && Object.keys(data.skills).length > 0) {
        html += `
            <section class="jake-section">
                <div class="jake-section-title">Technical Skills</div>
                <ul class="jake-skills-list">
        `;
        for (const [cat, items] of Object.entries(data.skills)) {
            const catName = escapeHtml(cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()));
            let itemsStr = "";
            if (Array.isArray(items)) {
                itemsStr = items.map(escapeHtml).join(", ");
            } else {
                itemsStr = escapeHtml(String(items));
            }
            if (itemsStr.trim()) {
                html += `<li contenteditable="${state.isEditMode}"><strong>${catName}:</strong> ${itemsStr}</li>`;
            }
        }
        html += `
                </ul>
            </section>
        `;
    }

    // Certifications Section (if any)
    if (data.certifications && data.certifications.length > 0) {
        html += `
            <section class="jake-section">
                <div class="jake-section-title">Certifications</div>
                <ul class="jake-skills-list">
        `;
        data.certifications.forEach(c => {
            if (typeof c === "object") {
                const cName = escapeHtml(c.name || "");
                const cIssuer = c.issuer ? ` — ${escapeHtml(c.issuer)}` : "";
                const cDate = c.date ? ` (${escapeHtml(c.date)})` : "";
                html += `<li contenteditable="${state.isEditMode}"><strong>${cName}</strong>${cIssuer}${cDate}</li>`;
            } else {
                html += `<li contenteditable="${state.isEditMode}">${escapeHtml(String(c))}</li>`;
            }
        });
        html += `
                </ul>
            </section>
        `;
    }

    elements.jakeResumePaper.innerHTML = html;
}

// Render ATS Analytics Scorecard
function renderAtsAnalytics(analysis) {
    if (!analysis) return;

    elements.atsAnalyticsCard.classList.remove("hidden");

    const score = analysis.score || 85;
    elements.atsScoreValue.textContent = score;
    elements.atsScoreProgressBar.style.width = `${score}%`;
    elements.atsRatingBadge.textContent = analysis.rating || `${score}% Match`;

    elements.atsSummaryText.textContent = analysis.tailoring_summary || "Optimized against target JD using Gemma 4.";

    // Matched Keywords
    const matched = analysis.matched_keywords || [];
    elements.matchedCount.textContent = matched.length;
    elements.matchedKeywordsList.innerHTML = matched.map(kw => 
        `<span class="kw-tag matched">✓ ${escapeHtml(kw)}</span>`
    ).join("");

    // Missing Keywords
    const missing = analysis.missing_keywords || [];
    elements.missingCount.textContent = missing.length;
    elements.missingKeywordsList.innerHTML = missing.map(kw => 
        `<span class="kw-tag missing">+ ${escapeHtml(kw)}</span>`
    ).join("");

    // Tips
    const tips = analysis.actionable_tips || ["Ensure single-column layout for ATS parser readability."];
    elements.atsTipsList.innerHTML = tips.map(tip => 
        `<li>${escapeHtml(tip)}</li>`
    ).join("");
}

// Switch between Jake's Preview, LaTeX, Markdown, JSON
function switchView(viewName) {
    state.activeTab = viewName;

    // Reset active buttons
    [elements.viewJakeBtn, elements.viewLatexBtn, elements.viewMarkdownBtn, elements.viewJsonBtn].forEach(b => b.classList.remove("active"));
    
    // Hide all view containers
    elements.jakeResumePaper.classList.add("hidden");
    elements.latexCodeView.classList.add("hidden");
    elements.markdownCodeView.classList.add("hidden");
    elements.jsonCodeView.classList.add("hidden");

    if (viewName === "jake") {
        elements.viewJakeBtn.classList.add("active");
        elements.jakeResumePaper.classList.remove("hidden");
    } else if (viewName === "latex") {
        elements.viewLatexBtn.classList.add("active");
        elements.latexCodeView.classList.remove("hidden");
    } else if (viewName === "markdown") {
        elements.viewMarkdownBtn.classList.add("active");
        elements.markdownCodeView.classList.remove("hidden");
    } else if (viewName === "json") {
        elements.viewJsonBtn.classList.add("active");
        elements.jsonCodeView.classList.remove("hidden");
    }
}

// Inline Edit Mode Toggle
function toggleInlineEdit() {
    if (!state.currentResumeData) {
        showToast("Generate or load a resume first", "error");
        return;
    }

    state.isEditMode = !state.isEditMode;
    elements.jakeResumePaper.classList.toggle("editable-active", state.isEditMode);
    elements.toggleEditBtn.classList.toggle("active", state.isEditMode);
    elements.editBtnText.textContent = state.isEditMode ? "Editing Active" : "Edit Mode";

    const editables = elements.jakeResumePaper.querySelectorAll("[contenteditable]");
    editables.forEach(el => el.setAttribute("contenteditable", state.isEditMode ? "true" : "false"));

    if (state.isEditMode) {
        showToast("Inline Edit Enabled: Click any text to edit directly!", "info");
    } else {
        showToast("Inline Edit Disabled", "info");
    }
}

// Download LaTeX File
function downloadLatexFile() {
    if (!state.currentLatex) {
        showToast("Please generate a resume first", "error");
        return;
    }

    const candidateName = (state.currentResumeData?.contact?.name || "resume")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_");
    const filename = `${candidateName}_jakes_resume.tex`;

    const blob = new Blob([state.currentLatex], { type: "application/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${filename}`, "success");
}

// Copy helper
async function copyToClipboard(text, successMsg) {
    if (!text) {
        showToast("Nothing to copy yet", "error");
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        showToast(successMsg, "success");
    } catch (err) {
        showToast("Clipboard copy failed", "error");
    }
}

// Toast notification helper
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "⚠️";

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        toast.style.transition = "all 0.3s";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Utility: Escape HTML
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Utility: Convert markdown **bold** to <strong>bold</strong>
function formatMarkdownBold(text) {
    if (!text) return "";
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}
