import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext/authContext"

export default function PrivateRoutes() {

  const { authState } = useAuth();

  return authState.isAuthenticated ? <Outlet /> : <Navigate to="/login" replace/>
}