export const sortCourses = (courses) => {
  let coursesRanks = [];
  const coursesArr = courses;

  // Extract Ranks
  for (let coursesArrKey in coursesArr) {
    coursesRanks[coursesArrKey] = coursesArr[coursesArrKey].course_rank;
  }

  // Sort Based On Ranking
  coursesRanks = coursesRanks.sort((a, b) => a - b);

  // Get All Courses In Ranking
  return coursesRanks.map((rank) => {
    return coursesArr.find((course) => course.course_rank === rank);
  });
};
