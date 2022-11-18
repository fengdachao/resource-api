var { MongoClient, ServerApiVersion } = require('mongodb');

function db () {
  let _client = null
  let _collection = null
  let _db = null

  const connect = async function(dbName = 'recording', collectionName = 'list') {
    // const uri = "mongodb://dachao:dachao@cluster0-shard-00-00.veb9b.mongodb.net:27017,cluster0-shard-00-01.veb9b.mongodb.net:27017,cluster0-shard-00-02.veb9b.mongodb.net:27017/?ssl=true&replicaSet=atlas-ee4eye-shard-0&authSource=admin&retryWrites=true&w=majority"
    const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.0"
    _client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
    await _client.connect()
    console.log('connect mongo successfully...')
    _collection = _client.db(dbName).collection(collectionName)
    _db = _client.db(dbName)
  }

  const find = async function(params = {}, collectionName) {
    if (_db === null) await connect()
    const result = await _db.collection(collectionName).find(params).toArray()
    console.log('result:', result)
    return result
  }

  const findOne = async function(params ={}, collectionName) {
    if (_db === null) await connect()
    const result = await _db.collection(collectionName).findOne(params)
    console.log('result:', result)
    return result
  }

  const insertOne = async function(doc, collectionName) {
    if (_db === null) await connect()
    const result = await _db.collection(collectionName).insertOne(doc)
    return result
  }

  const deleteOne = async function(id, collectionName) {
    return await _db.collection(collectionName).deleteOne({ id })
  }

  const updateOne = async function(filter, doc, collectionName) {
    if (_db === null) await connect()
    console.log('filter:', filter)
    const found = await findOne(filter, collectionName)
    console.log('found:', found)
    return await _db.collection(collectionName).updateOne(filter, { $set: doc })
  }

  return {
    find,
    findOne,
    insertOne,
    updateOne,
    deleteOne,
  }
}

module.exports = db
