import React,{useEffect, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import {Text, View,TouchableOpacity,Keyboard,ScrollView,FlatList,Image} from 'react-native';
import { MaterialCommunityIcons,AntDesign,MaterialIcons } from '@expo/vector-icons';
import styles from './styles';
import { normalize } from '../../Helpers/normalize';
import { Searchbar,Avatar, Button, Card, Title, Paragraph,ActivityIndicator} from 'react-native-paper';
import moment from 'moment';
import { FAB } from 'react-native-paper';
import { dbRef } from '../../../firebase';
import { useFocusEffect } from '@react-navigation/native';



const Class=({route,navigation})=> {
    const[user,setUser]=useState(route.params.user);
    const[classDay,setClassDay]=useState(route.params.classDay);
    const[classTime,setClassTime]=useState(route.params.classTime);
    const[usersList,setUsersList]=useState([]);
    const[loading,setLoading]=useState(true);
    

    const handleBooking=async ()=>{
        console.log(route.params.canBook);
        setLoading(true);
        const document=String(moment(classDay).format("YYYY-MM-DD")+" "+ classTime.time);
        console.log(document);
        let pushedUser=usersList.USERS;
        pushedUser.push({
            FirstName:user.FirstName,
            uid:user.uid,
            Picture:user.Picture,
        });
        dbRef.collection("Bookings").doc(document).set({
            ClassDate: usersList.ClassDate,
            ClassTime: usersList.ClassTime,
            USERS: pushedUser,
            Capacity:route.params.capacity
        })
        .then(() => {
            dbRef.collection("Users").doc(String(user.uid)).set({
                Plan:{
                    Entries:(user.Plan.Entries)+1
                }
            }, { merge: true }).then(()=>{
                setLoading(false);
            })            
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
        
    }
    const handleCancelBooking=()=>{
        const newUsersList=(usersList.USERS).filter(item=>{
            return item.uid != user.uid
        })
        setLoading(true);
        const document=String(moment(classDay).format("YYYY-MM-DD")+" "+ classTime.time);
        dbRef.collection("Bookings").doc(document).set({
            ClassDate: usersList.ClassDate,
            ClassTime: usersList.ClassTime,
            USERS: newUsersList,
            Capacity:route.params.capacity,
        })
        .then(() => {
            const data={
                ClassDate: usersList.ClassDate,
                ClassTime: usersList.ClassTime,
                USERS: newUsersList,
                Capacity:route.params.capacity,
            }
            setUsersList(data);
            dbRef.collection("Users").doc(String(user.uid)).set({
                Plan:{
                    Entries:(user.Plan.Entries)-1
                }
            }, { merge: true })
            console.log("Document successfully written!");
            
        })
            
        .catch((error) => {
            console.error("Error writing document: ", error);
        })
        .finally(()=>{
            setLoading(false);
        })
        
        
    }

    useEffect(()=>{
        console.log(route.params.canBook)
        setLoading(true);
        const document=String(moment(classDay).format("YYYY-MM-DD")+" "+ classTime.time);
        console.log(document);
        const unsubscribe = dbRef.collection("Bookings").doc(document)
        .onSnapshot({
            includeMetadataChanges: true
        }, (doc) => {
            if(typeof doc.data() == "undefined"){
                dbRef.collection("Bookings").doc(document).set({
                    ClassDate: moment(classDay).format("YYYY-MM-DD"),
                    ClassTime: classTime.time,
                    USERS: [],
                    Capacity:route.params.capacity
                })
                .then(() => {
                    setLoading(false);
                    console.log("Document successfully written!");
                })
                .catch((error) => {
                    console.error("Error writing document: ", error);
                });
            }
            else{
                setUsersList(doc.data());
                setLoading(false);
            }
            
        });
        return unsubscribe;
    },[])
    if(loading){
        return(
            <View style={[styles.container]}>
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
                                navigation.navigate("Home",{user:user});
                            }}
                            style={styles.profileBtn}>
                                <Text style={styles.profileBtnText}>{"Hello, "+user.FirstName}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={()=>{
                                navigation.navigate("Home",{user:user});
                            }}
                            style={styles.topBarBtns}>
                                <MaterialCommunityIcons  name="bell-ring-outline" size={normalize(25)} color="black" />
                        </TouchableOpacity>
                    </View>
                    <ActivityIndicator style={styles.ActivityIndicator} animating={true} size={"large"} color={"#6E1D1D"} />
                </View>
        );
    }
    else return (
        <View onTouchStart={Keyboard.dismiss} style={styles.container}>
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
                        navigation.navigate("Home",{user:user});
                    }}
                    style={styles.profileBtn}>
                        <Text style={styles.profileBtnText}>{"Hello, "+user.FirstName}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                        navigation.navigate("Home",{user:user});
                    }}
                    style={styles.topBarBtns}>
                        <MaterialCommunityIcons  name="bell-ring-outline" size={normalize(25)} color="black" />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.texts}>
                    <Text style={styles.progressText}>
                        {"Members - "+(usersList.USERS).length+"/"+route.params.capacity}
                    </Text>
                </View>
                <FlatList
                    data={usersList.USERS}
                    renderItem={({item,index}) =>(
                        <TouchableOpacity 
                            style={styles.classItem}
                        >
                            <View style={styles.classItemBodyLeft}>
                                <View style={styles.imageBody}>
                                    <Avatar.Image size={normalize(60)} source={item.Picture?{uri:item.Picture}:require('../../../assets/USER.png')}/>
                                </View>
                            </View>
                            <View style={styles.classItemBodyRight}>
                                <Text style={styles.className}>
                                    {item.FirstName}
                                </Text>
                                <Text style={styles.classDescription}>
                                    {"HURRAH!"}
                                </Text>
                            </View>

                        </TouchableOpacity>
                    )}
                />
            </ScrollView>
        <StatusBar style="auto" />
        {!(usersList.USERS).some(item=>item.uid==user.uid)?
            <FAB
                style={styles.fab}
                icon="plus"
                color='white'
                label='Join now'
                onPress={() => {
                    console.log(moment().diff(moment(classDay), 'minutes'))
                    if(user.Plan.Entries<user.Plan.TotalEntries){
                        if(parseInt((classTime.time).substr(0, (classTime.time).indexOf(':')))-parseInt(moment().format("HH"))>1 || moment(classDay).format("YYYY-MM-DD")!==moment().format("YYYY-MM-DD")){
                            if(route.params.canBook){
                                handleBooking();
                            }
                            else{
                                alert("You have alredy booked in another class");
                            }
                            
                        }
                        else{
                            
                            alert("You are late");
                        }
                    }
                    else{
                        alert("you have used all your entries")
                    }
                    
                }}
                />
            :<FAB
                style={styles.fab}
                icon="minus"
                color='white'
                label='Cancel booking'
                onPress={() => handleCancelBooking()}
            />}
        </View>
    );
}

export default Class;
