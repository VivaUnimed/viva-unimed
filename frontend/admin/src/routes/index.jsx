import { Route, Routes } from "react-router";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

export const RoutesApp = () => {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};
