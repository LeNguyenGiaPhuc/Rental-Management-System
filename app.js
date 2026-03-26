require('dotenv').config();
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session ? req.session.user : null;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  helpers: {
    eq: (a, b) => a === b, 
    formatVND: function(price) {
      if (!price) return '0 ₫';
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      }).format(price);
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', require('./src/routes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
