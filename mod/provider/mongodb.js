const { MongoClient } = require('mongodb');

module.exports = async params => {

  if (!process.env.MONGODB) return;

  const client = new MongoClient(process.env.MONGODB);

  try {
    
    const db = client.db(params.db);
    const collection = db.collection(params.collection);
    const response = await collection[params.cmd||'findOne'](params.query, params.options, params.lang);

    return response;

  } finally {

    // Ensures that the client will close when you finish/error
    await client.close();
  }

}