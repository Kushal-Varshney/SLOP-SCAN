'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/scan', label: 'Scanner' },
  { href: '/cross-track', label: 'Cross-Track' },
  { href: '/bakeoff', label: 'Transparency' },
  { href: '/live-fire', label: 'Live Fire' },
  { href: '/history', label: 'History' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container">
        <Link href="/" className="nav-brand">
          Slop Scan
        </Link>
        <ul className={`nav-links ${mobileOpen ? 'nav-links-open' : ''}`}>
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={pathname === l.href ? 'active' : ''}>
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <button 
              onClick={() => { localStorage.removeItem('slop_auth'); window.location.reload(); }} 
              style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
            >
              Logout
            </button>
          </li>
        </ul>
        <button
          className="nav-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
