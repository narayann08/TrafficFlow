const express=require('express');
const app=require('./app');
const connectDB = require('./config/db');
require("dotenv").config();

// Connect to MongoDB
connectDB();

const PORT=process.env.PORT || 8000;

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
})
