/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Santiago Camacho Moyano Student ID: 128242245 Date: 07 December 2025
*
* Published URL: https://assingment3-web322.vercel.app/ 

********************************************************************************/

const express = require('express'); 
const app = express(); 
const HTTP_PORT = process.env.PORT || 8080; 
const path = require('path');
const projectData = require("./modules/projects");
const Sequelize = require('sequelize');
 
require('pg'); 
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
express.urlencoded({extended:true});

app.listen(HTTP_PORT, () => {
  console.log('server listening on: ' + HTTP_PORT);
});

projectData.initialize()
  .catch((reason) => {
    console.log(reason);
  });


app.get('/', (req, res) => {
   res.render('home');
});


app.get('/about', (req, res) => {
   res.render('about');
});


app.get('/solutions/projects/:id', (req, res) => {
  console.log("\n/////////////////// TESTING  getProjectById() /////////////////////\n");
  projectData.getProjectById(req.params.id)
    .then(project => res.render("project", { project: project }))
    .catch((err) => {
      res.status(404).render("404", { message: err });
    });
});

app.get('/solutions/projects/', (req, res) => {
  if (req.query.sector) {
    projectData.getProjectsBySector(req.query.sector)
      .then((projects) => {
        res.render("projects", { projects: projects });
      })
      .catch(() => {
        res.status(404).render("404", { message: `No projects found for sector: <strong>${req.query.sector}</strong>` });
      });
  } else {
    projectData.getAllProjects()
      .then((projects) => {
        res.render("projects", { projects: projects });
      })
      .catch((err) => {
        res.status(404).render("404", { message: err });
      });
  }
});

app.get('/solutions/addProject', (req, res) => {
   res.render('addProject');
});

app.post('/solutions/addProject', (req, res) => {

    projectData.addProject(req.body)
      .then(() => {
        res.redirect('/solutions/projects/');
      })
      .catch(() => {
        res.render("500", { message: `We are sorry, an error has occurred: ${err}` });
      });
});




/*
  app.get('/solutions/projects', (req, res) => {
    console.log("\n/////////////////// TESTING  getAllProjects() /////////////////////\n")
    projectData.getAllProjects()
      .then(projectsArr => res.send(projectsArr))
  
      .catch((errText) => {
      console.log(errText);
    });
  });
  
  
  app.get('/solutions/projects/id-demo', (req, res) => {
    console.log("\n/////////////////// TESTING  getProjectById() /////////////////////\n")
    projectData.getProjectById(24)
      .then(data => res.send(data))
  
      .catch((errText) => {
      res.send(errText);
      });
  });
  
  
  
  app.get('/solutions/projects/sector-demo', (req, res) => {
  
  console.log("\n/////////////////// TESTING  getProjectsBySector() /////////////////////\n")
  projectData.getProjectsBySector("portation")
       .then((data) => {
      res.send(data);
    })
  
    .catch((errText) => {
      res.send(errText);
    });
  
  });
*/

app.use((req, res) => {
  res.status(404).render("404" , {message: 'Oops! It looks like this page does not exist, please check the URL resource.'});
});

