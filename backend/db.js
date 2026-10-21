const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'talk2me',
    password: 'hanniballkanni',
    port: 5432,
});

module.exports = pool;
