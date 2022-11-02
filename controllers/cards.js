const mongoose = require('mongoose');
const cards = require('../models/card');

const getCards = async (req, res) => {
  try {
    const card = await cards.find({});
    res.send(card);
  } catch (err) {
    res.status(500).send({ message: 'Ошибка сервера' });
  }
};

const createCard = (req, res) => {
  const { name, link } = req.body;

  cards.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({ message: 'Ошибка валидации', err });
      }
      return res.status(500).send({ message: 'Ошибка сервера', err });
    });
};

const deleteCard = (req, res) => {
  cards.findByIdAndRemove(req.params.cardId).orFail(new Error('NotFound'))
    .then(() => res.status(200).send([]))
    .catch((err) => {
      if (err.message === 'NotFound') {
        return res.status(404).send({ message: 'Карточка не найдена', err });
      }
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send({ message: 'не корректный id', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const likeCard = (req, res) => {
  cards.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }
      return res.send(card);
    })
    .catch((err) => {
      // eslint-disable-next-line max-len
      if (err instanceof mongoose.Error.CastError || err instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({ message: 'Не корректные данные', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const dislikeCard = (req, res) => {
  cards.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }
      return res.send(card);
    })
    .catch((err) => {
      // eslint-disable-next-line max-len
      if (err instanceof mongoose.Error.CastError || err instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({ message: 'Не корректные данные', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
