const cardSchema = require('../models/card');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ForbidError = require('../errors/ForbidError');

function getCards(req, res, next) {
  return cardSchema
    .find({})
    .then((cards) => res.status(200).send(cards))
    .catch((err) => {
      next(err);
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
        throw new ValidationError(
          'Переданы некорректные данные при создании карточки.',
        );
      } else {
        next(err);
      }
    });
}

function deleteCard(req, res, next) {
  const { cardId } = req.params;

  cardSchema.findById(cardId).then((card) => {
    if (!card) {
      throw new NotFoundError('Нет карточки с таким id');
    }
    if (card.userId !== req.user._id) {
      throw new ForbidError('Нельзя удалять чужие карточки');
    }
    cardSchema
      .findByIdAndRemove(cardId)
      .then((deletedCard) => {
        res.status(200).send(deletedCard);
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          throw new NotFoundError(
            'Переданы некорректные данные при удалении карточки.',
          );
        }
        next(err);
      });
  });
}

function likeCard(req, res, next) {
  const { cardId } = req.params;

  cardSchema
    .findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным id не найдена');
      } else {
        cardSchema
          .findByIdAndUpdate(
            req.params.cardId,
            { $addToSet: { likes: req.user._id } },
            { new: true },
          )
          .then((cardLiked) => res.status(200).send(cardLiked));
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        throw new NotFoundError(
          'Карточка с указанным id не существует в базе данных',
        );
      } else {
        next(error);
      }
    });
}

function dislikeCard(req, res, next) {
  const { cardId } = req.params;

  cardSchema
    .findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным id не найдена');
      } else {
        cardSchema
          .findByIdAndUpdate(
            req.params.cardId,
            { $pull: { likes: req.user._id } },
            { new: true },
          )
          .then((cardDisliked) => res.status(200).send(cardDisliked));
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        throw new NotFoundError(
          'Карточка с указанным id не существует в базе данных',
        );
      } else {
        next(error);
      }
    });
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
