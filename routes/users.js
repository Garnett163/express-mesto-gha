const userRoutes = require('express').Router();

const { getUsers, getUserById, createUser } = require('../controllers/users');

userRoutes.get('/users', getUsers);
userRoutes.get('/:userId', getUserById);
userRoutes.post('/users', createUser);

module.exports = userRoutes;
