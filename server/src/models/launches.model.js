const axios=require('axios');

const launchesDatabase=require('./launches.mongo');
const planets=require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER=100;   

// const launch={
//   flightNumber:100, //flight_number
//   mission:'Kepler Exploration X', //name
//   rocket:'Explorer IS1', //rocket.name
//   launchDate:new Date('December 27,2030'), //date_local
//   target:'Kepler-296 A f', //not applicable
//   customers:['ZTM','NASA'], //payload.customers for each payload
//   upcoming:true, //upcoming
//   success:true, //success
// };

// saveLaunch(launch);
// // launches.set(launch.flightNumber,launch);

const SPACE_API_URL='https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
  console.log('Dowloading Launch Data....');
  const response=await axios.post(SPACE_API_URL,{
    query:{},
    options:{
        pagination:false,
        page:5,
        limit:20,
        populate:[
            {
                path:"rocket",
                select:{
                    name:1    
                }
            },
            {
                path:"payloads",
                select:{
                    customers:1
                }
            }
        ]
    } 
  });

  if(response.status!==200){
    console.log('Problem downloading Launch Data');
    throw new Error('Launch data download failed');
  }

  const launchDocs=response.data.docs;
  for(const launchDoc of launchDocs)
  {
     const payloads=launchDoc['payloads'];
     const customers=payloads.flatMap((payload)=>{
       return payload['customers'];
     });

     const launch={
       flightNumber:launchDoc['flight_number'],
       mission:launchDoc['name'],
       rocket:launchDoc['rocket']['name'],
       launchDate:launchDoc['date_local'],
       upcoming:launchDoc['upcoming'],
       success:launchDoc['success'],  
       customers,
     };

     console.log(`${launch.flightNumber} ${launch.mission}`);
 
     await saveLaunch(launch);
     //TODO:populate launches collection...
  } 
}

async function loadLunchesData(){
  const firstLaunch=await findLaunch({
    flightNumber:1,
    rocket:'Falcon 1',
    mission:'FalconSat'
  });
  if(firstLaunch){
    console.log('Launch data already loaded!');
    return;
  }else{
    await populateLaunches(); 
  }

}

async function findLaunch(filter)
{
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId){
  //  return await launchesDatabase.has(launchId); 
  return await findLunch({
    flightNumber:launchId,
  });
}

async function getLatestFlightNumber(){ 
   const latestlaunch=await launchesDatabase
   .findOne()
   .sort('-flightNumber');

   if(!latestlaunch)
   {
     DEFAULT_FLIGHT_NUMBER;
   }

   return latestlaunch.flightNumber;
}

async function getAllLaunches(skip,limit) {
  return await launchesDatabase
    .find({},{'_id':0,'__v':0})
    .sort({flightNumber:-1})
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch){
  await launchesDatabase.findOneAndUpdate({
     flightNumber:launch.flightNumber,
  },launch,{
    upsert:true,
  })
}

// function addNewLaunch(launch){
//   latestFlightNumber++;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch,{
//        success:true,
//        upcoming:true,
//        customers:['Zero to Mastery','NASA'],
//        flightNumber:latestFlightNumber,
//   }));
// }

async function scheduleNewLaunch(launch)
{
   const planet=await planets.findOne({
      keplerName:launch.target,
   });

   if(!planet)
   {
      throw new Error('No matching planet found')
   }
    
   const newFlightNumber=await getLatestFlightNumber()+1;
   const newLaunch=Object.assign(launch,{
      success:true,
      upcoming:true,
      customers:['Zero to Mastery','NASA'],
      flightNumber:newFlightNumber,
   });

   await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId){
  const aborted = await launchesDatabase.updateOne({
    flightNumber:launchId,
  },{
    upcoming:false,
    success:false,
  });
    
  return aborted.ok===1 && aborted.nModified===1;
  // return aborted;
  // console.log(aborted.ok==1 && aborted.nModified===1);

  //  const aborted=launches.get(launchId);
  //  aborted.upcoming = false;
  //  aborted.success=false; 
  //  return aborted;
}
// function httpAddNewLaunch(req,res){
//   const launch = req.body;
//   launch.launchDate=new Date(launch.launchDate);
//   addNewLaunch(launch);
//   return res.status(201).json(launch);
// }

module.exports = {
    getAllLaunches,
    existsLaunchWithId,
    abortLaunchById,
    scheduleNewLaunch,
    loadLunchesData,
};