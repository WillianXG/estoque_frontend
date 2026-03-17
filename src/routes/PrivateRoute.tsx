import { useContext, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface Props {
  children: JSX.Element;
  roles?: string[];
}

export default function PrivateRoute({ children, roles }: Props) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // verifica permissão
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/pdv" />;
  }

  return children;
}