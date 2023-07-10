const express = require('express');
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
});

const app = express();

app.use(express.json());
// app.use(bodyParser.json());
app.use((req, res, next) => {
  req.user = {
    _id: '64ac173e58b57856294bd716',
  };

  next();
});
app.use(userRoutes);
app.use(cardRoutes);

app.listen(PORT, () => {
  console.log(`Application is running on port ${PORT}`);
});
