const mongoose = require("mongoose");

const uri = "mongodb+srv://Tymor:Tymor123@shulacluster.ged8w.mongodb.net/ShulaDB?retryWrites=true&w=majority";

mongoose.set("debug", true);

mongoose.connect(uri)
    .then(() => {
        console.log("✅ Connected to MongoDB Atlas");
        mongoose.connection.close();
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
    });
