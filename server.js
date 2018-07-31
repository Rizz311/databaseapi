const express = require('express');
const app = express();

const { Pool, Client } = require('pg')

// create a new connection pool
const pool = new Pool({
	user: 'resilient',
	host: 'localhost',
	password: 'resilient',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// exit if there's a problem with a db connection
// this should be more robust in a real application
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

app.listen(3001, function() {
    console.log('listening on 3001')
});

app.get('/locations', (req, res) => {
// render is async so that we can run the connect, query, and release statements synchronously using await
  async function provide_locations() {
		let client = null;
		try {
			client = await pool.connect();
		} catch (error) {
			res.status(500).send(error);
			console.log(error);
		}
    console.log("client connected");
		try {
			const dbres = await client.query('SELECT name, in_out from locations')
			console.log("db queried");
			res.status(200).json(dbres.rows);
		} catch (error) {
			res.status(500).send(error);
			console.log(error);
		} finally {
			await client.release();
			console.log("client released");
		}
  }
  provide_locations();
});
app.get('/users', (req, res) => {
// render is async so that we can run the connect, query, and release statements synchronously using await
  async function provide_users() {
		let client = null;
		try {
			client = await pool.connect();
		} catch (error) {
			res.status(500).send(error);
			console.log(error);
		}
    console.log("client connected");
		try {
			const dbres = await client.query('SELECT * from users')
			console.log('users');
			res.status(200).json(dbres.rows);
		} catch (error) {
			res.status(500).send(error);
			console.log(error);
		} finally {
			await client.release();
			console.log("client released");
		}
  }
  provide_users();
});
app.get('/newUser', (req, res) => {
	console.log('Starting New User');
	async function new_user() {
		let client = null;
		try {
			client = await pool.connect();
		} catch (error) {
			res.status(500).send(error);
			console.log(error);
		}
		console.log('Got Connection');
		var info = 'INSERT INTO users(username, password, email, age, show_age) VALUES($1, $2, $3, $4, $5)'
		try {
			const dbres = await client.query(info, [req.param('username'), req.param('password'), req.param('email'), req.param('age'), req.param('show_age')])
			console.log('newuser');
			res.status(200).send('Inserted New User');
		} catch (error) {
			res.status(500).send(error);
			console.log(error);
		} finally {
			await client.release();
			console.log("client released");
		}
	}
	new_user()
})
