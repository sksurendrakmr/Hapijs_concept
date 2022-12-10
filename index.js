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

    //start server
    await server.start();
    console.log(`Server started on: ${server.info.uri}`);
}

process.on('unhandledRejection',(err)=>{
    console.log(err);
    process.exit(1);
})

init();