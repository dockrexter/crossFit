import { dbRef } from "../../../firebase";


const getMemberships=async (setter)=>{
    var plans={}
    await dbRef.collection("Memberships")
    .onSnapshot({
        includeMetadataChanges: true
    },async (querySnapshot) => {
        await querySnapshot.forEach((doc) => {
            plans[doc.id]=doc.data();
        })
        setter(plans);
    });
    
}
export default getMemberships;


// PartAHistory:{
//     type:"",
//     min:"",
//     sec:"",
//     comment:"",
// },
// PartBHistory:{
//     type:"",
//     min:"",
//     sec:"",
//     comment:"",
// }