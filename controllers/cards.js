const cardSchema = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const ForbidError = require('../errors/ForbidError');
const BadRequestError = require('../errors/BadRequestError');

function getCards(req, res, next) {
  return cardSchema
    .find({})
    .then((cards) => res.status(200).send(cards))
    .catch((error) => {
      next(error);
    });
}

function createCard(req, res, next) {
  const { name, link } = req.body;
  const owner = req.user._id;
  cardSchema
    .create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки.'));
      } else {
        next(error);
      }
    });
}

function deleteCard(req, res, next) {
  const { cardId } = req.params;

  cardSchema
    .findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Нет карточки с таким id');
      } else if (card.owner.toString() !== req.user._id) {
        throw new ForbidError('Нельзя удалять чужие карточки');
      } else {
        return cardSchema.findByIdAndRemove(cardId).then((deletedCard) => {
          res.status(200).send(deletedCard);
        });
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при удалении карточки.'));
      } else {
        next(error);
      }
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
        next(new BadRequestError('Карточка с указанным id не существует в базе данных'));
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
        next(new BadRequestError('Карточка с указанным id не существует в базе данных'));
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
