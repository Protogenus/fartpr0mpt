const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      document.body.removeChild(ta);
      return false;
    }
  }
}

function typeToTerminal(lines, el) {
  let idx = 0;
  const push = () => {
    if (idx >= lines.length) return;
    // If line is empty string (used for delays/custom handling), skip printing it
    if (lines[idx] !== '') el.textContent = `${el.textContent.trimEnd()}\n${lines[idx]}`;
    
    idx += 1;
    el.scrollTop = el.scrollHeight;
    setTimeout(push, 420);
  };
  push();
}

function initCounters() {
  const nums = $$('[data-count]');
  const start = performance.now();
  const duration = 900;

  const tick = (t) => {
    const p = clamp((t - start) / duration, 0, 1);
    for (const el of nums) {
      const target = Number(el.getAttribute('data-count'));
      el.textContent = String(Math.round(target * p));
    }
    if (p < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initUptime() {
  const el = $('#uptime');
  const started = Date.now();
  const pad = (n) => String(n).padStart(2, '0');

  setInterval(() => {
    const s = Math.floor((Date.now() - started) / 1000);
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    el.textContent = `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  }, 500);
}

function initVault() {
  const input = $('#filter');
  const list = $('#vault-list');
  if (!input || !list) return;

  const applyFilter = () => {
    const q = input.value.trim().toLowerCase();
    const items = $$('.prompt', list);

    for (const item of items) {
      if (!q) {
        item.style.display = '';
        continue;
      }
      const tags = (item.getAttribute('data-tags') || '').toLowerCase();
      const title = $('h3', item)?.textContent?.toLowerCase() ?? '';
      item.style.display = tags.includes(q) || title.includes(q) ? '' : 'none';
    }
  };

  input.addEventListener('input', applyFilter);

  const shuffleBtn = $('#shuffle');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', () => {
      const items = $$('.prompt', list);
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      for (const item of items) list.appendChild(item);
    });
  }

  $$('.copy-prompt').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const prompt = btn.closest('.prompt');
      const text = $('.prompt__body', prompt)?.textContent ?? '';
      const ok = await copyToClipboard(text.trim());
      btn.textContent = ok ? 'extracted' : 'extract failed';
      setTimeout(() => (btn.textContent = 'extract'), 900);
    });
  });
}

function initDecipherPrompts() {
  const bodies = $$('.prompt__body');
  if (bodies.length === 0) return;

  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%*+-=<>/\\|';
  const randChar = () => glyphs[Math.floor(Math.random() * glyphs.length)];
  const frameMs = 160;
  const cycleMs = 8200;

  const items = bodies.map((el) => {
    const target = el.getAttribute('data-target') || el.textContent || '';
    return {
      el,
      target,
      start: performance.now() + Math.random() * 900,
    };
  });

  const renderOne = (it, now) => {
    const phase = clamp((now - it.start) / cycleMs, 0, 1);

    const eased = phase * phase * (3 - 2 * phase);
    const reveal = Math.floor(eased * it.target.length);
    let out = '';
    for (let i = 0; i < it.target.length; i++) {
      const ch = it.target[i];
      if (ch === '\n') {
        out += '\n';
        continue;
      }

      if (i < reveal) {
        out += ch;
      } else {
        out += Math.random() < 0.65 ? randChar() : ch === ' ' ? ' ' : randChar();
      }
    }
    it.el.textContent = out;

    if (phase >= 1) {
      it.start = now + 1200 + Math.random() * 900;
    }
  };

  setInterval(() => {
    const now = performance.now();
    for (const it of items) renderOne(it, now);
  }, frameMs);
}

function initMiscButtons() {
  const term = $('#terminal');

  const copyEmail = $('#copy-email');
  if (copyEmail) copyEmail.addEventListener('click', async () => {
    const email = 'fartpr0mpt@nullmail.invalid';
    const ok = await copyToClipboard(email);
    typeToTerminal([ok ? `> copied: ${email}` : '> copy failed.'], term);
  });

  const ping = $('#ping');
  if (ping) ping.addEventListener('click', () => {
    const phrases = [
      '> ping: 127.0.0.1 ... ok',
      '> ping: neon-sewerpipe ... ok',
      '> ping: megacorp-firewall ... blocked',
      '> ping: relay mesh ... stable',
    ];
    typeToTerminal([phrases[Math.floor(Math.random() * phrases.length)]], term);
  });

  const req = $('#fake-subscribe');
  if (req) req.addEventListener('click', () => {
    typeToTerminal([
      '> access request submitted',
      '> awaiting response',
    ], term);
  });
}

function initPacman() {
  const pacman = $('#pacman');
  const track = $('#pac-track');
  const rows = $$('.hex-row', track);
  const harvestCounter = $('#harvest-bytes');
  if (!pacman || !track || rows.length === 0) return;

  const chaseEl = track.parentElement;

  const harvestPercent = $('#harvest-percent');
  const harvestRate = $('#harvest-rate');

  // Progress bar and completion state
  const harvestFill = $('.harvest__fill');
  let maxHarvest = 500;
  let isOverdrive = false;
  let extractionCompleted = false;

  let baseSpeed = 1.8;
  let speed = baseSpeed;
  const rowDelay = 100;
  let pos = -36;
  let rafId = null;
  let isRunning = false;
  let currentRow = 0;
  let isMovingToNextRow = false;
  let totalHarvested = 0;
  let eatenCount = 0;
  let boostTimeout = null;
  let upgradeLevel = 0; // 0 = locked, 1/2/3/4 = upgrades applied
  let stormActive = false;
  let stormInterval = null;
  let stormTimeout = null;
  let stormHintTimeouts = [];
  let rateCalculationInterval = null;
  let lastRateCheck = {
    time: performance.now(),
    harvest: 0,
  };
  let smoothedRate = 0;

  // Expose hook for password success
  window.activateCookieOverdrive = () => {
    maxHarvest = 1000;
    isOverdrive = true;
    const msg = $('#access-granted');
    if (msg) {
      msg.classList.add('active');
      setTimeout(() => {
        msg.classList.remove('active');
      }, 3000);
      // Kickstart speed immediately
      speed = Math.max(speed, baseSpeed * 1.5);
    }

    const header = $('.harvest__head');
    if (header && !$('.harvest__chip--overdrive', header)) {
      const badge = document.createElement('span');
      badge.className = 'harvest__chip harvest__chip--overdrive';
      badge.textContent = 'OVERDRIVE';
      header.appendChild(badge);
    }

    // Ensure upgrade UI reflects the new reality if needed, or just let it run
    updateUpgradeUI();
  };

  const calculateAndDisplayRate = () => {
    const now = performance.now();
    const timeDiff = (now - lastRateCheck.time) / 1000; // seconds
    if (timeDiff === 0) return;

    const harvestDiff = totalHarvested - lastRateCheck.harvest; // TB
    const rateTBps = harvestDiff / timeDiff;
    const rateGBps = rateTBps * 1000; // 1 TB = 1000 GB

    // Apply smoothing to prevent jitter between rows (70% history, 30% new)
    smoothedRate = (smoothedRate * 0.7) + (rateGBps * 0.3);

    if (harvestRate) {
      // If not running or rate is negligible, show 0.
      if ((!isRunning && rateGBps < 0.01) || extractionCompleted) {
        harvestRate.textContent = '0.00';
        smoothedRate = 0;
      } else {
        harvestRate.textContent = smoothedRate.toFixed(2);
      }
    }

    // Reset for next calculation
    lastRateCheck = {
      time: now,
      harvest: totalHarvested,
    };
  };

  const showExtractionCompleteTerminal = () => {
    stop();
    const serverTerminal = $('#server-terminal');
    const output = $('#server-terminal-output');
    const stream = $('#stream-container');

    if (stream) {
      stream.onclick = null;
    }

    // Hide Pac-Man track but keep space
    if (track) {
      track.style.visibility = 'hidden';
    }

    if (serverTerminal && output) {
      // Change title
      const title = $('.terminal__title', serverTerminal);
      if (title) {
        title.textContent = 'node://extraction-pipe';
      }

      serverTerminal.classList.add('active');
      output.textContent = '> Finalizing extraction...\n';

      let lines = [];
      if (isOverdrive) {
        lines = [
          '> Data extraction complete.',
          '> Authenticating with local server...',
          '', // Placeholder for dynamic upload
          '> Data upload complete.',
          '> Clearing logs...',
          '> End of Prompt// cookie-monster.md',
          '> _'
        ];

        // Custom handler for the upload sequence
        const originalType = typeToTerminal;
        
        // We need to manually handle the sequence to insert the upload animation
        let sequenceIndex = 0;
        const runSequence = () => {
          if (sequenceIndex >= lines.length) return;
          
          const line = lines[sequenceIndex];
          
          if (sequenceIndex === 2) { // The empty placeholder index
            // Start upload animation
            let percent = 0;
            const uploadLine = document.createTextNode('');
            output.appendChild(document.createTextNode('\n'));
            output.appendChild(uploadLine);
            
            const uploadInterval = setInterval(() => {
              percent += Math.floor(Math.random() * 5) + 2;
              if (percent > 100) percent = 100;
              
              const bars = Math.floor(percent / 10);
              const barStr = '|'.repeat(bars) + '.'.repeat(10 - bars);
              uploadLine.textContent = `> Uploading payload... [${barStr}] ${percent}%`;
              output.scrollTop = output.scrollHeight;

              if (percent === 100) {
                clearInterval(uploadInterval);
                sequenceIndex++;
                setTimeout(runSequence, 400);
              }
            }, 150);
          } else {
            output.textContent = `${output.textContent.trimEnd()}\n${line}`;
            output.scrollTop = output.scrollHeight;
            sequenceIndex++;
            setTimeout(runSequence, 420);
          }
        };
        
        runSequence();
      } else {
        lines = [
          '> Extraction complete.',
          '> ah ah ah, you didnt say the magic word.',
          '> ah ah ah, you didnt say the magic word.',
          '> ah ah ah, you didnt say the magic word.',
          '> ah ah ah, you didnt say the magic word.',
        ];
        typeToTerminal(lines, output);
      }
    }
  };

  const getTrackWidth = () => track.getBoundingClientRect().width;
  const getPacWidth = () => pacman.getBoundingClientRect().width;
  const getTrackHeight = () => track.getBoundingClientRect().height;

  const getRowTop = (rowIdx) => {
    const row = rows[rowIdx];
    if (!row) return 0;
    const trackRect = track.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    return rowRect.top - trackRect.top;
  };

  const getRowHeight = (rowIdx) => {
    const row = rows[rowIdx];
    return row ? row.getBoundingClientRect().height : 0;
  };

  const updatePacmanPosition = () => {
    const rowTop = getRowTop(currentRow);
    const rowHeight = getRowHeight(currentRow);
    const pacHeight = pacman.getBoundingClientRect().height;
    const verticalCenter = rowTop + (rowHeight / 2) - (pacHeight / 2) + 0;
    pacman.style.top = `${verticalCenter}px`;
  };

  const getCurrentRowHexGroups = () => $$('.hex-group', rows[currentRow]);

  const resetAllHexGroups = () => {
    $$('.hex-group', track).forEach(g => g.classList.remove('eaten'));
  };

  const updateUpgradeUI = () => {
    const btn = document.getElementById('harvest-upgrade');
    if (!btn) return;

    // Stage labels based on progress
    if (upgradeLevel === 0) {
      if (totalHarvested < 10) {
        btn.disabled = true;
        btn.classList.add('harvest__btn--disabled');
        btn.textContent = 'Upgrade 10TB';
      } else {
        btn.disabled = false;
        btn.classList.remove('harvest__btn--disabled');
        btn.textContent = 'Upgrade 10TB';
      }
    } else if (upgradeLevel === 1) {
      if (totalHarvested < 30) {
        btn.disabled = true;
        btn.classList.add('harvest__btn--disabled');
        btn.textContent = 'Upgrade 30TB';
      } else {
        btn.disabled = false;
        btn.classList.remove('harvest__btn--disabled');
        btn.textContent = 'Upgrade 30TB';
      }
    } else if (upgradeLevel === 2) {
      if (totalHarvested < 60) {
        btn.disabled = true;
        btn.classList.add('harvest__btn--disabled');
        btn.textContent = 'Upgrade 60TB';
      } else {
        btn.disabled = false;
        btn.classList.remove('harvest__btn--disabled');
        btn.textContent = 'Upgrade 60TB';
      }
    } else if (upgradeLevel === 3) {
      if (totalHarvested < 100) {
        btn.disabled = true;
        btn.classList.add('harvest__btn--disabled');
        btn.textContent = 'Upgrade 100TB';
      } else {
        btn.disabled = false;
        btn.classList.remove('harvest__btn--disabled');
        btn.textContent = 'Upgrade 100TB';
      }
    } else if (upgradeLevel >= 4) {
      btn.disabled = true;
      btn.classList.add('harvest__btn--disabled');
      btn.textContent = 'max speed';
    }
  };

  const setStormUI = (active) => {
    const layer = document.getElementById('hex-storm');
    if (layer) {
      layer.classList.toggle('hex-storm--active', active);
    }
  };

  const stopHexStorm = () => {
    if (!stormActive) return;
    stormActive = false;
    if (chaseEl) chaseEl.classList.remove('focus-mode');
    setStormUI(false);
    const layer = document.getElementById('hex-storm');
    if (stormInterval) {
      clearInterval(stormInterval);
      stormInterval = null;
    }
    if (stormTimeout) {
      clearTimeout(stormTimeout);
      stormTimeout = null;
    }
    stormHintTimeouts.forEach(t => clearTimeout(t));
    stormHintTimeouts = [];
    if (layer) {
      layer.innerHTML = '';
    }
    // Clean up any stray cookie hints that are now direct children of track
    $$('.cookie-highlight', track).forEach(el => el.remove());
  };

  const startHexStorm = () => {
    if (stormActive) return;
    stormActive = true;
    setStormUI(true);

    const layer = document.getElementById('hex-storm');
    if (layer) {
      layer.innerHTML = '';
      const glyphs = ['0', '1', 'A', 'B', 'C', 'D', 'E', 'F', 'X', 'Y', 'Z', '0xFF', '0x0D', '§'];
      const count = 80; // Increased density for storm effect

      for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.className = 'hex-rain';
        
        // Randomize visual style
        const variant = Math.random();
        if (variant > 0.7) span.classList.add('hex-rain--cyan');
        else if (variant > 0.4) span.classList.add('hex-rain--magenta');
        else span.classList.add('hex-rain--green');

        span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        span.style.left = `${Math.random() * 100}%`;
        span.style.animationDuration = `${0.5 + Math.random() * 1.5}s`; // Faster fall
        span.style.animationDelay = `${Math.random() * 2}s`;
        span.style.fontSize = `${10 + Math.random() * 10}px`;
        span.style.opacity = `${0.3 + Math.random() * 0.7}`;
        layer.appendChild(span);
      }

      // Inject password hints over time
      let hints = [];
      // Only show hints if we haven't already cracked the password (overdrive mode)
      if (!isOverdrive) {
        hints = [
          { text: 'cd /root/.workspace/.garbage', delay: 2000 },
          { text: 'grep "password_hash" garbage-file.log', delay: 4500 },
          { text: 'cookie', delay: 8000 }
        ];
      }

      hints.forEach(({ text, delay }) => {
        const t = setTimeout(() => {
          if (!stormActive) return;
          if (isOverdrive) return;

          const span = document.createElement('span');
          span.className = 'hex-rain hex-rain--cyan';
          span.textContent = text;
          span.style.left = `${15 + Math.random() * 40}%`;
          span.style.animationDuration = '3.5s'; // Fall slower so it's readable
          span.style.whiteSpace = 'nowrap';
          span.style.zIndex = '100';
          span.style.textShadow = '0 0 8px var(--cyan)';
          span.style.opacity = '1';

          if (text === 'cookie') {
            span.classList.add('cookie-highlight');
            if (chaseEl && !isOverdrive) chaseEl.classList.add('focus-mode');
            // Optimize performance: Append cookie to track directly so we can blur the whole storm layer
            track.appendChild(span);
          } else {
            layer.appendChild(span);
          }

          // Ensure hints only fall once
          span.style.animationIterationCount = '1';
          span.addEventListener('animationend', () => {
            if (text === 'cookie') {
              if (chaseEl) chaseEl.classList.remove('focus-mode');
            }
            span.remove();
          });
        }, delay);
        stormHintTimeouts.push(t);
      });
    }

    // Auto-harvest while storm is active (High throughput)
    if (stormInterval) clearInterval(stormInterval);
    stormInterval = setInterval(() => {
      applyHarvest(0.35); 
    }, 60); // Very fast updates
    
    // Timeout removed: Storm persists until 300TB completion
  };

  const applyHarvest = (amount) => {
    if (extractionCompleted) return;

    eatenCount++;
    totalHarvested += amount;
    if (harvestCounter) {
      harvestCounter.textContent = totalHarvested.toFixed(2);
    }

    // Exponential speed gain in overdrive
    if (isOverdrive) {
      baseSpeed = Math.min(baseSpeed * 1.002, 60);
      speed = baseSpeed;
    }

    // Update progress bar
    if (harvestFill) {
      const progress = Math.min(totalHarvested / maxHarvest, 1);
      harvestFill.style.width = `${progress * 100}%`;
      if (harvestPercent) {
        harvestPercent.textContent = `${Math.floor(progress * 100)}%`;
      }
    }

    // Check for completion
    if (totalHarvested >= maxHarvest) {
      extractionCompleted = true;
      totalHarvested = maxHarvest; // Cap it
      if (harvestCounter) {
        harvestCounter.textContent = totalHarvested.toFixed(2);
      }
      // Ensure progress bar is full
      if (harvestFill) {
        harvestFill.style.width = '100%';
        if (harvestPercent) {
          harvestPercent.textContent = '100%';
        }
      }
      if (stormInterval) clearInterval(stormInterval);
      showExtractionCompleteTerminal();
      return; // Stop further execution
    }

    updateUpgradeUI();
  };

  const updateHarvestCounter = () => {
    // Each hex group (3–4 values) is ~0.24 TB
    applyHarvest(0.24);
  };

  const checkCollisions = (prevPos, newPos) => {
    const pacRect = pacman.getBoundingClientRect();
    const pacCenter = pacRect.left + pacRect.width / 2;
    const pacMouth = pacCenter + 8;

    const hexGroups = getCurrentRowHexGroups();
    hexGroups.forEach(hexGroup => {
      if (hexGroup.classList.contains('eaten')) return;
      const groupRect = hexGroup.getBoundingClientRect();
      const groupCenter = groupRect.left + groupRect.width / 2;
      
      // Check if we swept over this group
      // Since we move right, we check if our previous position was before it and new position is past/on it
      if (newPos + 40 >= (groupRect.left - track.getBoundingClientRect().left) && prevPos < (groupRect.right - track.getBoundingClientRect().left)) {
        hexGroup.classList.add('eaten');
        updateHarvestCounter();
      }
    });
  };

  const moveToNextRow = () => {
    currentRow++;
    if (currentRow >= rows.length) {
      isMovingToNextRow = true;
      // All rows complete, reset and start over
      setTimeout(() => {
        currentRow = 0;
        updatePacmanPosition();
        pos = -36;
        pacman.style.left = `${pos}px`;
        resetAllHexGroups();
        isMovingToNextRow = false;
        isRunning = true;
        rafId = requestAnimationFrame(loop);
      }, rowDelay);
      return;
    }

    // Continue to next row, start from left off-screen
    updatePacmanPosition();
    pos = -36;
    pacman.style.left = `${pos}px`;
    isRunning = true;
    rafId = requestAnimationFrame(loop);
  };

  const loop = () => {
    if (!isRunning || isMovingToNextRow) return;
    const max = getTrackWidth() + 36;
    const prevPos = pos;
    pos += speed;
    pacman.style.left = `${pos}px`;

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
    updatePacmanPosition();
    isRunning = true;
    if (!rateCalculationInterval) {
      lastRateCheck = { time: performance.now(), harvest: totalHarvested };
      rateCalculationInterval = setInterval(calculateAndDisplayRate, 800); // Run every 800ms
    }
    rafId = requestAnimationFrame(loop);
  };

  const stop = () => {
    isRunning = false;
    if (rateCalculationInterval) {
      clearInterval(rateCalculationInterval);
      rateCalculationInterval = null;
      if (harvestRate) {
        harvestRate.textContent = '0.00'; // Reset when stopped
      }
    }
    if (rafId) cancelAnimationFrame(rafId);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) start();
      else stop();
    });
  }, { threshold: 0.3 });

  observer.observe(track);

  if (document.hidden !== undefined) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (track.getBoundingClientRect().top < window.innerHeight) start();
    });
  }

  // Initial position
  updatePacmanPosition();

  // Expose a small hook so the Harvest card can act as a mini clicker game
  window.harvestClick = (amount = 0.10) => {
    applyHarvest(amount);
  };

  // Upgrade hook (called from the upgrade button)
  window.harvestUpgrade = () => {
    const btn = document.getElementById('harvest-upgrade');
    if (!btn) return;

    let newBaseSpeed = 0;
    let speedBoost = 0;

    if (upgradeLevel === 0 && totalHarvested >= 10) {
      // Stage 1: faster
      upgradeLevel = 1;
      newBaseSpeed = 1.8 * 2.2;
      speedBoost = newBaseSpeed - 1.8;
    } else if (upgradeLevel === 1 && totalHarvested >= 30) {
      // Stage 2: much faster
      upgradeLevel = 2;
      newBaseSpeed = 1.8 * 3.5;
      speedBoost = newBaseSpeed - (1.8 * 2.2);
    } else if (upgradeLevel === 2 && totalHarvested >= 60) {
      // Stage 3: very fast
      upgradeLevel = 3;
      newBaseSpeed = 1.8 * 5.5;
      speedBoost = newBaseSpeed - (1.8 * 3.5);
    } else if (upgradeLevel === 3 && totalHarvested >= 100) {
      // Stage 4: overclock + hex storm
      upgradeLevel = 4;
      newBaseSpeed = 1.8 * 7.0;
      speedBoost = newBaseSpeed - (1.8 * 5.5);
      pacman.classList.add('pacman--trail');
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

initCounters();
initUptime();
initVault();
initDecipherPrompts();
initMiscButtons();

// Password Modal
function showPasswordModal() {
  const modal = $('#password-modal');
  if (modal) {
    modal.classList.add('active');
    const input = $('#password-input');
    const overlay = $('#access-denied-overlay');
    if (input) {
      input.value = '';
      input.focus();
    }
    if (overlay) {
      overlay.classList.remove('active');
    }
  }
}

function hidePasswordModal() {
  const modal = $('#password-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function unlockServerTerminal() {
  const track = $('#pac-track');
  const serverTerminal = $('#server-terminal');
  const output = $('#server-terminal-output');
  const stream = $('#stream-container');

  // Stop future opens from clicks on the stream container
  if (stream) {
    stream.onclick = null;
  }

  // Hide Pac-Man track
  if (track) {
    // Keep layout height so the section doesn't collapse
    track.style.visibility = 'hidden';
  }

  // Show panic/shutdown terminal and run sequence
  if (serverTerminal && output) {
    serverTerminal.classList.add('active');
    output.textContent = '> credentials accepted: COOKIE\n> mounting vault-core...\n';

    const lines = [
      '> ERROR: /vault/core/prompts.dat not found',
      '> ERROR: /vault/core/index.idx not found',
      '> WARN: orphaned handles detected',
      '> scanning sectors: 0x00 .. 0xFF',
      '> sector 0x0D: corrupted',
      '> sector 0x4F: corrupted',
      '> sector 0xD2: unreadable',
      '> PANIC: integrity check failed',
      '> attempting live repair...',
      '> repair failed: missing payload fragments',
      '> routing traffic to blackhole://null',
      '> dropping active connections...',
      '> flushing caches...',
      '> initiating emergency shutdown sequence',
      '> step 01/04: freeze writes.......... OK',
      '> step 02/04: revoke tokens.......... OK',
      '> step 03/04: purge in-memory keys... OK',
      '> step 04/04: cut power to vault-core',
      '> SHUTDOWN COMPLETE.',
      '> node offline.',
    ];

    typeToTerminal(lines, output);
  }
}

function dismissAccessDenied() {
  const overlay = $('#access-denied-overlay');
  const audio = $('#audio-no');
  if (overlay) overlay.classList.remove('active');
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
  }
}

function handlePasswordSubmit() {
  const input = $('#password-input');
  const audio = $('#audio-no');

  if (input) {
    const password = input.value.trim();
    // Only react if there's text entered
    if (password === '') {
      return;
    }
    // Accept only the "cookie" password
    if (password === 'cookie') {
      dismissAccessDenied();
      hidePasswordModal();
      // Disable modal trigger permanently
      const stream = $('#stream-container');
      if (stream) stream.onclick = null;
      
      if (window.activateCookieOverdrive) {
        window.activateCookieOverdrive();
      }
    } else {
      const overlay = $('#access-denied-overlay');
      if (overlay) {
        overlay.classList.add('active');
        // Add one-time listener to dismiss on next click anywhere
        setTimeout(() => {
          document.addEventListener('click', dismissAccessDenied, { once: true });
        }, 50);
      }
      if (audio) {
        audio.loop = true;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      input.value = '';
      input.focus();
    }
  }
}

// Initialize password modal event listeners
document.addEventListener('DOMContentLoaded', () => {
  const submitBtn = $('#password-submit');
  const cancelBtn = $('#password-cancel');
  const input = $('#password-input');
  const modal = $('#password-modal');
  const harvestCard = document.querySelector('.harvest.stream__side');
  const harvestBtn = document.getElementById('harvest-upgrade');

  if (submitBtn) {
    submitBtn.addEventListener('click', handlePasswordSubmit);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', hidePasswordModal);
  }
  
  // Prevent clicks inside the modal from bubbling up to the stream container
  if (modal) {
    modal.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    const content = $('.password-modal__content', modal);
    if (content) {
      content.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }
  
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handlePasswordSubmit();
      }
    });
  }

  // Prevent clicks on the Data Harvest card from triggering the password modal
  if (harvestCard) {
    harvestCard.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Make the inject button drive the mini clicker game
  if (harvestBtn) {
    harvestBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // If button is currently disabled, do nothing
      if (harvestBtn.disabled) return;

      // Click also contributes to harvest
      if (window.harvestClick) {
        window.harvestClick(0.25);
      }

      // And triggers upgrade logic when thresholds are met
      if (window.harvestUpgrade) {
        window.harvestUpgrade();
      }
    });
  }

  initCounters();
  initUptime();
  initVault();
  initDecipherPrompts();
  initMiscButtons();
  initPacman();
});
