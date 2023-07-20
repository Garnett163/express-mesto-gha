const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = require('../models/users');

function getUsers(req, res, next) {
  return userSchema
    .find({})
    .then((users) => res.status(200).send(users))
    .catch(() => {
      next({ message: 'На сервере произошла ошибка' });
    });
}

function getUserById(req, res, next) {
  return userSchema
    .findById(req.params.userId)
    .then((user) => {
      if (!user) {
        next({ message: 'Нет пользователя с таким id' });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next({ message: 'Переданы некорректные данные' });
      } else {
        next({ message: 'На сервере произошла ошибка' });
      }
    });
}

function createUser(req, res, next) {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      userSchema.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      });
    })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next({
          message: 'Переданы некорректные данные при создании пользователя.',
        });
      } else {
        next({ message: 'На сервере произошла ошибка' });
      }
    });
}

function updateUser(req, res, next) {
  const { name, about } = req.body;
  const owner = req.user._id;
  userSchema
    .findByIdAndUpdate(
      owner,
      { name, about },
      { new: true, runValidators: true },
    )
    .then((user) => {
      if (!user) {
        next({ message: 'Нет пользователя с таким id' });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next({ message: 'Переданы некорректные данные' });
      } else {
        next({ message: 'На сервере произошла ошибка' });
      }
    });
}

function updateAvatar(req, res, next) {
  const { avatar } = req.body;
  const owner = req.user._id;
  userSchema
    .findByIdAndUpdate(owner, { avatar }, { new: true })
    .then((user) => {
      if (!user) {
        next({ message: 'Нет пользователя с таким id' });
      }
      return res.status(200).send(user);
    })
    .catch(() => next({ message: 'На сервере произошла ошибка' }));
}

function login(req, res, next) {
  const { email, password } = req.body;
  return userSchema
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', {
        expiresIn: '7d',
      });
      res.send({ token });
    })
    .catch((err) => {
      next({ message: err.message });
    });
}

function getCurrentUser(req, res, next) {
  userSchema
    .findById(req.user._id)
    .then((user) => {
      if (!user) {
        next({ message: 'Пользователь не найден' });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next({ message: 'Переданы некорректные данные' });
      } else {
        next({ message: 'На сервере произошла ошибка' });
      }
    });
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateAvatar,
  login,
  getCurrentUser,
};
