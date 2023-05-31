import { CronJob } from 'cron';
import { exec } from 'child_process'
import { Log } from '../logger/log'
import { SlackNotifications } from '../slack/slack.notifications';
import { Cache } from '../utils/cache';
const fs   = require('fs')
const util = require('util')
const exec_async = util.promisify(exec)
import { simpleBlock } from '../slack/templates/simple.block.notification';
import { iconBlock } from '../slack/templates/icon.block.notification';

/**
 * 
 */
export class Scheduler {

    cronJob: CronJob
    private FIRST_LINE           = 'firstLine' as const 
    private LAST_LINE            = 'lastLine' as const 
    private PERSISTED_LAST_LINE  = 'persistedLastLine' as const 
    private appName: string
    private filePath: string
    private slackChannel: string
    private searchPattern:string[]
    private log: Log
    private slackNotifications: SlackNotifications
    private canParse: boolean
    private cacheJsonFiles: Record<string, Record<string, Cache<string>>> = {}
    private SED_PATTERN = `sed -n {firstLine},{lastLine}p {logFile} | grep -n -E '{stringToSearch}';` 
    
    //----------------------------------------------------------------------------------------------------------
    constructor(appName: string) {
        this.slackNotifications = new SlackNotifications()
        this.log                = new Log()
        this.appName            = appName    
        this.filePath           = this.slackNotifications.getFilePath(this.appName)
        this.slackChannel       = this.slackNotifications.getChannel(this.appName)
        this.searchPattern      = this.slackNotifications.getSearchPattern(this.appName)
        this.setCacheJsonFiles(appName)

        const cronPattern = this.slackNotifications.getCronPattern(this.appName)
        this.cronJob = new CronJob(cronPattern, async () => {
            try {
                await this.scheduleTask();
            } catch (e) {
            }
        });   
    }

    //----------------------------------------------------------------------------------------------------------
    private setCacheJsonFiles(appName: string)
    {
        const typeFirstLine         = `${this.FIRST_LINE}.${appName}`
        const typeLastLine          = `${this.LAST_LINE}.${appName}`
        const typePersistedLastLine = `${this.PERSISTED_LAST_LINE}.${appName}`

        this.cacheJsonFiles[appName] = {
            'firstLine': new Cache<typeof typeFirstLine>('LogFile'),
            'lastLine': new Cache<typeof typeLastLine>('LogFile'),
            'persistedLastLine': new Cache<typeof typePersistedLastLine>('LogFile'),
        }
    }

    //----------------------------------------------------------------------------------------------------------
    public run() {
        this.resetCache()
        // Start job
        if (!this.cronJob.running) {
            this.cronJob.start();
        }
    }

    //----------------------------------------------------------------------------------------------------------
    private resetCache()
    {
        if (fs.existsSync(process.cwd()+`/.persistence/cache/LogFile/${this.FIRST_LINE}.${this.appName}.json`)) {
            this.cacheJsonFiles[this.appName][this.FIRST_LINE].deleteSync(`${this.FIRST_LINE}.${this.appName}`);
        }
        if (fs.existsSync(process.cwd()+`/.persistence/cache/LogFile/${this.LAST_LINE}.${this.appName}.json`)) {
            this.cacheJsonFiles[this.appName][this.LAST_LINE].deleteSync(`${this.LAST_LINE}.${this.appName}`);
        }
    }

    //----------------------------------------------------------------------------------------------------------
    private buildSearchCommand(firstLine: number, lastLine: number, logFile: string, stringToSearch: string): string {
        let searchCmd = this.SED_PATTERN.replace('{firstLine}', firstLine.toString())
        searchCmd     = searchCmd.replace('{lastLine}', lastLine.toString())
        searchCmd     = searchCmd.replace('{logFile}', logFile)
        searchCmd     = searchCmd.replace('{stringToSearch}', stringToSearch)
        return searchCmd
    }

    //----------------------------------------------------------------------------------------------------------
    private countLines(filePath: string) {
        exec(`wc -l ${filePath}`, (error: any, stdout: any, stderr: any) => {
            if (error) {
                this.log.logger.error(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                this.log.logger.error(`stderr: ${stderr}`);
                return;
            }
            this.log.logger.info(`*** LINES COUNT : ${stdout}`);
        });
      }
    
    //----------------------------------------------------------------------------------------------------------
    private async countLinesSync(filePath: string): Promise<number> {
        const countLinescommand = `wc -l < ${filePath}`
        //this.log.logger.info(countLinescommand)
        const { stdout, stderr } = await exec_async(countLinescommand);
        if (stderr) {
            this.log.logger(stderr)
        }
        return stdout
    }

    //----------------------------------------------------------------------------------------------------------
    private getFirstLineInCache(): number {
        return this.cacheJsonFiles[this.appName][this.FIRST_LINE].getSync<number>(`${this.FIRST_LINE}.${this.appName}`);
    }

    //----------------------------------------------------------------------------------------------------------
    private getLastLineInCache(): number {
        return this.cacheJsonFiles[this.appName][this.LAST_LINE].getSync<number>(`${this.LAST_LINE}.${this.appName}`);
    }
        
    //----------------------------------------------------------------------------------------------------------
    private getPersistedLastLine(): number {
        return this.cacheJsonFiles[this.appName][this.PERSISTED_LAST_LINE].getSync<number>(`${this.PERSISTED_LAST_LINE}.${this.appName}`);
    }

    //----------------------------------------------------------------------------------------------------------
    private setFirstLine(_firstLine: number) {
        this.cacheJsonFiles[this.appName][this.FIRST_LINE].setSync<number>(`${this.FIRST_LINE}.${this.appName}`, _firstLine)
    }

    //----------------------------------------------------------------------------------------------------------
    private setLastLine(_lastLine: number) {
        this.cacheJsonFiles[this.appName][this.LAST_LINE].setSync<number>(`${this.LAST_LINE}.${this.appName}`, _lastLine)
    }

    //----------------------------------------------------------------------------------------------------------
    private setPersistedLastLine(_lastLine: number) {
        this.cacheJsonFiles[this.appName][this.PERSISTED_LAST_LINE].setSync<number>(`${this.PERSISTED_LAST_LINE}.${this.appName}`, _lastLine)
    }

    //----------------------------------------------------------------------------------------------------------
    private async handleRangeToParse(filePath: string) {
        const countLines = await this.countLinesSync(filePath)
        // Calculate first line
        if (!fs.existsSync(process.cwd()+`/.persistence/cache/LogFile/${this.FIRST_LINE}.${this.appName}.json`)) {
            //Case of first iteration
            this.canParse = true
            const appMode = this.slackNotifications.getAppMode(this.appName)
            if (appMode === 'reset') {
                this.setFirstLine(1)
            }
            else {
                this.setFirstLine(this.getPersistedLastLine())
            }
            
            this.setLastLine(Number(countLines))
            this.setPersistedLastLine(Number(countLines))
        }
        else {
            const lastLineInCache = this.getLastLineInCache()
            if (Number(countLines) === lastLineInCache) {
                this.canParse = false
            }
            else {
                this.canParse = true
                this.setFirstLine(lastLineInCache+1)
                this.setLastLine(Number(countLines))
                this.setPersistedLastLine(Number(countLines))
            }
        }
    }

    //----------------------------------------------------------------------------------------------------------
    async scheduleTask(): Promise<void> {
        await this.handleRangeToParse(this.filePath)
        if (this.canParse) {
            const firstLineToParse = this.getFirstLineInCache()
            const lastLineToParse = this.getLastLineInCache()
            this.log.logger.info(` -----------> [${this.appName}] Parsing file from line ${firstLineToParse} to ${lastLineToParse}`)
            const searchPattern = this.searchPattern.join('|')
            const searchCmd = this.buildSearchCommand(firstLineToParse, lastLineToParse, this.filePath, searchPattern)
            this.log.logger.info(searchCmd)
            try {
                const { stdout, stderr } = await exec_async(searchCmd);
                if (stderr) {
                    this.log.logger.error('No error string pattern found')    
                }
                if (stdout) {
                    let arrayErrors = stdout.split('\n')
                    arrayErrors = arrayErrors.filter((elt: string)=> {
                        if (elt) {
                            return true
                        }
                    })

                    for (let i = 0; i < arrayErrors.length; i++) {
                        const errorInfos = arrayErrors[i].split(':');
                        const lineNumber = errorInfos[0]
                        errorInfos.shift()
                        const textError = errorInfos.join() 
                        this.log.logger.info(`Error string pattern found : ${textError}`)
                        this.log.logger.info(`==> Notifications send to channel '${this.slackChannel}'`)
                        const block = iconBlock(this.appName, textError, lineNumber, this.filePath).blocks
                        let textNotification = ''
                        textNotification     += stdout
                        this.slackNotifications.sendNotificationWebApi(this.appName, textNotification, block)
                            
                    }
                }
            }
            catch (error) {
                if (error.code !== 1) {
                    throw error
                }
                this.log.logger.info(`No error found`)    
            }
        }
        else {
            this.log.logger.info(`File can not be parsed as file size does not increase`)
        }
    }
}
