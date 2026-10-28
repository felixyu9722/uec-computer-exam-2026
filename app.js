// 2026年马来西亚华文独中统一考试（高中组）电脑与资讯工艺 (SY18)
// 教师参考解析网页核心应用逻辑交互脚本

document.addEventListener("DOMContentLoaded", () => {
  // 当前全局状态
  let currentPaper = "paper1"; // 'paper1' | 'paper2'
  let currentMode = "teacher";  // 'teacher' | 'clean' | 'practice'
  let searchKeyword = "";
  let userAnswers = {}; // { qId: selectedOption }
  let visibleSolutions = {}; // { qId: boolean }

  // DOM 容器
  const mcqContainer = document.getElementById("mcqContainer");
  const subjContainer = document.getElementById("subjContainer");
  const navGrid = document.getElementById("questionGridNav");
  const searchInput = document.getElementById("filterInput");
  const paper1TabBtn = document.getElementById("tabPaper1");
  const paper2TabBtn = document.getElementById("tabPaper2");
  const modeTeacherBtn = document.getElementById("modeTeacher");
  const modePracticeBtn = document.getElementById("modePractice");
  const modeCleanBtn = document.getElementById("modeClean");
  const statsLabel = document.getElementById("sidebarStats");

  // 初始化渲染
  renderMCQ();
  renderSubjective();
  renderNavGrid();
  updatePaperView();

  // 绑定事件
  paper1TabBtn.addEventListener("click", () => {
    currentPaper = "paper1";
    updatePaperView();
  });

  paper2TabBtn.addEventListener("click", () => {
    currentPaper = "paper2";
    updatePaperView();
  });

  modeTeacherBtn.addEventListener("click", () => setMode("teacher"));
  modePracticeBtn.addEventListener("click", () => setMode("practice"));
  modeCleanBtn.addEventListener("click", () => setMode("clean"));

  searchInput.addEventListener("input", (e) => {
    searchKeyword = e.target.value.trim().toLowerCase();
    if (currentPaper === "paper1") {
      renderMCQ();
    } else {
      renderSubjective();
    }
  });

  function setMode(mode) {
    currentMode = mode;
    [modeTeacherBtn, modePracticeBtn, modeCleanBtn].forEach(b => b.classList.remove("active"));
    if (mode === "teacher") modeTeacherBtn.classList.add("active");
    if (mode === "practice") modePracticeBtn.classList.add("active");
    if (mode === "clean") modeCleanBtn.classList.add("active");

    renderMCQ();
    renderSubjective();
    renderNavGrid();
  }

  function updatePaperView() {
    if (currentPaper === "paper1") {
      paper1TabBtn.classList.add("active");
      paper2TabBtn.classList.remove("active");
      mcqContainer.style.display = "block";
      subjContainer.style.display = "none";
    } else {
      paper2TabBtn.classList.add("active");
      paper1TabBtn.classList.remove("active");
      subjContainer.style.display = "block";
      mcqContainer.style.display = "none";
    }
    renderNavGrid();
  }

  // ================= 渲染选择题 =================
  function renderMCQ() {
    mcqContainer.innerHTML = "";

    const filtered = MCQ_QUESTIONS.filter(q => {
      if (!searchKeyword) return true;
      const combined = `${q.id} ${q.question} ${Object.values(q.options).join(" ")} ${q.topic} ${q.analysis}`.toLowerCase();
      return combined.includes(searchKeyword);
    });

    if (filtered.length === 0) {
      mcqContainer.innerHTML = `<div class="paper-intro-card" style="text-align:center; padding:30px;">
        <h3>未找到符合条件的题目</h3>
        <p style="color:var(--text-muted); margin-top:8px;">请尝试输入其他关键词，如“网络”、“CPU”、“流程图”等。</p>
      </div>`;
      return;
    }

    filtered.forEach(q => {
      const card = document.createElement("div");
      card.className = "question-card";
      card.id = `mcq-q-${q.id}`;

      // 配图 HTML
      let diagramHtml = "";
      if (q.diagram) {
        diagramHtml = `
          <div class="q-diagram-wrap">
            <img src="${q.diagram}" alt="题${q.id}插图" class="q-diagram-img" loading="lazy">
            <div class="diagram-caption">▲ 试卷原版插图（图 ${q.id === 20 ? 1 : 2}）</div>
          </div>
        `;
      }

      // 选项列表
      let optionsHtml = '<div class="options-list">';
      const isPractice = currentMode === "practice";
      const isTeacher = currentMode === "teacher";
      const userSelected = userAnswers[q.id];

      ["A", "B", "C", "D"].forEach(optKey => {
        const optText = q.options[optKey];
        let itemClass = "option-item";

        if (isTeacher) {
          // 教师模式下高亮正确答案
          if (optKey === q.answer) {
            itemClass += " highlight-correct";
          }
        } else if (isPractice && userSelected) {
          if (optKey === q.answer) {
            itemClass += " selected-correct";
          } else if (optKey === userSelected) {
            itemClass += " selected-wrong";
          }
        }

        optionsHtml += `
          <div class="${itemClass}" data-qid="${q.id}" data-opt="${optKey}">
            <div class="opt-prefix">${optKey}</div>
            <div class="opt-text">${escapeHtml(optText)}</div>
          </div>
        `;
      });
      optionsHtml += '</div>';

      // 教师解析面板
      let solutionHtml = "";
      const showSolution = isTeacher || (isPractice && userSelected) || visibleSolutions[q.id];

      if (currentMode !== "clean" && showSolution) {
        solutionHtml = `
          <div class="teacher-solution-box">
            <div class="solution-badge-row">
              <span class="correct-ans-tag">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                标准答案：${q.answer}
              </span>
              <span class="badge-topic">考点：${escapeHtml(q.topic)}</span>
            </div>

            <div class="analysis-block">
              <div class="analysis-title">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                教师参考解析与命题逻辑
              </div>
              <p class="analysis-p">${escapeHtml(q.analysis)}</p>
            </div>

            <div class="distractor-block">
              <div class="distractor-title">⚠️ 错项排除与干扰分析：</div>
              <div class="distractor-text">${escapeHtml(q.distractors)}</div>
            </div>
          </div>
        `;
      } else if (currentMode !== "clean" && !showSolution) {
        solutionHtml = `
          <div style="text-align:right; margin-top:10px;">
            <button class="solution-toggle-btn" onclick="toggleSolution(${q.id})">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              查看参考解析
            </button>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="q-header-row">
          <div class="q-num-badge">第 ${q.id} 题</div>
          <div class="q-meta-badges">
            <span class="badge-chapter">${escapeHtml(q.chapter)}</span>
            <span class="badge-marks">1%</span>
          </div>
        </div>
        <div class="q-content">${escapeHtml(q.question)}</div>
        ${diagramHtml}
        ${optionsHtml}
        ${solutionHtml}
      `;

      // 绑定选项点击（做题模式）
      card.querySelectorAll(".option-item").forEach(item => {
        item.addEventListener("click", () => {
          if (currentMode === "practice") {
            const qId = parseInt(item.getAttribute("data-qid"));
            const opt = item.getAttribute("data-opt");
            userAnswers[qId] = opt;
            renderMCQ();
            renderNavGrid();
          }
        });
      });

      mcqContainer.appendChild(card);
    });
  }

  window.toggleSolution = function(qId) {
    visibleSolutions[qId] = !visibleSolutions[qId];
    renderMCQ();
  };

  // ================= 渲染作答题 =================
  function renderSubjective() {
    subjContainer.innerHTML = "";

    const filtered = SUBJECTIVE_QUESTIONS.filter(item => {
      if (!searchKeyword) return true;
      const combined = `${item.id} ${item.title} ${item.context} ${JSON.stringify(item.subQuestions)}`.toLowerCase();
      return combined.includes(searchKeyword);
    });

    filtered.forEach(q => {
      const qWrap = document.createElement("div");
      qWrap.className = "question-card";
      qWrap.id = `subj-q-${q.id}`;

      // 小题列表
      let subHtml = "";
      q.subQuestions.forEach(sq => {
        let solutionSection = "";
        if (currentMode !== "clean") {
          solutionSection = `
            <div class="answer-standard-box">
              <div class="answer-standard-head">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                官方教师标准参考答案
              </div>
              <div class="answer-standard-body">${escapeHtml(sq.answer)}</div>
            </div>

            <div class="scoring-guide-box">
              <div class="scoring-guide-head">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path></svg>
                阅卷采分标准与评分细则 (Scoring Guide)
              </div>
              <div class="scoring-guide-body">${escapeHtml(sq.scoringGuide)}</div>
            </div>

            <div class="pedagogy-box">
              <div class="pedagogy-head">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a10.99 10.99 0 011.025 5.617 1 1 0 00.97.832h5.51a1 1 0 00.97-.832c.245-1.92.597-3.805 1.025-5.617l2.644-1.131a1 1 0 000-1.84l-7-3z"/></svg>
                课本考点延伸与教学点拨
              </div>
              <div class="pedagogy-body">${escapeHtml(sq.notes)}</div>
            </div>
          `;
        }

        subHtml += `
          <div class="subquestion-card">
            <div class="subq-head">
              <span class="subq-id-tag">${sq.subId}</span>
              <span class="badge-marks">${sq.marks}</span>
            </div>
            <div class="subq-text">${escapeHtml(sq.question)}</div>
            ${solutionSection}
          </div>
        `;
      });

      // 如果是第 1 题，加入“网络上传时间换算互动模拟器”
      let interactiveComponent = "";
      if (q.id === 1 && currentMode !== "clean") {
        interactiveComponent = `
          <div class="interactive-tool-box">
            <div class="tool-title">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              【互动演练】(d) 小题：文件上传耗时即时推算工具
            </div>
            <div class="tool-desc">教师可在课堂演示更改文件大小与带宽速率，直观对比二进制（1024）与十进制（1000）换算结果：</div>
            <div class="sim-input-row">
              <label style="font-size:0.85rem; font-weight:600;">文件大小 (KB)：
                <input type="number" id="simFileSize" class="sim-input" value="500000">
              </label>
              <label style="font-size:0.85rem; font-weight:600;">网络速率 (Mbps)：
                <input type="number" id="simBandwidth" class="sim-input" value="512">
              </label>
              <button class="sim-btn" onclick="calcUploadTime()">即时推算</button>
            </div>
            <div id="simResultOutput" class="sim-result-box">
              <strong>推算结果：</strong><br>
              • 二进制标准（推荐）：500,000 × 1024 × 8 bits ÷ 512,000,000 bps = <strong>8.00 秒</strong><br>
              • 十进制工程体系：500,000 × 1000 × 8 bits ÷ 512,000,000 bps = <strong>7.81 秒</strong>
            </div>
          </div>
        `;
      }

      // 如果是第 4 题，加入“地铁票价算法流程图与交互执行模拟器”
      if (q.id === 4 && currentMode !== "clean") {
        interactiveComponent = `
          <div class="interactive-tool-box">
            <div class="tool-title">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              【动态流程图演算】(a) 小题：地铁票价计费算法模拟器
            </div>
            <div class="tool-desc">输入任意乘坐站点数 N，实时高亮流程图中对应的判断路径与计费分支：</div>
            <div class="sim-input-row">
              <label style="font-size:0.85rem; font-weight:600;">输入乘坐站点数 (N)：
                <input type="number" id="subwayStationsInput" class="sim-input" value="7" min="1" max="100">
              </label>
              <button class="sim-btn" onclick="traceSubwayFlow()">单步演算追踪</button>
            </div>
            <div class="flowchart-svg-wrap">
              <svg width="560" height="420" viewBox="0 0 560 420" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;">
                <!-- 开始 -->
                <g id="node-start" class="flowchart-node">
                  <rect x="220" y="10" width="120" height="36" rx="18" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                  <text x="280" y="33" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">开始</text>
                </g>
                <path d="M280,46 L280,68" stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
                
                <!-- 输入 N -->
                <g id="node-input" class="flowchart-node">
                  <polygon points="210,104 230,70 350,70 330,104" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                  <text x="280" y="92" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">输入站点数 N</text>
                </g>
                <path d="M280,104 L280,128" stroke="#475569" stroke-width="2"/>

                <!-- 判断 1: N <= 5 -->
                <g id="node-cond1" class="flowchart-node">
                  <polygon points="280,128 350,158 280,188 210,158" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                  <text x="280" y="163" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">N ≤ 5 ?</text>
                </g>
                <!-- 是 1 -->
                <path d="M350,158 L420,158" stroke="#475569" stroke-width="2"/>
                <text x="375" y="150" font-size="12" fill="#15803d" font-weight="bold">是</text>
                <g id="node-act1" class="flowchart-node">
                  <rect x="420" y="140" width="100" height="36" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                  <text x="470" y="163" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">票价 = RM 5</text>
                </g>

                <!-- 否 1 -->
                <path d="M280,188 L280,210" stroke="#475569" stroke-width="2"/>
                <text x="288" y="202" font-size="12" fill="#dc2626" font-weight="bold">否</text>

                <!-- 判断 2: N <= 10 -->
                <g id="node-cond2" class="flowchart-node">
                  <polygon points="280,210 350,240 280,270 210,240" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                  <text x="280" y="245" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">N ≤ 10 ?</text>
                </g>
                <!-- 是 2 -->
                <path d="M350,240 L420,240" stroke="#475569" stroke-width="2"/>
                <text x="375" y="232" font-size="12" fill="#15803d" font-weight="bold">是</text>
                <g id="node-act2" class="flowchart-node">
                  <rect x="420" y="222" width="100" height="36" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                  <text x="470" y="245" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">票价 = RM 8</text>
                </g>

                <!-- 否 2 -->
                <path d="M280,270 L280,292" stroke="#475569" stroke-width="2"/>
                <text x="288" y="284" font-size="12" fill="#dc2626" font-weight="bold">否</text>

                <!-- 判断 3: N <= 15 -->
                <g id="node-cond3" class="flowchart-node">
                  <polygon points="280,292 350,322 280,352 210,322" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                  <text x="280" y="327" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">N ≤ 15 ?</text>
                </g>
                <!-- 是 3 -->
                <path d="M350,322 L420,322" stroke="#475569" stroke-width="2"/>
                <text x="375" y="314" font-size="12" fill="#15803d" font-weight="bold">是</text>
                <g id="node-act3" class="flowchart-node">
                  <rect x="420" y="304" width="100" height="36" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                  <text x="470" y="327" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">票价 = RM 12</text>
                </g>

                <!-- 否 3 (N > 15) -->
                <path d="M280,352 L280,380 L420,380" stroke="#475569" stroke-width="2"/>
                <text x="288" y="366" font-size="12" fill="#dc2626" font-weight="bold">否</text>
                <g id="node-act4" class="flowchart-node">
                  <rect x="420" y="362" width="100" height="36" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                  <text x="470" y="385" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">票价 = RM 15</text>
                </g>

                <!-- 汇合线与输出 -->
                <path d="M520,158 L540,158 L540,380 L520,380" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
                <path d="M520,240 L540,240" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
                <path d="M520,322 L540,322" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
                
                <!-- 底部输出与结束 -->
                <g id="node-out" class="flowchart-node">
                  <polygon points="50,350 70,316 190,316 170,350" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                  <text x="120" y="338" text-anchor="middle" font-size="13" font-weight="600" fill="#0f172a">输出票价</text>
                </g>
                <path d="M540,270 L550,270 L550,405 L120,405 L120,350" stroke="#475569" stroke-width="1.5" fill="none"/>
                
                <g id="node-end" class="flowchart-node">
                  <rect x="60" y="260" width="120" height="36" rx="18" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
                  <text x="120" y="283" text-anchor="middle" font-size="14" font-weight="600" fill="#0f172a">结束</text>
                </g>
                <path d="M120,316 L120,296" stroke="#475569" stroke-width="2"/>
              </svg>
            </div>
            <div id="subwayTraceOutput" class="sim-result-box">
              当前演算状态：请输入站点数点击“单步演算追踪”。
            </div>
          </div>
        `;
      }

      qWrap.innerHTML = `
        <div class="q-header-row">
          <div class="q-num-badge">试卷二 · 第 ${q.id} 大题</div>
          <span class="badge-marks">总分：${q.totalMarks}</span>
        </div>
        <h3 style="font-size:1.25rem; font-weight:800; color:var(--primary-navy); margin-bottom:12px;">${escapeHtml(q.title)}</h3>
        <div class="subj-context-card">
          <span class="subj-context-badge">📌 试题情景资料</span><br>
          ${escapeHtml(q.context)}
        </div>
        ${interactiveComponent}
        <div class="subquestions-list">
          ${subHtml}
        </div>
      `;

      subjContainer.appendChild(qWrap);
    });
  }

  // ================= 侧边题号网格导航 =================
  function renderNavGrid() {
    navGrid.innerHTML = "";
    if (currentPaper === "paper1") {
      statsLabel.innerText = `40 题全卷 (当前做题模式：${currentMode === 'teacher' ? '教师全解' : currentMode === 'practice' ? '自测练习' : '卷面模式'})`;
      MCQ_QUESTIONS.forEach(q => {
        const btn = document.createElement("a");
        btn.className = "q-grid-btn";
        btn.href = `#mcq-q-${q.id}`;
        btn.innerText = q.id;

        if (currentMode === "practice" && userAnswers[q.id]) {
          if (userAnswers[q.id] === q.answer) {
            btn.classList.add("answered-correct");
          } else {
            btn.classList.add("answered-wrong");
          }
        }
        navGrid.appendChild(btn);
      });
    } else {
      statsLabel.innerText = "6 大题全卷 (满分 60%)";
      SUBJECTIVE_QUESTIONS.forEach(q => {
        const btn = document.createElement("a");
        btn.className = "q-grid-btn";
        btn.href = `#subj-q-${q.id}`;
        btn.innerText = `Q${q.id}`;
        btn.style.aspectRatio = "auto";
        btn.style.padding = "8px 4px";
        navGrid.appendChild(btn);
      });
    }
  }

  // 辅助函数
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // 挂载全局交互函数
  window.calcUploadTime = function() {
    const sizeKB = parseFloat(document.getElementById("simFileSize").value) || 0;
    const mbps = parseFloat(document.getElementById("simBandwidth").value) || 1;
    const out = document.getElementById("simResultOutput");

    const tBinary = (sizeKB * 1024 * 8) / (mbps * 1000000);
    const tDecimal = (sizeKB * 1000 * 8) / (mbps * 1000000);

    out.innerHTML = `
      <strong>实时推算结果：</strong><br>
      • 文件大小：${sizeKB.toLocaleString()} KB = ${(sizeKB * 1024).toLocaleString()} Bytes<br>
      • 二进制网络标准（推荐得分）：${(sizeKB * 1024 * 8).toLocaleString()} bits ÷ ${(mbps * 1000000).toLocaleString()} bps = <span style="color:#15803d; font-size:1.1rem; font-weight:800;">${tBinary.toFixed(2)} 秒</span><br>
      • 十进制通信标准：${(sizeKB * 1000 * 8).toLocaleString()} bits ÷ ${(mbps * 1000000).toLocaleString()} bps = <span style="color:#b45309; font-weight:700;">${tDecimal.toFixed(2)} 秒</span>
    `;
  };

  window.traceSubwayFlow = function() {
    const n = parseInt(document.getElementById("subwayStationsInput").value) || 0;
    const out = document.getElementById("subwayTraceOutput");

    // 清空先前的 active 路径
    document.querySelectorAll(".flowchart-node").forEach(node => node.classList.remove("active-path"));

    // 激活开始和输入
    document.getElementById("node-start")?.classList.add("active-path");
    document.getElementById("node-input")?.classList.add("active-path");

    let price = 0;
    let traceText = "";

    if (n <= 5) {
      document.getElementById("node-cond1")?.classList.add("active-path");
      document.getElementById("node-act1")?.classList.add("active-path");
      price = 5;
      traceText = `乘坐 ${n} 站 (≤ 5 站) ➔ 判定框【N ≤ 5 ?】为【是】 ➔ 执行【票价 = RM 5】 ➔ 汇合输出并结束。`;
    } else if (n <= 10) {
      document.getElementById("node-cond1")?.classList.add("active-path");
      document.getElementById("node-cond2")?.classList.add("active-path");
      document.getElementById("node-act2")?.classList.add("active-path");
      price = 8;
      traceText = `乘坐 ${n} 站 ➔ 判定框【N ≤ 5 ?】为【否】 ➔ 判定框【N ≤ 10 ?】为【是】 ➔ 执行【票价 = RM 8】 ➔ 汇合输出并结束。`;
    } else if (n <= 15) {
      document.getElementById("node-cond1")?.classList.add("active-path");
      document.getElementById("node-cond2")?.classList.add("active-path");
      document.getElementById("node-cond3")?.classList.add("active-path");
      document.getElementById("node-act3")?.classList.add("active-path");
      price = 12;
      traceText = `乘坐 ${n} 站 ➔ 判定框【N ≤ 5 ?】为【否】 ➔ 判定框【N ≤ 10 ?】为【否】 ➔ 判定框【N ≤ 15 ?】为【是】 ➔ 执行【票价 = RM 12】 ➔ 汇合输出并结束。`;
    } else {
      document.getElementById("node-cond1")?.classList.add("active-path");
      document.getElementById("node-cond2")?.classList.add("active-path");
      document.getElementById("node-cond3")?.classList.add("active-path");
      document.getElementById("node-act4")?.classList.add("active-path");
      price = 15;
      traceText = `乘坐 ${n} 站 (> 15 站) ➔ 前三级判定均为【否】 ➔ 进入超额分支执行【票价 = RM 15】 ➔ 汇合输出并结束。`;
    }

    document.getElementById("node-out")?.classList.add("active-path");
    document.getElementById("node-end")?.classList.add("active-path");

    out.innerHTML = `
      <strong style="color:#1d4ed8;">逻辑追踪轨迹：</strong><br>
      ${traceText}<br>
      <strong>最终输出票价：<span style="color:#15803d; font-size:1.2rem; font-weight:800;">RM ${price}</span></strong>
    `;
  };
});
