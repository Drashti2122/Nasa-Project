 const http=require('http');
 
 require('dotenv').config();

 const app=require('./app');

 const {mongoConnect}=require('./services/mongo');

 const {loadPlanetsData}=require('./models/planets.model');
 const {loadLunchesData}=require('./models/launches.model');
 const PORT=process.env.PORT || 8001;

 const server = http.createServer(app);

 async function startServer(){
   await mongoConnect();

   await loadPlanetsData();
   await loadLunchesData();
   
   server.listen(PORT,() => {
      console.log(`Listening on port ${PORT}`);  
   });
 }
 
 startServer();