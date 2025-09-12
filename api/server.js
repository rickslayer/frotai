
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3001;

// MongoDB Connection String
const mongoUri = 'mongodb+srv://frotai:X7Ra8kREnBX6z6SC@frotai.bylfte3.mongodb.net/';
const dbName = 'frotai';
const collectionName = 'carros';

let db;

async function connectToMongo() {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected successfully to MongoDB');
    db = client.db(dbName);
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

// Middlewares
app.use(cors());
app.use(express.json());

// API Endpoint: GET /api/carros
app.get('/api/carros', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  try {
    const query = {};
    const { state, city, manufacturer, model, version, year } = req.query;

    if (state && state !== 'all') {
      query.UF = state;
    }
    if (city && city !== 'all') {
      query['Município'] = city;
    }
    if (manufacturer && manufacturer !== 'all') {
      query.Marca = manufacturer;
    }
    if (year && year !== 'all') {
      query.Ano = parseInt(year, 10);
    }

    // Complex handling for model and version, as they both filter the 'Modelo' field
    if (model && model !== 'all') {
      const modelRegex = new RegExp(`^${model}`, 'i');
      
      const versions = Array.isArray(version) ? version : (version ? [version] : []);
      
      if (versions.length > 0) {
        // If versions are specified, find documents where 'Modelo' starts with the model
        // AND contains one of the version strings.
        const versionRegexes = versions.map(v => new RegExp(v.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'));
        query.$and = [
          { 'Modelo': modelRegex },
          { 'Modelo': { $in: versionRegexes } }
        ];
      } else {
        // If no versions, just match the model start
        query['Modelo'] = modelRegex;
      }
    }


    const carros = await db.collection(collectionName).find(query).limit(50000).toArray();
    res.json(carros);
  } catch (err) {
    console.error('Error fetching data from MongoDB', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
  });
});
