import { SlackSettings } from "./src/types/app.settings.types";
const slackSettings: SlackSettings = require('../.secret/slack.settings.json')

const appSlacks = Object.keys(slackSettings)

// Main execution
for (let i = 0; i < appSlacks.length; i++) {
    const appName = appSlacks[i]
    //const scheduler = new Scheduler(appName);
    //scheduler.run()        
}



