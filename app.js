// Checklist Diário de Segurança - Intranet Offline / Totem
// Protótipo estático. Para produção, use servidor local, autenticação real e banco de dados.

const USERS = [
  {
    username: "joao.silva",
    password: "1234",
    nome: "João Silva",
    funcao: "Operador de Escavadeira"
  },
  {
    username: "carlos.lima",
    password: "1234",
    nome: "Carlos Lima",
    funcao: "Operador de Caminhão Fora de Estrada"
  },
  {
    username: "maria.souza",
    password: "1234",
    nome: "Maria Souza",
    funcao: "Técnica de Segurança"
  }
];

const QUESTIONS = [
  {
    id: 1,
    bloco: "Estado Físico e Mental",
    fixed: true,
    criticalQuestion: true,
    text: "Como você se sente fisicamente e mentalmente para iniciar suas atividades hoje?",
    options: [
      { value: "pronto", label: "100% Pronto", icon: "☺", tone: "ok" },
      { value: "cansado", label: "Um pouco cansado/disperso", icon: "○", tone: "warn", alert: "Orientar pausa, hidratação ou conversa rápida com a liderança." },
      { value: "mal_estar", label: "Muito cansado ou com mal-estar", icon: "☹", tone: "bad", block: true, action: "Acionar liderança imediatamente. Não iniciar atividade em área de risco." }
    ]
  },
  {
    id: 2,
    bloco: "Estado Físico e Mental",
    fixed: false,
    criticalQuestion: false,
    text: "Você teve um período de sono e descanso adequado antes de iniciar este turno?",
    options: [
      { value: "sim", label: "Sim", icon: "✓", tone: "ok" },
      { value: "nao", label: "Não dormi bem", icon: "!", tone: "warn", alert: "Registrar fadiga e avaliar necessidade de pausa ou realocação temporária." }
    ]
  },
  {
    id: 3,
    bloco: "Estado Físico e Mental",
    fixed: false,
    criticalQuestion: false,
    text: "Existe alguma situação de saúde ou preocupação forte tirando o seu foco da segurança hoje?",
    options: [
      { value: "nao", label: "Não, estou focado", icon: "✓", tone: "ok" },
      { value: "sim", label: "Sim, sinto que estou disperso", icon: "!", tone: "warn", alert: "Liderança deve conversar com o profissional antes do início da atividade." }
    ]
  },
  {
    id: 4,
    bloco: "Proteção Individual - EPIs",
    fixed: true,
    criticalQuestion: true,
    text: "Você inspecionou e está portando todos os seus EPIs obrigatórios para a tarefa de hoje?",
    options: [
      { value: "sim", label: "Sim, todos em ordem", icon: "✓", tone: "ok" },
      { value: "nao", label: "Não, preciso de substituição", icon: "!", tone: "bad", block: true, action: "Bloquear início da atividade até regularizar EPIs obrigatórios." }
    ]
  },
  {
    id: 5,
    bloco: "Proteção Individual - EPIs",
    fixed: false,
    criticalQuestion: false,
    text: "Algum dos seus EPIs de uso diário apresenta rasgos, trincas ou desconforto que prejudique seu uso?",
    options: [
      { value: "nao", label: "Não, tudo certo", icon: "✓", tone: "ok" },
      { value: "sim", label: "Sim", icon: "!", tone: "warn", alert: "Gerar alerta para o almoxarifado e substituir o EPI." }
    ]
  },
  {
    id: 6,
    bloco: "Máquinas e Equipamentos",
    fixed: false,
    criticalQuestion: false,
    text: "Você realizou a inspeção visual prévia da sua máquina/equipamento hoje?",
    options: [
      { value: "sim", label: "Sim", icon: "✓", tone: "ok" },
      { value: "nao", label: "Não", icon: "!", tone: "warn", alert: "Realize a inspeção antes de ligar a máquina/equipamento." }
    ]
  },
  {
    id: 7,
    bloco: "Máquinas e Equipamentos",
    fixed: true,
    criticalQuestion: true,
    text: "A máquina ou área apresenta alguma falha visível, vazamento, ruído estranho ou alerta no painel?",
    options: [
      { value: "nao", label: "Não, está operacional", icon: "✓", tone: "ok" },
      { value: "sim", label: "Sim, apresenta uma anormalidade", icon: "!", tone: "bad", block: true, action: "Parar equipamento/atividade, isolar se necessário e acionar liderança/manutenção." }
    ]
  },
  {
    id: 8,
    bloco: "Máquinas e Equipamentos",
    fixed: false,
    criticalQuestion: true,
    text: "Os dispositivos críticos de emergência foram testados e estão funcionando?",
    options: [
      { value: "sim", label: "Sim", icon: "✓", tone: "ok" },
      { value: "nao", label: "Não", icon: "!", tone: "bad", block: true, action: "Não operar. Acionar liderança e manutenção imediatamente." },
      { value: "nao_aplica", label: "Não se aplica", icon: "–", tone: "neutral" }
    ]
  },
  {
    id: 9,
    bloco: "Percepção de Risco e Cultura",
    fixed: false,
    criticalQuestion: false,
    text: "Você conhece os riscos críticos da sua tarefa de hoje e sabe como se proteger deles?",
    options: [
      { value: "sim", label: "Sim, conheço", icon: "✓", tone: "ok" },
      { value: "duvidas", label: "Tenho dúvidas sobre os riscos de hoje", icon: "!", tone: "warn", alert: "Realizar DDS/orientação antes de iniciar a tarefa." }
    ]
  },
  {
    id: 10,
    bloco: "Percepção de Risco e Cultura",
    fixed: false,
    criticalQuestion: false,
    text: "A sua frente de trabalho apresenta alguma condição insegura perceptível neste momento?",
    options: [
      { value: "nao", label: "Não, está segura", icon: "✓", tone: "ok" },
      { value: "sim", label: "Sim, há uma condição de risco na área", icon: "!", tone: "warn", alert: "Comunicar liderança, registrar condição e tratar antes de expor pessoas ao risco." }
    ]
  }
];

const FIXED_IDS = [1, 4, 7];
const QUESTIONS_PER_SHIFT = 5;
const STORAGE_KEY = "mineracao-forte-checklists-v2";
const DRAFT_KEY = "mineracao-forte-draft-v2";

let currentUser = null;
let currentQuestions = [];

const $ = (selector) => document.querySelector(selector);

const el = {
  loginScreen: $("#loginScreen"),
  dashboardScreen: $("#dashboardScreen"),
  loginForm: $("#loginForm"),
  username: $("#username"),
  password: $("#password"),
  loginError: $("#loginError"),
  togglePassword: $("#togglePassword"),
  workerName: $("#workerName"),
  workerRole: $("#workerRole"),
  currentDate: $("#currentDate"),
  shiftSelect: $("#shiftSelect"),
  questionsContainer: $("#questionsContainer"),
  checklistForm: $("#checklistForm"),
  answeredCount: $("#answeredCount"),
  totalCount: $("#totalCount"),
  progressFill: $("#progressFill"),
  resultCard: $("#resultCard"),
  alreadyAnswered: $("#alreadyAnswered"),
  saveDraftBtn: $("#saveDraftBtn"),
  callLeaderBtn: $("#callLeaderBtn"),
  historyBtn: $("#historyBtn"),
  historyCard: $("#historyCard"),
  historyList: $("#historyList"),
  exportCsvBtn: $("#exportCsvBtn"),
  printBtn: $("#printBtn"),
  clearHistoryBtn: $("#clearHistoryBtn"),
  closeHistoryBtn: $("#closeHistoryBtn"),
  logoutBtn: $("#logoutBtn")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function todayKey() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayDisplay() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date());
}

function recordsKey(user = currentUser, shift = el.shiftSelect.value) {
  return `${todayKey()}::${shift}::${user?.username || "sem-usuario"}`;
}

function getRecords() {
  try {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getDrafts() {
  try {
    const drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
    return drafts && typeof drafts === "object" ? drafts : {};
  } catch {
    return {};
  }
}

function setDraft(key, answers) {
  const drafts = getDrafts();
  drafts[key] = answers;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
}

function removeDraft(key) {
  const drafts = getDrafts();
  delete drafts[key];
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
}

function seededRandom(seedText) {
  let seed = 0;
  for (const char of seedText) {
    seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  }
  return function random() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function shuffleBySeed(items, seedText) {
  const arr = [...items];
  const random = seededRandom(seedText);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function selectQuestions() {
  const fixed = FIXED_IDS.map((id) => QUESTIONS.find((question) => question.id === id));
  const pool = QUESTIONS.filter((question) => !FIXED_IDS.includes(question.id));
  const seed = `${todayKey()}::${el.shiftSelect.value}::${currentUser.username}`;
  const extras = shuffleBySeed(pool, seed).slice(0, QUESTIONS_PER_SHIFT - fixed.length);
  return [...fixed, ...extras].sort((a, b) => a.id - b.id);
}

function getSelectedAnswers() {
  const answers = {};
  currentQuestions.forEach((question) => {
    const checked = document.querySelector(`input[name="q_${question.id}"]:checked`);
    if (checked) answers[question.id] = checked.value;
  });
  return answers;
}

function applySavedAnswers(answers) {
  Object.entries(answers || {}).forEach(([questionId, value]) => {
    const input = document.querySelector(`input[name="q_${questionId}"][value="${CSS.escape(value)}"]`);
    if (input) input.checked = true;
  });
  refreshSelectedOptions();
  updateProgress();
}

function optionHtml(question, option) {
  return `
    <label class="option-label ${escapeHtml(option.tone)}" data-tone="${escapeHtml(option.tone)}">
      <input type="radio" name="q_${question.id}" value="${escapeHtml(option.value)}" required />
      <span class="option-icon">${escapeHtml(option.icon)}</span>
      <span>${escapeHtml(option.label)}</span>
    </label>
  `;
}

function questionHtml(question, displayIndex) {
  const cardClass = question.fixed ? "fixed" : "rotative";
  const typeLabel = question.fixed ? "Pergunta fixa" : "Pergunta rotativa";
  const criticalLabel = question.criticalQuestion ? "⚠ Resposta crítica" : "ⓘ Rotativa";
  const criticalClass = question.criticalQuestion ? "critical" : "normal";

  return `
    <article class="question-card ${cardClass}" data-question-id="${question.id}">
      <div class="question-meta">
        <span class="number-badge ${question.fixed ? "" : "rotative"}">${displayIndex}</span>
        <span class="pill ${question.fixed ? "fixed" : "rotative"}">${typeLabel}</span>
        <span class="pill ${criticalClass}">${criticalLabel}</span>
      </div>
      <h3 class="question-title">${escapeHtml(question.text)}</h3>
      <div class="options">${question.options.map((option) => optionHtml(question, option)).join("")}</div>
    </article>
  `;
}


function bindOptionSelectionFeedback() {
  document.querySelectorAll(".option-label").forEach((label) => {
    label.addEventListener("click", () => {
      window.setTimeout(updateProgress, 0);
    });
  });
}

function renderQuestions() {
  currentQuestions = selectQuestions();
  el.totalCount.textContent = currentQuestions.length;
  el.questionsContainer.innerHTML = currentQuestions.map((question, index) => questionHtml(question, index + 1)).join("");
  el.resultCard.classList.add("hidden");

  const drafts = getDrafts();
  const draft = drafts[recordsKey()];
  if (draft) applySavedAnswers(draft);
  updateProgress();
  bindOptionSelectionFeedback();
  checkAlreadyAnswered();
}


function refreshSelectedOptions() {
  document.querySelectorAll(".option-label").forEach((label) => {
    const input = label.querySelector('input[type="radio"]');
    const isSelected = Boolean(input && input.checked);
    label.classList.toggle("is-selected", isSelected);
  });

  document.querySelectorAll(".question-card").forEach((card) => {
    const selected = card.querySelector('.option-label input[type="radio"]:checked');
    const selectedLabel = selected?.closest(".option-label");

    card.classList.toggle("answered", Boolean(selected));
    card.classList.toggle("answered-ok", Boolean(selectedLabel?.classList.contains("ok")));
    card.classList.toggle("answered-warn", Boolean(selectedLabel?.classList.contains("warn")));
    card.classList.toggle("answered-bad", Boolean(selectedLabel?.classList.contains("bad")));
  });
}

function updateProgress() {
  refreshSelectedOptions();
  const answered = currentQuestions.filter((question) => {
    return Boolean(document.querySelector(`input[name="q_${question.id}"]:checked`));
  }).length;
  const total = currentQuestions.length || QUESTIONS_PER_SHIFT;
  const percent = total ? Math.round((answered / total) * 100) : 0;
  el.answeredCount.textContent = answered;
  el.totalCount.textContent = total;
  el.progressFill.style.width = `${percent}%`;
}

function getQuestionById(id) {
  return QUESTIONS.find((question) => question.id === Number(id));
}

function getOption(question, value) {
  return question?.options.find((option) => option.value === value);
}

function evaluateAnswers(answers) {
  const respostas = [];
  const bloqueios = [];
  const alertas = [];

  currentQuestions.forEach((question) => {
    const option = getOption(question, answers[question.id]);
    if (!option) return;

    const response = {
      perguntaId: question.id,
      pergunta: question.text,
      bloco: question.bloco,
      resposta: option.label,
      valor: option.value
    };

    respostas.push(response);

    if (option.block) {
      bloqueios.push({ ...response, acao: option.action });
    } else if (option.alert) {
      alertas.push({ ...response, acao: option.alert });
    }
  });

  const status = bloqueios.length ? "BLOQUEADO" : alertas.length ? "ATENÇÃO" : "LIBERADO";
  return { respostas, bloqueios, alertas, status };
}

function renderResult(evaluation, mode = "final") {
  const statusClass = evaluation.status === "BLOQUEADO" ? "blocked" : evaluation.status === "ATENÇÃO" ? "attention" : "safe";
  const title = evaluation.status === "BLOQUEADO"
    ? "⛔ Checklist bloqueado — acione a liderança"
    : evaluation.status === "ATENÇÃO"
      ? "⚠ Checklist com atenção — tratar antes de iniciar"
      : "✅ Checklist liberado";

  const actions = [...evaluation.bloqueios, ...evaluation.alertas];
  const list = actions.length
    ? `<ul>${actions.map((item) => `<li><b>Pergunta ${item.perguntaId}:</b> ${escapeHtml(item.resposta)}<br><small>${escapeHtml(item.acao)}</small></li>`).join("")}</ul>`
    : `<p>Nenhum bloqueio ou alerta registrado.</p>`;

  const prefix = mode === "leader" ? "Protocolo manual acionado." : "Registro concluído no modo offline.";

  el.resultCard.className = `result-card ${statusClass}`;
  el.resultCard.innerHTML = `
    <h2>${title}</h2>
    <p><b>${prefix}</b> Dados salvos localmente neste totem.</p>
    ${list}
  `;
  el.resultCard.classList.remove("hidden");
  el.resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
}

function saveSubmission(evaluation, manualLeaderCall = false) {
  const records = getRecords();
  const now = new Date();
  const record = {
    key: recordsKey(),
    createdAt: now.toISOString(),
    data: todayDisplay(),
    hora: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    usuario: currentUser.username,
    nome: currentUser.nome,
    funcao: currentUser.funcao,
    turno: el.shiftSelect.value,
    status: evaluation.status,
    chamadaManualLideranca: manualLeaderCall,
    respostas: evaluation.respostas,
    bloqueios: evaluation.bloqueios,
    alertas: evaluation.alertas
  };

  const withoutSameKey = records.filter((item) => item.key !== record.key);
  withoutSameKey.unshift(record);
  saveRecords(withoutSameKey);
  removeDraft(recordsKey());
  checkAlreadyAnswered();
  renderHistory();
  return record;
}

function checkAlreadyAnswered() {
  const existing = getRecords().find((record) => record.key === recordsKey());
  if (!existing) {
    el.alreadyAnswered.classList.add("hidden");
    el.alreadyAnswered.innerHTML = "";
    return;
  }

  el.alreadyAnswered.innerHTML = `
    Este turno já possui um registro salvo para <b>${escapeHtml(existing.nome)}</b> às <b>${escapeHtml(existing.hora)}</b>.
    Ao finalizar novamente, o registro anterior será substituído.
  `;
  el.alreadyAnswered.classList.remove("hidden");
}

function submitChecklist(event) {
  event.preventDefault();
  const formData = new FormData(el.checklistForm);
  const answers = Object.fromEntries(currentQuestions.map((question) => [question.id, formData.get(`q_${question.id}`)]));

  const missing = currentQuestions.filter((question) => !answers[question.id]);
  if (missing.length) {
    el.resultCard.className = "result-card attention";
    el.resultCard.innerHTML = `<h2>⚠ Responda todas as perguntas</h2><p>Faltam ${missing.length} pergunta(s) para finalizar o checklist.</p>`;
    el.resultCard.classList.remove("hidden");
    return;
  }

  const evaluation = evaluateAnswers(answers);
  saveSubmission(evaluation, false);
  renderResult(evaluation);
}

function saveDraft() {
  const answers = getSelectedAnswers();
  setDraft(recordsKey(), answers);
  el.resultCard.className = "result-card safe";
  el.resultCard.innerHTML = `<h2>💾 Respostas salvas</h2><p>Rascunho salvo localmente neste navegador/totem.</p>`;
  el.resultCard.classList.remove("hidden");
}

function callLeader() {
  const answers = getSelectedAnswers();
  const evaluation = evaluateAnswers(answers);
  evaluation.status = "BLOQUEADO";
  evaluation.bloqueios.push({
    perguntaId: "Manual",
    pergunta: "Acionamento manual",
    resposta: "Chamar Liderança",
    acao: "Profissional solicitou apoio da liderança pelo totem."
  });
  saveSubmission(evaluation, true);
  renderResult(evaluation, "leader");
}

function renderHistory() {
  const records = getRecords();
  if (!records.length) {
    el.historyList.innerHTML = `<div class="history-item"><strong>Nenhum registro local encontrado.</strong><small>Os checklists finalizados aparecerão aqui.</small></div>`;
    return;
  }

  el.historyList.innerHTML = records.map((record) => {
    const statusClass = record.status === "BLOQUEADO" ? "blocked" : record.status === "ATENÇÃO" ? "attention" : "safe";
    const problems = (record.bloqueios?.length || 0) + (record.alertas?.length || 0);
    return `
      <article class="history-item ${statusClass}">
        <strong>${escapeHtml(record.status)} — ${escapeHtml(record.nome)} — ${escapeHtml(record.funcao)}</strong>
        <small>${escapeHtml(record.data)} às ${escapeHtml(record.hora)} | Turno: ${escapeHtml(record.turno)} | Alertas/protocolos: ${problems}</small>
      </article>
    `;
  }).join("");
}

function exportCsv() {
  const records = getRecords();
  if (!records.length) return;

  const rows = [[
    "data", "hora", "usuario", "nome", "funcao", "turno", "status", "pergunta_id", "pergunta", "resposta", "alerta_ou_bloqueio"
  ]];

  records.forEach((record) => {
    record.respostas.forEach((answer) => {
      const action = [...(record.bloqueios || []), ...(record.alertas || [])].find((item) => item.perguntaId === answer.perguntaId);
      rows.push([
        record.data,
        record.hora,
        record.usuario,
        record.nome,
        record.funcao,
        record.turno,
        record.status,
        answer.perguntaId,
        answer.pergunta,
        answer.resposta,
        action?.acao || ""
      ]);
    });
  });

  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `checklists-seguranca-${todayKey()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function clearHistory() {
  const ok = confirm("Deseja apagar todos os registros salvos localmente neste navegador/totem?");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
  checkAlreadyAnswered();
}

function showDashboard(user) {
  currentUser = user;
  el.workerName.textContent = user.nome;
  el.workerRole.textContent = user.funcao;
  el.currentDate.textContent = todayDisplay();
  el.loginScreen.classList.add("hidden");
  el.dashboardScreen.classList.remove("hidden");
  renderQuestions();
  renderHistory();
}

function logout() {
  currentUser = null;
  el.dashboardScreen.classList.add("hidden");
  el.loginScreen.classList.remove("hidden");
  el.loginForm.reset();
  el.loginError.textContent = "";
  el.resultCard.classList.add("hidden");
  el.historyCard.classList.add("hidden");
  el.username.focus();
}

el.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = el.username.value.trim().toLowerCase();
  const password = el.password.value;
  const user = USERS.find((item) => item.username === username && item.password === password);

  if (!user) {
    el.loginError.textContent = "Usuário ou senha inválidos.";
    return;
  }

  showDashboard(user);
});

el.togglePassword.addEventListener("click", () => {
  el.password.type = el.password.type === "password" ? "text" : "password";
});

el.shiftSelect.addEventListener("change", renderQuestions);
el.checklistForm.addEventListener("change", updateProgress);
el.checklistForm.addEventListener("submit", submitChecklist);
if (el.saveDraftBtn) el.saveDraftBtn.addEventListener("click", saveDraft);
el.callLeaderBtn.addEventListener("click", callLeader);
el.historyBtn.addEventListener("click", () => {
  renderHistory();
  el.historyCard.classList.toggle("hidden");
  if (!el.historyCard.classList.contains("hidden")) {
    el.historyCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
el.closeHistoryBtn.addEventListener("click", () => el.historyCard.classList.add("hidden"));
el.exportCsvBtn.addEventListener("click", exportCsv);
el.printBtn.addEventListener("click", () => window.print());
el.clearHistoryBtn.addEventListener("click", clearHistory);
el.logoutBtn.addEventListener("click", logout);

// Atalho para apresentação no totem: Enter no campo senha tenta login.
el.username.focus();
