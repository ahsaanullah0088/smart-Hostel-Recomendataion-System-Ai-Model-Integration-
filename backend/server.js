const express = require('express');
const app = require('./app');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./db');
const PORT = process.env.PORT || 5000;
connectDB();


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}
);