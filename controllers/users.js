const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = require('../models/users');
const ConflictError = require('../errors/ConflictError');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');

function getUsers(req, res, next) {
  return userSchema
    .find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      next(err);
    });
}

function getUserById(req, res, next) {
  userSchema
    .findById(req.params.userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь не найден');
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Пользователя с таким id не существует');
      }
      next(err);
    });
}

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Переданы некорректные данные');
  }

  userSchema
    .findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError(`Пользователь с таким ${email} уже существует`);
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => userSchema.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((newUser) => {
      res.send({
        _id: newUser._id,
        name: newUser.name,
        about: newUser.about,
        avatar: newUser.avatar,
        email: newUser.email,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Некорректные данные');
      } else {
        next(err);
      }
    });
};

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
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные');
      }
      next(err);
    });
}

function updateAvatar(req, res, next) {
  const { avatar } = req.body;
  const owner = req.user._id;
  userSchema
    .findByIdAndUpdate(owner, { avatar }, { new: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.status(200).send(user);
    })
    .catch((err) => next(err));
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
    .catch((err) => next(err));
}

function getCurrentUser(req, res, next) {
  userSchema
    .findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('Пользователь не найден');
    })
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError('Переданы некорректные данные');
      } else if (err.message === 'NotFound') {
        throw new NotFoundError('Пользователь не найден');
      }
    })
    .catch(next);
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
