var express = require('express');
var router = express.Router();

// const https = require('https');
// var request = require('request');
// var ClientOAuth2 = require('client-oauth2');
// const {google} = require('googleapis');

// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow').v2beta1;

// Instantiates the Intent Client
const intentsClient = new dialogflow.IntentsClient();

const projectId = 'chatbot-abb-omxw';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET : add intent. */
router.get('/add', function(req, res, next) {
  const displayName = req.query.title;
  const trainingPhrasesParts = req.query.question;
  const messageTexts = req.query.response;
  createIntent(projectId, displayName, trainingPhrasesParts, messageTexts);
  res.header("Access-Control-Allow-Origin", "*");
  //a changer (implementer la logique des cas des erreurs)
  res.send({ message: 'OK' });
});

/* GET : list intent. */
router.get('/list',async function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  //where to store intents
  let intentsList = [];
  // The path to identify the agent that owns the intents.
  const projectAgentPath = intentsClient.projectAgentPath(projectId);

  console.log(projectAgentPath);

  const request = {
    parent: projectAgentPath,
  };
  // Send the request for listing intents.
  const [response] = await intentsClient.listIntents(request);
  response.forEach(intent => {
    intentsList.push({
      intentName : intent.name,
      intentDisplayName: intent.displayName
    });
    console.log("=============================");
    console.log(`Intent name: ${intent.name}`);
    console.log(`Intent display name: ${intent.displayName}`);
  });

  res.send({ intents: intentsList });
});

/* GET : list intent. */
router.get('/get',async function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  //where to store intents
  let questions = [];
  let responses = [];
  console.log(req.query.intentName);
  const query = {
    name : req.query.intentName,
    languageCode: 'en',
    intentView: 'INTENT_VIEW_FULL'
  };

  intentsClient.getIntent(query)
      .then((intent) => {
          console.log(intent[0]);
          intent[0].trainingPhrases.forEach(tp => {
            questions.push(tp.parts[0].text);
          });
          responses = intent[0].messages[0].text.text;
        console.log("=============================");
        console.log(questions);
        console.log("=============================");
        console.log(responses);
        res.send({ questions: questions, responses: responses });
      }).catch(err=>{
          console.error(err);
          res.send({ questions: questions, responses: responses, error : err });
  });
//messages[0].text.text for responses
//trainingPhrases[0].parts[0].text for questions

});



/* GET : list intent. */
router.get('/update',async function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  console.log(req.query.intentName);
  const deleteQuery = {name: req.query.intentName};

  const displayName = req.query.intentDisplayName;
  const trainingPhrasesParts = req.query.question;
  const messageTexts = req.query.response;

  intentsClient.deleteIntent(deleteQuery).then(async ()=>{
    await createIntent(projectId, displayName, trainingPhrasesParts, messageTexts);
    //a changer (implementer la logique des cas des erreurs)
    //get list of intents and send it for update
    res.send({ message: 'OK' });
  });


});



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
  return response;
}



async function listIntents() {
  // Construct request

  // The path to identify the agent that owns the intents.
  const projectAgentPath = intentsClient.projectAgentPath(projectId);

  console.log(projectAgentPath);

  const request = {
    parent: projectAgentPath,
  };

  // Send the request for listing intents.
  const [response] = await intentsClient.listIntents(request);
  response.forEach(intent => {

    console.log('====================');
    console.log(intent);
    console.log('====================');
    console.log(`Intent name: ${intent.name}`);
    console.log(`Intent display name: ${intent.displayName}`);
    console.log(`Action: ${intent.action}`);
    console.log(`Root folowup intent: ${intent.rootFollowupIntentName}`);
    console.log(`Parent followup intent: ${intent.parentFollowupIntentName}`);

    console.log('Input contexts:');
    intent.inputContextNames.forEach(inputContextName => {
      console.log(`\tName: ${inputContextName}`);
    });

    console.log('Output contexts:');
    intent.outputContexts.forEach(outputContext => {
      console.log(`\tName: ${outputContext.name}`);
    });
  });


  return response;
}





module.exports = router;
