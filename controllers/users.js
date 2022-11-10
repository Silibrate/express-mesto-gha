/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const UnauthorizedError = require('../errors/UnauthorizedError');

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(201).send({ data: user });
    })
    .catch((e) => {
      if (e.code === 11000) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }
      if (e instanceof mongoose.Error.ValidationError) {
        return next(new BadRequestError('Ошибка валидации'));
      }
      return next(e);
    });
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    return next(e);
  }
};
const getUsersMe = (req, res, next) => {
  User.findById(req.user._id).orFail(new Error('NotFound'))
    .then((user) => res.send({ data: user }))
    .catch((e) => {
      if (e.message === 'NotFound') {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return next(e);
    });
};

const getUsersById = (req, res, next) => {
  User.findById(req.params.userId).orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => res.send(user))
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        return next(new BadRequestError('Не коректный id'));
      }
      return next(e);
    });
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }
    const { name, about } = req.body;
    const newUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    );
    res.send(newUser);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError || e instanceof mongoose.Error.CastError) {
      return next(new BadRequestError('Ошибка валидации. Переданные данные не корректны'));
    }
    return next(e);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }
    const { avatar } = req.body;
    const newAvatar = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );

    res.send(newAvatar);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError || e instanceof mongoose.Error.CastError) {
      return next(new BadRequestError('Ошибка валидации. Переданные данные не корректны'));
    }
    return next(e);
  }
};

const login = (req, res, next) => {
  const {
    email,
    password,
  } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }
          const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
          if (!token) {
            return Promise.reject(new Error('Ошибка токена'));
          }
          return res.status(200).send({ token });
        });
    })
    .catch((e) => next(new UnauthorizedError(`${e.message}`)));
};

module.exports = {
  createUser,
  getUsers,
  getUsersById,
  updateUser,
  updateAvatar,
  login,
  getUsersMe,
};
