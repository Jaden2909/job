import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleAuthCheck = () => {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem('userName');
      const role = localStorage.getItem('userRole');
      if (token && name) {
        setUser({ name, role });
      } else {
        setUser(null);
      }
    };

    // Perform initial check on mount
    handleAuthCheck();

    // Listen to local and cross-component authentication shifts seamlessly
    window.addEventListener('storage', handleAuthCheck);
    router.events.on('routeChangeComplete', handleAuthCheck);
    
    return () => {
      window.removeEventListener('storage', handleAuthCheck);
      router.events.off('routeChangeComplete', handleAuthCheck);
    };
  }, [router.events]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    // Alert all other observers that state was cleared
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e1e4e8', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#0070f3', letterSpacing: '-0.5px' }}>🚀 JobBoard</span>
          </Link>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', color: '#444' }}>
                💼 <strong>{user.name}</strong> ({user.role})
              </span>
              <button 
                onClick={handleLogout}
                style={{ background: '#fff', border: '1px solid #dc3545', color: '#dc3545', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
