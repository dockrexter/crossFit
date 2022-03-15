import React,{useState,useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import {Text, View ,Image,TouchableOpacity,ScrollView} from 'react-native';
import { MaterialCommunityIcons,Fontisto,MaterialIcons} from '@expo/vector-icons';
import { ActivityIndicator,Avatar} from 'react-native-paper';
import styles from './styles';
import { normalize } from '../../Helpers/normalize';
import Constants from '../../Constants/Constants';
import { TextInput } from 'react-native-paper';
import { dbRef } from '../../../firebase';
import Theme from '../../Constants/Theme';
import getUser from '../../Helpers/UserHelper/UserFb';
import * as DocumentPicker from 'expo-document-picker';
import * as firebase from "firebase";
import { Linking } from 'react-native';



const EditProfile=({navigation,route})=> {
    const [email, setEmail] = useState(route.params.user.Email);
    const [firstName,setFirstName] = useState(route.params.user.FirstName);
    const [lastName,setLastName]=useState(route.params.user.LastName);
    const [profilePicture,setProfilePicture]=useState(route.params.user.Picture);
    const [password,setPassword] =useState('');
    const [confirmPassword,setConfirmPassword] = useState('');
    const [showPassword,setShowPassword] = useState(false);
    const [loading,setLoading]=useState(false);
    const [codice,setCodice] =useState(route.params.user.CodiceFiscale);
    const [uploading,setUploading]=useState(false);
    const [user,setUser]=useState();

    const pickDocument = async (docType) => {
        const { type, uri } = await DocumentPicker.getDocumentAsync({type:"application/pdf"});
        if (type === 'cancel') {
            return;
        }
        try {
            setUploading(true);
            const fetchResponse = await fetch(uri);
            const blob = await fetchResponse.blob();
            var storageRef = firebase.storage().ref();
            var mountainImagesRef = storageRef.child(`${docType+"/"+user.uid}.pdf`);
            mountainImagesRef.put(blob).then((snapshot) => {
                console.log('Uploaded a blob or file!');
                mountainImagesRef.getDownloadURL()
                .then((url) => {
                    var obj;
                    if(docType=="CodiceFiscale"){
                        obj={
                            CodiceFiscaleDoc:String(url),
                        }
                    }
                    else{
                        obj={
                            MadicalCertificateDoc:String(url),
                        }
                    }
                    var editUser= dbRef.collection("Users");
                    editUser.doc(user.uid).update(obj).then(()=>{
                        alert("UpLoad SuccessFull!")
                        setUploading(false);
                    })
                })
            });
            
        } 
        catch (error) {
            console.log('ERR: ' + error.message);
        }
        
	}
    useEffect(()=>{
        setLoading(true);
        getUser((user)=>{
            setUser(user);
            setFirstName(user.FirstName);
            setLastName(user.LastName);
            setProfilePicture(user.Picture);
            setCodice(user.CodiceFiscale);
        })
        .then(()=>{
            setLoading(false);
        })
        console.log(route.params.user);
    },[])


    const saveProfile=()=>{
        setLoading(true);
        var editUser= dbRef.collection("Users");
        editUser.doc(user.uid).update({
            FirstName:firstName,
            LastName:lastName,
            CodiceFiscale:codice,
        }).then(()=>{
            setLoading(false);
        })
    }

    if(loading){
        return(
            <ScrollView  contentContainerStyle={[styles.container,{justifyContent:"center"}]} >
                <View style={[styles.body,{justifyContent:"center"}]}>
                    <ActivityIndicator animating={true} size={"large"} color={"#6E1D1D"} />
                </View>
            </ScrollView>

        );
    }
    
    return (
        <ScrollView contentContainerStyle={styles.container} >
            <View style={styles.body}>
                <View style={styles.topBar}>
                    <TouchableOpacity
                        onPress={()=>{
                            navigation.navigate("LeaderBoard",{user:user});
                        }}
                        style={styles.topBarBtns}>
                            <MaterialIcons name="leaderboard" size={normalize(25)} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            navigation.navigate("UserProfile",{user:user});
                        }}
                        style={styles.profileBtn}>
                            <Text style={styles.profileBtnText}>{user?"Hello, "+user.FirstName:"Hello, "}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            // navigation.navigate("Home");
                        }}
                        style={styles.topBarBtns}>
                            <MaterialCommunityIcons  name="bell-ring-outline" size={normalize(25)} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={styles.profilePicContainer}>
                    <Avatar.Image size={normalize(80)}  source={user?{uri:user.Picture}:require('../../../assets/USER.png')}/>
                    {/* <TouchableOpacity
                        onPress={()=>{
                            // pickImage();
                        }}
                        style={[styles.profileBtn,{flexDirection:"row",width:normalize(100)}]}>

                            <Text style={[styles.profileBtnText,{paddingRight:normalize(10)}]}>{"UPLOAD"}</Text>
                            <MaterialIcons name="upload-file" size={normalize(15)} color={Theme.red} />
                    </TouchableOpacity> */}
                </View>
                <View style={styles.inputsView}>
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        value={firstName}
                        onChangeText={(firstName)=>{setFirstName(firstName)}}
                        theme={{colors: {text: 'black', primary: '#6E1D1D'}}}
                        label="First Name"
                    />
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        value={lastName}
                        onChangeText={(lastName)=>{setLastName(lastName)}}
                        theme={{colors: {text: 'black', primary: '#6E1D1D'}}}
                        label="Last Name"
                    />
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        disabled
                        value={email}
                        onChangeText={(email)=>{setEmail(email)}}
                        theme={{colors: {text: 'black', primary: '#6E1D1D'}}}
                        label="Email"
                    />
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        value={codice}
                        onChangeText={(codice)=>{setCodice(codice)}}
                        theme={{colors: {text: 'black', primary: '#6E1D1D'}}}
                        label="Codice Fiscale Code"
                    />
                    {/* {!route.params.user.social?
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        label="Password"
                        secureTextEntry={showPassword}
                        theme={{colors: {text: 'black', primary: '#6E1D1D'}}}
                        onChangeText={(password)=>{setPassword(password)}}
                        right={<TextInput.Icon onPress={()=>setShowPassword(prev=>!prev)} name={showPassword?"eye-off":"eye"} />}
                    />:null} */}
                    <View style={{alignItems:"center",marginTop:normalize(20)}}> 
                        <TouchableOpacity
                            style={[styles.profileBtn,{flexDirection:"row",width:"auto",paddingHorizontal:normalize(10),height:normalize(50)}]}>
                                <Text onPress={()=>{Linking.openURL(user["CodiceFiscaleDoc"])}} style={[styles.profileBtnText,{color:Theme.red,paddingRight:normalize(10)}]}>{"VIEW CODICE FISCALE |"}</Text>
                                <Text onPress={()=>{
                                        pickDocument("CodiceFiscale");
                                    }} style={[styles.profileBtnText,{paddingRight:normalize(10)}]}>{" UPLOAD CODICE FISCALE"}</Text>
                                <MaterialIcons name="upload-file" size={normalize(15)} color={Theme.red} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            
                            style={[styles.profileBtn,{flexDirection:"row",width:"auto",paddingHorizontal:normalize(10),height:normalize(50)}]}>
                                <Text onPress={()=>{Linking.openURL(user["MadicalCertificateDoc"])}} style={[styles.profileBtnText,{color:Theme.red,paddingRight:normalize(10)}]}>{"VIEW MEDICAL CERTIFICATE |"}</Text>
                                <Text onPress={()=>{
                                    pickDocument("MadicalCirtificate");
                                }}  style={[styles.profileBtnText,{paddingRight:normalize(10)}]}>{"UPLOAD MEDICAL CIRTIFICATE "}</Text>
                                <MaterialIcons name="upload-file" size={normalize(15)} color={Theme.red} />
                        </TouchableOpacity>
                    </View>
                </View>
                
                {uploading?
                    <ActivityIndicator animating={true} size={"large"} color={"#6E1D1D"} />
                :<TouchableOpacity 
                    onPress={()=>{
                        saveProfile();
                    }}
                    style={styles.loginBtn}>
                    <Text style={styles.loginBtnText}>
                        {"SAVE"}
                    </Text>
                </TouchableOpacity>}
            </View>
        <StatusBar style="auto" />

        </ScrollView>
    );
}

export default EditProfile;
