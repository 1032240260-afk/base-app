const AGENTS = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    tag: 'Anthropic · agentic CLI',
    note: 'Claude Code reads files before editing and plans in steps — structure the prompt as Role / Context / Task / Working agreement / Constraints.',
    build(ctx) {
      return [
        `# Role`,
        `You are Claude Code, an agentic coding assistant with terminal and file-system access.`,
        ``,
        `# Context`,
        `Project: ${ctx.projectName}`,
        `Type: ${ctx.projectType}`,
        `Stack: ${ctx.stackSummary}`,
        ``,
        `# Task`,
        ctx.task,
        ``,
        `# Working agreement`,
        `1. Read the relevant files before editing; never assume file contents.`,
        `2. Plan the change in 3-5 steps before writing code, then execute.`,
        `3. Prefer small, verifiable diffs over large rewrites.`,
        `4. Run tests, or add them if none exist, and report pass/fail.`,
        `5. Summarize the tradeoffs made and files touched at the end.`,
        ``,
        `# Constraints`,
        ctx.requirements
      ].join('\n');
    }
  },
  {
    id: 'codex',
    name: 'Codex / OpenAI CLI',
    tag: 'OpenAI · terminal agent',
    note: 'Codex responds best to short, imperative, scoped instructions with an explicit output format — skip the narrative.',
    build(ctx) {
      return [
        `Task: ${ctx.task}`,
        `Project: ${ctx.projectName} — ${ctx.projectType}`,
        `Stack: ${ctx.stackSummary}`,
        ``,
        `Instructions:`,
        `1. Implement only what is scoped above.`,
        `2. Keep functions small and pure where reasonable.`,
        `3. Match the existing code style; do not reformat unrelated code.`,
        `4. Do not add comments unless the logic is genuinely non-obvious.`,
        `5. Output a diff-style summary of every file changed.`,
        ``,
        `Requirements:`,
        ctx.requirements
      ].join('\n');
    }
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Coder',
    tag: 'DeepSeek · reasoning-first',
    note: 'DeepSeek performs best when it reasons through the problem before generating code — give it explicit thinking steps.',
    build(ctx) {
      return [
        `### Objective`,
        ctx.task,
        ``,
        `### Environment`,
        `${ctx.projectName} — a ${ctx.projectType} using ${ctx.stackSummary}`,
        ``,
        `### Reasoning steps (work through before coding)`,
        `1. Restate the problem in your own words.`,
        `2. List the files or modules likely affected.`,
        `3. Sketch the algorithm or data flow.`,
        `4. Identify edge cases and how each is handled.`,
        ``,
        `### Requirements`,
        ctx.requirements,
        ``,
        `### Output`,
        `Provide the final code, followed by a short rationale for the key decisions.`
      ].join('\n');
    }
  },
  {
    id: 'kimi-k2',
    name: 'Kimi K2',
    tag: 'Moonshot AI · long context',
    note: 'Kimi K2 handles large repo context well — lean on repo-wide awareness and a verification loop instead of restating file contents.',
    build(ctx) {
      return [
        `[SYSTEM CONTEXT]`,
        `You are operating with full-repository context. Treat the codebase as ground truth over assumptions.`,
        ``,
        `[PROJECT]`,
        `Name: ${ctx.projectName}`,
        `Type: ${ctx.projectType}`,
        `Stack: ${ctx.stackSummary}`,
        ``,
        `[TASK]`,
        ctx.task,
        ``,
        `[AGENT LOOP]`,
        `1. Search the repo for existing patterns before introducing new ones.`,
        `2. Cross-check every dependent file touched by this change.`,
        `3. Make the edit.`,
        `4. Verify by running or simulating tests.`,
        `5. Summarize what changed and why, file by file.`,
        ``,
        `[REQUIREMENTS]`,
        ctx.requirements
      ].join('\n');
    }
  },
  {
    id: 'cursor',
    name: 'Cursor',
    tag: 'Anysphere · IDE composer',
    note: 'Cursor works in a multi-file Composer session — reference files with @ instead of pasting their contents.',
    build(ctx) {
      return [
        `@workspace`,
        `Task: ${ctx.task}`,
        `Project: ${ctx.projectName} — ${ctx.projectType} (${ctx.stackSummary})`,
        ``,
        `Use Composer to apply changes across the relevant files. Reference existing files with @filename instead of restating their content. Keep edits scoped to what's needed for this task.`,
        ``,
        `Requirements:`,
        ctx.requirements
      ].join('\n');
    }
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    tag: 'Google · tool-calling agent',
    note: 'Gemini CLI benefits from an explicit plan-then-act structure and a visible list of intended tool calls.',
    build(ctx) {
      return [
        `Goal: ${ctx.task}`,
        `Project: ${ctx.projectName} (${ctx.projectType} — ${ctx.stackSummary})`,
        ``,
        `Before acting:`,
        `- Confirm the plan in one short paragraph.`,
        `- List any tool calls you intend to make.`,
        ``,
        `Then execute the plan and report results, including any commands run.`,
        ``,
        `Requirements:`,
        ctx.requirements
      ].join('\n');
    }
  }
];

const COMMON_EXTRAS = [
  { id: 'typescript', label: 'TypeScript strict', fragment: 'Write in TypeScript with strict mode enabled; no implicit any.' },
  { id: 'testing', label: 'Automated tests', fragment: 'Include unit tests for core logic and at least one integration test for the critical path.' },
  { id: 'docker', label: 'Docker', fragment: 'Provide a Dockerfile (multi-stage if applicable) and a docker-compose.yml for local development.' },
  { id: 'cicd', label: 'CI pipeline', fragment: 'Add a CI workflow that runs lint, type-check, and tests on every push.' },
  { id: 'errorHandling', label: 'Error handling', fragment: 'Handle errors explicitly; never swallow exceptions silently, and return meaningful error messages.' },
  { id: 'logging', label: 'Structured logging', fragment: 'Add structured logging at key points (requests, errors, external calls) instead of console.log.' },
  { id: 'envConfig', label: 'Env-based config', fragment: 'Read configuration from environment variables; never hardcode secrets or connection strings.' },
  { id: 'documentation', label: 'Short docs', fragment: 'Write a brief README section for any new module explaining what it does and how to run it.' }
];

const PROJECT_EXTRAS = {
  web: [
    { id: 'accessibility', label: 'Accessibility', fragment: 'Follow accessibility basics: semantic HTML, keyboard navigation, sufficient color contrast, ARIA where native semantics fall short.' },
    { id: 'seo', label: 'SEO basics', fragment: 'Set meaningful titles, meta descriptions, and semantic headings for each page.' }
  ],
  api: [
    { id: 'rateLimiting', label: 'Rate limiting', fragment: 'Apply rate limiting to public endpoints and return a 429 with a Retry-After header when exceeded.' }
  ],
  cli: [
    { id: 'argParsing', label: 'Argument parsing', fragment: 'Parse CLI arguments and flags explicitly (e.g. yargs, argparse, cobra); support a working --help output.' },
    { id: 'packaging', label: 'Packaging', fragment: 'Make the tool installable and distributable (npm bin entry, pip package, or a single compiled binary).' }
  ],
  mobile: [
    { id: 'offlineFirst', label: 'Offline-first', fragment: 'Handle offline or poor-network states gracefully with local caching or optimistic UI.' },
    { id: 'platformParity', label: 'Platform parity', fragment: 'Keep behavior consistent across iOS and Android; isolate platform-specific code behind a shared interface.' }
  ],
  data: [
    { id: 'dataValidation', label: 'Data validation', fragment: 'Validate input data shape and types before processing; fail fast with a clear error on malformed input.' },
    { id: 'notebookFriendly', label: 'Notebook-friendly', fragment: 'Keep functions pure and importable; separate exploration code from reusable pipeline code.' }
  ]
};

const BLOCK_LIBRARY = {
  frontend: [
    { id: 'react', label: 'React', fragment: 'Build UI as functional components with hooks; avoid class components and unnecessary re-renders.' },
    { id: 'vue', label: 'Vue', fragment: "Use Vue's Composition API with <script setup>; keep components small and single-purpose." },
    { id: 'nextjs', label: 'Next.js', fragment: 'Use the App Router; keep data-fetching in server components and use client components only where interactivity is needed.' },
    { id: 'svelte', label: 'Svelte', fragment: "Use Svelte's built-in reactivity directly; avoid re-implementing state management the framework already provides." },
    { id: 'vanilla', label: 'Vanilla JS', fragment: 'Use plain HTML/CSS/JS with no framework; keep DOM updates minimal and avoid unnecessary abstraction.' }
  ],
  database: [
    { id: 'postgres', label: 'PostgreSQL', sub: 'RDBMS', fragment: 'Design normalized tables with explicit foreign keys and indexes; use parameterized queries or an ORM (Prisma/Drizzle) — never string-concatenate SQL.' },
    { id: 'mysql', label: 'MySQL', sub: 'RDBMS', fragment: 'Design normalized schemas with proper indexing; use prepared statements or an ORM to prevent SQL injection.' },
    { id: 'mongodb', label: 'MongoDB', sub: 'NoSQL', fragment: 'Model documents around access patterns rather than strict normalization; validate schema shape with Mongoose or a schema validator.' },
    { id: 'firebase', label: 'Firebase', sub: 'NoSQL', fragment: "Structure Firestore collections for the read patterns you'll actually query; set security rules explicitly, don't rely on defaults." },
    { id: 'redis', label: 'Redis', sub: 'Cache', fragment: 'Use Redis for caching or session storage only, with explicit TTLs; treat it as ephemeral, never the source of truth.' },
    { id: 'none-db', label: 'No database', sub: '', fragment: 'This project has no persistent database; keep state in memory or on the client only.' }
  ],
  auth: [
    { id: 'jwt', label: 'JWT auth', fragment: 'Issue short-lived JWT access tokens plus a longer-lived refresh token; verify signatures on every protected route; keep secrets in environment variables.' },
    { id: 'session', label: 'Session auth', fragment: 'Use server-side sessions with an httpOnly, secure cookie; store session data server-side, not in the cookie itself.' },
    { id: 'oauth', label: 'OAuth', fragment: "Implement OAuth via the provider's official SDK/flow (Authorization Code + PKCE); never handle raw provider passwords." },
    { id: 'none-auth', label: 'No auth', fragment: 'No authentication is required for this project.' }
  ],
  apiStyle: [
    { id: 'rest', label: 'REST', fragment: 'Follow REST conventions: plural resource nouns, correct HTTP verbs and status codes, versioned routes (/api/v1/...).' },
    { id: 'graphql', label: 'GraphQL', fragment: 'Define a typed schema first; keep resolvers thin and delegate business logic to a service layer.' }
  ],
  styling: [
    { id: 'tailwind', label: 'Tailwind CSS', fragment: 'Use Tailwind utility classes directly in markup; extract a component only once a pattern repeats three or more times.' },
    { id: 'cssModules', label: 'CSS Modules', fragment: 'Use CSS Modules for component-scoped styles; keep one shared tokens file for color and spacing variables.' },
    { id: 'styledComponents', label: 'styled-components', fragment: 'Use styled-components for component-scoped styles; keep a shared theme object for colors, spacing, and typography.' }
  ],
  language: [
    { id: 'node', label: 'Node.js', fragment: 'Write in Node.js using ES modules; keep the entry point thin and delegate to well-named functions or modules.' },
    { id: 'python', label: 'Python', fragment: 'Write in Python 3 following PEP 8; type-hint public functions.' },
    { id: 'go', label: 'Go', fragment: "Write idiomatic Go; return explicit errors, don't panic for expected failure paths." },
    { id: 'typescriptLang', label: 'TypeScript', fragment: 'Write in TypeScript compiled with strict mode; avoid any.' }
  ],
  mobileFramework: [
    { id: 'reactNative', label: 'React Native', fragment: 'Use React Native with functional components and hooks; keep navigation logic in a dedicated navigator file.' },
    { id: 'flutter', label: 'Flutter', fragment: 'Use Flutter with a clear widget tree; separate business logic from widgets (e.g. Provider or Riverpod).' }
  ]
};

const CATEGORY_META = {
  frontend: { title: 'Frontend framework', multi: false },
  database: { title: 'Database', multi: false },
  auth: { title: 'Authentication', multi: false },
  apiStyle: { title: 'API style', multi: false },
  styling: { title: 'Styling approach', multi: false },
  language: { title: 'Language / runtime', multi: false },
  mobileFramework: { title: 'Mobile framework', multi: false },
  extras: { title: 'Extras & practices', multi: true }
};

const PROJECT_TYPES = [
  { id: 'web', name: 'Web Application', desc: 'Frontend + backend, browser-facing', categories: ['frontend', 'database', 'auth', 'apiStyle', 'styling', 'extras'] },
  { id: 'api', name: 'Backend API', desc: 'Service consumed by other clients', categories: ['language', 'database', 'auth', 'apiStyle', 'extras'] },
  { id: 'cli', name: 'CLI Tool', desc: 'Command-line utility', categories: ['language', 'extras'] },
  { id: 'mobile', name: 'Mobile App', desc: 'Native or cross-platform app', categories: ['mobileFramework', 'database', 'auth', 'extras'] },
  { id: 'data', name: 'Data / ML Script', desc: 'Pipelines, notebooks, models', categories: ['language', 'extras'] }
];

const state = {
  agentId: null,
  projectTypeId: null,
  selections: {},
  extras: new Set(),
  projectName: '',
  task: ''
};

function getExtrasForProjectType(projectTypeId) {
  return COMMON_EXTRAS.concat(PROJECT_EXTRAS[projectTypeId] || []);
}

function findBlock(category, blockId) {
  if (category === 'extras') {
    return getExtrasForProjectType(state.projectTypeId).find(function (b) { return b.id === blockId; });
  }
  return BLOCK_LIBRARY[category].find(function (b) { return b.id === blockId; });
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function renderAgents() {
  const grid = document.getElementById('agent-grid');
  grid.innerHTML = '';
  AGENTS.forEach(function (agent) {
    const card = el('button', 'pick-card');
    card.type = 'button';
    card.setAttribute('data-id', agent.id);
    card.innerHTML =
      '<span class="pc-title">' + agent.name + '</span>' +
      '<span class="pc-tag">' + agent.tag + '</span>' +
      '<span class="pc-desc">' + agent.note.slice(0, 64) + '…</span>';
    card.addEventListener('click', function () { selectAgent(agent.id); });
    grid.appendChild(card);
  });
}

function renderProjectTypes() {
  const grid = document.getElementById('project-grid');
  grid.innerHTML = '';
  PROJECT_TYPES.forEach(function (pt) {
    const card = el('button', 'pick-card');
    card.type = 'button';
    card.setAttribute('data-id', pt.id);
    card.innerHTML =
      '<span class="pc-title">' + pt.name + '</span>' +
      '<span class="pc-desc">' + pt.desc + '</span>';
    card.addEventListener('click', function () { selectProjectType(pt.id); });
    grid.appendChild(card);
  });
}

function selectAgent(id) {
  state.agentId = id;
  document.querySelectorAll('#agent-grid .pick-card').forEach(function (c) {
    c.classList.toggle('is-selected', c.getAttribute('data-id') === id);
  });
  const agent = AGENTS.find(function (a) { return a.id === id; });
  const note = document.getElementById('agent-note');
  note.textContent = agent.note;
  note.hidden = false;
  unlockSection('section-project');
  updateRail();
  updateOutput();
}

function selectProjectType(id) {
  state.projectTypeId = id;
  state.selections = {};
  state.extras = new Set();
  document.querySelectorAll('#project-grid .pick-card').forEach(function (c) {
    c.classList.toggle('is-selected', c.getAttribute('data-id') === id);
  });
  unlockSection('section-stack');
  unlockSection('section-task');
  renderPalette();
  renderStackList();
  updateRail();
  updateOutput();
}

function unlockSection(sectionId) {
  document.getElementById(sectionId).classList.remove('is-locked');
}

function updateRail() {
  const steps = document.querySelectorAll('.rail-step');
  const completed = [];
  if (state.agentId) completed.push(1);
  if (state.projectTypeId) completed.push(2);
  const stackFilled = Object.keys(state.selections).length > 0 || state.extras.size > 0;
  if (stackFilled) completed.push(3);
  if (state.task && state.task.trim().length > 0) completed.push(4);
  let active = 1;
  for (let i = 1; i <= 4; i++) { if (!completed.includes(i)) { active = i; break; } active = i; }
  steps.forEach(function (step) {
    const n = Number(step.getAttribute('data-step'));
    step.classList.toggle('is-complete', completed.includes(n) && n !== active);
    step.classList.toggle('is-active', n === active);
  });
}

function renderPalette() {
  const palette = document.getElementById('palette');
  palette.innerHTML = '';
  const pt = PROJECT_TYPES.find(function (p) { return p.id === state.projectTypeId; });
  pt.categories.forEach(function (cat) {
    const meta = CATEGORY_META[cat];
    const group = el('div', 'palette-group');
    group.appendChild(el('h3', null, meta.title));
    const row = el('div', 'chip-row');
    const blocks = cat === 'extras' ? getExtrasForProjectType(pt.id) : BLOCK_LIBRARY[cat];
    blocks.forEach(function (block) {
      const chip = el('button', 'chip', block.label + (block.sub ? ' <span style="opacity:.55">· ' + block.sub + '</span>' : ''));
      chip.type = 'button';
      chip.draggable = true;
      chip.setAttribute('data-cat', cat);
      chip.setAttribute('data-id', block.id);
      chip.addEventListener('click', function () { toggleBlock(cat, block.id); });
      chip.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', JSON.stringify({ cat: cat, id: block.id }));
        chip.classList.add('is-dragging');
      });
      chip.addEventListener('dragend', function () { chip.classList.remove('is-dragging'); });
      row.appendChild(chip);
    });
    group.appendChild(row);
    palette.appendChild(group);
  });
  syncChipStates();
}

function toggleBlock(cat, id) {
  if (cat === 'extras') {
    if (state.extras.has(id)) state.extras.delete(id); else state.extras.add(id);
  } else {
    state.selections[cat] = state.selections[cat] === id ? null : id;
    if (!state.selections[cat]) delete state.selections[cat];
  }
  syncChipStates();
  renderStackList();
  updateRail();
  updateOutput();
}

function syncChipStates() {
  document.querySelectorAll('#palette .chip').forEach(function (chip) {
    const cat = chip.getAttribute('data-cat');
    const id = chip.getAttribute('data-id');
    const active = cat === 'extras' ? state.extras.has(id) : state.selections[cat] === id;
    chip.classList.toggle('is-active', active);
  });
}

function renderStackList() {
  const list = document.getElementById('stack-list');
  const hint = document.getElementById('dropzone-hint');
  list.innerHTML = '';
  const pt = PROJECT_TYPES.find(function (p) { return p.id === state.projectTypeId; });
  let count = 0;
  let hookIndex = 0;
  pt.categories.forEach(function (cat) {
    if (cat === 'extras') return;
    const id = state.selections[cat];
    if (!id) return;
    const block = findBlock(cat, id);
    hookIndex++;
    list.appendChild(buildStackItem(cat, block, hookIndex));
    count++;
  });
  Array.from(state.extras).forEach(function (id) {
    const block = findBlock('extras', id);
    if (!block) return;
    hookIndex++;
    list.appendChild(buildStackItem('extras', block, hookIndex));
    count++;
  });
  hint.style.display = count ? 'none' : 'block';
}

function buildStackItem(cat, block, index) {
  const li = el('li', 'stack-item');
  const hook = el('span', 'si-hook', String(index).padStart(2, '0'));
  const body = el('div', 'si-body');
  body.appendChild(el('div', 'si-cat', CATEGORY_META[cat].title));
  body.appendChild(el('div', 'si-label', block.label));
  const remove = el('button', 'si-remove', '✕');
  remove.type = 'button';
  remove.setAttribute('aria-label', 'Remove ' + block.label);
  remove.addEventListener('click', function () { toggleBlock(cat, block.id); });
  li.appendChild(hook);
  li.appendChild(body);
  li.appendChild(remove);
  return li;
}

function setupDropzone() {
  const zone = document.getElementById('dropzone');
  zone.addEventListener('dragover', function (e) {
    e.preventDefault();
    zone.classList.add('is-over');
  });
  zone.addEventListener('dragleave', function () { zone.classList.remove('is-over'); });
  zone.addEventListener('drop', function (e) {
    e.preventDefault();
    zone.classList.remove('is-over');
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      toggleBlock(data.cat, data.id);
    } catch (err) { /* ignore malformed payload */ }
  });
}

function buildStackSummary() {
  const pt = PROJECT_TYPES.find(function (p) { return p.id === state.projectTypeId; });
  const parts = [];
  pt.categories.forEach(function (cat) {
    if (cat === 'extras') return;
    const id = state.selections[cat];
    if (!id) return;
    parts.push(findBlock(cat, id).label);
  });
  return parts.length ? parts.join(', ') : 'no stack chosen yet';
}

function buildRequirementsList() {
  const pt = PROJECT_TYPES.find(function (p) { return p.id === state.projectTypeId; });
  const lines = [];
  pt.categories.forEach(function (cat) {
    if (cat === 'extras') return;
    const id = state.selections[cat];
    if (!id) return;
    lines.push('- ' + findBlock(cat, id).fragment);
  });
  Array.from(state.extras).forEach(function (id) {
    const block = findBlock('extras', id);
    if (block) lines.push('- ' + block.fragment);
  });
  return lines.length ? lines.join('\n') : '- (no extra requirements selected yet)';
}

function updateOutput() {
  const codeEl = document.getElementById('output-code');
  const metaEl = document.getElementById('output-meta');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');

  if (!state.agentId || !state.projectTypeId) {
    codeEl.textContent = '// Pick an agent and a project type — your structured prompt will hook together here.';
    metaEl.innerHTML = '';
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    return;
  }

  const agent = AGENTS.find(function (a) { return a.id === state.agentId; });
  const pt = PROJECT_TYPES.find(function (p) { return p.id === state.projectTypeId; });
  const taskInput = document.getElementById('task-desc');
  const nameInput = document.getElementById('project-name');
  state.task = taskInput ? taskInput.value.trim() : '';
  state.projectName = nameInput ? nameInput.value.trim() : '';

  const ctx = {
    projectName: state.projectName || 'Untitled project',
    projectType: pt.name,
    stackSummary: buildStackSummary(),
    requirements: buildRequirementsList(),
    task: state.task || '[Describe the specific feature or bug you want the agent to handle]'
  };

  const prompt = agent.build(ctx);
  codeEl.textContent = prompt;
  metaEl.innerHTML =
    '<span><b>Agent</b> ' + agent.name + '</span>' +
    '<span><b>Type</b> ' + pt.name + '</span>' +
    '<span><b>Stack</b> ' + ctx.stackSummary + '</span>';
  copyBtn.disabled = false;
  downloadBtn.disabled = false;
}

function setupTaskFields() {
  document.getElementById('task-desc').addEventListener('input', function () { updateOutput(); updateRail(); });
  document.getElementById('project-name').addEventListener('input', updateOutput);
}

function setupActions() {
  document.getElementById('copy-btn').addEventListener('click', function () {
    const text = document.getElementById('output-code').textContent;
    navigator.clipboard.writeText(text).then(function () {
      const btn = document.getElementById('copy-btn');
      const original = btn.textContent;
      btn.textContent = 'Copied ✓';
      btn.classList.add('is-copied');
      setTimeout(function () { btn.textContent = original; btn.classList.remove('is-copied'); }, 1600);
    });
  });

  document.getElementById('download-btn').addEventListener('click', function () {
    const text = document.getElementById('output-code').textContent;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (state.projectName ? state.projectName.replace(/\s+/g, '-').toLowerCase() : 'prompt-hook') + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  document.getElementById('reset-btn').addEventListener('click', function () {
    state.agentId = null;
    state.projectTypeId = null;
    state.selections = {};
    state.extras = new Set();
    state.projectName = '';
    state.task = '';
    document.getElementById('project-name').value = '';
    document.getElementById('task-desc').value = '';
    document.getElementById('agent-note').hidden = true;
    document.getElementById('palette').innerHTML = '';
    document.getElementById('stack-list').innerHTML = '';
    document.querySelectorAll('.pick-card').forEach(function (c) { c.classList.remove('is-selected'); });
    document.getElementById('section-project').classList.add('is-locked');
    document.getElementById('section-stack').classList.add('is-locked');
    document.getElementById('section-task').classList.add('is-locked');
    updateRail();
    updateOutput();
  });
}

function init() {
  renderAgents();
  renderProjectTypes();
  setupDropzone();
  setupTaskFields();
  setupActions();
  updateRail();
}

document.addEventListener('DOMContentLoaded', init);
