// initialise
// npm i mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// connection setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// function to retrive data

async function retrieveData() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Retrieve only 'link' field from all documents
        const data = await collection.find({}, { projection: { link: 1, _id: 0 } }).toArray();
        vidlinks = data.map(item => item.link);
        console.log('Retrieved data:', vidlinks);
    } catch (err) {
        console.error('Error retrieving data:', err);
    } finally {
        await client.close();
    }
}
retrieveData();


// Function to update data in MongoDB
async function updateData(field, input, output) {
    try {
        await client.connect();
        const database = client.db('askeladd'); // Replace with your actual database name
        const collection = database.collection('plots'); // Replace with your actual collection name

        const result = await collection.updateMany(
            { [field]: { $regex: input } }, // Filter documents with the input value in the specified field
            [
                {
                    $set: {
                        [field]: {
                            $replaceOne: {
                                input: `$${field}`,
                                find: input,
                                replacement: output
                            }
                        }
                    }
                }
            ]
        );

        console.log(`Matched ${result.matchedCount} documents and modified ${result.modifiedCount} documents.`);
    } catch (error) {
        console.error("Error during updateData operation:", error);
    } finally {
        await client.close();
    }
}

const field = 'link'; // Replace with your actual field name
const input = 'jpg'; // Replace with your actual input value
const output = 'mp4'; // Replace with your actual output value
updateData(field, input, output);


// function to add data

async function addData(links) {
    try {
        await client.connect();
        const database = client.db('askeladd'); // Replace with your actual database name
        const collection = database.collection('general'); // Replace with your actual collection name

        for (const link of links) {
            const linkData = { link }; // Store the link in an object
            try {
                const result = await collection.insertOne(linkData); // Insert each link
                console.log(`New document inserted with _id: ${result.insertedId}`);
            } catch (error) {
                if (error.code === 11000) {
                    console.error(`Duplicate link found: ${link}. Skipping insertion.`);
                } else {
                    console.error("Error inserting data:", error);
                }
            }
        }
    } catch (error) {
        console.error("Error during addData operation:", error);
    } finally {
        await client.close();
    }
}

addData(links);


// shuffle data
  async function shuffleDocuments() {
    client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
    try {
      const shuffledData = await db.collection(collectionName).aggregate([
        { $sample: { size: 10 } } // Sample 10 random documents
      ]).toArray();
  
      console.log(shuffledData); // Now you get the resolved value
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  shuffleDocuments();



