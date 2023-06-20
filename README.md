# Slack-Notification

## Description

This app implemented in TypeScript is an app that can be used to be notified in Slack when application errors occurs.
A setting configuration enables this.

A scheduler (Cron) is launched to scan your logging file.
When it encounters the string pattern you set in the configuration file, 
a slack notifiation is displayed int he slack channel you set in this same configuration file.

Remarks : We use _sed_ native linux command to scan the error pattern so it can only work under Linux System

## Configuration

The configuration file is put under _.secret_ direvctory.
Below an example of the conf file : 


```json
{
    "app1" : 
        {
            "mode": "reset",
            "cronPattern": "*/20 * * * * *",
            "filePath": "~/test1.txt",
            "apiKey": "",
            "channelName": "#app1-notifications",
            "searchPattern": ["error", "erreur"],
            "slackOAuthtoken": ""
        },
    "app2" : 
        {
            "mode": "reset",
            "cronPattern": "*/10 * * * * *",
            "filePath": "~/test2.txt",
            "apiKey": "",
            "channelName": "#app2-notifications",
            "searchPattern": ["error"],
            "slackOAuthtoken": ""
        }    
}
```


