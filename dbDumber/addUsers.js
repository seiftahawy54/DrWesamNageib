import { Users } from "../models/index.js";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

(async () => {
  try {
    for (let i = 0; i < 1; i++) {
      const firstName = faker.name.firstName();
      const middleName = faker.name.middleName();
      const lastName = faker.name.lastName();
      const email = faker.internet.email();
      const whatsapp_no = faker.phone.number();
      const specialization = faker.name.jobTitle();
      const encryptionResult = await bcrypt.hash("123456789", 12);

      Users.create({
        name: firstName + " " + middleName + " " + lastName,
        email: email,
        whatsapp_no: whatsapp_no,
        specialization: specialization,
        password: encryptionResult,
        cart: [],
        type: 2,
      });
    }

    console.log("users added successfully");
  } catch (e) {
    console.log("adding users failed");
    console.log(e);
  }
})();
