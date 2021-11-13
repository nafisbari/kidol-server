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
        const usersCollection = database.collection('users');



        ////   TOYS Operaion   ////
        //get toys collection
        app.get('/toys', async (req, res) => {

            const cursor = toysCollection.find({});
            const toys = await cursor.toArray();

            res.send(toys)
        })

        //Post toy
        app.post('/toys', async (req, res) => {
            const addToy = req.body;
            const result = await toysCollection.insertOne(addToy);
            res.json(result);

        })
        //get toy using id
        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const toy = await toysCollection.findOne(query);
            console.log(id);
            res.send(toy);
        })
        //delete toy
        //delete order
        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            console.log(result);
            console.log('deleting', id)
            res.json(result);
        });



        ////   ORDERS Operation   /////

        //Post Orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);

        })

        //get Orders
        app.get('/orders', async (req, res) => {
            const userEmail = req.query.email;
            console.log(userEmail)
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            if (userEmail) {
                const newResult = result.filter(order => order.email === userEmail);
                res.send(newResult);
            } else {
                res.send(result);
            }

        })

        //get order using id
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await ordersCollection.findOne(query);
            console.log(id);
            res.send(order);
        })

        //delete order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log(result);
            console.log('deleting', id)
            res.json(result);
        });

        //update order
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const orderStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedStatus = {
                $set: {
                    status: orderStatus.status,
                }
            };
            const result = await ordersCollection.updateOne(filter, updatedStatus, options);
            res.json(result);
        })




        ////    REVIEW Operation ////
        //post reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);

        })

        //get reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const review = await cursor.toArray();
            res.send(review)
        })

        ////    USER info operation ////

        //sending user to db
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);

        })

        //getting user with email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        //update user if not in db
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateUser = {
                $set: user
            };
            const result = await usersCollection.updateOne(filter, updateUser, options);
            res.json(result)

        })

        //admin making
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = {
                $set: { role: 'admin' }
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
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