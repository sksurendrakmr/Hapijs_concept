'use-strict'

const Hapi = require('@hapi/hapi');

//Create server function
//Wrap in async function so we can make use of await keyword.
const init = async() => {

    const server = Hapi.server({
        host:'localhost',
        port:5050
    })

    server.route({
        method:'GET',
        path:'/',
        handler:(req,h)=>{
            return "Hello Hapi";
        }
    })

    server.route({
        method:'GET',
        path:'users',
        handler:(request,h)=>{
            return '<h1>Hello User<h1/>';
        }
    })
    //Add uri parameter
    server.route({
        method:'GET',
        path:'users/{user}',
        handler:(request,h)=>{
            return `<h1>Hello ${request.params.user}<h1/>`;
        }
    })

    //optional parameters uri
    server.route({
        method:'GET',
        path:'users/{user?}',
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
        path:'/users',
        handler:(req,h)=>{
            return `<h1>${req.query.name} ${req.query.age}<h1/>`
        }
    })

    //redirect
    server.route({
        method:'GET',
        path:'/users',
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