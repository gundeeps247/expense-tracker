const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { router: authRouter } = require("./routes/auth");
const expensesRouter = require("./routes/expenses");

const app = express();
app.use(bodyParser.json());

// Use CORS middleware to allow all origins
app.use(cors({
  origin: '*', // Allow requests from all origins
  methods: ['GET', 'POST'], // Allow methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers
}));

mongoose.connect(
  "mongodb+srv://gundeepsinghm:nRMpOnlEH53OMA2V@cluster0.zhiocaw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  ssl: true, // Enable SSL/TLS
  sslValidate: true, 
  }
);

app.use("/api/auth", authRouter); // Route for authentication
app.use("/api/expenses", expensesRouter); // Route for expenses

// Error handling middleware
app.use(function(err, req, res, next) {
  console.error(err.stack); // Log the error stack trace for debugging
  res.status(500).send('Something broke!'); // Send a generic error response
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
