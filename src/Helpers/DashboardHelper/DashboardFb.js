import { dbRef } from "../../../firebase";
import moment from "moment";
import Days from "./Days";

const getTimeTable=async (day,setter)=>{
    console.log(Days[`${day}`])
    await dbRef.collection("TimeTable").doc(String(Days[`${day}`]))
        .onSnapshot((doc) => {
            console.log("Current data: ", doc.data());
            setter(doc.data());
        },(err)=>{alert(arr)});
}

const getUserBookings=async(date,setter)=>{
    const date_formated=moment(date).format("YYYY-MM-DD");
    var bookings=[];
    console.log(date_formated);
    await dbRef.collection("Bookings").where("ClassDate", "==", String(date_formated))
    .onSnapshot((snapshots) => {
        snapshots.forEach((doc) => {
            bookings.push(doc.data());
            
        });
        setter(bookings);
    });
    
}

const getWod=async(date,setter)=>{
    const date_formated=moment(date).format("YYYY-MM-DD");
    var wods=[];
    await dbRef.collection("WOD").where("Date", "==", String(date_formated))
    .onSnapshot((snapshots) => {
        snapshots.forEach((doc) => {
            console.log(doc.data());
            wods.push(doc.data());
            
        });
        setter(wods);
        console.log(wods);
    });

}

export {getTimeTable,getUserBookings,getWod}


// const setUpDashboard= async ()=>{
    //     let wod_array=[];
    //     let table_array=[];
    //    const table= await dbRef.collection("TimeTable").get();
    //     table.forEach((doc) => {
    //         table_array.push(doc.data());
    //     });
    //     const workout= await dbRef.collection("WOD").get()
    //     workout.forEach((doc) => {
    //         wod_array.push(doc.data());
    //     });
    //     return({
    //         table:table_array,
    //         wod:wod_array
    //     })
    // }

 // useEffect(()=>{
    //     let mounted = true;
    //     setCanBook(true);
    //     setLoading(true);
    //     setUpDashboard().then(data=>{
    //         setTimeTable(data.table);
    //         setWod(data.wod.filter(
    //             object=>{
    //                 return object.Date == moment().format("YYYY-MM-DD")
    //             }
    //         ));
    //         setDate(moment());
    //         setDay(moment().day());
    //     }).finally(()=>{
    //         setLoading(false);
    //     })
    //     return () => mounted = false;
    // },[refreshing])

    // useEffect(()=>{
    //     setRefreshing(false);
    //     setCanBook(true);
    // },[date,timeTable,wod,day])

    //     useEffect(()=>{
    //         setLoading(true);
    //         setCanBook(true);
    //         dbRef.collection("Bookings").where("ClassDate", "==", moment(date).format("YYYY-MM-DD"))
    //         .onSnapshot({
    //             includeMetadataChanges: true
    //         }, (querySnapshot) => {
    //             var cities = [];
    //             querySnapshot.forEach((doc) => {
    //                 cities.push(doc.data());
    //             });
    //             setBookings(cities);
    //             setLoading(false);
    //         });
    //     },[date])

    // useEffect(() => {
    //     const unsubscribe = navigation.addListener('focus', () => {
    //         setLoading(true);
    //         setCanBook(true);
    //         dbRef.collection("Bookings").where("ClassDate", "==", moment(date).format("YYYY-MM-DD"))
    //         .onSnapshot({
    //             includeMetadataChanges: true
    //         }, (querySnapshot) => {
    //             var cities = [];
    //             querySnapshot.forEach((doc) => {
    //                 cities.push(doc.data());
    //             });
    //             setBookings(cities);
    //             setLoading(false);
    //         });
    //     });
        
    //     return unsubscribe;
    //   }, [navigation,date]);

    // useEffect(()=>{
    //     const unsubscribe = navigation.addListener('beforeRemove', (e) => {
    //         e.preventDefault();
    //         console.log(route.name);
    //         if(route.name=="Dashboard"){
                
    //             BackHandler.exitApp();
    //         }
    //         else{
    //             navigation.goBack()
    //         }
    //       });
    //     return unsubscribe;
    // })
