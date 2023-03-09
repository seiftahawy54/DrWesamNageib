import { Courses } from "../models/index.js";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

(async () => {
  try {
    for (let i = 0; i < 70; i++) {
      const courseName = faker.commerce.productName(),
        coursePrice = faker.commerce.price(),
        courseImage = faker.image.imageUrl(),
        detailedImage = faker.image.imageUrl(),
        courseDescription = faker.commerce.productDescription(),
        courseArName = faker.commerce.productName(),
        courseThumbnail = faker.image.imageUrl(),
        courseRank = faker.random.numeric(3),
        specialCourse = Math.round(Math.random() * 10) % 2 === 0 ? true : false,
        courseCategory = faker.commerce.productName(),
        courseTotalHours = faker.random.numeric(3);

      Courses.create({
        name: courseName,
        price: coursePrice,
        course_img: courseImage,
        detailed_img: detailedImage,
        description: courseDescription,
        ar_course_name: courseArName,
        course_thumbnail: courseThumbnail,
        course_rank: courseRank,
        special_course: specialCourse,
        course_category: courseCategory,
        total_hours: courseTotalHours,
      });
    }

    console.log("users added successfully");
  } catch (e) {
    console.log("adding users failed");
    console.log(e);
  }
})();
