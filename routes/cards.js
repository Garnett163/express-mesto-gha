const cardRoutes = require('express').Router();
const validate = require('../middlewares/validation');

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

cardRoutes.get('/cards', getCards);
cardRoutes.post('/cards', validate.validateCreateCard, createCard);
cardRoutes.delete('/cards/:cardId', validate.validateCardId, deleteCard);
cardRoutes.put('/cards/:cardId/likes', validate.validateCardId, likeCard);
cardRoutes.delete('/cards/:cardId/likes', validate.validateCardId, dislikeCard);

module.exports = cardRoutes;
