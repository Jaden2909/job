import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();

  const navItemStyle = (path) => ({
    color: router.pathname === path ? '#0070f3' : '#555',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: router.pathname === path ? '600' : '500',
    padding: '6px 12px',
    borderRadius: '4px',
    background: router.pathname === path ? '#e6f0fa' : 'transparent',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
      {/* Universal Navigation Banner */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e1e4e8', padding: '12px 24px', sticky: 'top', zIndex: 1000 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo Brand Link */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#0070f3', letterSpacing: '-0.5px' }}>🚀 JobBoard</span>
          </Link>

          {/* Navigation Route Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={navItemStyle('/')}>Browse Jobs</Link>
            <Link href="/create" style={navItemStyle('/create')}>Post a Job</Link>
            <Link href="/login" style={{ ...navItemStyle('/login'), border: '1px solid #ccc', marginLeft: '8px' }}>Sign In</Link>
          </div>

        </div>
      </nav>

      {/* Main Dynamic Viewport Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
