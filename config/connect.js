const mysql = require('mysql')

MYSQL_USER = 'root'
MYSQL_HOST = 'localhost'
MYSQL_DB = 'electronic_wallet'
MYSQL_PWD = ''
MYSQL_PORT = '3306'

const mysqlConfig = {
    host: MYSQL_HOST,
    user: MYSQL_USER,
    port: MYSQL_PORT,
    password: MYSQL_PWD,
    database: MYSQL_DB
    // ssl: true
}

const pool = mysql.createPool({...mysqlConfig, charset : 'utf8'})
/**
 *
 * @param {String} queryStr
 * @returns Object
 */

const query = async (queryStr) => {    
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            connection.query(queryStr, function(err, rows) {
                console.log('err err >>>>> ', err)
                connection.release();
                return resolve(rows)     
            });
        });
    })
}

module.exports.mysql = {
    query,
}
