const {MongoClient} = require('mongodb');

const {ObjectId} = require('bson')

const uri = "mongodb+srv://admin:admin@cluster0.equfm.mongodb.net/demo-tttn?retryWrites=true&w=majority"
const dbName = "demo-tttn"
const client = new MongoClient(uri);


async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
 

    const client = new MongoClient(uri);
 
    try {
        // Connect to the MongoDB cluster
        await client.connect(); 

        const db = client.db(dbName)

        // add count = 0;
        // await db.collection("products").updateMany({}, {$set: {count: 0}})

        // const allProduct = await db.collection("products").find().toArray()
        // console.log(allProduct);

        // lay order theo ngay
        const getDate = new Date().getDate()


        const foundOrder = await (await db.collection("orders").find({}).toArray()).filter(el => {
            ObjectId(el._id).getTimestamp().getDate() === getDate
        })

        console.log(foundOrder);


 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);