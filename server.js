

var express = require('express');
var app = express();
const bcrypt = require('bcrypt');

const session = require('express-session');

app.use(session({
  secret: 'mySecretKey123',   // change this in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }   // true only if using HTTPS
}));

app.use(express.urlencoded({ extended: true }));

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'new_schema'
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
    connection.release();
  }
});

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', function (req, res) {
  res.render('pages/index.ejs');
});

// about page
app.get('/about', function (req, res) {
  res.render('pages/about.ejs');
});

// sign up page
app.get('/signup', function (req, res) {
  res.render('pages/signup.ejs', { message: "message test " });
});

// login page
app.get('/login', function (req, res) {
  res.render('pages/login.ejs');
});

// profile page
app.get('/profile', function (req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const passport = req.session.user.passport_number;
 

  pool.query(
    "SELECT b.booking_id, f.flight_number, f.departure_time, f.arrival_time FROM booking b JOIN flight f ON b.flight_number = f.flight_number WHERE b.passport_number = ?",
    [passport],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.send("Error loading bookings");
      }

      return res.render('pages/profile.ejs', {
        user: req.session.user,
        bookings: results || [],
      });
    }
  );
});

// arrivals page not sure what to put here yet    
app.get('/arrivals', function (req, res) {

  res.render('pages/arrivals.ejs', {flights: []});
});

// departures page not sure what to put here yet
app.get('/departures', function (req, res) {
  res.render('pages/departures.ejs', {flights: []});
});

// admin profile page not sure what to put here yet
app.get('/booking', function (req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  } res.render('pages/bookings.ejs');
});

// logout route
app.post('/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      return res.send("Error logging out");
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// login route
app.post('/loginbutton', async function (req, res) {
  const { Passport_number, Password } = req.body;

  if (!Passport_number || !Password) {
    return res.send("Please enter passport number and password");
  }

  pool.query(
    'SELECT * FROM passenger WHERE passport_number = ?',
    [Passport_number],
    async (err, results) => {

      if (err) {
        console.error(err);
        return res.send("Login failed");
      }

      if (results.length === 0) {
        return res.send("Invalid credentials");
      }

      const user = results[0];
      const bcrypt = require('bcrypt');

      const match = await bcrypt.compare(Password, user.password_hash);

      if (!match) {
        return res.send("Invalid credentials");
      }

      // ✅ SAVE USER INTO SESSION
      req.session.user = {
        passport_number: user.passport_number,
        first_name: user.first_name,
        last_name: user.last_name
      };

      res.redirect('/profile');
    }
  );
});

app.get('/createbooking', function (req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('pages/createbooking.ejs');
});

app.post('/createbookingbutton', function (req, res) {
  const { Flight_number } = req.body;

  if (!Flight_number) {
    return res.send("Please fill in all fields");
  }

  if (!req.session?.user) {
    return res.status(401).send("User not logged in");
  }

  const user_id = req.session.user.passport_number;

  // Find outbound flight
  const outboundQuery = `
    SELECT * FROM flight 
    WHERE flight_number = ?
  `;

  pool.query(outboundQuery, [Flight_number], (err, outboundResults) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error checking flight availability");
    }

    if (outboundResults.length === 0) {
      return res.send("No outbound flights available for the selected criteria");
    }

    const outboundFlight = outboundResults[0];

    const insertQuery = `
        INSERT INTO booking (booking_id, passport_number, flight_number, booking_date) 
        VALUES (?, ?, ?, ?)
      `;

    pool.query(insertQuery, ['1005', user_id, outboundFlight.flight_number, new Date()], (err, insertResult) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error creating booking");
      }
    });
    res.render('pages/bookingcreated.ejs');
  });
});

app.post('/deleteaccount', function (req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const passport = req.session.user.passport_number;
  
  pool.query('DELETE FROM passenger WHERE passport_number = ?', [passport], (err, result) => {
    if (err) {
      console.error(err);
      return res.send("Error deleting account");
    }

    req.session.destroy(function (err) {
      if (err) {
        return res.send("Error logging out after account deletion");
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});
app.post('/arrivalsbutton', function (req, res) {
  const { Airport_code } = req.body;

  if (!Airport_code) {
    return res.send("Please enter an airport code");
  }

  pool.query(
    'SELECT * FROM flight WHERE arrival_airport = ?',
    [Airport_code],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.send("Error fetching arrivals");
      }

      res.render('pages/arrivals.ejs', { flights: results });

    }
  );
});

app.post('/departuresbutton', function (req, res) {
  const { Airport_code } = req.body;

  if (!Airport_code) {
    return res.send("Please enter an airport code");
  }
  pool.query(
    'SELECT * FROM flight WHERE departure_airport = ?',
    [Airport_code],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.send("Error fetching departures");
      }

      res.render('pages/departures.ejs', { flights: results });
    }
  );
});

app.post('/signupbutton', async function (req, res) {
  const { Passport_number, First_name, Last_name, Password, Country_name } = req.body;

  if (!Passport_number || !Password) {
    return res.send("Please enter passport number and password");
  }

  try {
    const hashedPassword = await bcrypt.hash(Password, 10);

    pool.query(
      'INSERT INTO passenger (passport_number, first_name, last_name, password_hash, country_name) VALUES (?, ?, ?, ?, ?)',
      [Passport_number, First_name, Last_name, hashedPassword, Country_name],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.send("Signup failed");
        }

        res.redirect('/profile');
      }
    );

  } catch (err) {
    console.error(err);
    res.send("Error creating account");
  }
});

app.listen(8081);
console.log('Server is listening on port 8081');