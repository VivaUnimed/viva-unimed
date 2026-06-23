import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import './styles.css';

const SIDEBAR_STORAGE_KEY = 'private-layout:sidebar-hidden';

export default function PrivateLayout() {
  const [isSidebarHidden, setIsSidebarHidden] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarHidden));
  }, [isSidebarHidden]);

  return (
    <div
      className={`private-layout${isSidebarHidden ? ' private-layout--sidebar-hidden' : ''}`}
    >
      <Sidebar isHidden={isSidebarHidden} />

      <div className="private-layout__main">
        <Topbar
          isSidebarHidden={isSidebarHidden}
          onToggleSidebar={() => setIsSidebarHidden((current) => !current)}
        />

        <main className="private-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
