import { memo } from "react";
import Image from "next/image";
import Script from "next/script";
import { HEX_ROWS } from "./home-data";

type HexGroup = (typeof HEX_ROWS)[number][number];
type HexRow = HexGroup[];

const DENSE_COLUMNS: HexRow[] = HEX_ROWS.map((row) => {
  const expanded = [];
  for (let i = 0; i < row.length; i += 1) {
    const current = row[i];
    const next = row[(i + 1) % row.length];
    expanded.push(current);
    expanded.push([
      current[1],
      next[0],
      current[3],
      next[2],
    ]);
  }
  return expanded;
});

const DENSE_ROWS: HexRow[] = [];
for (let rowIndex = 0; rowIndex < DENSE_COLUMNS.length; rowIndex += 1) {
  const currentRow = DENSE_COLUMNS[rowIndex];
  DENSE_ROWS.push(currentRow);

  if (rowIndex === DENSE_COLUMNS.length - 1) {
    continue;
  }

  const nextRow = DENSE_COLUMNS[rowIndex + 1];
  DENSE_ROWS.push(
    currentRow.map((group, groupIndex) => {
      const nextGroup = nextRow[groupIndex % nextRow.length];
      return [
        group[1],
        nextGroup[0],
        group[3],
        nextGroup[2],
      ];
    }),
  );
}

function PacmanSectionInner() {

  return (
    <>
      <div className="stream" id="stream-container">
        <div className="chase" role="img" aria-label="Pac-Man consuming data files">
          <div className="password-modal" id="password-modal">
            <div className="password-modal__content">
              <h3>Access Required</h3>
              <p>Enter password:</p>
              <input type="password" id="password-input" placeholder="Enter password..." />
              <div className="password-modal__buttons">
                <button id="password-submit" type="button">Submit</button>
                <button id="password-cancel" type="button">Cancel</button>
              </div>
            </div>
          </div>

          <div className="server-terminal" id="server-terminal" aria-label="Server terminal">
            <div className="terminal__bar">
              <span className="dot dot--red"></span>
              <span className="dot dot--yellow"></span>
              <span className="dot dot--green"></span>
              <span className="terminal__title">node://vault-core</span>
            </div>
            <pre className="terminal__body" id="server-terminal-output">{"> awaiting credentials..."}</pre>
          </div>

          <div className="chase__track" id="pac-track">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pak.gif"
              alt=""
              className="pacman"
              id="pacman"
              width="36"
              height="36"
              loading="eager"
              decoding="sync"
              draggable="false"
            />
            <div className="access-granted" id="access-granted">ACCESS GRANTED</div>
            <div className="hex-storm" id="hex-storm" aria-hidden="true"></div>
            <div className="hex-rows" id="hex-rows" aria-hidden="true">
              {DENSE_ROWS.map((row, rowIndex) => (
                <div className="hex-row" data-row={rowIndex} key={`hex-row-${rowIndex}`}>
                  {row.map((group, groupIndex) => (
                    <div className="hex-group" key={`hex-group-${rowIndex}-${groupIndex}`}>
                      {group.map((value, valueIndex) => (
                        <div className="hex-value" data-hex={value} key={`hex-value-${rowIndex}-${groupIndex}-${valueIndex}`}>
                          {value}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="chase__status" id="pac-status" aria-live="polite">
            <span className="chase__statusLabel">status</span>
            <span className="chase__statusText" id="pac-status-text">standard mode // no boost</span>
          </div>
        </div>

        <article className="harvest panel stream__side" aria-label="Data harvest status">
          <header className="harvest__head">
            <span className="harvest__label">data harvest</span>
            <span className="harvest__chip">LIVE FEED</span>
          </header>

          <div className="harvest__body">
            <div className="harvest__gauge">
              <div className="harvest__meter">
                <span className="harvest__fill"></span>
              </div>
            </div>

            <div className="harvest__readouts">
              <div className="harvest-counter">
                <div className="counter__value" id="harvest-bytes">0.00</div>
                <div className="counter__unit">TERABYTES</div>
              </div>
              <div className="harvest-rate">
                <div className="rate__value" id="harvest-rate">0.00</div>
                <div className="rate__unit">GB/s</div>
              </div>
            </div>
          </div>

          <footer className="harvest__foot">
            <div className="harvest__status">
              <button className="harvest__btn harvest__btn--disabled" id="harvest-upgrade" type="button">
                Upgrade 10TB
              </button>
            </div>
            <button className="harvest__btn harvest__btn--login" id="harvest-login" type="button">
              Login
            </button>
          </footer>
        </article>
      </div>
      <div id="access-denied-overlay" className="access-denied-overlay">
        <Image src="/magic-word.gif" id="magic-word-gif" alt="Access Denied" width={500} height={500} unoptimized />
      </div>
      <audio id="audio-no" src="/no.mp3"></audio>
      <Script src="/pacman-game.js" strategy="afterInteractive" />
    </>
  );
}

const PacmanSection = memo(PacmanSectionInner);

export default PacmanSection;
