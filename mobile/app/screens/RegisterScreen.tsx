import { Alert } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterData, registerSchema } from "../../../packages/schemas";
import { useForm , Controller} from "react-hook-form";
import { View, TouchableOpacity, Text, Linking} from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import api from "../../../packages/api";
import { useNavigation } from "@react-navigation/native";
import { useThemeContext } from "../../../packages/context";
import { GoogleButton } from "../components/GoogleButton";
export default function Register(){
    const {theme} = useThemeContext()
    const navigation = useNavigation()
    const {
        control,
        handleSubmit,
        formState : {errors, isSubmitting}
    } = useForm<RegisterData>({resolver: zodResolver(registerSchema)})

const onSubmit = async (data: RegisterData) =>{
    try{
         await api.post("/auth/register", data)
        Alert.alert("Registro exitoso 🎉 Revisa tu correo");
        navigation.navigate("CheckEmail" as never)
    }catch(err: any){
        console.error("Error al registrar usuario", err)
          Alert.alert("Error en el registro");
  
    }
}
const goToGoogle = () =>{
     Linking.openURL("http://192.168.0.228:4000/auth/google");
}


return(
    <View>
        <Controller
        control = {control}
        name="email"
        render ={({field: {onChange,onBlur, value }}) => (
            <Input
            label="Email"
            onChange={onChange}
            onBlur={onBlur}
            value={value}
             errors={errors.email?.message ?? ""}
            />
        )}
        />
        <Controller
        control = {control}
        name="username"
        render={({field : {onChange, onBlur, value}})=>(
            <Input
            label="Username"
            onChange={onChange}
            onBlur={onBlur}
            value={value}
             errors={errors.username?.message ?? ""}
            />
        )}
    
        />
           <Controller
        control = {control}
        name="password"
        render={({field : {onChange, onBlur, value}})=>(
            <Input
            label="Contraseña"
            onChange={onChange}
            onBlur={onBlur}
            value={value}
             errors={errors.password?.message ?? ""}
            />
        )}
    
        />
        <Button onPress={handleSubmit(onSubmit)}>
            {isSubmitting ? "Registrando.." : "Registrarse"}
        </Button>
        <GoogleButton/>
        <View>
            <Text style={[theme.typography.body, {color:theme.colors.secondary}]}>
                ¿Ya tienes una cuenta?
            </Text>
            <TouchableOpacity onPress={() =>navigation.navigate("Login" as never)}>
                <Text style={[theme.typography.body, { color: theme.colors.primary }]}>Inicia sesión aquí</Text>
            </TouchableOpacity>
        </View>
    </View>
)
}