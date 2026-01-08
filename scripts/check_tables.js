const { Client } = require('pg');
const client = new Client({
    user: 'deeyashreesingare',
    host: 'localhost',
    database: 'food_ordering',
    password: 'password',
    port: 5432,
});

client.connect();

client.query(`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'restaurants';
`, (err, res) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Restaurants Table Columns:', res.rows);
    }

    client.end();
});
