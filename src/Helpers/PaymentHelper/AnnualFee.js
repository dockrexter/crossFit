import { dbRef } from "../../../firebase";
import * as firebase from "firebase"
import moment from "moment"


const AnnualFee=async(uid)=>{
    var user = dbRef.collection("Users").doc(String(uid));
    // Atomically add a new region to the "regions" array field.
    await user.update({
        ValidFrom:`${moment()}`,
        ValidThru:`${moment().add(365,"days")}`
    });
}

const Packages=async(uid,Entries,Price,TotalEntries,Type,ValidFrom,ValidThru)=>{
    var user = dbRef.collection("Users").doc(String(uid));
    // Atomically add a new region to the "regions" array field.
    await user.update({
        Plan:{
            Entries:Entries,
            Price:Price,
            TotalEntries:TotalEntries,
            Type:Type,
            ValidFrom:ValidFrom,
            ValidThru:ValidThru,
        }
    });
}
const Plans=async(uid,Entries,Price,TotalEntries,Type,ValidFrom,ValidThru)=>{
    var user = dbRef.collection("Users").doc(String(uid));
    // Atomically add a new region to the "regions" array field.
    await user.update({
        Plan:{
            Entries:Entries,
            Price:Price,
            TotalEntries:TotalEntries,
            Type:Type,
            // ValidFrom:`${ValidFrom}`,
            // ValidThru:`${ValidThru}`,
            ValidFrom:"",
            ValidThru:"",
        }
    });
}


export {AnnualFee,Packages,Plans}