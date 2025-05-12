import { AppDataSource } from "../DAL/config/data-source";
import { seedAdmin } from "./createAdmin";

AppDataSource.initialize()
  .then(async () => {
    console.log("Verilənlər bazası ilə əlaqə quruldu.");
    await seedAdmin();
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeder xətası:", error);
    process.exit(1);
  });
