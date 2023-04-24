const { format, createLogger, transports } = require('winston')
const {timestamp, combine, printf} = format

export class Log {

    public logger

    constructor() {
        const logFormat = printf(
            ({level, message, timestamp}: Record<string, string>) => {
                return `${timestamp} ${level}: ${message}`
            }
        )
        this.logger = createLogger({
            format: combine(
                format.colorize(),
                timestamp(), 
                logFormat),
            transports: [new transports.Console()]
        })
    }
}