const {MongoClient} = require('mongodb');
const dotenv = require('dotenv')
dotenv.config()

const {ObjectId} = require('bson')

const uri = process.env.URI_DATABASE
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
        // const getDate = new Date().getDate()

        // const foundOrder = (await db.collection("orders").find({}).toArray()).filter(el => {
        //     return (el.Datetime).getDate() === getDate
        // }) 
        // console.log(foundOrder); 

        //lay order theo tuan
        // const getDay = new Date().getDay()
        // let dateNow = new Date()
        // dateNow.setHours(0, 0, 0, 0)
        // // dateNow = new Date(dateNow.getFullYear(),dateNow.getMonth(), dateNow.getDate())
        // console.log(dateNow.toLocaleString());
        // const lastMonday = new Date(dateNow.setDate(dateNow.getDate() - getDay + 1));
        // console.log(lastMonday.toLocaleString());
        // dateNow = new Date()
        // dateNow.setHours(0,0,0,0)
        // const lastSunday = new Date(dateNow.setDate(dateNow.getDate() + (7 - getDay)));
        // console.log(lastSunday.toLocaleString());

        // const foundOrder = await db.collection("orders").find({"Datetime": {$lte: lastSunday, $gte: lastMonday}}).toArray()
        
        // console.log(foundOrder);
        
        //lay order theo thang
        // let dateNow = new Date()
        // let firstDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1)
        // let lastDate = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0)
        // console.log(firstDate.toLocaleString());
        // console.log(lastDate.toLocaleString());
        // const foundOrder = await db.collection("orders").find({"Datetime": {$lte: lastDate, $gte: firstDate}}).toArray()
        
        // console.log(foundOrder);

        // lay order theo ngay

        // const found = await db.collection('products').updateMany({}, {$set: {percent: 0}}, {multi: true})
        // if (found.modifiedCount === 0) {
        //     console.log("Error");
        // }
        // else {
        //     console.log(found);
        // }
        
        // const found = await db.collection('products').find().sort({_id:-1}).limit(1).toArray()
        // console.log(found);

        // const found = await db.collection('categories').aggregate([{$lookup: {from: 'products', localField: 'products', foreignField: "_id", as: 'products'}}]).toArray()
        // console.log(found[0].products);
        await db.collection('products').updateMany({}, {$set: {"quickFact": ["Reliable & regular updates. This theme is maintained by the author of Vuetify, John Leider.", "Professionally developed. All components and features are developed using the most up-to-date coding practices.", "Blazing fast & optimized. Themes are designed for maximum performance and are semantically structured to maximize SEO.", "Built on Vuetify. Being developed with Vuetify means you have access to all of the frameworks available features."]}})
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);