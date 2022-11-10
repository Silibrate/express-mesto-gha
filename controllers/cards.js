const mongoose = require('mongoose');
const cards = require('../models/card');

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

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
        return next(new BadRequestError('Ошибка валидации'));
      }
      return next(e);
    });
};

const deleteCard = async (req, res, next) => {
  cards.findById(req.params.cardId).orFail(new NotFoundError('Карточка не найдена'))
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Нельзя удалять чужие карточки');
      }
      return cards.findByIdAndRemove(req.params.cardId)
        .then(() => res.status(200).send([]))
        .catch((e) => next(e));
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        return next(new BadRequestError('не корректный id'));
      }
      return next(e);
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
        throw new NotFoundError('Карточка не найдена');
      }
      return res.send(card);
    })
    .catch((e) => {
      // eslint-disable-next-line max-len
      if (e instanceof mongoose.Error.CastError || e instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Не корректные данные'));
      }
      return next(e);
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
        throw new NotFoundError('Карточка не найдена');
      }
      return res.send(card);
    })
    .catch((e) => {
      // eslint-disable-next-line max-len
      if (e instanceof mongoose.Error.CastError || e instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Не корректные данные'));
      }
      return next(e);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
