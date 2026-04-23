import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import './styles.css';

export default function PrivateLayout() {
  return (
    <div className="private-layout">
      <Sidebar />

      <div className="private-layout__main">
        <Topbar />

        <main className="private-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
