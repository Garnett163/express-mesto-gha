const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');

const { PORT = 3000 } = process.env;
const { MONGO_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const { login, createUser } = require('./controllers/users');

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
});

const app = express();

app.use(express.json());

userRoutes.post('/signin', login);
userRoutes.post('/signup', createUser);
app.use(auth);
app.use(userRoutes);
app.use(cardRoutes);
app.use(errorHandler);

app.use('/*', (req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});

app.listen(PORT, () => {
  console.log(`Application is running on port ${PORT}`);
});
