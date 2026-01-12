const app = require("./app.js");
const { sequelize } = require("./models/index.js");
const { seedDatabase } = require("./seed.js");

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to database established");
    await seedDatabase();

    app.listen(5678, () => {
      console.log("Example app listening on port 5678!");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
