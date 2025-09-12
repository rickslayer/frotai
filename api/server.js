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

// API Endpoint: GET /carros
app.get('/api/carros', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database not connected' });
  }

  try {
    const query = {};
    
    // Mapeamento de parâmetros de consulta para campos do MongoDB
    const queryMap = {
      state: 'UF',
      city: 'Município',
      manufacturer: 'Marca',
      model: 'Modelo',
      year: 'Ano',
      // Adicione outros mapeamentos se necessário
    };

    for (const key in req.query) {
      if (req.query.hasOwnProperty(key)) {
        const dbField = queryMap[key] || key; // Usa o mapeamento ou a chave original
        let value = req.query[key];

        // Converte o ano para número, se for o campo 'Ano'
        if (dbField === 'Ano' && !isNaN(parseInt(value, 10))) {
          value = parseInt(value, 10);
        }
        
        query[dbField] = value;
      }
    }

    const carros = await db.collection(collectionName).find(query).toArray();
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
