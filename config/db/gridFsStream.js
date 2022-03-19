const Grid = require('gridfs-stream');
const mongoose = require('mongoose');

let gfs
async function gridFsStream(conn) {
    await conn.once('open', function () {
        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('uploads')
    })
}

module.exports = gridFsStream
exports.gfs = gfs
