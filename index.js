const config = require('config-dug');
const axios = require('axios');
const aws = require('aws-sdk');

const buildEmailBody = (stores) => {
  let body = "There's Blantons available at these stores:\n\n";

  stores.forEach(store => {
    body += `${store.name}\n`;
    body += `${store.addressLine1}\n`;
    body += `${store.todayHours.open} - ${store.todayHours.close}\n`;
    body += `Quantity Available: ${store.productAvailability}\n\n`;
  });

  return body;
}

const sendEmail = async (body) => {
  const ses = new aws.SES();
  const emailData = {
    Source: config.default.FROM_ADDRESS,
    Destination: { ToAddresses: config.default.TO_ADDRESSES },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: "🎉 There's Blantons Available!"
      }
    }
  };

  try {
    await ses.sendEmail(emailData).promise();
  } catch (error) {
    console.log(`Unable to send email: ${error.message}`)
  }
};

const handler = async () => {
  try {
    const results = await axios.get(config.default.SEARCH_URL);

    if (results.data.stores && results.data.stores.length > 0) {
      await sendEmail(buildEmailBody(results.data.stores));
    }

    return {
      statusCode: 200
    }
  } catch (error) {
    console.log(`Unable to generate results: ${error.message}`);

    return {
      statusCode: 500
    }
  }

};

module.exports = { handler };
