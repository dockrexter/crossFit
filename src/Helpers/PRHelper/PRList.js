import { dbRef } from "../../../firebase";
import * as firebase from "firebase"
import moment from "moment"

const getPRList=async()=>{
    var list=[]
    const querySnapshot = await dbRef.collection("PRList").get()
    await querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        list.push(doc.data());
    });
    return list;
    
}

const getPR=async(uid,setter)=>{
    await dbRef.collection("PR").doc(String(uid)).onSnapshot((doc) => {
        var data=doc.data();
        console.log(data,"getter")
        setter(data);
    });    
}

const savePR=async(uid,number,reps,exercise)=>{
    console.log(uid);
    var PR = dbRef.collection('PR').doc(String(uid));
    var obj={};
    var obj2={};
    obj2[reps]=firebase.firestore.FieldValue.arrayUnion({
        number:number,
        date:String(moment().format("L"))
    });
    obj[exercise]=obj2
    var setWithMerge = PR.set(obj, { merge: true });
}

export {getPRList,savePR,getPR};