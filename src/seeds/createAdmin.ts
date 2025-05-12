import { ERoleType } from "../Core/app/enums";
import * as bcrypt from "bcrypt";
import { User } from "../DAL/models/User.model";

export const seedAdmin = async () => {
  const adminEmail = "sdftlbzd@gmail.com";

  const existingAdmin = await User.findOne({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log("Admin istifadəçi artıq mövcuddur.");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const Admin = new User();

  Admin.name = "Sədəf";
  Admin.surname = "Talıbzadə";
  Admin.email = adminEmail;
  Admin.password = hashedPassword;
  Admin.role = ERoleType.ADMIN;
  Admin.phone = "+994504881038";

  await User.save(Admin);
  console.log("Admin istifadəçi uğurla yaradıldı.");
};
