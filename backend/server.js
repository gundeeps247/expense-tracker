const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { router: authRouter } = require("./routes/auth");
const expensesRouter = require("./routes/expenses");

const app = express();
app.use(bodyParser.json());
const corsOptions = {
  origin: 'https://expense-tracker-lac-two.vercel.app',
  methods: ['GET', 'POST'], // Specify the methods you allow
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify the headers you allow
};

app.use(cors(corsOptions));

mongoose.connect(
  "mongodb+srv://gundeepsinghm:nRMpOnlEH53OMA2V@cluster0.zhiocaw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.use("/api/auth", authRouter); // Correct route
app.use("/api/expenses", expensesRouter); // Correct route


// Error handling middleware
app.use(function(err, req, res, next) {
  console.error(err.stack); // Log the error stack trace for debugging
  res.status(500).send('Something broke!'); // Send a generic error response
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
