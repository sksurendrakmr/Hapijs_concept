const Sequelize = require('sequelize');

const sequelize = new Sequelize('hapi_tutorial','root','rootPassword',{
    host:'localhost',
    port:3306,
    dialect:'mysql'
})

/**
 * authenticate() method checks the database connection asynchronously.
 * Thus, it returns a promise that is resolved with a successful connection and
 * rejected otherwise.
 */
sequelize.authenticate()
    .then(()=>console.log("Connected to database"))
    .catch((err)=>console.log("couldn't connect"))

//Test the connection by retreiving the data
async function testConnection(){
    try {
        await sequelize.authenticate();
        const {results, metadata} = await sequelize.query('SELECT * FROM users')
        console.log("Results",results);
    } catch (error) {
        console.log("Couldn't connect...!!!");
    }
}

testConnection()