try {

  const { MongoClient } = require('mongodb');
} catch {

  console.log('MONOGODB module is not available.')
}

module.exports = async params => {

  if (!MongoClient) return;

  if (!process.env.MONGODB) return;

  const client = new MongoClient(process.env.MONGODB);

  try {
    
    const db = client.db(params.db);
    const collection = db.collection(params.collection);
    const response = await collection.findOne(params.query, params.options, params.lang);

    return response;

  } finally {

    // Ensures that the client will close when you finish/error
    await client.close();
  }

}