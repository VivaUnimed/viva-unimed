import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext/authContext"

export default function RedirectIfAuthenticated() {

  const { authState } = useAuth();

  return authState.isAuthenticated ? <Navigate to="/" replace/> : <Outlet />
}