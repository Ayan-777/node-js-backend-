import dotenv from 'dotenv';
import express from 'express';
import connectDB from './db/index.js';
import {app } from './app.js'

// Initialize dotenv
dotenv.config({
  path: './.env'
});




// Connect to the database
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('MONGODB connection failed !!', err);
  });




  


  
// If you want to keep the commented-out code, make sure it's properly commented out:
/*
(async () => {
  try {
    await mongoose.connect(`process.env.MONGODB_URI/${DB_NAME}`);
    app.on('error', (err) => {
      console.log('ERROR:', err);
      throw err;
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('ERROR:', error);
    throw error;
  }
})();
*/
