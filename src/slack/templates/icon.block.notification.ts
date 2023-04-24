const iconBlock = (appName: string, text: string, lineNumber: number, fileName:string) => (

{
    "blocks":
        [
            {
                "type":"context",
                "elements":
                    [
                        {
                            "type":"image",
                            "image_url":"https://image.freepik.com/free-photo/red-drawing-pin_1156-445.jpg",
                            "alt_text":"images"
                        },
                        {
                            "type":"mrkdwn",
                            "text": `YON APPLICATION : ${appName}`
                        }
                    ]
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": `*Line number:*\n${lineNumber}`
                    },
                    {
                        "type": "mrkdwn",
                        "text": `*File:*\n${fileName}` 
                    }
                ]
            },
            {
                "type": "section",
                
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": `${text}`
                }
            }
        ]
})

export { iconBlock }
