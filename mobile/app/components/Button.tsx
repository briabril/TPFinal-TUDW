import {  TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useThemeContext  } from "../../../packages/context";



interface ButtonProps {
    onPress: () => void;
    children: string | React.ReactNode;
    disabled?: boolean;
}

const Button : React.FC<ButtonProps> = ({children, onPress,  disabled, ...rest}) =>{
    const { theme} = useThemeContext ();
    return(
        <TouchableOpacity
         disabled={disabled}
          onPress={onPress} 
          style={[ disabled && {backgroundColor: theme.colors.textSecondary}]}
          activeOpacity={0.8} {...rest}>
            {typeof children === "string" ? 
            <Text style={theme.typography.base}>{children}</Text> : <View>{children}</View>
            }
        
        </TouchableOpacity>
    )
}

export default Button