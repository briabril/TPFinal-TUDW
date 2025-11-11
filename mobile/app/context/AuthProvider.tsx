import { AuthProviderBase } from "@tpfinal/context/AuthBase"
import { Alert } from "react-native"

export function AuthProvider({ children }: { children: React.ReactNode }) {

  return (
    <AuthProviderBase
      onLogout={() => {
        Alert.alert("Sesión cerrada", "👋 Hasta pronto")
      }}
    >
      {children}
    </AuthProviderBase>
  )
}

