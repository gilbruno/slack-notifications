const simpleBlock = (appName: string, text: string) => ({
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "plain_text",
				"emoji": true,
				"text": `Errors encountered in app [${appName}]:`
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `${text}`
			}
		},
		{
			"type": "divider"
		}
	]
})

export { simpleBlock }