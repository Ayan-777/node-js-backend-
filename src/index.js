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