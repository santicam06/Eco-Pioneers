
const express = require('express'); 
const app = express(); 
const HTTP_PORT = process.env.PORT || 8080; 
const path = require('path');
const projectData = require("./modules/projects");
const Sequelize = require('sequelize');
const clientSessions = require('client-sessions');
const { ensureLogin } = require('./middleware/auth');

require('pg'); 
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended:true}));

app.use(
  clientSessions({
    cookieName: 'session', 
    secret: process.env.SESSIONSECRET,
    duration: 3 * 60 * 1000, // duration of the session in milliseconds (3 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Server only starts after the database connection is confirmed
projectData.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log('server listening on: ' + HTTP_PORT);
    });
  })
  .catch((reason) => {
    console.log(`Unable to start server: ${reason}`);
  });


app.get('/', (req, res) => {
  projectData.getAllProjects()
    .then((projects) => {
      // Create a copy of the array and shuffle it
      const shuffled = [...projects].sort(() => 0.5 - Math.random());
      // Pick the first 3 projects from the shuffled list
      const randomProjects = shuffled.slice(0, 3);
      res.render('home', { projects: randomProjects });
    })
    .catch((err) => {
      res.status(500).render("500", { message: `Unable to load featured projects: ${err}` });
    });
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

app.get('/solutions/addProject', ensureLogin, (req, res) => {
  res.render('addProject');
});

app.post('/solutions/addProject', ensureLogin, (req, res) => {

  projectData.addProject(req.body)
    .then(() => {
      res.redirect('/solutions/projects/');
    })
    .catch((err) => {
      res.render("500", { message: `We are sorry, an error has occurred: ${err}` });
    });
});


app.get('/solutions/editProject/:id', ensureLogin, (req, res) => {

  projectData.getProjectById(req.params.id)
    .then(project => res.render("editProject", { project: project }))
    .catch((err) => {
      res.status(404).render("404", { message: err });
    });
});

app.post('/solutions/editProject', ensureLogin, (req, res) => {

    projectData.editProject(req.body.id, req.body)
      .then(() => {
        res.redirect(`/solutions/projects/${req.body.id}`);
      })
      .catch((err) => {
        res.render("500", { message: `We are sorry, an error has occurred: ${err}` });
      });
});


app.post('/solutions/deleteProject/:id', ensureLogin, (req, res) => {

  projectData.deleteProject(req.params.id)
    .then(() => res.redirect("/solutions/projects/"))
    .catch((err) => {
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

