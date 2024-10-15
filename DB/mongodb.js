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

