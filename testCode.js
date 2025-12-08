initialize();


console.log("/////////////////// TESTING  getAllProjects() /////////////////////")
let testArray = getAllProjects();
console.log(testArray);

console.log("/////////////////// TESTING  getProjectById() /////////////////////")
let specificProj = getProjectById(24);
console.log(specificProj);

console.log("/////////////////// TESTING  getProjectsBySector() /////////////////////")
let specificProjects = getProjectsBySector("portation");
console.log(specificProjects);