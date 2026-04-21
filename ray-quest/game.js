(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const ui = {
    levelName: document.getElementById("levelName"),
    score: document.getElementById("score"),
    accuracy: document.getElementById("accuracy"),
    attempts: document.getElementById("attempts"),
    angle: document.getElementById("beamAngle"),
    angleOut: document.getElementById("angleOut"),
    targetY: document.getElementById("targetY"),
    targetYOut: document.getElementById("targetYOut"),
    predictionText: document.getElementById("predictionText"),
    controls: document.getElementById("elementControls"),
    lawTitle: document.getElementById("lawTitle"),
    lawText: document.getElementById("lawText"),
    mission: document.getElementById("missionText"),
    toast: document.getElementById("toast"),
    summary: document.getElementById("summaryOverlay"),
    summaryScore: document.getElementById("summaryScore"),
    summaryAttempts: document.getElementById("summaryAttempts"),
    summaryFirstHits: document.getElementById("summaryFirstHits"),
    summaryLevels: document.getElementById("summaryLevels"),
    summaryReplay: document.getElementById("summaryReplay"),
    summaryClose: document.getElementById("summaryClose"),
    fire: document.getElementById("fire"),
    reset: document.getElementById("reset"),
    prev: document.getElementById("prevLevel"),
    next: document.getElementById("nextLevel")
  };

  const TAU = Math.PI * 2;
  const WORLD = { width: 1180, height: 720 };
  const GRID = { xMax: 100, yMax: 60 };
  const MAX_STEPS = 8;
  const EPS = 0.001;

  const levels = [
    {
      name: "Mirror Gate",
      source: { x: 102, y: 530, angle: 18 },
      target: { x: 880, y: 258, radius: 30 },
      lawTitle: "Law of reflection",
      lawText: "theta_i = theta_r. The incoming and reflected rays make equal angles with the mirror normal.",
      mission: "Use the mirror law to predict where one clean bounce will land, then place the receiver there.",
      optics: [
        { id: "mirrorA", type: "mirror", label: "Mirror", x: 505, y: 365, length: 260, angle: 32, min: -180, max: 180 }
      ]
    },
    {
      name: "Glass Bend",
      source: { x: 88, y: 470, angle: 14 },
      target: { x: 950, y: 330, radius: 30 },
      lawTitle: "Snell's law",
      lawText: "n1 sin(theta1) = n2 sin(theta2). Higher index material bends the ray toward the normal.",
      mission: "Use Snell's law to predict the refracted path, then place the receiver where it should land.",
      optics: [
        { id: "slabA", type: "slab", label: "Glass slab", x: 515, y: 360, width: 76, height: 420, angle: 8, n: 1.5, min: -180, max: 180 }
      ]
    },
    {
      name: "Diamond Switchback",
      source: { x: 94, y: 560, angle: 35 },
      target: { x: 985, y: 154, radius: 28 },
      lawTitle: "Reflection + refraction",
      lawText: "Use theta_i = theta_r at mirrors, then n1 sin(theta1) = n2 sin(theta2) at material boundaries.",
      mission: "Combine a reflection and a refraction, then place the receiver at the predicted landing point.",
      optics: [
        { id: "mirrorB", type: "mirror", label: "Mirror", x: 360, y: 385, length: 220, angle: 48, min: -180, max: 180 },
        { id: "slabB", type: "slab", label: "Dense block", x: 695, y: 275, width: 86, height: 330, angle: -23, n: 1.72, min: -180, max: 180 }
      ]
    },
    {
      name: "Glass Relay",
      source: { x: 86, y: 492, angle: 24 },
      target: { x: 1038, y: 222, radius: 27 },
      lawTitle: "Two-boundary refraction",
      lawText: "Apply n1 sin(theta1) = n2 sin(theta2) at each boundary. Track the ray direction after it exits the glass.",
      mission: "Predict the exit path after a tilted glass block, then set the receiver height on the fixed line.",
      optics: [
        { id: "slabC", type: "slab", label: "Crown glass", x: 500, y: 350, width: 92, height: 430, angle: -18, n: 1.52, min: -180, max: 180 },
        { id: "mirrorC", type: "mirror", label: "Finishing mirror", x: 788, y: 260, length: 190, angle: 62, min: -180, max: 180 }
      ]
    },
    {
      name: "Prism Gauntlet",
      source: { x: 84, y: 620, angle: 41 },
      target: { x: 1062, y: 116, radius: 25 },
      lawTitle: "Full ray trace",
      lawText: "Use the mirror law and Snell's law in sequence. Keep every outgoing direction in the +x-axis convention.",
      mission: "Trace mirror, glass, then mirror again. Place the receiver where the final ray reaches the locked line.",
      optics: [
        { id: "mirrorD", type: "mirror", label: "Mirror 1", x: 300, y: 430, length: 210, angle: 55, min: -180, max: 180 },
        { id: "slabD", type: "slab", label: "Dense glass", x: 610, y: 292, width: 92, height: 350, angle: 16, n: 1.68, min: -180, max: 180 },
        { id: "mirrorE", type: "mirror", label: "Mirror 2", x: 874, y: 265, length: 185, angle: -34, min: -180, max: 180 }
      ]
    }
  ];

  let levelIndex = 0;
  let score = 0;
  let beamPulse = 0;
  let lastResult = null;
  let predictionLocked = false;
  let levelAttempts = levels.map(() => 0);
  let levelSolved = levels.map(() => false);
  let levelBestAttempts = levels.map(() => null);
  let controls = {};
  let animationFrame = 0;

  function degToRad(value) {
    return (value * Math.PI) / 180;
  }

  function radToDeg(value) {
    return (value * 180) / Math.PI;
  }

  function vecFromAngle(degrees) {
    const a = degToRad(degrees);
    return { x: Math.cos(a), y: -Math.sin(a) };
  }

  function canvasToGrid(point) {
    return {
      x: (point.x / WORLD.width) * GRID.xMax,
      y: ((WORLD.height - point.y) / WORLD.height) * GRID.yMax
    };
  }

  function gridToCanvas(x, y) {
    return {
      x: (Number(x) / GRID.xMax) * WORLD.width,
      y: WORLD.height - (Number(y) / GRID.yMax) * WORLD.height
    };
  }

  function dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  function cross(a, b) {
    return a.x * b.y - a.y * b.x;
  }

  function normalize(v) {
    const length = Math.hypot(v.x, v.y) || 1;
    return { x: v.x / length, y: v.y / length };
  }

  function reflect(dir, normal) {
    const d = dot(dir, normal);
    return normalize({ x: dir.x - 2 * d * normal.x, y: dir.y - 2 * d * normal.y });
  }

  function refract(dir, normal, n1, n2) {
    let n = normalize(normal);
    let cosi = Math.max(-1, Math.min(1, dot(dir, n)));
    let etaI = n1;
    let etaT = n2;
    if (cosi < 0) {
      cosi = -cosi;
    } else {
      n = { x: -n.x, y: -n.y };
      const temp = etaI;
      etaI = etaT;
      etaT = temp;
    }

    const eta = etaI / etaT;
    const k = 1 - eta * eta * (1 - cosi * cosi);
    if (k < 0) return null;
    return normalize({
      x: eta * dir.x + (eta * cosi - Math.sqrt(k)) * n.x,
      y: eta * dir.y + (eta * cosi - Math.sqrt(k)) * n.y
    });
  }

  function lineSegmentIntersection(origin, dir, a, b) {
    const segment = { x: b.x - a.x, y: b.y - a.y };
    const denom = cross(dir, segment);
    if (Math.abs(denom) < 0.00001) return null;
    const diff = { x: a.x - origin.x, y: a.y - origin.y };
    const t = cross(diff, segment) / denom;
    const u = cross(diff, dir) / denom;
    if (t > EPS && u >= 0 && u <= 1) {
      return { t, u, point: { x: origin.x + dir.x * t, y: origin.y + dir.y * t } };
    }
    return null;
  }

  function circleIntersection(origin, dir, circle) {
    const toCircle = { x: origin.x - circle.x, y: origin.y - circle.y };
    const b = 2 * dot(dir, toCircle);
    const c = dot(toCircle, toCircle) - circle.radius * circle.radius;
    const disc = b * b - 4 * c;
    if (disc < 0) return null;
    const t = (-b - Math.sqrt(disc)) / 2;
    if (t > EPS) return { t, point: { x: origin.x + dir.x * t, y: origin.y + dir.y * t } };
    return null;
  }

  function mirrorSegment(optic) {
    const dir = vecFromAngle(optic.angle);
    const half = optic.length / 2;
    return {
      a: { x: optic.x - dir.x * half, y: optic.y - dir.y * half },
      b: { x: optic.x + dir.x * half, y: optic.y + dir.y * half }
    };
  }

  function slabSegments(optic) {
    const axis = vecFromAngle(optic.angle);
    const normal = { x: -axis.y, y: axis.x };
    const halfH = optic.height / 2;
    const halfW = optic.width / 2;
    const leftA = { x: optic.x - normal.x * halfW - axis.x * halfH, y: optic.y - normal.y * halfW - axis.y * halfH };
    const leftB = { x: optic.x - normal.x * halfW + axis.x * halfH, y: optic.y - normal.y * halfW + axis.y * halfH };
    const rightA = { x: optic.x + normal.x * halfW - axis.x * halfH, y: optic.y + normal.y * halfW - axis.y * halfH };
    const rightB = { x: optic.x + normal.x * halfW + axis.x * halfH, y: optic.y + normal.y * halfW + axis.y * halfH };
    return [
      { a: leftA, b: leftB, normal: { x: -normal.x, y: -normal.y } },
      { a: rightA, b: rightB, normal }
    ];
  }

  function collectSurfaces(level) {
    const surfaces = [];
    for (const optic of level.optics) {
      if (optic.type === "mirror") {
        const seg = mirrorSegment(optic);
        const axis = normalize({ x: seg.b.x - seg.a.x, y: seg.b.y - seg.a.y });
        surfaces.push({ type: "mirror", optic, a: seg.a, b: seg.b, normal: { x: -axis.y, y: axis.x } });
      } else {
        for (const seg of slabSegments(optic)) {
          surfaces.push({ type: "slab", optic, a: seg.a, b: seg.b, normal: seg.normal });
        }
      }
    }
    return surfaces;
  }

  function traceRay(level) {
    const points = [{ x: level.source.x, y: level.source.y }];
    let origin = { x: level.source.x, y: level.source.y };
    let dir = vecFromAngle(Number(ui.angle.value));
    let medium = 1;
    const interactions = [];
    let hitTarget = false;
    let targetHit = null;

    for (let step = 0; step < MAX_STEPS; step += 1) {
      let nearest = { t: Infinity, kind: "bounds", point: projectToBounds(origin, dir) };
      nearest.t = Math.hypot(nearest.point.x - origin.x, nearest.point.y - origin.y);

      const target = circleIntersection(origin, dir, level.target);
      if (target && target.t < nearest.t) {
        nearest = { ...target, kind: "target" };
      }

      for (const surface of collectSurfaces(level)) {
        const hit = lineSegmentIntersection(origin, dir, surface.a, surface.b);
        if (hit && hit.t < nearest.t) {
          nearest = { ...hit, kind: surface.type, surface };
        }
      }

      points.push(nearest.point);

      if (nearest.kind === "target") {
        hitTarget = true;
        targetHit = nearest.point;
        break;
      }

      if (nearest.kind === "bounds") break;

      if (nearest.kind === "mirror") {
        const normal = dot(dir, nearest.surface.normal) > 0
          ? { x: -nearest.surface.normal.x, y: -nearest.surface.normal.y }
          : nearest.surface.normal;
        const incoming = opticAngleFromNormal(dir, normal);
        dir = reflect(dir, normal);
        const outgoing = opticAngleFromNormal(dir, normal);
        interactions.push({
          type: "reflection",
          incoming,
          outgoing,
          outgoingAxis: directionAngle(dir),
          point: nearest.point,
          label: "reflected ray direction"
        });
      } else {
        const nextMedium = medium === 1 ? nearest.surface.optic.n : 1;
        const incoming = opticAngleFromNormal(dir, nearest.surface.normal);
        const bent = refract(dir, nearest.surface.normal, medium, nextMedium);
        if (!bent) {
          dir = reflect(dir, nearest.surface.normal);
          interactions.push({
            type: "total internal reflection",
            incoming,
            outgoing: incoming,
            outgoingAxis: directionAngle(dir),
            point: nearest.point,
            label: "reflected ray direction"
          });
        } else {
          const outgoing = opticAngleFromNormal(bent, nearest.surface.normal);
          interactions.push({
            type: "snell",
            incoming,
            outgoing,
            outgoingAxis: directionAngle(bent),
            n1: medium,
            n2: nextMedium,
            point: nearest.point,
            label: "refracted ray direction"
          });
          dir = bent;
          medium = nextMedium;
        }
      }

      origin = { x: nearest.point.x + dir.x * 1.5, y: nearest.point.y + dir.y * 1.5 };
    }

    const finalPoint = points[points.length - 1];
    const miss = targetHit ? 0 : Math.hypot(finalPoint.x - level.target.x, finalPoint.y - level.target.y);
    return { points, interactions, hitTarget, miss, receiverY: targetHit ? level.target.y : yAtX(points, level.target.x) };
  }

  function yAtX(points, x) {
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i];
      const b = points[i + 1];
      const minX = Math.min(a.x, b.x);
      const maxX = Math.max(a.x, b.x);
      if (x >= minX && x <= maxX && Math.abs(b.x - a.x) > 0.0001) {
        const t = (x - a.x) / (b.x - a.x);
        return a.y + (b.y - a.y) * t;
      }
    }
    return null;
  }

  function angleBetween(a, b) {
    const value = Math.max(-1, Math.min(1, dot(normalize(a), normalize(b))));
    return Math.abs(radToDeg(Math.acos(value)));
  }

  function opticAngleFromNormal(ray, normal) {
    const raw = angleBetween(ray, normal);
    return Math.min(raw, 180 - raw);
  }

  function projectToBounds(origin, dir) {
    const candidates = [];
    if (dir.x > 0) candidates.push((WORLD.width - origin.x) / dir.x);
    if (dir.x < 0) candidates.push((0 - origin.x) / dir.x);
    if (dir.y > 0) candidates.push((WORLD.height - origin.y) / dir.y);
    if (dir.y < 0) candidates.push((0 - origin.y) / dir.y);
    const t = Math.min(...candidates.filter((value) => value > EPS));
    return { x: origin.x + dir.x * t, y: origin.y + dir.y * t };
  }

  function fireBeam() {
    levelAttempts[levelIndex] += 1;
    lastResult = traceRay(levels[levelIndex]);
    predictionLocked = true;
    beamPulse = 1;
    const placed = canvasToGrid(levels[levelIndex].target);
    if (lastResult.hitTarget) {
      const firstSolve = !levelSolved[levelIndex];
      levelSolved[levelIndex] = true;
      if (levelBestAttempts[levelIndex] === null || levelAttempts[levelIndex] < levelBestAttempts[levelIndex]) {
        levelBestAttempts[levelIndex] = levelAttempts[levelIndex];
      }
      const base = Math.max(100, 260 - lastResult.interactions.length * 25);
      const multiplier = attemptMultiplier(levelAttempts[levelIndex]);
      const bonus = Math.round(base * multiplier);
      score += bonus;
      showToast(`Receiver energized on attempt ${levelAttempts[levelIndex]}. ${Math.round(multiplier * 100)}% score: +${bonus} photons.`);
      if (firstSolve && levelSolved.every(Boolean)) {
        window.setTimeout(showSummary, 650);
      }
    } else {
      score = Math.max(0, score - 10);
      const next = attemptMultiplier(levelAttempts[levelIndex] + 1);
      showToast(`Attempt ${levelAttempts[levelIndex]} missed y = ${formatCoord(placed.y)}. Next hit pays ${Math.round(next * 100)}%.`);
    }
    updateHud();
  }

  function attemptMultiplier(attempts) {
    return Math.max(0.25, 1 - (attempts - 1) * 0.15);
  }

  function updateHud() {
    const level = levels[levelIndex];
    ui.levelName.textContent = level.name;
    ui.score.textContent = String(score);
    ui.attempts.textContent = String(levelAttempts[levelIndex]);
    ui.angleOut.textContent = `${ui.angle.value}°`;
    ui.targetYOut.textContent = ui.targetY.value;
    ui.lawTitle.textContent = level.lawTitle;
    ui.lawText.textContent = level.lawText;
    ui.mission.textContent = level.mission;
    if (!predictionLocked) {
      ui.accuracy.textContent = "hidden";
    } else if (lastResult.hitTarget) {
      ui.accuracy.textContent = "locked";
    } else {
      ui.accuracy.textContent = "miss";
    }
    ui.predictionText.textContent = predictionLocked && lastResult
      ? "The revealed ray is feedback for your placed receiver. Adjust your sketch or calculation, change the receiver height, and test again."
      : `The receiver line is locked at x = ${formatCoord(canvasToGrid(level.target).x)}. First-hit score is best; each extra attempt reduces the reward.`;
  }

  function directionAngle(vector) {
    return normalizeAngle(radToDeg(Math.atan2(-vector.y, vector.x)));
  }

  function normalizeAngle(angle) {
    let value = angle;
    while (value > 180) value -= 360;
    while (value <= -180) value += 360;
    return value;
  }

  function formatCoord(value) {
    return String(Math.round(value));
  }

  function showToast(message) {
    ui.toast.textContent = message;
    ui.toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => ui.toast.classList.remove("show"), 1800);
  }

  function buildControls() {
    const level = levels[levelIndex];
    controls = {};
    ui.controls.innerHTML = "";
    ui.angle.value = level.source.angle;
    syncTargetControlsFromCanvas();
    for (const optic of level.optics) {
      controls[optic.id] = { angle: optic.angle };
      const item = document.createElement("section");
      item.className = "optic-control";
      item.innerHTML = `
        <div class="optic-head">
          <strong>${optic.label}</strong>
          <span class="tag">${optic.type === "mirror" ? "theta_i = theta_r" : `n = ${optic.n}`}</span>
        </div>
        <label for="${optic.id}Angle">Rotation from +x</label>
        <div class="range-row">
          <input id="${optic.id}Angle" type="range" min="${optic.min}" max="${optic.max}" value="${optic.angle}" step="1">
          <output id="${optic.id}Out">${optic.angle}°</output>
        </div>
        <p class="mini">${optic.type === "mirror" ? "Positive rotation is counterclockwise; the dashed normal turns with the mirror." : "Positive rotation is counterclockwise; Snell's law handles the bend."}</p>
      `;
      ui.controls.appendChild(item);
      const slider = item.querySelector("input");
      const output = item.querySelector("output");
      slider.addEventListener("input", () => {
        optic.angle = Number(slider.value);
        output.textContent = `${slider.value}°`;
        lastResult = null;
        predictionLocked = false;
        updateHud();
      });
    }
    lastResult = null;
    predictionLocked = false;
    updateHud();
  }

  function resetLevel() {
    const original = levels[levelIndex];
    original.source.angle = Number(original.source.angle);
    original.target.x = levelSeeds[levelIndex].target.x;
    original.target.y = levelSeeds[levelIndex].target.y;
    for (const optic of original.optics) {
      const seed = levelSeeds[levelIndex].optics.find((item) => item.id === optic.id);
      optic.angle = seed.angle;
    }
    levelAttempts[levelIndex] = 0;
    levelSolved[levelIndex] = false;
    levelBestAttempts[levelIndex] = null;
    buildControls();
    showToast("Level reset.");
  }

  function resetCourse() {
    score = 0;
    levelAttempts = levels.map(() => 0);
    levelSolved = levels.map(() => false);
    levelBestAttempts = levels.map(() => null);
    for (let i = 0; i < levels.length; i += 1) {
      levels[i].source.angle = levelSeeds[i].source.angle;
      levels[i].target.x = levelSeeds[i].target.x;
      levels[i].target.y = levelSeeds[i].target.y;
      for (const optic of levels[i].optics) {
        const seed = levelSeeds[i].optics.find((item) => item.id === optic.id);
        optic.angle = seed.angle;
      }
    }
    levelIndex = 0;
    hideSummary();
    buildControls();
    showToast("Course reset.");
  }

  function syncTargetControlsFromCanvas() {
    const level = levels[levelIndex];
    const position = canvasToGrid(level.target);
    ui.targetY.value = String(Math.round(position.y));
    ui.targetYOut.textContent = ui.targetY.value;
  }

  function syncTargetFromControls() {
    const level = levels[levelIndex];
    const position = gridToCanvas(canvasToGrid(level.target).x, ui.targetY.value);
    level.target.y = position.y;
    ui.targetYOut.textContent = ui.targetY.value;
    lastResult = null;
    predictionLocked = false;
    updateHud();
  }

  const levelSeeds = JSON.parse(JSON.stringify(levels));

  function setLevel(next) {
    hideSummary();
    levelIndex = (next + levels.length) % levels.length;
    buildControls();
    showToast(levels[levelIndex].name);
  }

  function showSummary() {
    const totalAttempts = levelAttempts.reduce((sum, attempts) => sum + attempts, 0);
    const firstHits = levelBestAttempts.filter((attempts) => attempts === 1).length;
    ui.summaryScore.textContent = String(score);
    ui.summaryAttempts.textContent = String(totalAttempts);
    ui.summaryFirstHits.textContent = `${firstHits}/${levels.length}`;
    ui.summaryLevels.innerHTML = levels.map((level, index) => {
      const attempts = levelBestAttempts[index] || levelAttempts[index] || 0;
      const status = attempts === 1 ? "First try" : `${attempts} attempts`;
      const multiplier = attempts ? `${Math.round(attemptMultiplier(attempts) * 100)}% payout` : "not cleared";
      return `<div><strong>${index + 1}. ${level.name}</strong><span>${status} · ${multiplier}</span></div>`;
    }).join("");
    ui.summary.hidden = false;
  }

  function hideSummary() {
    ui.summary.hidden = true;
  }

  function draw() {
    animationFrame = requestAnimationFrame(draw);
    const level = levels[levelIndex];
    beamPulse = Math.max(0, beamPulse - 0.025);
    ctx.clearRect(0, 0, WORLD.width, WORLD.height);
    drawBackdrop();
    drawGrid();
    drawTarget(level.target);
    drawSource(level.source);
    for (const optic of level.optics) drawOptic(optic);
    if (lastResult) {
      drawRay(lastResult.points, lastResult.hitTarget);
      drawInteractionMarkers(lastResult.interactions);
    } else {
      drawPlanningBeam(level.source);
    }
  }

  function drawBackdrop() {
    const gradient = ctx.createLinearGradient(0, 0, WORLD.width, WORLD.height);
    gradient.addColorStop(0, "#11202b");
    gradient.addColorStop(0.55, "#173140");
    gradient.addColorStop(1, "#3a4634");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
    for (let i = 0; i < 55; i += 1) {
      const x = (i * 193) % WORLD.width;
      const y = (i * 97) % WORLD.height;
      ctx.beginPath();
      ctx.arc(x, y, 1 + (i % 3), 0, TAU);
      ctx.fill();
    }
  }

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.055)";
    ctx.lineWidth = 1;
    for (let xUnit = 0; xUnit <= GRID.xMax; xUnit += 5) {
      const x = gridToCanvas(xUnit, 0).x;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD.height);
      ctx.stroke();
    }
    for (let yUnit = 0; yUnit <= GRID.yMax; yUnit += 5) {
      const y = gridToCanvas(0, yUnit).y;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD.width, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255, 249, 232, 0.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, WORLD.height);
    ctx.lineTo(WORLD.width, WORLD.height);
    ctx.moveTo(0, WORLD.height);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 249, 232, 0.72)";
    ctx.font = "700 13px Inter, sans-serif";
    ctx.textBaseline = "top";
    for (let xUnit = 0; xUnit <= GRID.xMax; xUnit += 20) {
      const x = gridToCanvas(xUnit, 0).x;
      ctx.fillText(String(xUnit), x + 4, WORLD.height - 20);
    }
    ctx.textBaseline = "middle";
    for (let yUnit = 10; yUnit <= GRID.yMax; yUnit += 10) {
      const y = gridToCanvas(0, yUnit).y;
      ctx.fillText(String(yUnit), 8, y);
    }
    ctx.fillText("+x", WORLD.width - 34, WORLD.height - 22);
    ctx.fillText("+y", 10, 18);
    ctx.restore();
  }

  function drawSource(source) {
    const angle = Number(ui.angle.value);
    ctx.save();
    ctx.translate(source.x, source.y);
    ctx.rotate(-degToRad(angle));
    ctx.fillStyle = "#263949";
    ctx.strokeStyle = "#fff2c2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-32, -22, 58, 44, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffcf33";
    ctx.beginPath();
    ctx.moveTo(24, -13);
    ctx.lineTo(48, 0);
    ctx.lineTo(24, 13);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawTarget(target) {
    const glow = lastResult && lastResult.hitTarget ? 20 + beamPulse * 24 : 10;
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.shadowColor = "#65f0a1";
    ctx.shadowBlur = glow;
    ctx.strokeStyle = "#92ffc0";
    ctx.lineWidth = 4;
    ctx.fillStyle = "rgba(85, 182, 111, 0.28)";
    ctx.beginPath();
    ctx.arc(0, 0, target.radius, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-target.radius - 8, 0);
    ctx.lineTo(target.radius + 8, 0);
    ctx.moveTo(0, -target.radius - 8);
    ctx.lineTo(0, target.radius + 8);
    ctx.stroke();
    const grid = canvasToGrid(target);
    ctx.fillStyle = "rgba(255, 249, 232, 0.88)";
    ctx.font = "800 14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`x = ${formatCoord(grid.x)}, y = ${formatCoord(grid.y)}`, 0, target.radius + 24);
    ctx.setLineDash([8, 10]);
    ctx.strokeStyle = "rgba(146, 255, 192, 0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -WORLD.height);
    ctx.stroke();
    ctx.restore();
  }

  function drawOptic(optic) {
    if (optic.type === "mirror") {
      const seg = mirrorSegment(optic);
      ctx.save();
      ctx.strokeStyle = "#d8f6ff";
      ctx.lineWidth = 9;
      ctx.lineCap = "round";
      ctx.shadowColor = "#39bfd8";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(seg.a.x, seg.a.y);
      ctx.lineTo(seg.b.x, seg.b.y);
      ctx.stroke();
      drawNormal(optic.x, optic.y, optic.angle + 90, 54, "#7fd8e8");
      ctx.restore();
      return;
    }

    const segments = slabSegments(optic);
    const points = [segments[0].a, segments[0].b, segments[1].b, segments[1].a];
    ctx.save();
    ctx.fillStyle = "rgba(73, 197, 218, 0.24)";
    ctx.strokeStyle = "#86e8f0";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#39bfd8";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (const seg of segments) {
      const mid = { x: (seg.a.x + seg.b.x) / 2, y: (seg.a.y + seg.b.y) / 2 };
      drawNormal(mid.x, mid.y, directionAngle(seg.normal), 34, "#9df5ff");
    }
    ctx.restore();
  }

  function drawNormal(x, y, angle, size, color) {
    const dir = vecFromAngle(angle);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.setLineDash([5, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - dir.x * size, y - dir.y * size);
    ctx.lineTo(x + dir.x * size, y + dir.y * size);
    ctx.stroke();
    ctx.restore();
  }

  function drawRay(points, hitTarget) {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.shadowColor = hitTarget ? "#80ffb4" : "#ffcf33";
    ctx.shadowBlur = 18 + beamPulse * 26;
    ctx.strokeStyle = hitTarget ? "#9cffc5" : "#ffcf33";
    ctx.lineWidth = 5 + beamPulse * 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 107, 53, 0.72)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawPlanningBeam(source) {
    const dir = vecFromAngle(Number(ui.angle.value));
    ctx.save();
    ctx.strokeStyle = "rgba(255, 207, 51, 0.55)";
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(source.x + dir.x * 150, source.y + dir.y * 150);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 249, 232, 0.75)";
    ctx.font = "700 14px Inter, sans-serif";
    ctx.fillText("initial +x angle only", source.x + dir.x * 160, source.y + dir.y * 160);
    ctx.restore();
  }

  function drawInteractionMarkers(interactions) {
    for (const item of interactions) {
      ctx.save();
      ctx.translate(item.point.x, item.point.y);
      ctx.fillStyle = item.type === "snell" ? "#39bfd8" : "#ffcf33";
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  ui.angle.addEventListener("input", () => {
    lastResult = null;
    predictionLocked = false;
    updateHud();
  });
  ui.targetY.addEventListener("input", syncTargetFromControls);
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = WORLD.width / rect.width;
    const scaleY = WORLD.height / rect.height;
    const point = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
    const grid = canvasToGrid(point);
    ui.targetY.value = String(Math.max(Number(ui.targetY.min), Math.min(Number(ui.targetY.max), Math.round(grid.y))));
    syncTargetFromControls();
  });
  ui.fire.addEventListener("click", fireBeam);
  ui.reset.addEventListener("click", resetLevel);
  ui.prev.addEventListener("click", () => setLevel(levelIndex - 1));
  ui.next.addEventListener("click", () => setLevel(levelIndex + 1));
  ui.summaryReplay.addEventListener("click", resetCourse);
  ui.summaryClose.addEventListener("click", hideSummary);
  window.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      event.preventDefault();
      fireBeam();
    }
    if (event.key === "ArrowRight") setLevel(levelIndex + 1);
    if (event.key === "ArrowLeft") setLevel(levelIndex - 1);
  });

  if (!ctx.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
      return this;
    };
  }

  buildControls();
  cancelAnimationFrame(animationFrame);
  draw();
})();
