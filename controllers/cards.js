const mongoose = require('mongoose');
const cards = require('../models/card');

const getCards = async (req, res, next) => {
  try {
    const card = await cards.find({});
    return res.send(card);
  } catch (e) {
    const err = new Error('На сервере произошла ошибка');
    err.statusCode = 500;
    return next(err);
  }
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;

  cards.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        const err = new Error('Ошибка валидации');
        err.statusCode = 400;
        return next(err);
      }
      const err = new Error('На сервере произошла ошибка');
      err.statusCode = 500;
      return next(err);
    });
};

const deleteCard = (req, res, next) => {
  cards.findByIdAndRemove(req.params.cardId).orFail(new Error('NotFound'))
    .then(() => res.status(200).send([]))
    .catch((e) => {
      if (e.message === 'NotFound') {
        const err = new Error('Карточка не найдена');
        err.statusCode = 404;
        return next(err);
      }
      if (e instanceof mongoose.Error.CastError) {
        const err = new Error('не корректный id');
        err.statusCode = 400;
        return next(err);
      }
      const err = new Error('На сервере произошла ошибка');
      err.statusCode = 500;
      return next(err);
    });
};

const likeCard = (req, res, next) => {
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
    .catch((e) => {
      // eslint-disable-next-line max-len
      if (e instanceof mongoose.Error.CastError || e instanceof mongoose.Error.ValidationError) {
        const err = new Error('Не корректные данные');
        err.statusCode = 400;
        return next(err);
      }
      const err = new Error('На сервере произошла ошибка');
      err.statusCode = 500;
      return next(err);
    });
};

const dislikeCard = (req, res, next) => {
  cards.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        const err = new Error('Карточка не найдена');
        err.statusCode = 404;
        return next(err);
      }
      return res.send(card);
    })
    .catch((e) => {
      // eslint-disable-next-line max-len
      if (e instanceof mongoose.Error.CastError || e instanceof mongoose.Error.ValidationError) {
        const err = new Error('Не корректные данные');
        err.statusCode = 400;
        return next(err);
      }
      const err = new Error('На сервере произошла ошибка');
      err.statusCode = 500;
      return next(err);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
