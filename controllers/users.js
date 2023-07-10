const userSchema = require('../models/users');

function getUsers(req, res) {
  return userSchema
    .find({})
    .then((users) => res.status(200).send(users))
    .catch(() => {
      res.status(500).send({ message: 'Произошла ошибка' });
    });
}

function getUserById(req, res) {
  const { id } = req.params;
  return userSchema
    .findById(id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Нет пользователя с таким id' });
      }
      return res.status(200).send(user);
    })
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
}

function createUser(req, res) {
  const { name, about, avatar } = req.body;
  userSchema
    .create({ name, about, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({
          message: 'Переданы некорректные данные при создании пользователя.',
        });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
};
