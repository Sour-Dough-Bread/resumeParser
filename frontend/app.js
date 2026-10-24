/**
 * Resume Tailor & Cover Letter Generator
 * Minimalist Black & White UI Logic
 */

// Application State
const state = {
    currentResumeData: null,
    currentCoverLetter: null,
    currentLatex: "",
    currentMarkdown: "",
    isEditMode: false,
    activeTab: "jake",
    sampleData: null,
    isProcessing: false,
    isGeneratingCover: false
};

// DOM References
const elements = {
    // Header
    ollamaStatusText: document.getElementById("ollamaStatusText"),
    statusDot: document.getElementById("statusDot"),
    activeModelTag: document.getElementById("activeModelTag"),
    quickSampleBtn: document.getElementById("quickSampleBtn"),

    // Left Panel - Step 1: Upload
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

    // Step 3: Controls
    modelSelect: document.getElementById("modelSelect"),
    temperatureSlider: document.getElementById("temperatureSlider"),
    tempValue: document.getElementById("tempValue"),
    processBtn: document.getElementById("processBtn"),
    processBtnText: document.getElementById("processBtnText"),
    processSpinner: document.getElementById("processSpinner"),
    generateCoverLetterBtn: document.getElementById("generateCoverLetterBtn"),
    coverLetterBtnText: document.getElementById("coverLetterBtnText"),
    coverSpinner: document.getElementById("coverSpinner"),
    aiStatusBar: document.getElementById("aiStatusBar"),
    aiStatusMessage: document.getElementById("aiStatusMessage"),

    // Step 4: ATS Scorecard
    atsAnalyticsCard: document.getElementById("atsAnalyticsCard"),
    atsRatingBadge: document.getElementById("atsRatingBadge"),
    atsScoreProgressBar: document.getElementById("atsScoreProgressBar"),
    matchedCount: document.getElementById("matchedCount"),
    matchedKeywordsList: document.getElementById("matchedKeywordsList"),
    missingCount: document.getElementById("missingCount"),
    missingKeywordsList: document.getElementById("missingKeywordsList"),
    atsSummaryText: document.getElementById("atsSummaryText"),

    // Right Panel - Tabs & Actions
    viewJakeBtn: document.getElementById("viewJakeBtn"),
    viewCoverBtn: document.getElementById("viewCoverBtn"),
    viewLatexBtn: document.getElementById("viewLatexBtn"),
    viewMarkdownBtn: document.getElementById("viewMarkdownBtn"),
    viewJsonBtn: document.getElementById("viewJsonBtn"),
    toggleEditBtn: document.getElementById("toggleEditBtn"),
    editBtnText: document.getElementById("editBtnText"),
    printPdfBtn: document.getElementById("printPdfBtn"),
    downloadLatexBtn: document.getElementById("downloadLatexBtn"),

    // Viewports
    jakeResumePaper: document.getElementById("jakeResumePaper"),
    coverLetterPaper: document.getElementById("coverLetterPaper"),
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

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    checkOllamaAndModels();
    loadSamples();
}

// Check Ollama status
async function checkOllamaAndModels() {
    try {
        const res = await fetch("/api/models");
        const data = await res.json();

        if (data.ollama_online) {
            elements.ollamaStatusText.textContent = "Ollama Connected";
            elements.statusDot.style.backgroundColor = "#18181b"; // Minimal black dot

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
                const gemmaOpt = document.createElement("option");
                gemmaOpt.value = "gemma4:latest";
                gemmaOpt.textContent = "gemma4:latest";
                gemmaOpt.selected = true;
                elements.modelSelect.prepend(gemmaOpt);
            }

            elements.activeModelTag.textContent = elements.modelSelect.value || "gemma4:latest";
        } else {
            elements.ollamaStatusText.textContent = "Ollama Offline";
            elements.statusDot.style.backgroundColor = "#dc2626";
        }
    } catch (err) {
        elements.ollamaStatusText.textContent = "Server Offline";
    }
}

// Load sample presets
async function loadSamples() {
    try {
        const res = await fetch("/api/samples");
        state.sampleData = await res.json();
    } catch (err) {
        console.warn("Could not load sample data", err);
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
        elements.activeModelTag.textContent = e.target.value;
    });

    // Upload vs Text tab toggle
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

    // Dropzone
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
        showToast("File removed");
    });

    // Quick samples
    elements.quickSampleBtn.addEventListener("click", applyFullSample);
    if (elements.placeholderSampleBtn) {
        elements.placeholderSampleBtn.addEventListener("click", applyFullSample);
    }

    elements.sampleJdAiBtn.addEventListener("click", () => {
        if (state.sampleData && state.sampleData.job_descriptions.ai_fullstack) {
            elements.jobDescriptionText.value = state.sampleData.job_descriptions.ai_fullstack.description.trim();
            showToast("Loaded AI/Full-Stack Job Description");
        }
    });

    elements.sampleJdBackendBtn.addEventListener("click", () => {
        if (state.sampleData && state.sampleData.job_descriptions.backend_systems) {
            elements.jobDescriptionText.value = state.sampleData.job_descriptions.backend_systems.description.trim();
            showToast("Loaded Backend Job Description");
        }
    });

    // Actions
    elements.processBtn.addEventListener("click", processResume);
    elements.generateCoverLetterBtn.addEventListener("click", generateCoverLetterStandalone);

    // View tabs
    elements.viewJakeBtn.addEventListener("click", () => switchView("jake"));
    elements.viewCoverBtn.addEventListener("click", () => switchView("cover"));
    elements.viewLatexBtn.addEventListener("click", () => switchView("latex"));
    elements.viewMarkdownBtn.addEventListener("click", () => switchView("markdown"));
    elements.viewJsonBtn.addEventListener("click", () => switchView("json"));

    // Inline edit toggle
    elements.toggleEditBtn.addEventListener("click", toggleInlineEdit);

    // Print / Export
    elements.printPdfBtn.addEventListener("click", () => {
        if (!state.currentResumeData && !state.currentCoverLetter) {
            showToast("Please generate or load content first");
            return;
        }
        window.print();
    });

    elements.downloadLatexBtn.addEventListener("click", downloadLatexFile);

    // Copy buttons
    elements.copyLatexBtn.addEventListener("click", () => copyToClipboard(state.currentLatex, "LaTeX copied"));
    elements.copyMdBtn.addEventListener("click", () => copyToClipboard(state.currentMarkdown, "Markdown copied"));
    elements.copyJsonBtn.addEventListener("click", () => copyToClipboard(JSON.stringify(state.currentResumeData, null, 2), "JSON copied"));
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

        elements.dropzoneArea.classList.add("hidden");
        elements.fileInfoBanner.classList.remove("hidden");
        elements.fileNameText.textContent = file.name;
        elements.fileTypeBadge.textContent = file.name.split('.').pop().toUpperCase();
        
        const count = data.metadata.pages || data.metadata.elements || 1;
        elements.fileMetaText.textContent = `${count} ${data.metadata.type === 'pdf' ? 'pages' : 'elements'}`;
        elements.resumeRawText.value = data.raw_text;

        elements.aiStatusBar.classList.add("hidden");
        showToast(`Uploaded ${file.name}`);
    } catch (err) {
        elements.aiStatusBar.classList.add("hidden");
        showToast(err.message);
    }
}

// Apply Sample Data
function applyFullSample() {
    if (!state.sampleData) return;

    elements.resumeRawText.value = state.sampleData.sample_resume;
    elements.tabTextBtn.click();

    if (state.sampleData.job_descriptions && state.sampleData.job_descriptions.ai_fullstack) {
        elements.jobDescriptionText.value = state.sampleData.job_descriptions.ai_fullstack.description.trim();
    }

    showToast("Loaded sample resume & job description");
}

// Tailor Resume Pipeline
async function processResume() {
    const resumeText = elements.resumeRawText.value.trim();
    const jobDescription = elements.jobDescriptionText.value.trim();

    if (!resumeText) {
        showToast("Please upload a resume or paste text first.");
        elements.tabTextBtn.click();
        elements.resumeRawText.focus();
        return;
    }

    state.isProcessing = true;
    elements.processBtn.disabled = true;
    elements.processBtnText.textContent = "Analyzing & Tailoring...";
    elements.processSpinner.classList.remove("hidden");
    elements.aiStatusBar.classList.remove("hidden");
    elements.aiStatusMessage.textContent = "Gemma 4 is structuring resume to Jake's format...";

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
        state.currentCoverLetter = data.cover_letter;
        state.currentLatex = data.latex;
        state.currentMarkdown = data.markdown;

        // Render Resume
        renderJakesResume(data.resume);

        // Render Cover Letter
        if (data.cover_letter) {
            renderCoverLetter(data.cover_letter);
        }

        // Render Code Panels
        elements.latexCodeContent.textContent = data.latex;
        elements.markdownCodeContent.textContent = data.markdown;
        elements.jsonCodeContent.textContent = JSON.stringify(data.resume, null, 2);

        // Render Minimal ATS Scorecard
        renderAtsAnalytics(data.ats_analysis);

        switchView("jake");
        showToast("Resume tailored to Jake's template");
    } catch (err) {
        showToast(`Error: ${err.message}`);
    } finally {
        state.isProcessing = false;
        elements.processBtn.disabled = false;
        elements.processBtnText.textContent = "Tailor Resume (Jake's Format)";
        elements.processSpinner.classList.add("hidden");
        elements.aiStatusBar.classList.add("hidden");
    }
}

// Generate Standalone Cover Letter
async function generateCoverLetterStandalone() {
    const resumeText = elements.resumeRawText.value.trim();
    const jobDescription = elements.jobDescriptionText.value.trim();

    if (!resumeText) {
        showToast("Please provide resume text first.");
        elements.tabTextBtn.click();
        return;
    }

    state.isGeneratingCover = true;
    elements.generateCoverLetterBtn.disabled = true;
    elements.coverLetterBtnText.textContent = "Writing Cover Letter...";
    elements.coverSpinner.classList.remove("hidden");
    elements.aiStatusBar.classList.remove("hidden");
    elements.aiStatusMessage.textContent = "Gemma 4 is drafting personalized cover letter...";

    try {
        const payload = {
            resume_text: resumeText,
            job_description: jobDescription,
            model: elements.modelSelect.value || "gemma4:latest",
            candidate_data: state.currentResumeData
        };

        const res = await fetch("/api/cover-letter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || "Failed to generate cover letter");
        }

        state.currentCoverLetter = data;
        renderCoverLetter(data);
        switchView("cover");
        showToast("Personalized cover letter generated");
    } catch (err) {
        showToast(`Cover letter error: ${err.message}`);
    } finally {
        state.isGeneratingCover = false;
        elements.generateCoverLetterBtn.disabled = false;
        elements.coverLetterBtnText.textContent = "Generate Cover Letter";
        elements.coverSpinner.classList.add("hidden");
        elements.aiStatusBar.classList.add("hidden");
    }
}

// Render Jake's Resume HTML
function renderJakesResume(data) {
    const contact = data.contact || {};
    const name = contact.name || "Candidate Name";
    
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

    // Summary
    if (data.summary && data.summary.trim()) {
        html += `
            <section class="jake-section">
                <div class="jake-section-title">Professional Summary</div>
                <p class="jake-summary-text" contenteditable="${state.isEditMode}">${formatMarkdownBold(escapeHtml(data.summary))}</p>
            </section>
        `;
    }

    // Education
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

    // Experience
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

    // Projects
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

    // Skills
    if (data.skills && Object.keys(data.skills).length > 0) {
        html += `
            <section class="jake-section">
                <div class="jake-section-title">Technical Skills</div>
                <ul class="jake-skills-list">
        `;
        for (const [cat, items] of Object.entries(data.skills)) {
            const catName = escapeHtml(cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()));
            let itemsStr = Array.isArray(items) ? items.map(escapeHtml).join(", ") : escapeHtml(String(items));
            if (itemsStr.trim()) {
                html += `<li contenteditable="${state.isEditMode}"><strong>${catName}:</strong> ${itemsStr}</li>`;
            }
        }
        html += `
                </ul>
            </section>
        `;
    }

    elements.jakeResumePaper.innerHTML = html;
}

// Render Professional Cover Letter
function renderCoverLetter(letterData) {
    const contact = state.currentResumeData?.contact || {};
    const name = letterData.candidate_name || contact.name || "Candidate Name";
    const email = contact.email || "candidate@email.com";
    const phone = contact.phone || "(555) 012-3456";
    const location = contact.location || "San Francisco, CA";
    const company = letterData.company || "Hiring Team";

    // Format current date e.g. "October 24, 2026"
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const rawBody = letterData.cover_letter || "";
    // Break into paragraphs
    const paragraphs = rawBody.split(/\n\n+/).filter(p => p.trim());

    // Format paragraphs HTML
    const bodyHtml = paragraphs.map(p => {
        // Skip leading greeting or trailing signoff if embedded in paragraphs
        if (p.toLowerCase().startsWith("dear ") || p.toLowerCase().startsWith("sincerely")) {
            return `<p contenteditable="${state.isEditMode}"><em>${escapeHtml(p)}</em></p>`;
        }
        return `<p contenteditable="${state.isEditMode}">${escapeHtml(p)}</p>`;
    }).join("");

    const html = `
        <div class="cl-header">
            <h1 contenteditable="${state.isEditMode}">${escapeHtml(name)}</h1>
            <div class="cl-contact-sub" contenteditable="${state.isEditMode}">
                ${escapeHtml(location)} &bull; ${escapeHtml(phone)} &bull; ${escapeHtml(email)}
            </div>
        </div>

        <div class="cl-date" contenteditable="${state.isEditMode}">${today}</div>

        <div class="cl-recipient-block" contenteditable="${state.isEditMode}">
            <strong>Hiring Team</strong><br>
            ${escapeHtml(company)}
        </div>

        <div class="cl-body">
            ${bodyHtml}
        </div>

        <div class="cl-signoff" contenteditable="${state.isEditMode}">
            Sincerely,<br>
            <div class="name">${escapeHtml(name)}</div>
        </div>
    `;

    elements.coverLetterPaper.innerHTML = html;
}

// Render Minimal ATS Scorecard
function renderAtsAnalytics(analysis) {
    if (!analysis) return;

    elements.atsAnalyticsCard.classList.remove("hidden");

    const score = analysis.score || 85;
    elements.atsRatingBadge.textContent = `${score}% MATCH`;
    elements.atsScoreProgressBar.style.width = `${score}%`;

    elements.atsSummaryText.textContent = analysis.tailoring_summary || "Aligned against target job description.";

    const matched = analysis.matched_keywords || [];
    elements.matchedCount.textContent = matched.length;
    elements.matchedKeywordsList.innerHTML = matched.map(kw => 
        `<span class="minimal-tag matched">${escapeHtml(kw)}</span>`
    ).join("");

    const missing = analysis.missing_keywords || [];
    elements.missingCount.textContent = missing.length;
    elements.missingKeywordsList.innerHTML = missing.map(kw => 
        `<span class="minimal-tag missing">+ ${escapeHtml(kw)}</span>`
    ).join("");
}

// Switch Views
function switchView(viewName) {
    state.activeTab = viewName;

    [elements.viewJakeBtn, elements.viewCoverBtn, elements.viewLatexBtn, elements.viewMarkdownBtn, elements.viewJsonBtn].forEach(b => b.classList.remove("active"));
    
    elements.jakeResumePaper.classList.add("hidden");
    elements.coverLetterPaper.classList.add("hidden");
    elements.latexCodeView.classList.add("hidden");
    elements.markdownCodeView.classList.add("hidden");
    elements.jsonCodeView.classList.add("hidden");

    if (viewName === "jake") {
        elements.viewJakeBtn.classList.add("active");
        elements.jakeResumePaper.classList.remove("hidden");
    } else if (viewName === "cover") {
        elements.viewCoverBtn.classList.add("active");
        elements.coverLetterPaper.classList.remove("hidden");
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
    state.isEditMode = !state.isEditMode;
    elements.jakeResumePaper.classList.toggle("editable-active", state.isEditMode);
    elements.coverLetterPaper.classList.toggle("editable-active", state.isEditMode);
    elements.toggleEditBtn.classList.toggle("active", state.isEditMode);
    elements.editBtnText.textContent = state.isEditMode ? "Done Editing" : "Edit Mode";

    const editables = document.querySelectorAll(".jake-resume-container [contenteditable]");
    editables.forEach(el => el.setAttribute("contenteditable", state.isEditMode ? "true" : "false"));

    showToast(state.isEditMode ? "Edit Mode Enabled: Click text to edit" : "Edit Mode Disabled");
}

// Download LaTeX
function downloadLatexFile() {
    if (!state.currentLatex) {
        showToast("Generate a resume first");
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

    showToast(`Saved ${filename}`);
}

// Copy helper
async function copyToClipboard(text, successMsg) {
    if (!text) {
        showToast("Nothing to copy");
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        showToast(successMsg);
    } catch (err) {
        showToast("Copy failed");
    }
}

// Toast notification
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(6px)";
        toast.style.transition = "all 0.2s";
        setTimeout(() => toast.remove(), 200);
    }, 2800);
}

// Escape HTML
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Convert markdown **bold** to <strong>
function formatMarkdownBold(text) {
    if (!text) return "";
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}
