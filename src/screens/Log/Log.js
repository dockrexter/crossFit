import React,{useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import {Text, View,TouchableOpacity,Keyboard,ScrollView,FlatList,Image} from 'react-native';
import { MaterialCommunityIcons,AntDesign,MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';
import styles from './styles';
import { normalize } from '../../Helpers/normalize';
import { Searchbar,Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';
import moment from 'moment';
import { TextInput } from 'react-native-paper';
import Theme from '../../Constants/Theme';
import { dbRef } from '../../../firebase';
import LeaderBoard from '../LeaderBoard/LeaderBoard';





const Log=({route,navigation})=> {
    const [min,setMin]=useState("0");
    const [sec,setSec]=useState("0");
    const [scale,setScale]=useState("RX");
    const [loading,setLoading]=useState(false);

    const saveLog=()=>{
        // alert("saved");
        setLoading(true);
        var leaderboardRef = dbRef.collection("LeaderBoard").doc(String(route.params.wod.Date+` ${route.params.part}`));
        leaderboardRef.get()
        .then((data)=>{
            if(typeof data.data()!=="undefined"){
                var us=(data.data()).Users
                console.log(us,"sdsd");
                var newUser={
                    Name:route.params.user.FirstName,
                    uid:route.params.user.uid,
                    Picture:route.params.user.Picture,
                    RecordType:(route.params.wod)[`Type${route.params.part}`],
                    Record:min,
                    Scale:scale,
                }
                const objIndex = us.findIndex((obj => obj.uid == route.params.user.uid));
                us.some(item=>item.uid==route.params.user.uid)?us[objIndex]=newUser
                :us.push(newUser)
                console.log(us);
                leaderboardRef.set({
                    Users:us
                })
                .then(() => {
                    console.log("Document successfully written!");
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error writing document: ", error);
                });
                console.log(data.data().Users);
            }
            else{
                leaderboardRef.set({
                        Users:[{
                            Name:route.params.user.FirstName,
                            Picture:route.params.user.Picture,
                            uid:route.params.user.uid,
                            RecordType:(route.params.wod)[`Type${route.params.part}`],
                            Record:min,
                            Scale:scale,
                        }]
                    })
                    .then(() => {
                        console.log("Document successfully written!");
                        setLoading(false);
                    })
                    .catch((error) => {
                        console.error("Error writing document: ", error);
                    });
                // alert("undefined");
            }
        })
        .catch((error)=>{
            console.log(error);
        })
    }
    
    return (
        <View  style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity
                    onPress={()=>{
                        navigation.navigate("LeaderBoard",{user:route.params.user});
                    }}
                    style={styles.topBarBtns}>
                        <MaterialIcons name="leaderboard" size={normalize(25)} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                        navigation.navigate("UserProfile",{user:route.params.user});
                    }}
                    style={styles.profileBtn}>
                        <Text style={styles.profileBtnText}>{"Hello, "+route.params.user.FirstName}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                        navigation.navigate("Home");
                    }}
                    style={styles.topBarBtns}>
                        <MaterialCommunityIcons  name="bell-ring-outline" size={normalize(25)} color="black" />
                </TouchableOpacity>
            </View>
                <ScrollView style={styles.body}>
                    <Avatar.Image size={normalize(80)} style={{alignSelf:"center",marginVertical:normalize(20)}} source={route.params.user.Picture?{uri:route.params.user.Picture}:require('../../../assets/USER.png')}/>
                <View style={styles.logView}>
                    <TouchableOpacity
                        onPress={()=>{navigation.navigate("LeaderBoard",{user:user})}}
                        style={styles.buttons} 
                        >
                            <View>
                                <Text style={[styles.greatText]}>
                                    {(route.params.wod)[`Type${route.params.part}`]}
                                </Text>
                            </View>
                    </TouchableOpacity>
                   {console.log((route.params.wod)[`Type${route.params.part}`])}
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        maxLength={3}
                        label={(route.params.wod)[`Type${route.params.part}`]=="TIME"?"MIN":(route.params.wod)[`Type${route.params.part}`]}
                        // secureTextEntry={showPassword}
                        theme={{colors: {text: 'black', primary: '#6E1D1D'}}}
                        onChangeText={(min)=>{setMin(min)}}
                        />
                    {/* <TextInput
                        style={styles.input} 
                        keyboardType="numeric"
                        maxLength={2}
                        label="SEC"
                        // secureTextEntry={showPassword}
                        theme={{colors: {text: 'black', primary: '#6E1D1D'}}}
                        onChangeText={(sec)=>{setSec(sec)}}
                        // right={<TextInput.Icon onPress={()=>setShowPassword(prev=>!prev)} name={showPassword?"eye-off":"eye"} />}
                    /> */}
                    {/* </View> */}
                            
                </View> 
                <View style={styles.logView}>
                    <TouchableOpacity
                        onPress={()=>{setScale("RX")}}
                        style={[styles.buttons,scale=="RX"?{backgroundColor:Theme.red}:{backgroundColor:"white"}]} 
                        >
                            <View>
                                <Text style={[styles.greatText,scale=="RX"?{color:"white"}:{color:Theme.red}]}>
                                    RX
                                </Text>
                            </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>{
                            setScale("SCALED")
                        }}
                        style={[styles.buttons,scale=="SCALED"?{backgroundColor:Theme.red}:{backgroundColor:"white"}]} 
                        >
                            <View>
                                <Text style={[styles.greatText,scale=="SCALED"?{color:"white"}:{color:Theme.red}]}>
                                    SCALED
                                </Text>
                            </View>
                            
                    </TouchableOpacity>
                </View>
                <View style={[styles.logView,{
                    backgroundColor:"transparent",
                    shadowColor: 'transparent',
                    shadowOffset: {width: 0, height: 0},
                    shadowOpacity: 0,
                    elevation: 0
                    }]}>
                    {loading ?
                    <ActivityIndicator animating={true} size={"large"} color={Theme.red} />:
                    <TouchableOpacity
                            onPress={()=>{
                                saveLog();
                            }}
                            style={[styles.buttons]} 
                            >
                                <View>
                                    <Text style={[styles.greatText]}>
                                        SAVE
                                    </Text>
                                </View>
                                
                    </TouchableOpacity>}
                </View>
            </ScrollView>
        <StatusBar style="auto" />
        </View>
    );
}

export default Log;
