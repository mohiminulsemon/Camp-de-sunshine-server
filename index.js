const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.02w34e6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db("campdb").collection("users");
    const classesCollection = client.db("campdb").collection("classes");
    const bookingsCollection = client.db("campdb").collection("bookings");

    app.get("/", (req, res) => {
      res.send("camp Server is running..");
    });

    // <<<<<<<<<-------------------------------------------Users------------------------------------------->>>

    // Save user email and role in DB
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      console.log(result);
      res.send(result);
    });

    // Get user
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      console.log(result);
      res.send(result);
    });
    // Get all user
    app.get("/users", async (req, res) => {
      const user = usersCollection.find();
      const result = await user.toArray();
      res.send(result);
    });
    //  <<<<<<< -------------------------------- Classes ------------------------------------>>>>>>>>>>

    // Get all classes
    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      // const result = await classesCollection.find().sort({availableSeats: -1}).toArray();
      res.send(result);
    });

    // delete class
    app.delete("/classes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.deleteOne(query);
      res.send(result);
    });

    // Get a single class by instructor's
    app.get("/classes/:email", async (req, res) => {
      const email = req.params.email;
      const query = { instructorEmail: email };
      const result = await classesCollection.find(query).toArray();

      console.log(result);
      res.send(result);
    });

    // // Get a single class by id
    app.get("/classes/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };

      const data = await classesCollection.findOne(filter);

      res.send(data);
    });

    //update class status
    app.patch("/classes/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const user = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: user,
      };

      const result = await classesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Save a class in database
    app.post("/classes", async (req, res) => {
      const classData = req.body;
      console.log(classData);
      const result = await classesCollection.insertOne(classData);
      res.send(result);
    });

    // <<<-------------------------------------------Bookings ------------------------------------------>>>>>

    // Get all bookings
    app.get("/bookings", async (req, res) => {
      const result = await bookingsCollection.find({}).toArray();
      res.send(result);
    });

    // Get bookings for guest
    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { studentEmail: email };

      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    //update payment status
    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const user = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: user,
      };

      const result = await bookingsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Save a booking in database
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    // // Get a single booking by id
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;

      const data = await bookingsCollection.findOne({ _id: new ObjectId(id) });

      res.send(data);
    });
    // delete a booking

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`camp is running on port ${port}`);
});
