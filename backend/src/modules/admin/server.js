const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Connect to database
  await connectDB();

  // 2. Listen on port
  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });
};

startServer();
