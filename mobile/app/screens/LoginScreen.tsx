import { useAuth } from "@tpfinal/context/AuthBase";
import api from "@tpfinal/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Alert, View, Text, TouchableOpacity } from "react-native";
import { loginSchema, loginData } from "@tpfinal/schemas";
import { useNavigation } from "@react-navigation/native";
import Button from "../components/Button";
import Input from "../components/Input";
import { GoogleButton } from "../components/GoogleButton";
import { useThemeContext } from "@tpfinal/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NavigationProps = { navigate: (screen: string) => void };

export default function LoginScreen() {
  const { theme } = useThemeContext();
  const { setUser } = useAuth();
  const navigation = useNavigation<NavigationProps>();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<loginData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: loginData) => {
  try {
    const res = await api.post("/auth/login", data, { withCredentials: true });

    if (res.data.token) {
      await AsyncStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      Alert.alert("Login exitoso 🎉");
   
  } }catch (err) {
    console.error("Error al iniciar sesión:", err);
    Alert.alert("Error", "Credenciales inválidas");
  }
};
  

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20 }}>
        Iniciar Sesión
      </Text>

      <Controller
        control={control}
        name="identifier"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email o usuario"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            errors={errors.identifier?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Contraseña"
            placeholder="****"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            errors={errors.password?.message}
          />
        )}
      />

      <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </Button>

      <GoogleButton />

      <View style={{ marginTop: 20, alignItems: "center" }}>
        <Text style={[theme.typography.base, { color: theme.colors.primary }]}>
          ¿No tienes cuenta?
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text
            style={[
              theme.typography.base,
              { color: theme.colors.primary, textDecorationLine: "underline" },
            ]}
          >
            Regístrate aquí
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
