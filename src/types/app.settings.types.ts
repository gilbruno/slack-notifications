export type AppSettingsMode = 'reset' | 'noreset'


export type SlackSetting = {
    mode: AppSettingsMode,
    cronPattern: string,
    filePath: string,
    apiKey: string,
    channelName: string,
    searchPattern: string[],
    slackOAuthtoken: string
}

export type SlackSettings = Record<string, SlackSetting>

