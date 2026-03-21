const express=require("express");
const app=express();
const cors=require('cors');
const predictRoute=require('./routes/predict.route');
app.use(cors());

app.use(express.json());

app.use("/api",predictRoute);
module.exports=app;