const API_URL = 'http://localhost:8001/v1';
async function httpGetPlanets() {
  
  try{
      // TODO: Once API is ready.
      const response=await fetch(`${API_URL}/planets`).then((data)=>data.json()).then(data=>data); 
      // Load planets and return as JSON.
      return await response;
  }catch(err){
    console.log(err);
  }
  
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  const response=await fetch(`${API_URL}/launches`);
  const fetchedLaunches=await response.json();
  return fetchedLaunches.sort((a,b)=>{
    return a.flightNumber-b.flightNumber;
  });
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  try{
    return await fetch(`${API_URL}/launches`,{
      method:'POST',
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify(launch), //it convert the object into string
    })
  }catch(err){
    return {
      ok:false,
    }
  }
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try{
    const response=await fetch(`${API_URL}/launches/${id}`,{
      method:"delete",
     }).then((data)=>data.json()).then(data=>data);
    // window.location.reload();
    return response;

  }catch(err){
     console.log(err);
     return{
       ok:false,
     };
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};	