require('dotenv').config();
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,              
  saveUninitialized: false,   
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24,
    secure: false,
    httpOnly: true 
  }
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session ? req.session.user : null;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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
    },
    formatDate: function(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    },
    formatDate: function(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
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
