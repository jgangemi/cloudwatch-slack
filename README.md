# cloudwatch-slack
**AWS Lambda to post AWS CloudWatch notifications to Slack**

[![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url] [![License MIT][license-image]][license-url]

[travis-url]: https://travis-ci.org/feastr/cloudwatch-slack
[travis-image]: https://travis-ci.org/feastr/cloudwatch-slack.svg

[coveralls-url]: https://coveralls.io/github/feastr/cloudwatch-slack?branch=master
[coveralls-image]: https://coveralls.io/repos/feastr/cloudwatch-slack/badge.svg?branch=master&service=github

[license-url]: https://github.com/feastr/cloudwatch-slack/blob/master/LICENSE
[license-image]: https://img.shields.io/github/license/feastr/cloudwatch-slack.svg

This script is an AWS Lambda that will post a message to Slack whenever AWS CloudWatch emits data via an AWS SNS notification.

![Slack message](https://cloud.githubusercontent.com/assets/996231/10258004/5de28002-695b-11e5-9266-2132dd469620.png)

# Install

Assuming you already have an AWS CloudWatch alarm setup, you will have to go through the following steps:

1. Configure the "Incoming WebHooks" Slack integration.
2. Create an AWS SNS topic.
3. Add the newly created AWS SNS topic to the AWS CloudWatch alarm.
4. Create an AWS Lambda.

## Slack

1. Go to the Slack integrations page.
2. View the "Incoming WebHooks" integration.
3. Choose the channel to post to.
4. Add the integration.
5. Remember the Webhook URL.

*Hint*: Your Webhook URL should look something like this: 

```
https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX
```

Your Slack token will then be:

```
XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX
```

## AWS SNS

1. Go to the AWS SNS console.
2. Click "Create Topic".
3. Give the topic a name.
4. Create it.

## AWS CloudWatch

1. Go to the AWS CloudWatch console.
2. Modify the alarm you wish to have posted to Slack.
3. Select the newly created AWS SNS topic at "send a notification to:".
4. Save.

*Hint*: You can configure this for as many alarms as you wish. You only need one AWS SNS topic and one AWS Lambda regardless of the amount of alarms.

## AWS Lambda

Before creating the AWS Lambda, you will need to configure this script:

1. Copy `config.json.example` and `index.js` from this repository to a folder.
2. Rename `config.json.example` to `config.json`.
3. Edit `config.json` and set `### YOUR TOKEN ###` to whatever your Slack token from above is. The config should then look something like this:

    ```json
    {
      "hostname": "hooks.slack.com",
      "path": "/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX",
      "name": "CloudWatch",
      "emoji": ":cloudwatch:"
    }
    ```

4. Zip up `config.json` and `index.js` *without* the containing directory.

Now you are ready to create the AWS Lambda:

1. Go to the AWS Lambda console.
2. Click "Create a Lambda function".
3. Skip selecting a blueprint.
4. Give the function a name.
5. Select "Node.js" as runtime.

    ![AWS Lambda configuration](https://cloud.githubusercontent.com/assets/996231/10258614/e5246c52-695f-11e5-9010-235305556d75.png)

5. Select "Upload a .ZIP file".
6. Upload the created zip archive.

    ![AWS Lambda configuration](https://cloud.githubusercontent.com/assets/996231/10258793/bce03e0e-6961-11e5-84e7-378d604044f0.png)

7. Further down create a new basic execution role (or reuse an old one).

    ![AWS Lambda configuration](https://cloud.githubusercontent.com/assets/996231/10258616/e967ac20-695f-11e5-89e6-9e44146317c3.png)

8. Next.
9. Review and click "Create function".
10. Click tab "Event sources".
11. Click "Add event source".
12. Select "SNS" for "Event source type".
13. Select your newly created AWS SNS topic.
14. Submit.

If you wish to test the integration, click "Test" and paste the contents from the [message fixture](test/fixture/message.json). If everything went well, this should post a message to your selected Slack channel.

# Questions

If you have any questions, just create an issue [right here on GitHub](https://github.com/feastr/cloudwatch-slack/issues).
