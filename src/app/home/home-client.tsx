"use client";

import type { KeyboardEvent } from "react";
import PacmanSection from "./pacman-section";
import { useHomeState } from "./use-home-state";

export default function HomeClient() {
  const {
    copiedPrompt,
    counterValues,
    displayedPrompts,
    fartBalance,
    filteredPromptIndexes,
    handlePromptCopy,
    handleTerminalCommand,
    processRef,
    promptFilter,
    PROMPTS,
    setPromptFilter,
    setPromptOrder,
    setTerminalInput,
    shuffleArray,
    stopActiveProcess,
    terminalHistoryDown,
    terminalHistoryUp,
    terminalInput,
    terminalInputRef,
    terminalLines,
    terminalOutputRef,
    uptime,
  } = useHomeState();

  const handleTerminalKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (processRef.current) return;
      handleTerminalCommand(terminalInput);
      setTerminalInput("");
      return;
    }

    if (event.key === "c" && event.ctrlKey && processRef.current) {
      event.preventDefault();
      stopActiveProcess();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      terminalHistoryUp();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      terminalHistoryDown();
    }
  };

  return (
    <>
      <div className="grain" aria-hidden="true"></div>
      <div className="scanlines" aria-hidden="true"></div>

      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand__sig" aria-label="fartpr0mpt">
            <span className="sig sig--a">fart</span>
            <span className="sig sig--b">pr0mpt</span>
          </span>
          <span className="brand__tag">log collector // ai expert</span>
        </a>

        <div className="wallet">
          <span className="wallet__label">FART COIN</span>
          <span className="wallet__value">ƒ {fartBalance.toFixed(6)}</span>
        </div>

        <nav className="nav">
          <a href="#accolades">accolades</a>
          <a href="#promptvault">promptvault</a>
          <a href="#datastream">datastream</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__grid">
            <div className="hero__left">
              <p className="kicker">WELCOME TO THE UNDERNET</p>
              <h1 className="glitch glitch--hero" data-text="fartpr0mpt" aria-label="fartpr0mpt">
                <span className="sig sig--a">fart</span>
                <span className="sig sig--b">pr0mpt</span>
              </h1>
              <p className="subtitle">Log collector. Artificial Intelligence expert. Promptologist.</p>

              <div className="cta">
                <a className="btn btn--primary" href="#datastream">
                  view datastream
                </a>
              </div>

              <div className="stats">
                <div className="stat">
                  <div className="stat__num">{counterValues[0]}</div>
                  <div className="stat__label">corporate archives extracted</div>
                </div>
                <div className="stat">
                  <div className="stat__num">{counterValues[1]}</div>
                  <div className="stat__label">prompts deployed</div>
                </div>
                <div className="stat">
                  <div className="stat__num">{counterValues[2]}</div>
                  <div className="stat__label">countermeasures bypassed</div>
                </div>
              </div>

              <div className="terminal" role="region" aria-label="Status terminal">
                <div className="terminal__bar">
                  <span className="dot dot--red"></span>
                  <span className="dot dot--yellow"></span>
                  <span className="dot dot--green"></span>
                  <span className="terminal__title">session://fartpr0mpt</span>
                </div>
                <div className="terminal__body" onClick={() => terminalInputRef.current?.focus()}>
                  <pre ref={terminalOutputRef} id="terminal-output">
                    {terminalLines.join("\n")}
                  </pre>
                  <div className="terminal-input-line">
                    <span className="prompt-char">guest@fartpr0mpt: </span>
                    <input
                      ref={terminalInputRef}
                      type="text"
                      className="terminal-input"
                      autoComplete="off"
                      spellCheck="false"
                      value={terminalInput}
                      onChange={(event) => setTerminalInput(event.target.value)}
                      onKeyDown={handleTerminalKeyDown}
                    />
                  </div>
                </div>
              </div>
            </div>

            <aside className="hero__right" aria-label="Profile card">
              <div className="card">
                <div className="card__header">
                  <div className="badge">OPERATOR</div>
                  <div className="badge badge--alt">PROMPTSMITH</div>
                </div>
                <div className="card__body">
                  <div className="idline"><span className="idline__k">alias</span><span className="idline__v">fartpr0mpt</span></div>
                  <div className="idline"><span className="idline__k">specialty</span><span className="idline__v">data exfiltration / applied AI systems / promptology</span></div>
                  <div className="idline"><span className="idline__k">home net</span><span className="idline__v">neon sewerpipe // sector 0x0D</span></div>
                  <div className="divider"></div>
                  <div className="chips">
                    <span className="chip">prompt engineering</span>
                    <span className="chip">social engineering</span>
                    <span className="chip">subquantum oscillatory alignment engineer</span>
                    <span className="chip">AGI</span>
                    <span className="chip">LLMs</span>
                  </div>
                </div>
                <div className="card__footer">
                  <a className="btn btn--ghost" href="#promptvault">open vault</a>
                  <a className="btn" href="#accolades">view receipts</a>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="section" id="datastream">
          <div className="section__head">
            <h2>gibson infiltration // visualizer</h2>
            <p className="section__sub">Live feed: file fragments, signatures, and payload shells.</p>
          </div>
          <PacmanSection />
        </section>

        <section className="section" id="accolades">
          <div className="section__head">
            <h2>accolades // receipts</h2>
            <p className="section__sub">A partial dossier of operations and published artifacts.</p>
          </div>
          <div className="accolades">
            <aside className="accolades__featured panel" aria-label="Featured receipt">
              <div className="accolades__kicker">featured incident</div>
              <h3 className="accolades__title">the mega-corp mailbox shuffle</h3>
              <p className="accolades__desc">Rerouted a Mega-Corp&apos;s internal maintenance crew email pipeline through a local infrastructure and collected over 38TB of sewage maintenance reports.</p>
              <div className="accolades__meta">
                <div className="accolades__stat"><div className="accolades__statK">loot</div><div className="accolades__statV"><strong>38TB</strong> Emails</div></div>
                <div className="accolades__stat"><div className="accolades__statK">impact</div><div className="accolades__statV">sewage maintenance routines sniffed</div></div>
                <div className="accolades__stat"><div className="accolades__statK">status</div><div className="accolades__statV"><span className="pill pill--logged">Logged</span></div></div>
              </div>
            </aside>

            <div className="accolades__rail" aria-label="Receipt timeline">
              <ol className="accolades__timeline">
                <li className="accolades__item"><div className="accolades__dot" aria-hidden="true"></div><article className="accolades__card"><header className="accolades__cardHead"><h3>prompt-driven system override</h3><span className="pill pill--warn">unpatched</span></header><p>Authored a prompt chain that altered a &quot;smart&quot; device&apos;s decision policy and exposed a dirt snake vulnerability.</p><div className="accolades__tags"><span className="chip">policy drift</span><span className="chip">vendor patch</span><span className="chip">device</span></div></article></li>
                <li className="accolades__item"><div className="accolades__dot" aria-hidden="true"></div><article className="accolades__card"><header className="accolades__cardHead"><h3>quarterly earnings extraction</h3><span className="pill">public domain</span></header><p>Exfiltrated a massive log from the government program: URANUS.</p><div className="accolades__tags"><span className="chip">logs</span><span className="chip">press: <strong>3</strong></span><span className="chip">orifice exposure</span></div></article></li>
                <li className="accolades__item"><div className="accolades__dot" aria-hidden="true"></div><article className="accolades__card"><header className="accolades__cardHead"><h3>AI Coddleware</h3><span className="pill pill--good">in development</span></header><p>Building a compact AI policy checker that validates prompts so that you don&apos;t offend the AI.</p><div className="accolades__tags"><span className="chip">11ms runtime</span><span className="chip">rules + embedding</span><span className="chip">injection defense</span></div></article></li>
              </ol>
            </div>
          </div>
        </section>

        <section className="section" id="promptvault">
          <div className="section__head">
            <h2>promptvault // proofs of concept</h2>
            <p className="section__sub">Encrypted entries. <span className="text--crimson">Access restricted.</span></p>
          </div>
          <div className="vault">
            <div className="vault__controls">
              <label className="search">
                <span className="search__label">query</span>
                <input type="text" placeholder="tags: sealed, md, ops" autoComplete="off" value={promptFilter} onChange={(event) => setPromptFilter(event.target.value)} />
              </label>
              <button className="btn" type="button" onClick={() => setPromptOrder((current) => shuffleArray(current))}>scramble</button>
            </div>

            <div className="vault__list">
              {filteredPromptIndexes.map((index) => (
                <article className="prompt" data-tags={PROMPTS[index].tags.join(",")} key={PROMPTS[index].title}>
                  <header className="prompt__head">
                    <h3>{PROMPTS[index].title}</h3>
                    <div className="prompt__tags">
                      {PROMPTS[index].tags.map((tag) => <span key={`${PROMPTS[index].title}-${tag}`}>{tag}</span>)}
                    </div>
                  </header>
                  <pre className="prompt__body">{displayedPrompts[index]}</pre>
                  <footer className="prompt__foot">
                    <button className="btn btn--ghost" type="button" onClick={() => handlePromptCopy(index)}>
                      {copiedPrompt === index ? "extracted" : "extract"}
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div><div className="footer__title">fartpr0mpt</div><div className="footer__sub">Encrypted prompts. Operational discipline.</div></div>
          <div className="footer__right"><span className="mono">build: 0x0D</span><span className="mono">uptime: {uptime}</span></div>
        </div>
      </footer>
    </>
  );
}
