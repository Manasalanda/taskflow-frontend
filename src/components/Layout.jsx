
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="app-layout" style={{
      paddingTop: isMobile ? '56px' : '0',
    }}>
      <Sidebar />
      <main
        className="main-content"
        style={{ marginLeft: isMobile ? '0' : '240px' }}
      >
        {children}
      </main>
    </div>
  );
}