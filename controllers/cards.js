const cardSchema = require('../models/card');

function getCards(req, res, next) {
  return cardSchema
    .find({})
    .then((cards) => res.status(200).send(cards))
    .catch(() => {
      next({ message: 'На сервере произошла ошибка' });
    });
}

function createCard(req, res, next) {
  const { name, link } = req.body;
  const owner = req.user._id;
  cardSchema
    .create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next({
          message: 'Переданы некорректные данные при создании карточки.',
        });
      } else {
        next({ message: 'На сервере произошла ошибка' });
      }
    });
}

function deleteCard(req, res, next) {
  const { cardId } = req.params;

  cardSchema.findById(cardId).then((card) => {
    if (!card) {
      next({ message: 'Нет карточки с таким id' });
    }
    if (card.userId !== req.user._id) {
      next({ message: 'Нельзя удалять чужие карточки' });
    }
    cardSchema
      .findByIdAndRemove(cardId)
      .then((deletedCard) => {
        res.status(200).send(deletedCard);
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          next({
            message: 'Переданы некорректные данные при удалении карточки.',
          });
        }
        next({ message: 'На сервере произошла ошибка' });
      });
  });
}

function likeCard(req, res, next) {
  cardSchema
    .findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
    .orFail()
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next({ message: 'Переданы некорректные данные' });
      }
      if (err.name === 'DocumentNotFoundError') {
        next({ message: 'Нет карточки с таким id' });
      }
      next({ message: 'На сервере произошла ошибка' });
    });
}

function dislikeCard(req, res, next) {
  cardSchema
    .findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
    .orFail()
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        next({ message: 'Переданы некорректные данные' });
      }
      if (err.name === 'DocumentNotFoundError') {
        next({ message: 'Нет карточки с таким id' });
      }
      next({ message: 'На сервере произошла ошибка' });
    });
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
