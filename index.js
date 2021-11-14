const express = require("express");
const app = express();
var cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
app.use(cors());
app.use(express.json());
var ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pas4h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("RealVilla");
    const propertiesCollection = database.collection("properties");
    const orderCollection = database.collection("order_properties");
    const userCollection = database.collection("users");
    const reviewCollection = database.collection("users_reviews");

    //Get All property List
    app.get("/properties", async (req, res) => {
      const cursor = propertiesCollection.find({});
      if ((await cursor.count()) === 0) {
        console.log("No documents found!");
      }
      const result = await cursor.toArray();
      res.json(result);
    });
    //Get All Reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      if ((await cursor.count()) === 0) {
        console.log("No documents found!");
      }
      const result = await cursor.toArray();
      res.json(result);
    });

    //Get All property List
    app.get("/order-propertylist", async (req, res) => {
      const cursor = orderCollection.find({});
      if ((await cursor.count()) === 0) {
        console.log("No documents found!");
      }
      const result = await cursor.toArray();
      res.json(result);
    });

    //Get Admin List
    app.get("/adminlist", async (req, res) => {
      const cursor = userCollection.find({ role: "admin" });
      if ((await cursor.count()) === 0) {
        console.log("No documents found!");
      }
      const result = await cursor.toArray();
      res.json(result);
    });

    //Get Single Property Details
    app.get("/property/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await propertiesCollection.findOne(query);
      res.json(result);
    });

    //Post User Information
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    //Post order Property
    app.post("/order-property", async (req, res) => {
      const order_details = req.body;
      const result = await orderCollection.insertOne(order_details);
      res.json(result);
    });

    //Delete order
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
    //Delete property
    app.delete("/delete-property/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await propertiesCollection.deleteOne(query);
      res.json(result);
    });

    //Get User order List
    app.get("/my-orders/:id", async (req, res) => {
      const uid = [req.params.id];
      const query = { uid: { $in: uid } };
      const result = await orderCollection.find(query).toArray();
      res.json(result);
    });

    //Make Admin
    app.put("/make-admin", async (req, res) => {
      const adminData = req.body;
      const filter = { email: adminData.email };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //Get Single userinfo Details
    app.get("/user/:id", async (req, res) => {
      const uid = req.params.id;
      const query = { uid: uid };
      const result = await userCollection.findOne(query);
      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
      }
      res.json(isAdmin);
    });
    //Get Single order Details
    app.get("/orderlist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.json(result);
    });
    //update order status
    app.put("/update-order-status/:id", async (req, res) => {
      const id = req.params.id;
      const property = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: property.status,
        },
      };
      const result = await orderCollection.updateOne(query, updateDoc, options);
      res.json(result);
    });
    //Insert new property
    app.post("/addproperty", async (req, res) => {
      const new_property_details = req.body;
      const result = await propertiesCollection.insertOne(new_property_details);
      res.json(result);
    });
    //Insert new review
    app.post("/review", async (req, res) => {
      const new_review = req.body;
      const result = await reviewCollection.insertOne(new_review);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Real Villa");
});

app.listen(port, () => {
  console.log(`Running Port:${port}`);
});
