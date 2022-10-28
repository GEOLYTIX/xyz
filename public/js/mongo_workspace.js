const { MongoClient } = require('mongodb');

module.exports = async req => {

  if (!process.env.MONGODB) return;

  const client = new MongoClient(process.env.MONGODB);

  try {
    
    const db = client.db(req.params.db);
    const collection = db.collection(req.params.collection);
    const response = await collection[req.params.cmd||'findOne'](req.params.query, req.params.options, req.params.lang);

    return response;

  } finally {

    // Ensures that the client will close when you finish/error
    await client.close();
  }

}