import type { Metadata } from "next";
import Script from 'next/script';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "fartpr0mpt // store",
  description: "Official fartpr0mpt store and merch drops.",
};

export default function Store() {
  return (
    <>
      <div className="grain" aria-hidden="true"></div>
      <div className="scanlines" aria-hidden="true"></div>

      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand__sig" aria-label="fartpr0mpt"><span className="sig sig--a">fart</span><span className="sig sig--b">pr0mpt</span></span>
          <span className="brand__tag">log collector // ai expert</span>
        </Link>

        <div className="wallet">
          <span className="wallet__label">FART COIN</span>
          <span className="wallet__value" id="fart-balance">ƒ 0.000000</span>
        </div>

        <nav className="nav">
          <Link href="/#accolades">accolades</Link>
          <Link href="/#promptvault">promptvault</Link>
          <Link href="/#datastream">datastream</Link>
          <Link href="/store">store</Link>
        </nav>
      </header>

      <main>
          <section className="section" id="store">
              <div className="section__head">
                  <h2>FART CON // MERCH SHOP</h2>
                  <p className="section__sub">Official swag from the underground&apos;s favorite prompt party.</p>
              </div>

              <div className="drops">
                <article className="card">
                  <div className="card__header">
                    <h3>Random FART CON 26 Badge</h3>
                    <span className="chip">LIMITED EDITION</span>
                  </div>
                  <div className="card__body">
                    <p>
                      Get a random badge from FART CON 26. Each badge unlocks different levels of stank.
                    </p>
                    <div className="idline">
                      <span className="idline__k">price</span>
                      <span className="idline__v">ƒ 5.000000</span>
                    </div>
                  </div>
                  <div className="card__footer">
                    <button className="btn btn--ghost">purchase</button>
                  </div>
                </article>
              </div>
          </section>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div>
            <div className="footer__title">fartpr0mpt</div>
            <div className="footer__sub">Encrypted prompts. Operational discipline.</div>
          </div>
          <div className="footer__right">
            <span className="mono">build: 0x0D</span>
            <span className="mono">uptime: <span id="uptime">00:00:00</span></span>
          </div>
        </div>
      </footer>
      <Script src="/store/script.js" strategy="lazyOnload" />
    </>
  );
}
