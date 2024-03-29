const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');

const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');
const validate = require('./middlewares/validation');

const { PORT = 3000 } = process.env;
const { MONGO_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;
const { login, createUser } = require('./controllers/users');
const NotFoundError = require('./errors/NotFoundError');

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
});

const app = express();

app.use(express.json());

app.post('/signin', validate.validateLogin, login);
app.post('/signup', validate.validateCreateUser, createUser);

app.use(auth);
app.use(userRoutes);
app.use(cardRoutes);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена!'));
});

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Application is running on port ${PORT}`);
});
