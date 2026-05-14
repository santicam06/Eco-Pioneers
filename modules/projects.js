require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');


let sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
});


const Sector = sequelize.define('Sector', {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true, 
    autoIncrement: true
  },
  sector_name: Sequelize.STRING,
},
 {
    createdAt: false, 
    updatedAt: false 
 }
);


const Project = sequelize.define('Project', {

  id: { 
  type: Sequelize.INTEGER, 
  primaryKey: true, 
  autoIncrement: true
  },
  sector_id: Sequelize.INTEGER,
  title: Sequelize.STRING,
  feature_img_url: Sequelize.STRING,
  summary_short: Sequelize.TEXT,
  intro_short: Sequelize.TEXT,
  impact: Sequelize.TEXT,
  original_source_url: Sequelize.STRING,
},
{
    createdAt: false, 
    updatedAt: false,
}
);


Project.belongsTo(Sector, {foreignKey: 'sector_id'});


function initialize() {
    return new Promise((resolve, reject) => {

        sequelize.sync()
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject(err);
            });
    });
}


function getAllProjects() {
    return new Promise((resolve, reject) => {

        Project.findAll({
            include: [Sector],
        })
        .then((projects) => {
            resolve(projects); // <-- resolve with all projects
        })
        .catch((err) => {
            reject(err);
        });
    });
}


function getProjectById(projectID) {
    
    return new Promise((resolve, reject) => {
        Project.findAll({
            include: [Sector],
            where: { id: projectID }
        })
        .then((projects) => {
            if (projects.length > 0) {
                resolve(projects[0]);
            } else {
                reject("Unable to find requested project.");
            }
        })
        .catch((err) => {
            reject("Unable to find requested project: " + err);
        });
    });
} 


function getProjectsBySector(sectorPhr) {

    return new Promise((resolve, reject) => {

        // ensure sectorPhr is a string
        if (sectorPhr == null) {               
          sectorPhr = '';
        } else if (typeof sectorPhr !== 'string') {
          sectorPhr = String(sectorPhr);
        }

        // then trim / limit length / escape wildcards
        sectorPhr = sectorPhr.trim().slice(0, 200);
        const safePhr = sectorPhr.replace(/([\\%_])/g, m => '\\' + m);

        Project.findAll({
            include: [Sector],
            where: { '$Sector.sector_name$': {
                [Sequelize.Op.iLike]: `%${safePhr.trim()}%`} 
            }
        })
        .then((projects) => {
          
            if (projects.length > 0) {
                resolve(projects);
            } else {
                reject("Unable to find requested project(s) with this phrase.");
            }
        })
        .catch((err) => {
            reject("Unable to find requested project: " + err);
        });
    });
}


function addProject(projectData) {

    return new Promise((resolve, reject) => {
        
        Project.create(projectData)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err.errors[0].message);
        });
    });

}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector, addProject }




