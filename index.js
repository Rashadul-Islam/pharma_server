const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const ObjectId = require('mongodb').ObjectID;



const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ldkov.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express()
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const userCollection = client.db("pharmacy").collection("users");
    const medicineCollection = client.db("pharmacy").collection("medicine");
    const SellingInfo = client.db("pharmacy").collection("sellInfo");
    //load specific user
    app.get('/users/:mail', (req, res) => {
        userCollection.find({ email: req.params.mail })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    //add medicine
    app.post('/addMedicine', (req, res) => {
        const newMedicine = req.body;
        medicineCollection.insertOne(newMedicine)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    //load all medicine
    app.get('/medicines', (req, res) => {
        medicineCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    //load medicine by name
    app.get('/medicine/:name', (req, res) => {
        medicineCollection.find({ genericName: req.params.name })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    //get search medicine
    app.get('/medicineSearch', (req, res) => {
        const search = req.query.search;
        medicineCollection.find({ genericName: { $regex: search } })
            .toArray((err, items) => {
                res.send(items)
            })
    })

    //load medicine by id
    app.get('/medicines/:id', (req, res) => {
        medicineCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    //delete medicine
    app.delete('/medicines/delete/:id', (req, res) => {
        medicineCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0)
            })
    })

    //edit medicine information
    app.patch('/medicine/update/:id', (req, res) => {
        medicineCollection.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: {
                    brandName: req.body.brandName,
                    genericName: req.body.genericName,
                    description: req.body.description,
                    originalPrice: req.body.originalPrice,
                    sellingPrice: req.body.sellingPrice,
                    receivedDate: req.body.receivedDate,
                    expireDate: req.body.expireDate,
                    quantity: req.body.quantity
                }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    //add member
    app.post('/addMember', (req, res) => {
        const newUser = req.body;
        userCollection.insertOne(newUser)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    //load all user
    app.get('/alluser', (req, res) => {
        userCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    //delete user
    app.delete('/users/delete/:id', (req, res) => {
        userCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0)
            })
    })

    //get search user
    app.get('/userSearch', (req, res) => {
        const search = req.query.search;
        userCollection.find({ name: { $regex: search } })
            .toArray((err, items) => {
                res.send(items)
            })
    })

    //load user by id
    app.get('/user/:id', (req, res) => {
        userCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    //edit user information
    app.patch('/user/update/:id', (req, res) => {
        userCollection.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: {
                    email: req.body.email,
                    name: req.body.name,
                    password: req.body.password,
                    role: req.body.role
                }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    //reduce quantity
    app.patch('/medicine/reduce/:id', (req, res) => {
        medicineCollection.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: {
                    quantity: req.body.quantity
                }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })

    //add Selling Info
    app.post('/addSell', (req, res) => {
        const newUser = req.body;
        SellingInfo.insertOne(newUser)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })


    //find sales between dates
    app.get('/report/:start/:end', (req, res) => {
        SellingInfo.find({
            date: {
                $gte: req.params.start,
                $lt: req.params.end
            }
        })
            .toArray((err, items) => {
                res.send(items)
            })
    })


    //find sales current dates
    app.get('/:date', (req, res) => {
        SellingInfo.find({ date: req.params.date })
            .toArray((err, items) => {
                res.send(items)
            })
    })
});

app.get('/', (req, res) => {

    res.send('Hello World!')
})

app.listen(process.env.PORT || port)