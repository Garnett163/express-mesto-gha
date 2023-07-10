const cardSchema = require('../models/card');

function getCards(req, res) {
  return cardSchema
    .find({})
    .then((cards) => res.status(200).send(cards))
    .catch(() => {
      res.status(500).send({ message: 'Произошла ошибка' });
    });
}

function createCard(req, res) {
  const { name, link } = req.body;
  const owner = req.user._id;
  cardSchema
    .create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({
          message: 'Переданы некорректные данные при создании карточки.',
        });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
}

function deleteCard(req, res) {
  const { id } = req.params;
  return cardSchema
    .findById(id)
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Нет карточки с таким id' });
      }
      return cardSchema.findByIdAndRemove(id).then((removeCard) => {
        res.status(200).res.send(`${removeCard} успешно удалена`);
      });
    })
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
}

function likeCard(req, res) {
  cardSchema
    .findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .status(400)
          .send({ message: 'Переданы некорректные данные' });
      }
      if (err.name === 'DocumentNotFoundError') {
        return res.status(404).send({ message: 'Нет карточки с таким id' });
      }
      return res.status(500).send({ message: 'Произошла ошибка' });
    });
}

function dislikeCard(req, res) {
  cardSchema
    .findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res
          .status(400)
          .send({ message: 'Переданы некорректные данные' });
      }
      if (err.name === 'DocumentNotFoundError') {
        return res.status(404).send({ message: 'Нет карточки с таким id' });
      }
      return res.status(500).send({ message: 'Произошла ошибка' });
    });
}

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
