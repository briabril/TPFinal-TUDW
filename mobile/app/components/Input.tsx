import { View, Text, TextInput, TextInputProps } from "react-native";
import { useThemeContext  } from "../../../packages/context";
interface InputProps extends TextInputProps{
    label: string;
    errors?: string
}
const Input : React.FC<InputProps> = ({label, style, errors, ...rest}) =>{
 const {theme} = useThemeContext()
    return(
    <View style={{marginBottom: theme.spacing(2)}}>
        <Text style={[theme.typography.caption]}>{label}</Text>
        <TextInput
        style={[theme.components.inputBase, { color: theme.colors.textPrimary }, style]}
        placeholderTextColor={theme.colors.textSecondary}
        {...rest}
        />
      {errors && <Text style={[theme.typography.error , {color:theme.colors.error}]}>{errors}</Text>}  
    </View>
 )
}

export default Input