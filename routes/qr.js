var express = require('express');
var router = express.Router();
// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');

// Instantiates the Intent Client
const intentsClient = new dialogflow.IntentsClient();

const projectId = 'chatbot-abb-omxw';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/add', function(req, res, next) {
  const displayName = 'test';
  const trainingPhrasesParts = [];
  trainingPhrasesParts.push(req.query.question);
  const messageTexts = [req.query.reponse];
  createIntent(projectId, displayName, trainingPhrasesParts, messageTexts);
  res.header("Access-Control-Allow-Origin", "*");
  res.send({ message: 'OK' });
});

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */

async function createIntent(projectId, displayName, trainingPhrasesParts, messageTexts) {
  // Construct request

  // The path to identify the agent that owns the created intent.
  const agentPath = intentsClient.projectAgentPath(projectId);

  const trainingPhrases = [];

  trainingPhrasesParts.forEach(trainingPhrasesPart => {
    const part = {
      text: trainingPhrasesPart,
    };

    // Here we create a new training phrase for each provided part.
    const trainingPhrase = {
      type: 'EXAMPLE',
      parts: [part],
    };

    trainingPhrases.push(trainingPhrase);
  });

  const messageText = {
    text: messageTexts,
  };

  const message = {
    text: messageText,
  };

  const intent = {
    displayName: displayName,
    trainingPhrases: trainingPhrases,
    messages: [message],
  };

  const createIntentRequest = {
    parent: agentPath,
    intent: intent,
  };

  // Create the intent
  const [response] = await intentsClient.createIntent(createIntentRequest);
  console.log(`Intent ${response.name} created`);
}






module.exports = router;
