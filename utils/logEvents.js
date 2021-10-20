const fs = require('fs').promises
const path = require('path')

const filename = path.join('../logs', 'logs.log')

const logEvents = async (msg) => {
    try {
        fs.appendFile(filename, msg)
    } catch (error) {
        console.log(error);
    }
}