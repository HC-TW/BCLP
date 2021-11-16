const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const path = require('path');
const db = require('./models')
const services = require('./services');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());
app.use(cors());

// Mount REST on /api
app.use('/api', services);

try {
  db.sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

// If you don't want to drop, leave empty.
// db.sequelize.sync();
db.sequelize.sync({ force: true }).then( () => {
  console.log("Drop and re-sync db.")
});

app.listen(process.env.PORT || 8080);

//module.exports = app;