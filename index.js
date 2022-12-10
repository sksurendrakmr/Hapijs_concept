'use-strict'

const Hapi = require('@hapi/hapi');
const Hapi_Geo_Locate = require('hapi-geo-locate')
const Inert = require('@hapi/inert');
const path = require('path');
const Connection = require('./dbconfig')

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
    }
])

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
            return h.file('welcome.html')
        },
        options:{
            files:{
                relativeTo:path.join(__dirname,'static')
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
        }
    })

    //form data
    server.route({
        method:'POST',
        path:'/login',
        handler:(req,h)=>{
            const {username,password} = req.payload;
            if(username==="suri" && password==="1234"){
                // return `<h1>You logged In<h1/>`
                return h.file('LoggedIn.html');
            }else{
                return h.redirect('/');
            }
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

    //start server
    await server.start();
    console.log(`Server started on: ${server.info.uri}`);
}

process.on('unhandledRejection',(err)=>{
    console.log(err);
    process.exit(1);
})

init();