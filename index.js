const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 7052;

// Middlewares

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const { MongoClient, ServerApiVersion , ObjectId} = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pf5eojy.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);


const tasksCollection = client.db("task_manager").collection("tasks");

// Create a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = { title, description, status };
    const result = await tasksCollection.insertOne(task);
    task._id = result.insertedId;
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await tasksCollection.find({}).toArray();
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task by ID
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, status } = req.body;
    const updatedTask = { title, description, status };
    await tasksCollection.updateOne({ _id: new ObjectId(taskId) }, { $set: updatedTask });
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task by ID
app.delete('/api/tasks/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await tasksCollection.deleteOne(query);
  res.send(result);
})

app.listen(port, () => {
  console.log(`Manager is showing on port ${port}`);
});
