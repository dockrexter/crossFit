import { auth,dbRef } from "../../../firebase";
import Config from '../../Constants/Config';
import * as Google from "expo-google-app-auth";
import * as Facebook from 'expo-facebook';
import * as firebase from "firebase";
import User from "../DatabaseStructure/Users";


const handleSignUp=async(email,password,confirmPassword)=>{
    const userdb=User;
    if(password===confirmPassword){
        const userCredentials=await auth.createUserWithEmailAndPassword(email,password);
        const user=userCredentials.user;
        var userRef= dbRef.collection("Users");
        userdb.uid=user.uid;
        userdb.Email=user.email;
        await userRef.doc(user.uid).set(userdb)
    }
    else{
        alert("Password don't match");
    }
}

const handleLogin= async (email,password)=>{
    await auth.signInWithEmailAndPassword(email,password);
}

const facebookLogin=async()=> {
    
    await Facebook.initializeAsync({
        appId: '708487053499245',
    });
    const { type, token, expirationDate, permissions, declinedPermissions } =
        await Facebook.logInWithReadPermissionsAsync({
            permissions: ['public_profile','email'],
        });
    if (type === 'success') {
        var credential = firebase.auth.FacebookAuthProvider.credential(token);
        firebase.auth().signInWithCredential(credential).then((userCredentials)=>{
            console.log(userCredentials);
        })
        .catch((error) => {
            alert(error);
        });
    } 
    else {
        alert("cancelled")
    }
}



const checkAuthState=async(setter)=>{
    const userdb=User;
    auth.onAuthStateChanged(user=>{
        if(user){
            console.log(user);
            var userRef= dbRef.collection("Users").doc(String(user.uid));
            userRef.get().then((doc) => {
                if (doc.exists) {
                    console.log("exist");
                    setter(true);
                } 
                else {
                    userdb.Picture=String(user.photoURL);
                    userdb.Email=user.email;
                    userdb.FirstName=user.displayName;
                    userdb.uid=user.uid;
                    userRef.set(userdb);
                    console.log("No such document!");
                    setter(true);
                }
            })
            .catch((error) => {
                console.log("Error getting document:", error);
            });
        }
        else{
            setter(false);
        }
    })
}

const handleGoogleSignIn=()=>{
    const config={
        iosClientId:Config.iosClientId,
        androidClientId:Config.androidClientId,
        scope:["profile","email"],
    }
    Google
    .logInAsync(config)
    .then((result)=>{
        const{type,user}=result;
        if (result.type === 'success') {
            console.log(result);
            var credential = firebase.auth.GoogleAuthProvider.credential(result.idToken);
            firebase.auth().signInWithCredential(credential).then((userCredentials)=>{
            })
            .catch((error) => {
                console.log(error);
            });
        } 
        else {
            alert("cancelled")
        }
    })
    .catch((err)=>console.log(err));
}


export {handleLogin,handleSignUp,checkAuthState,handleGoogleSignIn,facebookLogin}