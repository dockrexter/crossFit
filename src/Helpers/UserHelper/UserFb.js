import {auth,dbRef} from "../../../firebase";

const getUser=async(setter)=>{
    await dbRef.collection("Users").doc(String(auth.currentUser.uid))
    .onSnapshot((doc) => {
        console.log("Current data: ", doc.data());
        setter(doc.data());
    },(err)=>{alert(arr)});
}

export default getUser;