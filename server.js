const express = require('express')
const app = express()
const cors = require('cors')
const {MongoClient, ObjectId} = require('mongodb')
const {respose} = require('express')
const {request} = request('http')
require('dotenv').config()
const PORT = 8000

let db, 
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log(`Connected to database`)
        db = client.db(dbName)
        collection = db.collection('movies')
    })

app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cors())

app.get("/search", async (request, respose) => {
    try{
        let result = await collection.aggregate([
            {
                "$Search" : {
                    "autocomplete" : {
                        "query" : `${request.query.query}`,
                        "path" : "title",
                        "fuzzy" : {
                            "maxEdits" : 2,
                            "prefixLength": 3

                        }
                    }
                }
            }
        ]).toArray()
        respose.send(result)
    }catch (error){
        respose.status(500).send({message: error.message})
    }
})

app.get("/get/:id", async (request, respose) => {
    try {
        let result = await collection.findOne({
            "_id" : ObjectId(request.params.id)
        })
        respose.send(result)
    }catch (error){
        respose.status(500).send({message: error.message})
    }
}
)
app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running`)
})