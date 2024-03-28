const mongoose = require('mongoose');

// With this setup, Node.js application will connect to the MongoDB database
// specified in the connection string (mongodb://localhost:27017/coding_app).
// Make sure to replace coding_app with the name of your actual MongoDB database.

// Additionally, Mongoose schemas and models for your data collections, can be defined.
// (e.g., code blocks, users) and perform CRUD operations using these models. 

// To do next - defining schemas and models or performing database operations


const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/coding_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true, // Recommended to handle deprecation warnings
      useFindAndModify: false, // Recommended to handle deprecation warnings
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
