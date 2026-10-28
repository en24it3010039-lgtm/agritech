require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db/config");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();