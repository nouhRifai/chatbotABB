var express = require('express');
var router = express.Router();
// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');

// Instantiates the Intent Client
const intentsClient = new dialogflow.IntentsClient();

const projectId = 'chatbot0abb';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Req to add an intent. */
router.get('/add', function(req, res, next) {
  const displayName = req.query.title;
  console.log(displayName);
  const trainingPhrasesParts = req.query.question;
  const messageTexts = req.query.response;
  createIntent(projectId, displayName, trainingPhrasesParts, messageTexts);
  res.header("Access-Control-Allow-Origin", "*");
  res.send({ message: 'OK' });
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
}

/* GET Req to list intents. */
router.get('/list', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  const agentPath = intentsClient.projectAgentPath(projectId);

  //constructing list intents request
  const listIntentsRequest = {
    parent: agentPath,
    intent_view: 'INTENT_VIEW_FULL'
  };
  intentsClient.listIntents(listIntentsRequest).then(response => {
    res.send({ intents: response[0] });
  })

});


/* GET Req to get a specific intent. */
router.get('/get', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  const nameIntent = req.query.name;
  
//constructing get intent request
  const getIntentRequest = {
    name: nameIntent,
    intentView: 'INTENT_VIEW_FULL'
  };
  let listQuestions = [];
  let listResponses = [];
  intentsClient.getIntent(getIntentRequest).then(response => {
    //constructing training phrases array
    response[0].trainingPhrases.forEach((tp)=> {
      listQuestions.push(tp.parts[0].text);
    })

    //constructing responses array
    response[0].messages.forEach(r => {
      listResponses.push(r.text.text);
    })

    res.send({ questions: listQuestions, responses: listResponses });
  })
});

/* GET Req to update a specific intent. */
router.get('/update', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");

  const intentName = req.query.intentName;
  const intentDisplayName = req.query.intentDisplayName;
  const question = req.query.question;
  const response = req.query.response;
  
  //constructing delete intent request
  const deleteIntentRequest = {
    name: intentName,
  };
  //delete the old intent
  intentsClient.deleteIntent(deleteIntentRequest).then(()=>{

    //create the new intent
    createIntent(projectId, intentDisplayName, question, response);

  });

  

});

/* GET Req to delete a specific intent. */
router.get('/delete', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");

  const intentName = req.query.intentName;
  
  
  //constructing delete intent request
  const deleteIntentRequest = {
    name: intentName,
  };
  //delete the old intent
  intentsClient.deleteIntent(deleteIntentRequest).then(()=>{
    res.send({message : "Intent "+intentName+" Deleted Succesfully!"})
  });

  

});

module.exports = router;
