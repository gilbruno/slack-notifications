import { Block, WebClient } from "@slack/web-api";
import { SlackSettings } from "../types/app.settings.types";



export class SlackNotifications{

    private slackSettings: SlackSettings = require('../../.secret/slack.settings.json')

    //----------------------------------------------------------------------------------------------------------
    constructor() {   
    }

    //----------------------------------------------------------------------------------------------------------
    public async sendNotification(appName: string) {
        const apiKey = this.getSlackApiKey(appName)

        let response:Response = null

        //const fetch = require('node-fetch');

        const data = {
          text: 'Hello, World!'
        };

        const url = `https://hooks.slack.com/services/${apiKey}`

        fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => {
            console.log(err);
        });
    }

    //----------------------------------------------------------------------------------------------------------
    public async sendNotificationWebApi(appName: string, _text: string, block: Block[]) {
        const apiToken = this.slackSettings[appName].slackOAuthtoken
        const channel  =  this.slackSettings[appName].channelName
        const slackclient = new WebClient(apiToken)
        await slackclient.chat.postMessage(
            {
                text: 'Errors',
                channel: channel,
                blocks: block
            }
        )

    }
    
    //----------------------------------------------------------------------------------------------------------
    public getSlackApiKey(_appName: string) {
        return this.slackSettings[_appName]['apiKey']
    }

    //----------------------------------------------------------------------------------------------------------
    public getFilePath(_appName: string) {
        return this.slackSettings[_appName]['filePath']
    }

    //----------------------------------------------------------------------------------------------------------
    public getCronPattern(_appName: string) {
        return this.slackSettings[_appName]['cronPattern']
    }

    //----------------------------------------------------------------------------------------------------------
    public getAppMode(_appName: string) {
        return this.slackSettings[_appName]['mode']
    }

    //----------------------------------------------------------------------------------------------------------
    public getChannel(_appName: string) {
        return this.slackSettings[_appName]['channelName']
    }
    
    //----------------------------------------------------------------------------------------------------------
    public getSearchPattern(_appName: string) {
        return this.slackSettings[_appName]['searchPattern']
    }
    
}