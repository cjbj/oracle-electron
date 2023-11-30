// myoracle.js
//
// christopher.jones@oracle.com

const oracledb = require('oracledb');

// This demo app uses a connection pool to avoid the cost of reconnecting for
// each query.  Becuse the app is single-user, the pool will only have one
// connection in it.  When the connection has been idle for the poolTimeout
// number of seconds, the pool will drop the connection to free up database
// resources.

// Invoked from the application window to set database credentials and create a pool
async function createAppConnectionPool(un, pw, cs) {

  // Close any existing pool in case credentials have changed
  try {
    await oracledb.getPool().close(0);
  } catch (err) {
    if (err.code !== 'NJS-047') { // Ignore "pool doesn't exist" error
      console.error(err);
    }
  }

  // Create a connection pool
  await oracledb.createPool({
    user: un,
    password:pw,
    connectString:cs,
    sessionCallback: initSession,
    connectTimeout: 3,  // Only wait this long if e.g. the network is unusable
    poolTimeout: 5      // Balance the cost of connection recreation vs keeping it open
                        // (N.b: artificially low for demo purposes)
    });

  console.log(`node-oracledb: ${new Date().toISOString()}: connection pool created`);
}

// Used to show when a new connection is created in the pool.
function initSession(connection, requestedTag, callbackFn) {
  console.log(`node-oracledb: ${new Date().toISOString()}: new connection created in the pool`);
  callbackFn();
}

// Query and return the current timestamp
async function doDateQuery() {

  let connection;

  try {

    connection = await oracledb.getConnection();  // get a connection from the pool

    const result = await connection.execute(`select to_char(current_timestamp, 'YYYY-MM-DD"T"hh:mi:ss.ff3"Z"') from dual`);
    const dt = result.rows[0][0];  // the timestamp
    return dt;

  } catch (err) {
    console.error(err);
    const m = (err.code == 'NJS-047') ? ': Connection pool is not open' : '';
    return `Error getting date ${m}`;
  } finally {
    if (connection)
      await connection.close();  // release the connection to the pool
  }
}

module.exports = {
  createAppConnectionPool,
  doDateQuery
};
