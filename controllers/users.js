/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const User = require('../models/user');

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.status(201).send({ data: user });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({ message: 'Ошибка валидации', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка', err });
    });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

const getUsersById = (req, res) => {
  User.findById(req.params.userId).orFail(new Error('NotFound'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NotFound') {
        return res.status(404).send('Пользователь не найден');
      }
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send({ message: 'Не коректный id', err });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

const updateUser = async (req, res) => {
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
  } catch (err) {
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

const updateAvatar = async (req, res) => {
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
  } catch (err) {
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUsersById,
  updateUser,
  updateAvatar,
};
