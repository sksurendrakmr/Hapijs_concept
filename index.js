'use-strict'

const Hapi = require('@hapi/hapi');
const Hapi_Geo_Locate = require('hapi-geo-locate')
const Inert = require('@hapi/inert');
const path = require('path')

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

    // server.route({
    //     method:'GET',
    //     path:'/users',
    //     handler:(request,h)=>{
    //         return '<h1>Hello User<h1/>';
    //     }
    // })
    //Add uri parameter
    // server.route({
    //     method:'GET',
    //     path:'/users/{user}',
    //     handler:(request,h)=>{
    //         return `<h1>Hello ${request.params.user}<h1/>`;
    //     }
    // })

    //optional parameters uri
    server.route({
        method:'GET',
        path:'/users/{user?}',
        handler:(request,h)=>{
            if(request.params.user){
                return `<h1>Hello ${request.params.user}<h1/>`;
            }else{
                return `Hello Stranger!!`
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

    //start server
    await server.start();
    console.log(`Server started on: ${server.info.uri}`);
}

process.on('unhandledRejection',(err)=>{
    console.log(err);
    process.exit(1);
})

init();