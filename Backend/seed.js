const { sequelize, User, Bill } = require("./models/index.js");

const DEFAULT_SEED_DATE = "2021-11-22";

const seedUsers = [
  {
    name: "employee",
    email: "employee@test.tld",
    type: "Employee",
    password: "$2b$10$8dXNkSLOvCOiGfuu5TSeKO/olqxTX5lQVqPvC9nTZfRmu2IRnazKO",
    status: "connected",
    key: "uoaRkMFrV67MKweoga5T3j",
  },
  {
    name: "admin",
    email: "admin@test.tld",
    type: "Admin",
    password: "$2b$10$IhfPi8qvCVD21lKeOvNgx.xdxFTJjHgWSn5jtY6LPSamCzvmseZ0m",
    status: "connected",
    key: "29hUAGWbj3F9eaW4D7PvE1",
  },
  {
    name: "employee",
    email: "employee@company.test",
    type: "Employee",
    password: "$2b$10$.iyo2Ye2vE/CGpKAQPQQfufdK9aSXY98MFXmqZRV1.//sYvSFHeXS",
    status: "connected",
    key: "6yUbmvvusnfjfRZ4ar8f1Y",
  },
  {
    name: "admin",
    email: "admin@company.tld",
    type: "Admin",
    password: "$2b$10$rERfsB9Dz/Co8XobKwAa4uaCSzq1hsimo4pau9WvdauHmnrMNVN6C",
    status: "connected",
    key: "fAhwNAEqrDAFs7MP46y5zx",
  },
];

const seedBills = [
  {
    key: "6g7PRkKM5gk35Fc2mw7JHw",
    vat: "40",
    status: "refused",
    type: "Transports",
    commentary: "Vol pour la vente de consommables",
    name: "Vol Paris Marseille",
    fileName: null,
    filePath: null,
    date: DEFAULT_SEED_DATE,
    amount: 240,
    commentAdmin: "",
    pct: 20,
    email: "employee@test.tld",
  },
  {
    key: "7to5QJDw6o4XWK9Wsjs7Go",
    vat: "20",
    status: "accepted",
    type: "Hôtel et logement",
    commentary: "",
    name: "Hôtel du centre ville",
    fileName: "bill-abcde.jpg",
    filePath: "public/4b392f446047ced066990b0627cfa444",
    date: DEFAULT_SEED_DATE,
    amount: 120,
    commentAdmin: "",
    pct: 20,
    email: "employee@test.tld",
  },
  {
    key: "d7vVuoPrxhBZog2Nya6oCW",
    vat: "10",
    status: "pending",
    type: "Restaurants et bars",
    commentary: "Repas pour la vente",
    name: "Repas d'affaire",
    fileName: "bill-efgh.jpg",
    filePath: "public/976fbc50929ab2852a517ff682c603f5",
    date: DEFAULT_SEED_DATE,
    amount: 60,
    commentAdmin: "",
    pct: 20,
    email: "employee@test.tld",
  },
  {
    key: "xAntdtPjo8zA42m5WhWcXR",
    vat: "40",
    status: "pending",
    type: "Transports",
    commentary: "Sales meeting",
    name: "Fly London Paris",
    fileName: null,
    filePath: null,
    date: DEFAULT_SEED_DATE,
    amount: 240,
    commentAdmin: "",
    pct: 20,
    email: "employee@company.test",
  },
  {
    key: "dMFWAp6UpHzNEqhK3aih29",
    vat: "10",
    status: "pending",
    type: "Restaurants et bars",
    commentary: "business meal",
    name: "Restaurant",
    fileName: "bill-abcde.jpg",
    filePath: "public/85026075b4d16cccb1a23011251f5c81",
    date: DEFAULT_SEED_DATE,
    amount: 60,
    commentAdmin: "",
    pct: 20,
    email: "employee@company.test",
  },
  {
    key: "nRHu1FXps8GDvNKwoQE7ma",
    vat: "20",
    status: "pending",
    type: "Hôtel et logement",
    commentary: "hotel room in city center",
    name: "Hotel room",
    fileName: "bill-efgh.jpg",
    filePath: "public/f8021afdeed2f9305e7120ae3af43383",
    date: DEFAULT_SEED_DATE,
    amount: 120,
    commentAdmin: "",
    pct: 20,
    email: "employee@company.test",
  },
];

const clearDatabase = async () => {
  try {
    await Bill.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await clearDatabase();
    await User.bulkCreate(seedUsers);
    console.log(`${seedUsers.length} users created`);

    await Bill.bulkCreate(seedBills);
    console.log(`${seedBills.length} bills created`);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

const resetDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to database established");

    await seedDatabase();

    await sequelize.close();
    console.log("Database reset completed");
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  resetDatabase();
}

module.exports = {
  clearDatabase,
  seedDatabase,
  resetDatabase,
};
