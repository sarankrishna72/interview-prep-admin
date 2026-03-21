require('dotenv').config();
const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.default || connectMongo;
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const methodOverride = require('method-override');

const app = express();

connectDB();

app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout');

app.use('/', authRoutes);
app.use('/questions', questionRoutes);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;