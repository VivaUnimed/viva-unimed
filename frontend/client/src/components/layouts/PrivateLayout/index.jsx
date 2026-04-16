import { Outlet } from 'react-router-dom';
import { HeaderSearchProvider } from '../../../context/headerSearchContext/headerSearchProvider';

export default function PrivateLayout() {
  return (
    <HeaderSearchProvider>
      {/* <Header /> */}
      <Outlet />
    </HeaderSearchProvider>
  );
}