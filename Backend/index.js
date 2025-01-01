const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const lessonRoutes = require('./routes/lessonRoutes.js');
const assignmentRoutes = require('./routes/assignmentRoutes.js');
const submissionRoutes = require('./routes/submissionRoutes.js');
const progressRoutes = require('./routes/progressRoutes.js');
const instructorRoutes = require('./routes/instructorRoutes.js');
const s3 = require('./config/s3Config.js');
const paymentRoutes = require('./routes/paymentRoutes.js');

const DB_URI = process.env.DB_URI;
const mongoose = require("mongoose");

mongoose
  .connect(DB_URI, null)
  .then(() => {
    console.log("MongoDB connection successful...");
  })
  .catch((err) => {
    console.log("MongoDB connection failed", err.message);
  });

const app = express();

app.use(express.static(path.join(__dirname)));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/user', userRoutes);
app.use('/course', courseRoutes);
app.use('/lesson', lessonRoutes);
app.use('/assignment', assignmentRoutes);
app.use('/submission', submissionRoutes);
app.use('/progress', progressRoutes);
app.use('/instructor', instructorRoutes);
app.use('/payment', paymentRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});