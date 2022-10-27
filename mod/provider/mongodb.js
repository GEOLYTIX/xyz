const { MongoClient } = require('mongodb');

module.exports = async ref => {

  const client = new MongoClient(process.env.MONGODB);

  try {
    
    const database = client.db(ref.split('/')[0]);
    const collection = database.collection(ref.split('/')[1]);
    const workspace = await collection.findOne({});
    console.log(workspace);
    return workspace
    
  } finally {

    // Ensures that the client will close when you finish/error
    await client.close();
  }

}