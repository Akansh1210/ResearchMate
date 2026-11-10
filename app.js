const $ = id => document.getElementById(id);
const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};
let project = store.get("researchMateProject", null);
let questions = store.get("researchMateQuestions", []);
let literature = store.get("researchMateLiterature", []);
let surveyItems = store.get("researchMateSurveyItems", []);

function safe(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function showModal(id) { $(id).hidden = false; document.body.style.overflow = "hidden"; }
function hideModal(id) { $(id).hidden = true; document.body.style.overflow = ""; }
document.querySelectorAll("[data-open]").forEach(button => button.addEventListener("click", () => showModal(button.dataset.open)));
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => hideModal(button.closest(".modal-backdrop").id)));
document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.addEventListener("click", e => { if (e.target === backdrop) hideModal(backdrop.id); }));
document.addEventListener("keydown", e => { if (e.key === "Escape") document.querySelectorAll(".modal-backdrop").forEach(m => { if (!m.hidden) hideModal(m.id); }); });

function renderProject() {
  if (!project) return;
  $("projectTitle").value = project.title || "";
  $("researchArea").value = project.area || "Education";
  $("researchStage").value = project.stage || "Exploring an idea";
  $("summaryTitle").textContent = project.title || "Your research title will appear here";
  $("summaryArea").textContent = `Research area: ${project.area || "Education"}`;
  $("summaryStage").textContent = project.stage || "Exploring an idea";
  $("projectSaved").textContent = "Saved locally";
}
$("projectForm").addEventListener("submit", e => {
  e.preventDefault();
  project = { title: $("projectTitle").value.trim(), area: $("researchArea").value, stage: $("researchStage").value };
  store.set("researchMateProject", project);
  renderProject();
  $("projectMessage").textContent = "Project details saved successfully in this browser.";
});

$("questionForm").addEventListener("submit", e => {
  e.preventDefault();
  const topic = $("qTopic").value.trim();
  const population = $("qPopulation").value.trim();
  const focus = $("qFocus").value;
  const stems = {
    "Experiences and perceptions": `How do ${population || "participants"} experience and perceive ${topic}?`,
    "Effectiveness or outcomes": `What outcomes are associated with ${topic} among ${population || "the selected participants"}?`,
    "Relationship between variables": `What is the relationship between ${topic} and a clearly defined learning or educational outcome among ${population || "the selected participants"}?`,
    "Needs, barriers or challenges": `What needs, barriers or challenges do ${population || "participants"} identify in relation to ${topic}?`,
    "Development and evaluation of an intervention": `How can an intervention related to ${topic} be developed and evaluated for ${population || "the selected participants"}?`
  };
  const record = { topic, population, focus, draft: stems[focus], savedAt: new Date().toLocaleDateString() };
  questions.unshift(record);
  store.set("researchMateQuestions", questions);
  $("questionOutput").hidden = false;
  $("questionOutput").innerHTML = `<b>Draft research question</b><p>${safe(record.draft)}</p><small>Refine the wording, define key concepts and check feasibility, scope and ethics with your supervisor.</small><br><button class="tool-link" id="saveQuestionDraft">Save to workspace library →</button>`;
  $("saveQuestionDraft").addEventListener("click", () => { renderLists(); $("questionOutput").innerHTML += "<p><b>Saved to your workspace library.</b></p>"; });
  renderLists();
});
$("literatureForm").addEventListener("submit", e => {
  e.preventDefault();
  literature.unshift({
    author: $("litAuthor").value.trim(), title: $("litTitle").value.trim(),
    method: $("litMethod").value.trim(), finding: $("litFinding").value.trim(),
    gap: $("litGap").value.trim(), savedAt: new Date().toLocaleDateString()
  });
  store.set("researchMateLiterature", literature);
  renderLists();
  $("literatureForm").reset();
  hideModal("literatureModal");
});
$("surveyForm").addEventListener("submit", e => {
  e.preventDefault();
  const item = { objective: $("surveyObjective").value.trim(), question: $("surveyItem").value.trim(), type: $("surveyType").value };
  surveyItems.unshift(item);
  store.set("researchMateSurveyItems", surveyItems);
  $("surveyOutput").hidden = false;
  $("surveyOutput").innerHTML = `<b>Draft item added to your local workspace</b><p>${safe(item.question)}</p><small>Objective: ${safe(item.objective)} · Format: ${safe(item.type)}</small>`;
  $("surveyForm").reset();
});
function renderLists() {
  $("questionCount").textContent = `${questions.length} saved`;
  $("literatureCount").textContent = `${literature.length} saved`;
  $("questionList").innerHTML = questions.length ? questions.map(q => `<article class="record"><b>${safe(q.draft)}</b><p>${safe(q.topic)} · ${safe(q.focus)}</p></article>`).join("") : '<p class="empty">No research questions saved yet.</p>';
  $("literatureList").innerHTML = literature.length ? literature.map(l => `<article class="record"><b>${safe(l.author)} — ${safe(l.title)}</b><p>${safe(l.method)} ${l.finding ? "· " + safe(l.finding) : ""}</p></article>`).join("") : '<p class="empty">No literature records saved yet.</p>';
}
$("exportBtn").addEventListener("click", () => {
  const data = { project, researchQuestions: questions, literatureRecords: literature, questionnaireDrafts: surveyItems, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = "researchmate-workspace.json"; link.click();
  URL.revokeObjectURL(url);
});
$("menuToggle").addEventListener("click", () => $("mainNav").classList.toggle("open"));
$("mainNav").querySelectorAll("a").forEach(a => a.addEventListener("click", () => $("mainNav").classList.remove("open")));
renderProject();
renderLists();
