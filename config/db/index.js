const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const {GridFsStorage} = require('multer-gridfs-storage');   
const gfs = require('./gridFsStream')

async function connect() {
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/ProjectCK');
        console.log('Connect successfully!!!');
        // gfs(conn)
    }
    catch (error){
        console.log(error);
        console.log('Connect failed!!!');
    }
}

module.exports = { connect }