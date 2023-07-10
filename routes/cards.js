const cardRoutes = require('express').Router();

const { getCards, createCard, deleteCard } = require('../controllers/cards');

cardRoutes.get('/cards', getCards);
cardRoutes.post('/cards', createCard);
cardRoutes.delete('/cards/:cardId', deleteCard);

module.exports = cardRoutes;
