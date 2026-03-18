const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

function typeToTerminal(lines, el) {
  let idx = 0;
  const push = () => {
    if (idx >= lines.length) return;
    if (lines[idx] !== "") el.textContent = `${el.textContent.trimEnd()}\n${lines[idx]}`;
    idx += 1;
    el.scrollTop = el.scrollHeight;
    setTimeout(push, 420);
  };
  push();
}

function initPacman() {
  const defaultMaxHarvest = 700;
  const upgradeMilestones = [50, 140, 260, 400];
  const pacman = $("#pacman");
  const track = $("#pac-track");
  const chase = track?.closest(".chase");
  const rows = $$(".hex-row", track);
  const harvestCounter = $("#harvest-bytes");
  const harvestFill = $(".harvest__fill");
  if (!pacman || !track || rows.length === 0 || !harvestFill) return;

  const harvestRate = $("#harvest-rate");
  const statusText = $("#pac-status-text");

  let maxHarvest = defaultMaxHarvest;
  let isOverdrive = false;
  let extractionCompleted = false;
  let baseSpeed = 1.8;
  let speed = baseSpeed;
  const rowDelay = 24;
  let pos = -36;
  let pacmanY = 0;
  let pacmanHeight = 36;
  let rafId = null;
  let isRunning = false;
  let currentRow = 0;
  let isMovingToNextRow = false;
  let totalHarvested = 0;
  let upgradeLevel = 0;
  let stormActive = false;
  let stormInterval = null;
  let rateCalculationInterval = null;
  let lastRateCheck = {
    time: performance.now(),
    harvest: 0,
  };
  let smoothedRate = 0;
  let lastFrameTime = null;
  let trackWidth = 0;
  let rowMetrics = [];
  let nextCollisionIndex = 0;

  const renderPacman = () => {
    pacman.style.transform = `translate3d(${pos}px, ${pacmanY}px, 0)`;
  };

  window.activateCookieOverdrive = () => {
    isOverdrive = true;
    const msg = $("#access-granted");
    if (msg) {
      msg.classList.add("active");
      setTimeout(() => {
        msg.classList.remove("active");
      }, 3000);
      speed = Math.max(speed, baseSpeed * 1.5);
    }

    if (chase) {
      chase.classList.add("chase--cookie");
    }
    if (statusText) {
      statusText.textContent = "cookie accepted // speed boost + gets faster";
    }

    updateUpgradeUI();
  };

  const calculateAndDisplayRate = () => {
    const now = performance.now();
    const timeDiff = (now - lastRateCheck.time) / 1000;
    if (timeDiff === 0) return;

    const harvestDiff = totalHarvested - lastRateCheck.harvest;
    const rateTBps = harvestDiff / timeDiff;
    const rateGBps = rateTBps * 1000;
    smoothedRate = smoothedRate * 0.7 + rateGBps * 0.3;

    if (harvestRate) {
      if ((!isRunning && rateGBps < 0.01) || extractionCompleted) {
        harvestRate.textContent = "0.00";
        smoothedRate = 0;
      } else {
        harvestRate.textContent = smoothedRate.toFixed(2);
      }
    }

    lastRateCheck = {
      time: now,
      harvest: totalHarvested,
    };
  };

  const stop = () => {
    isRunning = false;
    if (rateCalculationInterval) {
      clearInterval(rateCalculationInterval);
      rateCalculationInterval = null;
      if (harvestRate) {
        harvestRate.textContent = "0.00";
      }
    }
    if (rafId) cancelAnimationFrame(rafId);
  };

  const showExtractionCompleteTerminal = () => {
    stop();
    const serverTerminal = $("#server-terminal");
    const output = $("#server-terminal-output");
    const loginBtn = $("#harvest-login");

    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.style.opacity = "0.5";
    }

    if (track) {
      track.style.visibility = "hidden";
    }
    if (statusText) {
      statusText.textContent = "extraction complete // upload finalized";
    }

    if (serverTerminal && output) {
      const title = $(".terminal__title", serverTerminal);
      if (title) {
        title.textContent = "node://extraction-pipe";
      }

      serverTerminal.classList.add("active");
      output.textContent = "> Finalizing extraction...\n";

      const lines = [
        "> Data extraction complete.",
        "> Authenticating with local server...",
        "",
        "> Data upload complete.",
        "> Clearing logs...",
        "> End of Prompt// cookie-monster.md",
        "> _",
      ];

      if (isOverdrive) {
        let sequenceIndex = 0;
        const runSequence = () => {
          if (sequenceIndex >= lines.length) return;
          const line = lines[sequenceIndex];

          if (sequenceIndex === 2) {
            let percent = 0;
            const uploadLine = document.createTextNode("");
            output.appendChild(document.createTextNode("\n"));
            output.appendChild(uploadLine);

            const uploadInterval = setInterval(() => {
              percent += Math.floor(Math.random() * 5) + 2;
              if (percent > 100) percent = 100;

              const bars = Math.floor(percent / 10);
              const barStr = "|".repeat(bars) + ".".repeat(10 - bars);
              uploadLine.textContent = `> Uploading payload... [${barStr}] ${percent}%`;
              output.scrollTop = output.scrollHeight;

              if (percent === 100) {
                clearInterval(uploadInterval);
                sequenceIndex += 1;
                setTimeout(runSequence, 400);
              }
            }, 150);
          } else {
            output.textContent = `${output.textContent.trimEnd()}\n${line}`;
            output.scrollTop = output.scrollHeight;
            sequenceIndex += 1;
            setTimeout(runSequence, 420);
          }
        };

        runSequence();
      } else {
        typeToTerminal(lines, output);
      }
    }
  };

  const cacheTrackMetrics = () => {
    const trackRect = track.getBoundingClientRect();
    trackWidth = trackRect.width;

    rowMetrics = rows.map((row) => {
      const rowRect = row.getBoundingClientRect();
      const groups = $$(".hex-group", row).map((hexGroup) => {
        const groupRect = hexGroup.getBoundingClientRect();
        return {
          element: hexGroup,
          left: groupRect.left - trackRect.left,
          right: groupRect.right - trackRect.left,
        };
      });

      return {
        top: rowRect.top - trackRect.top,
        height: rowRect.height,
        groups,
      };
    });
  };

  const updatePacmanPosition = () => {
    const rowMetric = rowMetrics[currentRow];
    if (!rowMetric) return;
    pacmanY = rowMetric.top + rowMetric.height / 2 - pacmanHeight / 2;
    renderPacman();
  };

  const resetAllHexGroups = () => {
    $$(".hex-group", track).forEach((g) => g.classList.remove("eaten"));
    nextCollisionIndex = 0;
  };

  const updateUpgradeUI = () => {
    const btn = document.getElementById("harvest-upgrade");
    if (!btn) return;

    if (upgradeLevel === 0) {
      if (totalHarvested < upgradeMilestones[0]) {
        btn.disabled = true;
        btn.classList.add("harvest__btn--disabled");
        btn.textContent = `Upgrade ${upgradeMilestones[0]}TB`;
      } else {
        btn.disabled = false;
        btn.classList.remove("harvest__btn--disabled");
        btn.textContent = `Upgrade ${upgradeMilestones[0]}TB`;
      }
    } else if (upgradeLevel === 1) {
      if (totalHarvested < upgradeMilestones[1]) {
        btn.disabled = true;
        btn.classList.add("harvest__btn--disabled");
        btn.textContent = `Upgrade ${upgradeMilestones[1]}TB`;
      } else {
        btn.disabled = false;
        btn.classList.remove("harvest__btn--disabled");
        btn.textContent = `Upgrade ${upgradeMilestones[1]}TB`;
      }
    } else if (upgradeLevel === 2) {
      if (totalHarvested < upgradeMilestones[2]) {
        btn.disabled = true;
        btn.classList.add("harvest__btn--disabled");
        btn.textContent = `Upgrade ${upgradeMilestones[2]}TB`;
      } else {
        btn.disabled = false;
        btn.classList.remove("harvest__btn--disabled");
        btn.textContent = `Upgrade ${upgradeMilestones[2]}TB`;
      }
    } else if (upgradeLevel === 3) {
      if (totalHarvested < upgradeMilestones[3]) {
        btn.disabled = true;
        btn.classList.add("harvest__btn--disabled");
        btn.textContent = `Upgrade ${upgradeMilestones[3]}TB`;
      } else {
        btn.disabled = false;
        btn.classList.remove("harvest__btn--disabled");
        btn.textContent = `Upgrade ${upgradeMilestones[3]}TB`;
      }
    } else if (upgradeLevel >= 4) {
      btn.disabled = true;
      btn.classList.add("harvest__btn--disabled");
      btn.textContent = "max speed";
    }
  };

  const setStormUI = (active) => {
    const layer = document.getElementById("hex-storm");
    if (layer) {
      layer.classList.toggle("hex-storm--active", active);
    }
  };

  const startHexStorm = () => {
    if (stormActive) return;
    stormActive = true;
    setStormUI(true);

    const layer = document.getElementById("hex-storm");
    if (layer) {
      layer.innerHTML = "";
      const glyphs = ["0", "1", "A", "B", "C", "D", "E", "F", "X", "Y", "Z", "0xFF", "0x0D", "§"];
      const count = 80;

      for (let i = 0; i < count; i += 1) {
        const span = document.createElement("span");
        span.className = "hex-rain";
        const variant = Math.random();
        if (variant > 0.7) span.classList.add("hex-rain--cyan");
        else if (variant > 0.4) span.classList.add("hex-rain--magenta");
        else span.classList.add("hex-rain--green");

        span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        span.style.left = `${Math.random() * 100}%`;
        span.style.animationDuration = `${0.5 + Math.random() * 1.5}s`;
        span.style.animationDelay = `${Math.random() * 2}s`;
        span.style.fontSize = `${10 + Math.random() * 10}px`;
        span.style.opacity = `${0.3 + Math.random() * 0.7}`;
        layer.appendChild(span);
      }
    }

    if (stormInterval) clearInterval(stormInterval);
    stormInterval = setInterval(() => {
      applyHarvest(0.35);
    }, 60);
  };

  const applyHarvest = (amount) => {
    if (extractionCompleted) return;

    totalHarvested += amount;
    if (harvestCounter) {
      harvestCounter.textContent = totalHarvested.toFixed(2);
    }

    if (isOverdrive) {
      baseSpeed = Math.min(baseSpeed * 1.002, 60);
      speed = baseSpeed;
    }

    if (harvestFill) {
      const progress = Math.min(totalHarvested / maxHarvest, 1);
      harvestFill.style.width = `${progress * 100}%`;
    }

    if (totalHarvested >= maxHarvest) {
      extractionCompleted = true;
      totalHarvested = maxHarvest;
      if (harvestCounter) {
        harvestCounter.textContent = totalHarvested.toFixed(2);
      }
      if (harvestFill) {
        harvestFill.style.width = "100%";
      }
      if (stormInterval) clearInterval(stormInterval);
      showExtractionCompleteTerminal();
      return;
    }

    updateUpgradeUI();
  };

  const updateHarvestCounter = () => {
    applyHarvest(0.24);
  };

  const checkCollisions = (prevPos, newPos) => {
    const rowMetric = rowMetrics[currentRow];
    if (!rowMetric) return;
    const groups = rowMetric.groups;

    while (nextCollisionIndex < groups.length) {
      const { element, left, right } = groups[nextCollisionIndex];

      if (newPos + 40 < left) {
        break;
      }

      if (!element.classList.contains("eaten") && prevPos < right) {
        element.classList.add("eaten");
        updateHarvestCounter();
      }

      nextCollisionIndex += 1;
    }
  };

  const moveToNextRow = () => {
    currentRow += 1;
    if (currentRow >= rows.length) {
      isMovingToNextRow = true;
      setTimeout(() => {
        currentRow = 0;
        nextCollisionIndex = 0;
        updatePacmanPosition();
        pos = -36;
        renderPacman();
        resetAllHexGroups();
        isMovingToNextRow = false;
        isRunning = true;
        lastFrameTime = null;
        rafId = requestAnimationFrame(loop);
      }, rowDelay);
      return;
    }

    updatePacmanPosition();
    pos = -36;
    nextCollisionIndex = 0;
    renderPacman();
    isRunning = true;
    lastFrameTime = null;
    rafId = requestAnimationFrame(loop);
  };

  const loop = (timestamp) => {
    if (!isRunning || isMovingToNextRow) return;
    if (lastFrameTime === null) {
      lastFrameTime = timestamp;
    }

    const delta = Math.min(timestamp - lastFrameTime, 32);
    lastFrameTime = timestamp;
    const distance = speed * (delta / (1000 / 60));
    const max = trackWidth + 36;
    const prevPos = pos;
    pos += distance;
    renderPacman();

    checkCollisions(prevPos, pos);

    if (pos >= max) {
      isRunning = false;
      moveToNextRow();
      return;
    }

    rafId = requestAnimationFrame(loop);
  };

  const start = () => {
    if (isRunning) return;
    cacheTrackMetrics();
    updatePacmanPosition();
    isRunning = true;
    lastFrameTime = null;
    if (!rateCalculationInterval) {
      lastRateCheck = { time: performance.now(), harvest: totalHarvested };
      rateCalculationInterval = setInterval(calculateAndDisplayRate, 800);
    }
    rafId = requestAnimationFrame(loop);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) start();
        else stop();
      });
    },
    { threshold: 0.3 },
  );

  observer.observe(track);

  const handleResize = () => {
    cacheTrackMetrics();
    updatePacmanPosition();
  };

  window.addEventListener("resize", handleResize);

  window.__legacyPacmanControls = {
    start,
    stop,
  };

  cacheTrackMetrics();
  pacmanHeight = pacman.getBoundingClientRect().height || pacmanHeight;
  updatePacmanPosition();

  window.harvestClick = (amount = 0.1) => {
    applyHarvest(amount);
  };

  window.harvestUpgrade = () => {
    const btn = document.getElementById("harvest-upgrade");
    if (!btn) return;

    let newBaseSpeed = 0;
    let speedBoost = 0;

    if (upgradeLevel === 0 && totalHarvested >= upgradeMilestones[0]) {
      upgradeLevel = 1;
      newBaseSpeed = 1.8 * 2.2;
      speedBoost = newBaseSpeed - 1.8;
    } else if (upgradeLevel === 1 && totalHarvested >= upgradeMilestones[1]) {
      upgradeLevel = 2;
      newBaseSpeed = 1.8 * 3.5;
      speedBoost = newBaseSpeed - 1.8 * 2.2;
    } else if (upgradeLevel === 2 && totalHarvested >= upgradeMilestones[2]) {
      upgradeLevel = 3;
      newBaseSpeed = 1.8 * 5.5;
      speedBoost = newBaseSpeed - 1.8 * 3.5;
    } else if (upgradeLevel === 3 && totalHarvested >= upgradeMilestones[3]) {
      upgradeLevel = 4;
      newBaseSpeed = 1.8 * 7.0;
      speedBoost = newBaseSpeed - 1.8 * 5.5;
      pacman.classList.add("pacman--trail");
      startHexStorm();
    } else {
      return;
    }

    if (isOverdrive) {
      baseSpeed += speedBoost;
    } else {
      baseSpeed = newBaseSpeed;
    }
    speed = baseSpeed;
    updateUpgradeUI();
  };
}

function visChangeHandler() {
  const track = $("#pac-track");
  if (!track) return;
  const controls = window.__legacyPacmanControls;
  if (document.hidden) {
    controls?.stop?.();
    return;
  }
  if (track.getBoundingClientRect().top < window.innerHeight) {
    controls?.start?.();
  }
}

function showPasswordModal() {
  const modal = $("#password-modal");
  if (modal) {
    modal.classList.add("active");
    const input = $("#password-input");
    const overlay = $("#access-denied-overlay");
    if (input) {
      input.value = "";
      input.focus();
    }
    if (overlay) {
      overlay.classList.remove("active");
    }
  }
}

function hidePasswordModal() {
  const modal = $("#password-modal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function dismissAccessDenied() {
  const overlay = $("#access-denied-overlay");
  const audio = $("#audio-no");
  if (overlay) overlay.classList.remove("active");
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
  }
}

function handlePasswordSubmit() {
  const input = $("#password-input");
  const audio = $("#audio-no");

  if (!input) return;
  const password = input.value.trim();
  if (password === "") return;

  if (password === "cookie") {
    dismissAccessDenied();
    hidePasswordModal();
    const loginBtn = $("#harvest-login");
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.style.opacity = "0.5";
    }
    if (window.activateCookieOverdrive) {
      window.activateCookieOverdrive();
    }
  } else {
    const overlay = $("#access-denied-overlay");
    if (overlay) {
      overlay.classList.add("active");
      setTimeout(() => {
        document.addEventListener("click", dismissAccessDenied, { once: true });
      }, 50);
    }
    if (audio) {
      audio.loop = true;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
    input.value = "";
    input.focus();
  }
}

function initLegacyPacmanGame() {
  if (window.__legacyPacmanInitialized) return;
  window.__legacyPacmanInitialized = true;

  const submitBtn = $("#password-submit");
  const cancelBtn = $("#password-cancel");
  const input = $("#password-input");
  const modal = $("#password-modal");
  const harvestCard = document.querySelector(".harvest.stream__side");
  const harvestBtn = document.getElementById("harvest-upgrade");
  const loginBtn = document.getElementById("harvest-login");

  if (submitBtn) {
    submitBtn.addEventListener("click", handlePasswordSubmit);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener("click", hidePasswordModal);
  }
  if (modal) {
    modal.addEventListener("click", (e) => e.stopPropagation());
    const content = $(".password-modal__content", modal);
    if (content) {
      content.addEventListener("click", (e) => e.stopPropagation());
    }
  }
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handlePasswordSubmit();
      }
    });
  }
  if (harvestCard) {
    harvestCard.addEventListener("click", (e) => e.stopPropagation());
  }
  if (loginBtn) {
    loginBtn.addEventListener("click", showPasswordModal);
  }
  if (harvestBtn) {
    harvestBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (harvestBtn.disabled) return;
      if (window.harvestClick) {
        window.harvestClick(0.25);
      }
      if (window.harvestUpgrade) {
        window.harvestUpgrade();
      }
    });
  }

  initPacman();
  visChangeHandler();
  document.addEventListener("visibilitychange", visChangeHandler);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLegacyPacmanGame, { once: true });
} else {
  initLegacyPacmanGame();
}
