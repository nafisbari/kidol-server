const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 8000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkydx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri); // to see if the uri is showing the user id and pass
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        console.log("KIDOL Connected!");

        const database = client.db('kidol');
        const toysCollection = database.collection('toys');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');



        //get toys collection
        app.get('/toys', async (req, res) => {

            const cursor = toysCollection.find({});
            const toys = await cursor.toArray();

            res.send(toys)
        })

        //Post Orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);

        })



    }
    finally {
        //await client.close(); 
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Welcome to KIDOL Server")
});

app.listen(port, () => {
    console.log('Server is Running at,', port)
});