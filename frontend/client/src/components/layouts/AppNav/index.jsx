import { NavLink } from 'react-router-dom';
import { Bell, ClipboardList, House, User } from 'lucide-react';

const items = [
  { key: 'home', to: '/', label: 'INICIO', icon: House },
  {
    key: 'interesses',
    to: '/interesses',
    label: 'INTERESSES',
    icon: ClipboardList,
  },
  { key: 'alertas', to: '/alertas', label: 'ALERTAS', icon: Bell },
  { key: 'perfil', to: '/perfil', label: 'PERFIL', icon: User },
];

export default function AppNav({ className = '', active }) {
  return (
    <nav className={`app-bottom-nav ${className}`}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              `bottom-nav-item ${
                active === item.key || isActive ? 'active' : ''
              }`
            }
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
