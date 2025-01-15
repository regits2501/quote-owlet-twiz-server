
/**
 * Cross Origin Resource Share (CORS) request handling
 */
export default class CORS {

   
   constructor(req, res, config){
     this.req = req;
     this.res = res;

     this.config = config;
   }
   
   // preflight the request
   prefligh(){
     this.setAccessControlHeaders(this.config);
     this.send();
   }

   

   setAccessControlHeaders(config){
     
     const { 
        origin, 
        methods, 
        headers

    } = config.allow;

     const control = 'Access-Control-Allow-';

     // restrict to required domain
     this.res.header(`${control}Origin`,  origin);
     
     this.res.header(`${control}Methods`, methods); 

     // set the cors headers
     this.res.header(`${control}Headers`, headers);
     
   }

   send(){
      this.res.status(200).end();
   }
}