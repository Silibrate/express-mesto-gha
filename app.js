const express = require('express');
const mongoose = require('mongoose');
const cardsRouter = require('./routes/cardsRouter');
const usersRouter = require('./routes/usersRouter');

const app = express();
const { PORT = 3000, MONGO_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

app.use((req, res, next) => {
  req.user = {
    _id: '635ed67d756a9dbd401e8a88',
  };

  next();
});

mongoose.connect(MONGO_URL);

app.use(express.json());

app.use(usersRouter);
app.use(cardsRouter);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
