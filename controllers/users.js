/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');

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
        const err = new Error('Пользователь с таким email уже существует');
        err.statusCode = 409;
        return next(err);
      }
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

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    const err = new Error('На сервере произошла ошибка');
    err.statusCode = 500;
    return next(err);
  }
};
const getUsersMe = (req, res, next) => {
  User.findById(req.user._id).orFail(new Error('NotFound'))
    .then((user) => res.send({ data: user }))
    .catch((e) => {
      if (e.message === 'NotFound') {
        const err = new Error('Пользователь не найден');
        err.statusCode = 404;
        return next(err);
      }
      const err = new Error('На сервере произошла ошибка');
      err.statusCode = 500;
      return next(err);
    });
};

const getUsersById = (req, res, next) => {
  User.findById(req.params.userId).orFail(new Error('NotFound'))
    .then((user) => res.send(user))
    .catch((e) => {
      if (e.message === 'NotFound') {
        const err = new Error('Пользователь не найден');
        err.statusCode = 401;
        return next(err);
      }
      if (e instanceof mongoose.Error.CastError) {
        const err = new Error('Не коректный id');
        err.statusCode = 400;
        return next(err);
      }
      const err = new Error('На сервере произошла ошибка');
      err.statusCode = 500;
      return next(err);
    });
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send('Пользователь не найден');
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
      const err = new Error('Ошибка валидации. Переданные данные не корректны');
      err.statusCode = 400;
      return next(err);
    }
    const err = new Error('На сервере произошла ошибка');
    err.statusCode = 500;
    return next(err);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send('Пользователь не найден');
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
      const err = new Error('Ошибка валидации. Переданные данные не корректны');
      err.statusCode = 400;
      return next(err);
    }
    const err = new Error('На сервере произошла ошибка');
    err.statusCode = 500;
    return next(err);
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
    .catch((e) => {
      const err = new Error(`${e.message}`);
      err.statusCode = 401;
      return next(err);
    });
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
