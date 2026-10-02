import { createContext } from "react";
import { LoginResponse } from "../../api/types/auth.types";

interface AuthContextType {
  user: {
    username: string;
    role: string;
    companyId: number;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
