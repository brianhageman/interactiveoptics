const moduleData = [
  {
    id: "reflection",
    title: "Reflection",
    short: "Law of reflection and plane mirror behavior",
    quiz: [
      {
        prompt: "If the incident angle is 42 degrees, what is the reflected angle?",
        options: ["21 degrees", "42 degrees", "48 degrees"],
        answer: 1,
      },
      {
        prompt: "A plane mirror forms which kind of image?",
        options: [
          "Real, inverted, and enlarged",
          "Virtual, upright, and same size",
          "Virtual, inverted, and reduced",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "refraction",
    title: "Refraction",
    short: "Snell's law, media changes, and total internal reflection",
    quiz: [
      {
        prompt: "Light goes from air into glass. Which way does the ray bend?",
        options: [
          "Toward the normal",
          "Away from the normal",
          "It never bends",
        ],
        answer: 0,
      },
      {
        prompt: "Total internal reflection can occur only when light travels",
        options: [
          "from lower index to higher index",
          "from higher index to lower index",
          "between equal indices",
        ],
        answer: 1,
      },
    ],
  },
  {
    id: "mirrors",
    title: "Mirrors",
    short: "Concave and convex mirrors with ray diagrams",
    quiz: [
      {
        prompt: "A convex mirror forms what type of image?",
        options: [
          "Real and inverted",
          "Virtual and upright",
          "Either real or virtual depending on distance",
        ],
        answer: 1,
      },
      {
        prompt: "For a concave mirror, an object placed beyond the focal point can produce a",
        options: [
          "real image",
          "virtual image only",
          "no image",
        ],
        answer: 0,
      },
    ],
  },
  {
    id: "lenses",
    title: "Lenses",
    short: "Converging and diverging lenses with image formation",
    quiz: [
      {
        prompt: "A converging lens with the object inside the focal length forms a",
        options: [
          "real, inverted image",
          "virtual, upright image",
          "virtual, inverted image",
        ],
        answer: 1,
      },
      {
        prompt: "A ray through the center of a thin lens is modeled as",
        options: [
          "passing straight through",
          "reflecting back",
          "always bending toward the axis",
        ],
        answer: 0,
      },
    ],
  },
  {
    id: "wave",
    title: "Interference and Diffraction",
    short: "Single slit, double slit, and intensity patterns",
    quiz: [
      {
        prompt: "Increasing wavelength while everything else stays fixed will generally",
        options: [
          "spread the pattern out",
          "compress the pattern",
          "remove all bright fringes",
        ],
        answer: 0,
      },
      {
        prompt: "Increasing double-slit separation causes fringe spacing to",
        options: ["increase", "decrease", "stay the same"],
        answer: 1,
      },
    ],
  },
  {
    id: "polarization",
    title: "Polarization",
    short: "Transmission axes and Malus's law",
    quiz: [
      {
        prompt: "Two ideal polarizers are crossed at 90 degrees. The transmitted intensity is",
        options: ["maximum", "half of the original", "zero"],
        answer: 2,
      },
      {
        prompt: "For unpolarized light, the first ideal polarizer transmits",
        options: ["all of the light", "half of the light", "one quarter of the light"],
        answer: 1,
      },
    ],
  },
];

const progressKey = "optics-studio-progress";
const capstoneKey = "optics-studio-capstone";
const capstoneQuestions = [
  {
    prompt: "A light ray enters glass from air. Which statement is correct?",
    options: [
      "It speeds up and bends away from the normal",
      "It slows down and bends toward the normal",
      "Its speed stays constant but its wavelength changes",
      "It reflects completely for every incident angle",
    ],
    answer: 1,
  },
  {
    prompt: "A plane mirror image is best described as",
    options: [
      "real, inverted, and enlarged",
      "virtual, upright, and the same distance behind the mirror as the object is in front",
      "real, upright, and magnified",
      "virtual, inverted, and reduced",
    ],
    answer: 1,
  },
  {
    prompt: "For a concave mirror, an object placed inside the focal length produces a",
    options: [
      "virtual, upright image",
      "real, inverted image",
      "real, upright image",
      "no image",
    ],
    answer: 0,
  },
  {
    prompt: "A diverging lens always forms an image that is",
    options: [
      "real and inverted",
      "virtual, upright, and reduced",
      "real and magnified",
      "at infinity",
    ],
    answer: 1,
  },
  {
    prompt: "If double-slit separation increases while wavelength and screen distance stay fixed, the fringe spacing",
    options: ["increases", "decreases", "stays zero", "becomes random"],
    answer: 1,
  },
  {
    prompt: "For single-slit diffraction, decreasing slit width causes the central maximum to",
    options: ["narrow", "disappear", "widen", "stay unchanged"],
    answer: 2,
  },
  {
    prompt: "Two ideal polarizers are at 0 degrees and 60 degrees. Relative to light just after the first polarizer, the transmitted intensity after the second is",
    options: ["100%", "75%", "50%", "25%"],
    answer: 3,
  },
  {
    prompt: "Total internal reflection requires light to travel",
    options: [
      "from lower index to higher index",
      "from higher index to lower index",
      "parallel to the boundary only",
      "through a polarizer first",
    ],
    answer: 1,
  },
];
const completed = loadProgress();
const capstoneState = loadCapstoneState();
let activePanel = "welcome";

function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(progressKey) || "{}");
    return moduleData.reduce((acc, module) => {
      acc[module.id] = Boolean(stored[module.id]);
      return acc;
    }, {});
  } catch {
    return moduleData.reduce((acc, module) => {
      acc[module.id] = false;
      return acc;
    }, {});
  }
}

function saveProgress() {
  localStorage.setItem(progressKey, JSON.stringify(completed));
}

function loadCapstoneState() {
  try {
    const stored = JSON.parse(localStorage.getItem(capstoneKey) || "{}");
    return {
      bestPercent: Number.isFinite(stored.bestPercent) ? stored.bestPercent : null,
      latestPercent: Number.isFinite(stored.latestPercent) ? stored.latestPercent : null,
      latestCorrect: Number.isFinite(stored.latestCorrect) ? stored.latestCorrect : null,
      totalQuestions: Number.isFinite(stored.totalQuestions) ? stored.totalQuestions : capstoneQuestions.length,
      passed: Boolean(stored.passed),
    };
  } catch {
    return {
      bestPercent: null,
      latestPercent: null,
      latestCorrect: null,
      totalQuestions: capstoneQuestions.length,
      passed: false,
    };
  }
}

function saveCapstoneState() {
  localStorage.setItem(capstoneKey, JSON.stringify(capstoneState));
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function buildRandomizedQuestions(questions) {
  return shuffleArray(
    questions.map((question) => {
      const options = shuffleArray(
        question.options.map((option, optionIndex) => ({
          text: option,
          isCorrect: optionIndex === question.answer,
        })),
      );
      return {
        prompt: question.prompt,
        options,
      };
    }),
  );
}

function gradeLetter(percent) {
  if (percent >= 90) return "A";
  if (percent >= 80) return "B";
  if (percent >= 70) return "C";
  if (percent >= 60) return "D";
  return "F";
}

function unlockedCount() {
  let count = 0;
  for (const module of moduleData) {
    count += 1;
    if (!completed[module.id]) {
      break;
    }
  }
  return Math.min(count, moduleData.length);
}

function moduleIsUnlocked(index) {
  return index < unlockedCount();
}

function completedCount() {
  return moduleData.filter((module) => completed[module.id]).length;
}

function activatePanel(panelId) {
  activePanel = panelId;
  document.querySelectorAll(".lesson-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === panelId);
  });
  document.querySelectorAll(".module-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.target === panelId);
  });
}

function renderNav() {
  const nav = document.getElementById("module-nav");
  nav.innerHTML = "";

  moduleData.forEach((module, index) => {
    const button = document.createElement("button");
    const unlocked = moduleIsUnlocked(index);
    button.className = "module-button";
    if (!unlocked) {
      button.classList.add("locked");
      button.disabled = true;
    }
    if (activePanel === `panel-${module.id}`) {
      button.classList.add("active");
    }
    button.dataset.target = `panel-${module.id}`;
    button.innerHTML = `<strong>${index + 1}. ${module.title}</strong><small>${completed[module.id] ? "Completed" : unlocked ? "Unlocked" : "Locked"}</small>`;
    button.addEventListener("click", () => activatePanel(`panel-${module.id}`));
    nav.appendChild(button);
  });

  const finishButton = document.createElement("button");
  const allDone = completedCount() === moduleData.length;
  finishButton.className = "module-button";
  finishButton.dataset.target = "panel-finish";
  finishButton.innerHTML = `<strong>Capstone Exam</strong><small>${allDone ? capstoneState.latestPercent === null ? "Unlocked" : `Latest score: ${capstoneState.latestPercent}%` : "Complete all modules to unlock"}</small>`;
  if (!allDone) {
    finishButton.classList.add("locked");
    finishButton.disabled = true;
  }
  if (activePanel === "panel-finish") {
    finishButton.classList.add("active");
  }
  finishButton.addEventListener("click", () => activatePanel("panel-finish"));
  nav.appendChild(finishButton);

  const progress = completedCount() / moduleData.length;
  document.getElementById("progress-label").textContent = `${completedCount()} of ${moduleData.length} modules completed`;
  document.getElementById("progress-fill").style.width = `${progress * 100}%`;
}

function renderQuiz(host, questions, config) {
  host.innerHTML = "";
  const form = document.createElement("form");

  questions.forEach((question, questionIndex) => {
    const wrapper = document.createElement("div");
    wrapper.className = "quiz-question";
    const title = document.createElement("p");
    title.textContent = `${questionIndex + 1}. ${question.prompt}`;
    wrapper.appendChild(title);

    question.options.forEach((option, optionIndex) => {
      const label = document.createElement("label");
      label.className = "quiz-option";
      label.innerHTML = `
        <input type="radio" name="${config.formId}-q${questionIndex}" value="${optionIndex}" />
        <span>${typeof option === "string" ? option : option.text}</span>
      `;
      wrapper.appendChild(label);
    });

    form.appendChild(wrapper);
  });

  const actions = document.createElement("div");
  actions.className = "quiz-actions";
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "quiz-submit";
  submit.textContent = config.submitLabel;
  const feedback = document.createElement("div");
  feedback.className = "quiz-feedback";
  actions.appendChild(submit);
  actions.appendChild(feedback);
  form.appendChild(actions);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    config.onSubmit({ questions, formData, feedback });
  });

  if (config.allowRetry) {
    const tools = document.createElement("div");
    tools.className = "quiz-tools";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "quiz-secondary";
    retry.textContent = config.retryLabel || "Shuffle questions";
    retry.addEventListener("click", config.onRetry);
    tools.appendChild(retry);
    form.appendChild(tools);
  }

  host.appendChild(form);
}

function buildModuleQuiz(module) {
  const host = document.getElementById(`quiz-${module.id}`);
  const questions = buildRandomizedQuestions(module.quiz);

  renderQuiz(host, questions, {
    formId: module.id,
    submitLabel: "Submit checkpoint",
    allowRetry: true,
    retryLabel: "Shuffle checkpoint",
    onRetry: () => buildModuleQuiz(module),
    onSubmit: ({ questions: renderedQuestions, formData, feedback }) => {
      const allCorrect = renderedQuestions.every((question, index) => {
        const raw = formData.get(`${module.id}-q${index}`);
        return question.options[Number(raw)]?.isCorrect === true;
      });

      if (allCorrect) {
        completed[module.id] = true;
        saveProgress();
        feedback.textContent = "Correct. The next module is now unlocked.";
        feedback.className = "quiz-feedback success";
        renderNav();

        const currentIndex = moduleData.findIndex((entry) => entry.id === module.id);
        const nextModule = moduleData[currentIndex + 1];
        if (nextModule) {
          activatePanel(`panel-${nextModule.id}`);
        } else {
          activatePanel("panel-finish");
          renderCapstone();
        }
      } else {
        feedback.textContent = "Not yet. The checkpoint was reshuffled for a new attempt.";
        feedback.className = "quiz-feedback error";
        window.setTimeout(() => buildModuleQuiz(module), 500);
      }
    },
  });
}

function updateCapstoneSummary() {
  const summary = document.getElementById("capstone-summary");
  if (capstoneState.latestPercent === null) {
    summary.innerHTML = "<p>No score recorded yet. Submit the capstone to generate a grade.</p>";
    return;
  }

  const latestLetter = gradeLetter(capstoneState.latestPercent);
  const bestText = capstoneState.bestPercent === null ? "No best score yet" : `Best score: ${capstoneState.bestPercent}%`;
  summary.innerHTML = `
    <div class="score-badge">Latest: ${capstoneState.latestPercent}% (${latestLetter})</div>
    <div class="score-badge">${bestText}</div>
    <p>${capstoneState.latestCorrect}/${capstoneState.totalQuestions} correct. ${capstoneState.passed ? "Mastery target met." : "Mastery target not yet met. Retake encouraged."}</p>
  `;
}

function renderCapstone() {
  updateCapstoneSummary();
  const host = document.getElementById("quiz-capstone");
  const questions = buildRandomizedQuestions(capstoneQuestions);

  renderQuiz(host, questions, {
    formId: "capstone",
    submitLabel: "Submit graded capstone",
    allowRetry: true,
    retryLabel: "New randomized version",
    onRetry: renderCapstone,
    onSubmit: ({ questions: renderedQuestions, formData, feedback }) => {
      const correctCount = renderedQuestions.reduce((count, question, index) => {
        const raw = formData.get(`capstone-q${index}`);
        return count + (question.options[Number(raw)]?.isCorrect ? 1 : 0);
      }, 0);
      const percent = Math.round((correctCount / renderedQuestions.length) * 100);
      const letter = gradeLetter(percent);

      capstoneState.latestPercent = percent;
      capstoneState.latestCorrect = correctCount;
      capstoneState.totalQuestions = renderedQuestions.length;
      capstoneState.bestPercent = capstoneState.bestPercent === null ? percent : Math.max(capstoneState.bestPercent, percent);
      capstoneState.passed = percent >= 80;
      saveCapstoneState();
      updateCapstoneSummary();
      renderNav();

      feedback.textContent = `Score: ${percent}% (${letter})`;
      feedback.className = `quiz-feedback ${percent >= 80 ? "success" : "error"}`;
    },
  });
}

function line(ctx, x1, y1, x2, y2, color, width = 3, dashed = false) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (dashed) {
    ctx.setLineDash([8, 8]);
  }
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function arrow(ctx, x1, y1, x2, y2, color, width = 3, dashed = false) {
  line(ctx, x1, y1, x2, y2, color, width, dashed);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 10;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLabel(ctx, text, x, y, color = "#1f2430") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = "14px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function clearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

function updateReflection() {
  const angle = Number(document.getElementById("reflection-angle").value);
  document.getElementById("reflection-angle-value").textContent = `${angle} degrees`;
  document.getElementById("reflection-result").textContent = `${angle} degrees`;

  const canvas = document.getElementById("reflection-canvas");
  const ctx = clearCanvas(canvas);
  const w = canvas.width;
  const h = canvas.height;
  const mirrorX = w * 0.72;
  const centerY = h * 0.52;
  const length = 220;
  const radians = (angle * Math.PI) / 180;
  const dx = Math.cos(radians) * length;
  const dy = Math.sin(radians) * length;

  ctx.fillStyle = "#f8ead0";
  ctx.fillRect(0, 0, w, h);
  line(ctx, mirrorX, 36, mirrorX, h - 36, "#0a4f58", 6);
  line(ctx, mirrorX - 180, centerY, mirrorX + 120, centerY, "#5d6675", 2, true);

  arrow(ctx, mirrorX - dx, centerY - dy, mirrorX, centerY, "#e76f51", 4);
  arrow(ctx, mirrorX, centerY, mirrorX - dx, centerY + dy, "#0f766e", 4);

  drawLabel(ctx, "mirror", mirrorX + 12, 48, "#0a4f58");
  drawLabel(ctx, "normal", mirrorX - 70, centerY - 10, "#5d6675");
  drawLabel(ctx, "incident ray", mirrorX - dx + 12, centerY - dy - 12, "#e76f51");
  drawLabel(ctx, "reflected ray", mirrorX - dx + 12, centerY + dy + 22, "#0f766e");
}

function updateRefraction() {
  const n1 = Number(document.getElementById("n1-slider").value) / 100;
  const n2 = Number(document.getElementById("n2-slider").value) / 100;
  const angle = Number(document.getElementById("refraction-angle").value);
  document.getElementById("n1-value").textContent = n1.toFixed(2);
  document.getElementById("n2-value").textContent = n2.toFixed(2);
  document.getElementById("refraction-angle-value").textContent = `${angle} degrees`;

  const canvas = document.getElementById("refraction-canvas");
  const ctx = clearCanvas(canvas);
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const length = 180;
  const theta1 = (angle * Math.PI) / 180;
  const sin2 = (n1 / n2) * Math.sin(theta1);

  ctx.fillStyle = "#dceff4";
  ctx.fillRect(0, 0, w, cy);
  ctx.fillStyle = "#f7ead2";
  ctx.fillRect(0, cy, w, cy);
  line(ctx, 0, cy, w, cy, "#1f2430", 2);
  line(ctx, cx, 24, cx, h - 24, "#5d6675", 2, true);

  arrow(ctx, cx - length * Math.sin(theta1), cy - length * Math.cos(theta1), cx, cy, "#e76f51", 4);

  if (Math.abs(sin2) <= 1) {
    const theta2 = Math.asin(sin2);
    arrow(ctx, cx, cy, cx + length * Math.sin(theta2), cy + length * Math.cos(theta2), "#0f766e", 4);
    document.getElementById("refraction-result").textContent = `${(theta2 * 180 / Math.PI).toFixed(1)} degrees in medium 2`;
  } else {
    arrow(ctx, cx, cy, cx + length * Math.sin(theta1), cy - length * Math.cos(theta1), "#0f766e", 4);
    document.getElementById("refraction-result").textContent = "Total internal reflection";
  }

  drawLabel(ctx, `n1 = ${n1.toFixed(2)}`, 24, 32);
  drawLabel(ctx, `n2 = ${n2.toFixed(2)}`, 24, h - 26);
  drawLabel(ctx, "normal", cx + 12, 36, "#5d6675");
}

function opticalImage(f, objectDistance) {
  const reciprocal = 1 / f - 1 / objectDistance;
  if (Math.abs(reciprocal) < 0.0001) {
    return Infinity;
  }
  return 1 / reciprocal;
}

function drawArrowObject(ctx, x, baseY, heightPx, color) {
  arrow(ctx, x, baseY, x, baseY - heightPx, color, 4);
}

function intersectionY(x1, y1, x2, y2, xTarget) {
  const t = (xTarget - x1) / (x2 - x1);
  return y1 + t * (y2 - y1);
}

function updateMirror() {
  const type = document.getElementById("mirror-type").value;
  const focalAbs = Number(document.getElementById("mirror-focal").value);
  const objectDistance = Number(document.getElementById("mirror-distance").value);
  const objectHeight = Number(document.getElementById("mirror-height").value);
  const f = type === "concave" ? focalAbs : -focalAbs;
  const di = opticalImage(f, objectDistance);
  const hi = Number.isFinite(di) ? (-di / objectDistance) * objectHeight : 0;

  const canvas = document.getElementById("mirror-canvas");
  const ctx = clearCanvas(canvas);
  const w = canvas.width;
  const h = canvas.height;
  const axisY = h * 0.68;
  const mirrorX = w * 0.64;
  const scale = 22;
  const heightScale = 16;
  const objectX = mirrorX - objectDistance * scale;
  const imageX = Number.isFinite(di) ? (di > 0 ? mirrorX - di * scale : mirrorX + Math.abs(di) * scale) : w + 100;
  const objectTopY = axisY - objectHeight * heightScale;
  const imageTopY = axisY - hi * heightScale;
  const focusX = type === "concave" ? mirrorX - focalAbs * scale : mirrorX + focalAbs * scale;

  ctx.fillStyle = "#fbf7ee";
  ctx.fillRect(0, 0, w, h);
  line(ctx, 24, axisY, w - 24, axisY, "#5d6675", 2);
  line(ctx, mirrorX, 36, mirrorX, h - 28, "#0a4f58", 6);
  drawArrowObject(ctx, objectX, axisY, objectHeight * heightScale, "#e76f51");
  drawLabel(ctx, "object", objectX - 24, objectTopY - 10, "#e76f51");
  drawLabel(ctx, "F", focusX - 4, axisY + 22, "#0a4f58");

  if (Number.isFinite(di)) {
    drawArrowObject(ctx, imageX, axisY, hi * heightScale, "#0f766e");
    drawLabel(ctx, "image", imageX - 18, imageTopY - 12, "#0f766e");
  }

  const hit1Y = objectTopY;
  arrow(ctx, objectX, objectTopY, mirrorX, hit1Y, "#e9a03b", 3);

  if (type === "concave") {
    const ray1EndX = 40;
    const ray1EndY = intersectionY(mirrorX, hit1Y, focusX, axisY, ray1EndX);
    arrow(ctx, mirrorX, hit1Y, ray1EndX, ray1EndY, "#0f766e", 3);
    const hit2Y = intersectionY(objectX, objectTopY, focusX, axisY, mirrorX);
    arrow(ctx, objectX, objectTopY, mirrorX, hit2Y, "#e9a03b", 3);
    arrow(ctx, mirrorX, hit2Y, 40, hit2Y, "#0f766e", 3);
    if (di < 0 && Number.isFinite(di)) {
      line(ctx, mirrorX, hit1Y, imageX, imageTopY, "#0f766e", 2, true);
      line(ctx, mirrorX, hit2Y, imageX, imageTopY, "#0f766e", 2, true);
    }
  } else {
    const lineStartX = 40;
    const ray1EndY = intersectionY(focusX, axisY, mirrorX, hit1Y, lineStartX);
    arrow(ctx, mirrorX, hit1Y, lineStartX, ray1EndY, "#0f766e", 3);
    line(ctx, mirrorX, hit1Y, focusX, axisY, "#0f766e", 2, true);
    const hit2Y = intersectionY(objectX, objectTopY, focusX, axisY, mirrorX);
    arrow(ctx, objectX, objectTopY, mirrorX, hit2Y, "#e9a03b", 3);
    arrow(ctx, mirrorX, hit2Y, 40, hit2Y, "#0f766e", 3);
    line(ctx, mirrorX, hit2Y, imageX, hit2Y, "#0f766e", 2, true);
  }

  const descriptor = !Number.isFinite(di)
    ? "image at infinity"
    : di > 0
      ? hi < 0 ? "real, inverted" : "real, upright"
      : "virtual, upright";

  document.getElementById("mirror-image-distance").textContent = Number.isFinite(di) ? `${di.toFixed(2)} cm` : "infinite";
  document.getElementById("mirror-image-height").textContent = Number.isFinite(di) ? `${hi.toFixed(2)} cm` : "undefined";
  document.getElementById("mirror-image-type").textContent = descriptor;
}

function updateLens() {
  const type = document.getElementById("lens-type").value;
  const focalAbs = Number(document.getElementById("lens-focal").value);
  const objectDistance = Number(document.getElementById("lens-distance").value);
  const objectHeight = Number(document.getElementById("lens-height").value);
  const f = type === "converging" ? focalAbs : -focalAbs;
  const di = opticalImage(f, objectDistance);
  const hi = Number.isFinite(di) ? (-di / objectDistance) * objectHeight : 0;

  const canvas = document.getElementById("lens-canvas");
  const ctx = clearCanvas(canvas);
  const w = canvas.width;
  const h = canvas.height;
  const axisY = h * 0.68;
  const lensX = w * 0.5;
  const scale = 22;
  const heightScale = 16;
  const objectX = lensX - objectDistance * scale;
  const imageX = Number.isFinite(di) ? lensX + di * scale : w + 100;
  const objectTopY = axisY - objectHeight * heightScale;
  const imageTopY = axisY - hi * heightScale;
  const leftFocus = lensX - focalAbs * scale;
  const rightFocus = lensX + focalAbs * scale;

  ctx.fillStyle = "#fbf7ee";
  ctx.fillRect(0, 0, w, h);
  line(ctx, 24, axisY, w - 24, axisY, "#5d6675", 2);
  line(ctx, lensX, 36, lensX, h - 30, "#0a4f58", 6);
  drawArrowObject(ctx, objectX, axisY, objectHeight * heightScale, "#e76f51");
  drawLabel(ctx, "object", objectX - 24, objectTopY - 10, "#e76f51");
  drawLabel(ctx, "F", leftFocus - 3, axisY + 22, "#0a4f58");
  drawLabel(ctx, "F", rightFocus - 3, axisY + 22, "#0a4f58");

  if (Number.isFinite(di)) {
    drawArrowObject(ctx, imageX, axisY, hi * heightScale, "#0f766e");
    drawLabel(ctx, "image", imageX - 18, imageTopY - 12, "#0f766e");
  }

  arrow(ctx, objectX, objectTopY, lensX, objectTopY, "#e9a03b", 3);
  arrow(ctx, objectX, objectTopY, lensX, axisY, "#2a74b5", 2);

  if (type === "converging") {
    const endX = w - 40;
    const endY = intersectionY(lensX, objectTopY, rightFocus, axisY, endX);
    arrow(ctx, lensX, objectTopY, endX, endY, "#0f766e", 3);
    if (di < 0 && Number.isFinite(di)) {
      line(ctx, lensX, objectTopY, imageX, imageTopY, "#0f766e", 2, true);
      line(ctx, lensX, axisY, imageX, imageTopY, "#2a74b5", 2, true);
    }
  } else {
    const endX = w - 40;
    const endY = intersectionY(leftFocus, axisY, lensX, objectTopY, endX);
    arrow(ctx, lensX, objectTopY, endX, endY, "#0f766e", 3);
    line(ctx, leftFocus, axisY, lensX, objectTopY, "#0f766e", 2, true);
  }

  const centerRayEndY = intersectionY(objectX, objectTopY, lensX, axisY, w - 40);
  arrow(ctx, lensX, axisY, w - 40, centerRayEndY, "#2a74b5", 2);

  const descriptor = !Number.isFinite(di)
    ? "image at infinity"
    : di > 0
      ? hi < 0 ? "real, inverted" : "real, upright"
      : "virtual, upright";

  document.getElementById("lens-image-distance").textContent = Number.isFinite(di) ? `${di.toFixed(2)} cm` : "infinite";
  document.getElementById("lens-image-height").textContent = Number.isFinite(di) ? `${hi.toFixed(2)} cm` : "undefined";
  document.getElementById("lens-image-type").textContent = descriptor;
}

function wavelengthColor(wavelengthNm) {
  if (wavelengthNm < 450) return "#5a6ff0";
  if (wavelengthNm < 495) return "#3a9dd6";
  if (wavelengthNm < 570) return "#1c9f62";
  if (wavelengthNm < 590) return "#d9ab2b";
  if (wavelengthNm < 620) return "#ef7a3b";
  return "#d94a46";
}

function sincSquared(beta) {
  if (Math.abs(beta) < 1e-6) {
    return 1;
  }
  return (Math.sin(beta) / beta) ** 2;
}

function updateWave() {
  const mode = document.getElementById("wave-mode").value;
  const wavelength = Number(document.getElementById("wave-wavelength").value) * 1e-9;
  const slitWidth = Number(document.getElementById("wave-width").value) * 1e-6;
  const slitSeparation = Number(document.getElementById("wave-separation").value) * 1e-3;
  const screenDistance = Number(document.getElementById("wave-distance").value) / 10;
  document.getElementById("wave-wavelength-value").textContent = `${Math.round(wavelength * 1e9)} nm`;

  const canvas = document.getElementById("wave-canvas");
  const ctx = clearCanvas(canvas);
  const w = canvas.width;
  const h = canvas.height;
  const graphLeft = 50;
  const graphRight = w - 30;
  const graphTop = 36;
  const graphBottom = h - 50;
  const xMax = 0.025;
  const color = wavelengthColor(wavelength * 1e9);

  ctx.fillStyle = "#fbf7ee";
  ctx.fillRect(0, 0, w, h);
  line(ctx, graphLeft, graphBottom, graphRight, graphBottom, "#5d6675", 2);
  line(ctx, graphLeft, graphTop, graphLeft, graphBottom, "#5d6675", 2);
  drawLabel(ctx, "intensity", 12, graphTop + 12);
  drawLabel(ctx, "screen position", graphRight - 90, graphBottom + 26);

  ctx.beginPath();
  let first = true;
  for (let px = graphLeft; px <= graphRight; px += 1) {
    const x = ((px - graphLeft) / (graphRight - graphLeft)) * 2 * xMax - xMax;
    const theta = Math.atan(x / screenDistance);
    const beta = (Math.PI * slitWidth * Math.sin(theta)) / wavelength;
    let intensity = sincSquared(beta);
    if (mode === "double") {
      const alpha = (Math.PI * slitSeparation * Math.sin(theta)) / wavelength;
      intensity *= Math.cos(alpha) ** 2;
    }
    const py = graphBottom - intensity * (graphBottom - graphTop);
    if (first) {
      ctx.moveTo(px, py);
      first = false;
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  const metric = mode === "single"
    ? (2 * wavelength * screenDistance / slitWidth) * 1000
    : (wavelength * screenDistance / slitSeparation) * 1000;
  document.getElementById("wave-result").textContent = mode === "single"
    ? `${metric.toFixed(2)} mm central maximum`
    : `${metric.toFixed(2)} mm fringe spacing`;
}

function updatePolarization() {
  const mode = document.getElementById("polarization-input").value;
  const angle = Number(document.getElementById("polarization-angle").value);
  const theta = (angle * Math.PI) / 180;
  const base = mode === "unpolarized" ? 0.5 : 1;
  const transmitted = base * Math.cos(theta) ** 2;

  document.getElementById("polarization-angle-value").textContent = `${angle} degrees`;
  document.getElementById("polarization-result").textContent = `${(transmitted * 100).toFixed(1)}% of I0`;

  const canvas = document.getElementById("polarization-canvas");
  const ctx = clearCanvas(canvas);
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "#fbf7ee";
  ctx.fillRect(0, 0, w, h);

  const left = 80;
  const center = w / 2;
  const right = w - 120;
  const baseY = h * 0.62;

  ctx.fillStyle = "#0a4f58";
  ctx.fillRect(center - 10, 70, 20, h - 140);
  ctx.fillRect(right - 10, 70, 20, h - 140);
  drawLabel(ctx, "polarizer", center - 34, 58);
  drawLabel(ctx, "analyzer", right - 28, 58);

  for (let i = 0; i < 7; i += 1) {
    const y = 80 + i * 28;
    const swing = i % 2 === 0 ? 24 : -24;
    line(ctx, left - 20, y, left + swing, y + 10, "#e9a03b", 3);
  }
  drawLabel(ctx, mode === "unpolarized" ? "mixed directions" : "aligned wave", left - 22, baseY + 54, "#5d6675");

  const polarizedHeight = 86;
  line(ctx, center + 18, baseY + polarizedHeight / 2, center + 18, baseY - polarizedHeight / 2, "#0f766e", 5);
  drawLabel(ctx, `${(base * 100).toFixed(0)}% after first polarizer`, center - 44, baseY + 54, "#5d6675");

  const analyzerHeight = polarizedHeight * Math.cos(theta);
  const analyzerX = right + 40;
  const analyzerY = baseY;
  line(ctx, analyzerX, analyzerY, analyzerX + analyzerHeight * Math.sin(theta), analyzerY - analyzerHeight * Math.cos(theta), "#d94a46", 5);
  drawLabel(ctx, `${(transmitted * 100).toFixed(1)}% transmitted`, right - 18, baseY + 54, "#5d6675");
}

function attachControls() {
  [
    "reflection-angle",
    "n1-slider",
    "n2-slider",
    "refraction-angle",
    "mirror-type",
    "mirror-focal",
    "mirror-distance",
    "mirror-height",
    "lens-type",
    "lens-focal",
    "lens-distance",
    "lens-height",
    "wave-mode",
    "wave-wavelength",
    "wave-width",
    "wave-separation",
    "wave-distance",
    "polarization-input",
    "polarization-angle",
  ].forEach((id) => {
    const element = document.getElementById(id);
    element.addEventListener("input", renderAllSimulations);
    element.addEventListener("change", renderAllSimulations);
  });

  document.getElementById("start-course").addEventListener("click", () => {
    activatePanel("panel-reflection");
  });

  document.getElementById("reset-progress").addEventListener("click", () => {
    moduleData.forEach((module) => {
      completed[module.id] = false;
    });
    saveProgress();
    capstoneState.bestPercent = null;
    capstoneState.latestPercent = null;
    capstoneState.latestCorrect = null;
    capstoneState.totalQuestions = capstoneQuestions.length;
    capstoneState.passed = false;
    saveCapstoneState();
    renderNav();
    activatePanel("welcome-panel");
    document.querySelectorAll("form").forEach((form) => form.reset());
    document.querySelectorAll(".quiz-feedback").forEach((node) => {
      node.textContent = "";
      node.className = "quiz-feedback";
    });
    moduleData.forEach(buildModuleQuiz);
    renderCapstone();
    renderAllSimulations();
  });
}

function renderAllSimulations() {
  updateReflection();
  updateRefraction();
  updateMirror();
  updateLens();
  updateWave();
  updatePolarization();
}

function init() {
  moduleData.forEach(buildModuleQuiz);
  renderCapstone();
  attachControls();
  renderNav();
  renderAllSimulations();
  if (completedCount() > 0) {
    const nextIndex = moduleData.findIndex((module) => !completed[module.id]);
    if (nextIndex >= 0) {
      activatePanel(`panel-${moduleData[nextIndex].id}`);
    } else {
      activatePanel("panel-finish");
    }
  } else {
    activatePanel("welcome-panel");
  }
}

init();
