import Slack from "@slack/api"
import dotenv from "dotenv"

dotenv.config();

const app = new Slack.App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
})

const blocks = {
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Hello, Assistant to the Regional Manager Dwight! *Michael Scott* wants to know where you'd like to take the Paper Company investors to dinner tonight.\n\n *Please select a restaurant:*"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Farmhouse Thai Cuisine*\n:star::star::star::star: 1528 reviews\n They do have some vegan options, like the roti and curry, plus they have a ton of salad stuff and noodles can be ordered without meat!! They have something for everyone here"
			},
			"accessory": {
				"type": "image",
				"image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/c7ed05m9lC2EmA3Aruue7A/o.jpg",
				"alt_text": "alt text for image"
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Kin Khao*\n:star::star::star::star: 1638 reviews\n The sticky rice also goes wonderfully with the caramelized pork belly, which is absolutely melt-in-your-mouth and so soft."
			},
			"accessory": {
				"type": "image",
				"image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/korel-1YjNtFtJlMTaC26A/o.jpg",
				"alt_text": "alt text for image"
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*Ler Ros*\n:star::star::star::star: 2082 reviews\n I would really recommend the  Yum Koh Moo Yang - Spicy lime dressing and roasted quick marinated pork shoulder, basil leaves, chili & rice powder."
			},
			"accessory": {
				"type": "image",
				"image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/DawwNigKJ2ckPeDeDM7jAg/o.jpg",
				"alt_text": "alt text for image"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Farmhouse",
						"emoji": true
					},
					"value": "click_me_123"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Kin Khao",
						"emoji": true
					},
					"value": "click_me_123",
					"url": "https://google.com"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Ler Ros",
						"emoji": true
					},
					"value": "click_me_123",
					"url": "https://google.com"
				}
			]
		},
		{
			"type": "section",
			"fields": [
				{
					"type": "plain_text",
					"text": "*this is plain_text text*",
					"emoji": true
				},
				{
					"type": "plain_text",
					"text": "*this is plain_text text*",
					"emoji": true
				},
				{
					"type": "plain_text",
					"text": "*this is plain_text text*",
					"emoji": true
				},
				{
					"type": "plain_text",
					"text": "*this is plain_text text*",
					"emoji": true
				},
				{
					"type": "plain_text",
					"text": "*this is plain_text text*",
					"emoji": true
				}
			]
		}
	]
}

await app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: process.env.SLACK_CHANNEL,
    text: "This is a test",
    blocks,
})