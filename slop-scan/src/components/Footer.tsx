'use client';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-links">
          <span>Slop Scan</span>
          <span className="footer-dot">·</span>
          <span>Custom Detection Engine</span>
          <span className="footer-dot">·</span>
          <span>No External APIs</span>
          <span className="footer-dot">·</span>
          <span>{new Date().getFullYear()}</span>
        </div>
        <div className="footer-tech">
          Next.js · TypeScript · Vanilla CSS
        </div>
      </div>
    </footer>
  );
}
