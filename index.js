'use-strict'

const Hapi = require('@hapi/hapi');
const Hapi_Geo_Locate = require('hapi-geo-locate')
const Inert = require('@hapi/inert');
const path = require('path');
const Connection = require('./dbconfig')
const Basic_Auth_Plugin = require('@hapi/basic');
const BoomPlugin = require('@hapi/boom')
const CookiePlugin = require("@hapi/cookie");
const { request } = require('http');
// //Mocked users
// const users = {
//     suri:{
//         username:"suri",
//         password:"sk",
//         id:0,
//         name:"sksuri"
//     },
//     sk:{
//         username:"sk",
//         password:"suri",
//         id:1,
//         name:"sksk"
//     },
// }
// const validate = async(request,username,password,h) => {
//     /**
//      * If validate returns "isValid:false" then the popup reappears
//      * and the page content is still hidden from the user. 
//      */
//     if(!users[username]){
//         return {isValid:false}
//     }

//     const user = users[username]; 

//     /**
//      * The object passed to crednetials can be accessed in the handler by
//      * request.auth.credentials.
//      */
//     if(user.password === password){
//         return {isValid:true,credentials:{id:user.id,name:user.name}};
//     }else{
//         return {isValid:false}
//     }
// }

//Create server function
//Wrap in async function so we can make use of await keyword.
const init = async() => {

    const server = Hapi.server({
        host:'localhost',
        port:5050,
        routes:{
            //globally configured the static files
            files:{
                relativeTo:path.join(__dirname,'static')
            }
        }
    })

    await server.register([
    {
        plugin: Hapi_Geo_Locate,
        options:{
            enableByDefault:true
        }
    },
    {
        plugin:Inert,
    },
    // {
    //     plugin:Basic_Auth_Plugin //1. Register Basic Auth plugin
    // },
    {
        plugin:CookiePlugin
    }
])

// //2. Implement Strategy
// server.auth.strategy('login','basic',{
//     validate
// })

server.auth.strategy('login','cookie',{
    cookie:{
        name:'session',
        password:'surisksurisksurisksurisksurisksurisk',
        isSecure:true,
        ttl: 30000
    },
    redirectTo: '/login',
    //validate if cookie is still valid.
    //session object that we create if user is successfully loggedIn.
    validateFunc: async(request,session) => {
        /**
         * ValidateFunc
         * ====
         * - A function used to validate the content of the cookie on each request.
         * - Must return an object with the key valid and value true(if authenticated) or false(if not authenticated)
         * - Used to verify that the user session with the server is still valid.
         * 
         * - Signature -> function(request, session)
         *   where request is the Hapi request object being authenticated and session is the object set with request.cookieAuth.set()
         */

        if(session.username === "sk" && session.password==="sksuri"){
            return {valid:true, credentials:{favouriteFood:'pizza'}}
        }else{
            return {valid:false}
        }
    }
})

server.auth.default('login')

// We can specify the strategy on select routes by using options=> auth => scheme name 
//we can specify the strategy to work on every route using
// server.auth.default("login")

    server.route({
        method:'GET',
        path:'/location',
        handler:(request,h)=>{
            // console.log(request);
            // console.log("Response Toolkit", h);
            // return request.location;
            if(request.location){
                return request.location;
            }else{
                return "<h1>Location is not enabled by default.</h1>"
            }

        }
    })

    //only applied the files configuration  
    server.route({
        method:'GET',
        path:'/',
        handler:(req,h)=>{
            //inert will provide a method called file in response toolkit to serve a file to client from server
            // return h.file('./staic/welcome.html');
            if(req.auth.isAuthenticated()){
                return h.redirect('/welcome')
            }
            return h.file('welcome.html')
        },
        options:{
            // files:{
            //     relativeTo:path.join(__dirname,'static')
            // }
            auth:{
                mode:'try'
            }
        }
    })


    //query paramters
    //http://localhost:5050/users?name=s&age=25
    server.route({
        method:'GET',
        path:'/userinfo',
        handler:(req,h)=>{
            return `<h1>${req.query.name} ${req.query.age}<h1/>`
        }
    })

    //Downloading a file
    /**
     * Inert also let us download files as well as display them.
     * 
     * Setting the mode to 'attachment' makes the file become a download
     * as opposed to being displayed.
     * 
     * The default mode is 'inline'.
     * 
     * we must change the mode to inline now or it will stay as attachment. 
     */
    server.route({
        method:'GET',
        path:'/download',
        handler:(req,h)=>{
            return h.file('welcome.html',{
                mode:'attachment',
                filename:'welcome-download-html'
            })
        }
    })

    //redirect
    server.route({
        method:'GET',
        path:'/users_redirect',
        handler:(req,h)=>{
            return h.redirect('/');
        }
    })

    //handle 404 error
    server.route({
        method:'GET',
        path:'/{any*}', //can be of any name
        handler:(req,h)=>{
            return `<h1>The page not found!!!<h1/>`;
        },
        options:{
            auth:{
                mode:'try'
            }
        }
    })

    //form data
    server.route({
        method:'POST',
        path:'/login',
        handler:(req,h)=>{
            const {username,password} = req.payload;
            if(username==="sk" && password === "sksuri"){
                //send back the cookie to user that contain login information.
                //The informations which we set here, can be access via session object which is 2nd parameter of validateFunc
                request.cookieAuth.set({username:username,password:password})
                return h.redirect('./welcome.html')
            }else{
                return h.redirect('/login')
            }
        },
        options:{
            auth:{
                mode:'try'
            }
        }
    })

    server.route({
        method:'GET',
        path:'/welcome',
        handler:(request,h)=>{
            // return h.file('welcome.html')
            return `Welcome ${request.auth.credentials.username}` //which we have set in cookieAuth
        }
    })

    //Get users
    server.route({
        method:'GET',
        path:'/getUsers',
        handler:async(request,h) => {
            const users = await Connection.getUsers();
            h.response(users)
        }
    })
    
    //3. create a route to implement the scheme.
    //we have created our strategy but we have not registered it with a route.
    server.route({
        method:'GET',
        path:'/loginbasic',
        handler:(request,h)=>{
            //as we are passing credentials object and this handler is register with route.
            return `welcome to restricted page. ${request.auth.credentials.name}`
        },
        options:{
            auth:'login'//name of the strategy
        }
    })

    server.route({
        method:'GET',
        path:'/logout',
        handler:(request,h) => {
            request.cookieAuth.clear();
            return h.redirect('/')
            // return BoomPlugin.unauthorized("You have been logged out successfully");
        }
    })

    //start server
    await server.start();
    console.log(`Server started on: ${server.info.uri}`);
}

process.on('unhandledRejection',(err)=>{
    console.log(err);
    process.exit(1);
})

init();