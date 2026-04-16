import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext/authContext"

export default function RedirectIfAuthenticated() {

  const { authState } = useAuth();

  console.log(authState)

  return authState.isAuthenticated ? <Navigate to="/" replace/> : <Outlet />
}