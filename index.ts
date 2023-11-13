//1. import packages
import express from 'express';
import cors from 'cors';
import { MongoClient , ObjectId } from 'mongodb';
import bcrypt from 'bcrypt'

import 'dotenv/config'

const client = new MongoClient(process.env.MONGO_URI as string)
const db = client.db('dinos-store')
const users = db.collection('users')

client.connect()

//2. use the packages
const app = express()
app.use(express.json())
app.use(cors())

//3. listen on port 
app.listen(process.env.PORT, () => console.log('api running here 😎'))

//4. create a get endpoint
app.get('/', async (req, res) => {
    const allUsers = await users.find().toArray()
    res.send(allUsers)
})

//5. create endpoint to add users

app.post('/', async (req, res) => {
    const userEmail = req.body.email
    const userPassword = req.body.password

    const hashPass = await bcrypt.hash(userPassword, 10)
    const userAdded = await users.insertOne({email: userEmail, password: hashPass})
    res.status(201).send(userAdded)
})

// 6. crete and delete endpoint by email with params 

app.delete('/:_id', async (req, res) => {
    const cleanId = new Object (req.params._id)
    console.log('req.params-->',req.params)
    const userDeleted = await users.findOneAndDelete({ _id: cleanId })
    res.send(userDeleted)
})

//7. create a patch endpoint by _id whit params
app.patch('/:_id', async(req, res) => {
    const cleanId = new Object(req.params._id)
    const itemUpdate = await users.findOneAndUpdate({ _id: cleanId }, { $set: req.body })
    res.send(itemUpdate)
})

//8. Login endpoint 
app.post('/login', async (req, res) => {
   const userPassword = req.body.password
    const foundUser =  await users.findOne({email : req.body.email})

    if(foundUser){
    const passInDb = foundUser?.password
     const result = await bcrypt.compare(userPassword, passInDb)
     console.log('result->', result) // true or false 

    res.send(foundUser)
    }else{
        res.json('User not found!!!❌')
    }
})




