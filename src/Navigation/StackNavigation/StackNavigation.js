import React,{ useEffect,useState} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../../screens/Login/Login';
import Dashboard from '../../screens/Dashboard/Dashboard';
import LeaderBoard from '../../screens/LeaderBoard/LeaderBoard';
import Class from '../../screens/Class/Class';
import EditProfile from '../../screens/EditProfile/EditProfile';
import UserProfile from '../../screens/Profile/Profile';
import Log from '../../screens/Log/Log';
import LeaderBoardList from '../../screens/LeaderBoardList/LeaderBoardList';
import Membership from '../../screens/Membership/Membership';
import Payment from '../../screens/Payment/Payment';
import PR from '../../screens/PR/PR';
import PRHis from '../../screens/PRHis/PRHis';


const Stack = createStackNavigator();


const StackNavigation= ()=> {

  return (
    <Stack.Navigator
        initialRouteName={"Login"}
        screenOptions={{
            gestureEnabled:true,
            headerShown:false,

        }}
    >
        <Stack.Screen name="Login" component={Login}/>
        <Stack.Screen name="Dashboard" component={Dashboard}/>
        <Stack.Screen name="Class" component={Class} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="LeaderBoard" component={LeaderBoard} />
        <Stack.Screen name="LeaderBoardList" component={LeaderBoardList} />
        <Stack.Screen name="Log" component={Log} />   
        <Stack.Screen name="Membership" component={Membership} />  
        <Stack.Screen name="Payment" component={Payment} />
        <Stack.Screen name="PR" component={PR} />  
        <Stack.Screen name="PRHis" component={PRHis} /> 

        
    </Stack.Navigator>
  );
}
export default StackNavigation;