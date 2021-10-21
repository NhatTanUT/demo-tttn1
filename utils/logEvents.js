const fs = require('fs').promises
const path = require('path')
const {format} = require('date-fns')

const filename = path.join(__dirname, '../logs', 'logs.log')

const logEvents = async (msg) => {
    const dateTime = `${format(new Date(), 'dd-MM-yyyy \t HH:mm:ss')}`
    const contentLog = `${dateTime} \n ${msg} \n`
    try {
        fs.appendFile(filename, contentLog)
        fs.appendFile(filename, '-----------------------------------------------------\n')
    } catch (error) {
        console.log(error);
    }
}

module.exports = logEvents