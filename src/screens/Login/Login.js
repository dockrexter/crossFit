import React,{useState,useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import {Text, View ,Image,TouchableOpacity,ScrollView} from 'react-native';
import { MaterialCommunityIcons} from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';
import styles from './styles';
import { normalize } from '../../Helpers/normalize';
import Constants from '../../Constants/Constants';
import { TextInput } from 'react-native-paper';
import {handleSignUp,handleLogin,handleGoogleSignIn,checkAuthState} from '../../Helpers/UserHelper/auth';


const Login=({navigation})=> {
    const [email, setEmail] = useState('');
    const [password,setPassword] =useState('');
    const [confirmPassword,setConfirmPassword] = useState('');
    const [register,setRegister] = useState(false);
    const [showPassword,setShowPassword] = useState(true);
    const [loading,setLoading]=useState(true);
    const [user,setUser]=useState(false);

    useEffect(()=>{
        checkAuthState((state)=>setUser(state))
        .then(()=>{
            if(user==true){
                setLoading(false);
                navigation.replace("Dashboard");
            }
            else{
                setLoading(false);
            }
        })
    })
    

    return (
        <ScrollView  contentContainerStyle={styles.container} >
            <View style={styles.body}>
                <View
                    style={styles.imageContainer}
                >
                    <Image 
                        style={styles.LoginScreenImage}
                        source={Constants.logo}
                    />
                </View>
                <View style={styles.inputsView}>
                    <TextInput
                        style={styles.input}
                        onChangeText={(email)=>{setEmail(email)}}
                        theme={{colors: {text: 'black', primary: '#6E1D1D'}}}
                        label="Email"
                    />
                    <TextInput
                        style={styles.input}
                        label="Password"
                        secureTextEntry={showPassword}
                        theme={{colors: {text: 'black', primary: '#6E1D1D'}}}
                        onChangeText={(password)=>{setPassword(password)}}
                        right={<TextInput.Icon onPress={()=>setShowPassword(prev=>!prev)} name={showPassword?"eye-off":"eye"} />}
                    />
                    {register?
                        <TextInput
                            style={styles.input}
                            label="Confirm Password"
                            secureTextEntry={showPassword}
                            theme={{colors: {text: 'black', primary: '#6E1D1D'}}}
                            onChangeText={(confirmPassword)=>{setConfirmPassword(confirmPassword)}}
                        />:null}
                </View>
                {loading?
                    <ActivityIndicator animating={true} size={"large"} color={"#6E1D1D"} />:
                    <TouchableOpacity 
                        onPress={()=>{
                            if(register){
                                setLoading(true);
                                handleSignUp(email,password,confirmPassword)
                                .then(()=>{
                                    setLoading(false);
                                })
                                .catch(err=>{
                                    setLoading(false);
                                    alert(err);
                                })
                            }
                            else{
                                setLoading(true);
                                handleLogin(email,password)
                                .then(()=>{
                                    setLoading(false);
                                })
                                .catch(err=>{
                                    setLoading(false);
                                    alert(err);
                                })
                            }
                            
                        }}
                        style={styles.loginBtn}>
                        <Text style={styles.loginBtnText}>
                            {register?"Register":"Login"}
                        </Text>
                    </TouchableOpacity>
                }
                <View style={styles.socialLogins}>
                    
                    <TouchableOpacity 
                        onPress={()=>{
                            handleGoogleSignIn();
                            // navigation.navigate("Home");
                        }}
                        style={styles.googleLoginBtn}>
                        <MaterialCommunityIcons  name="gmail" size={normalize(27)} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            navigation.navigate("Home");
                        }}
                        style={styles.facebookLoginBtn}>
                            <MaterialCommunityIcons  name="facebook" size={normalize(28)} color="white" />
                    </TouchableOpacity>
                </View>
            
                <View style={styles.signUpView}>
                    <Text style={styles.tagline}>
                        {register?"Login with email: ":"Not a member? "}
                    </Text>
                    <Text onPress={()=>{setRegister(prev=>!prev)}}style={styles.signUpBtn}>
                        {register?"Login":"Sign Up"}
                    </Text>
                </View>
            </View>
        <StatusBar style="auto" />

        </ScrollView>
    );
}

export default Login;
