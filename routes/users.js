const userRoutes = require('express').Router();
const validate = require('../middlewares/validation');

const {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

userRoutes.get('/users', getUsers);
userRoutes.get('/users/me', getCurrentUser);
userRoutes.get('/users/:userId', validate.validateGetUserById, getUserById);
userRoutes.patch('/users/me', validate.validateUpdateUser, updateUser);
userRoutes.patch('/users/me/avatar', validate.validateUpdateAvatar, updateAvatar);

module.exports = userRoutes;
