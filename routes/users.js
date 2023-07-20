const userRoutes = require('express').Router();

const {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

userRoutes.get('/users', getUsers);
userRoutes.get('/users/:userId', getUserById);
userRoutes.get('/users/me', getCurrentUser);
userRoutes.patch('/users/me', updateUser);
userRoutes.patch('/users/me/avatar', updateAvatar);

module.exports = userRoutes;
