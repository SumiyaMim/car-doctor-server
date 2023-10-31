const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vf2rev7.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const serviceCollection = client.db('carDoctor').collection('services');
    const checkoutCollection = client.db('carDoctor').collection('checkout');

    // get services
    app.get('/services', async (req, res) => {
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // get single service data
    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        // if only get title, price, img, service_id
        // const options = {
        //     projection: { title: 1, price: 1, service_id: 1, img: 1 },
        // };
        const result = await serviceCollection.findOne(query);
        res.send(result);
    })

    // send checkout data
    app.post('/checkout', async (req, res) => {
      const checkout = req.body;
      // console.log(checkout);
      const result = await checkoutCollection.insertOne(checkout);
      res.send(result);
    });

    // get checkout data
    app.get('/checkout', async (req, res) => {
      // console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
          query = { email: req.query.email }
      }
      const result = await checkoutCollection.find(query).toArray();
      res.send(result);
    })

    // update order status
    app.patch('/checkout/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedCheckout = req.body;
      console.log(updatedCheckout);
      const updateDoc = {
          $set: {
              status: updatedCheckout.status
          },
      };
      const result = await checkoutCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    // delete checkout data
    app.delete('/checkout/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await checkoutCollection.deleteOne(query);
      res.send(result);
    })

   
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Car Doctor Server is running')
})

app.listen(port, () => {
    console.log(`Car Doctor Server is running on port ${port}`)
})