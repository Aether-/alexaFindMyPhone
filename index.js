// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const messages = {
    NOTIFY_MISSING_PERMISSIONS: 'Please enable profile permissions in the Amazon Alexa App.',
    ERROR: 'Uh Oh. Looks like something went wrong.'
};
var PHONE_Number;
const MOBILE_PERMISSION = "alexa::profile:mobile_number:read";

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest'  
    },
    handle(handlerInput) {
        const speechText = 'Welcome, you can ask me to call your phone or provide its location. What would you like me to do?';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const GetPhoneNumberIntent = {
    canHandle(handlerInput){
        const { request } = handlerInput.requestEnvelope;
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' 
         && handlerInput.requestEnvelope.request.intent.name === 'GetPhoneNumberIntent';
    },
    async handle(handlerInput) {
    const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
    const consentToken = requestEnvelope.context.System.user.permissions
      && requestEnvelope.context.System.user.permissions.consentToken;
    if(!consentToken){
        return responseBuilder
            .speak('Please enable mobile phone permissions in the Amazon Alexa app.')
            .withAskForPermissionsConsentCard(['alexa::profile:mobile_number:read'])
            .getResponse();
    }
    try {
      const upsServiceClient = serviceClientFactory.getUpsServiceClient();
      const profileMobileObject = await upsServiceClient.getProfileMobileNumber();
     
      const profileMobile = profileMobileObject.phoneNumber;
      PHONE_Number = profileMobile;
      const speechResponse = `Hello your mobile number is, ${profileMobile}`;
      const cardResponse = `Hello your mobile number is, ${profileMobile}`
      return responseBuilder
                      .speak(speechResponse)
                      .withSimpleCard("FindMyPhone", cardResponse)
                      .getResponse();
    } catch (error) {
      console.log(JSON.stringify(error));
      if (error.statusCode === 403) {
        return responseBuilder
        .speak(messages.NOTIFY_MISSING_PERMISSIONS)
        .withAskForPermissionsConsentCard([MOBILE_PERMISSION])
        .getResponse();
      }
      console.log(JSON.stringify(error));
      const response = responseBuilder.speak(messages.ERROR).getResponse();
      return response;
    }
  },

};
/*function getPhoneNumber(){ //function assumes that permission has been handled
    var options = {
        host: 'api.amazonalexa.com',
        path: '/' + encodeURIComponent('v2/accounts/~current/settings/Profile.mobileNumber'),
        method: 'GET',
    }; //calls the api and gets the customer's phone number so that options becomes the phone number, which is stored as {"countryCode": "string", "phoneNumber": "string"}
    
    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var responseString = "";
        var strArray = new Array();
        
        res.on('data', chunk =>{
            strArray.push(chunk)
        })
        
        res.on('end',()=>{
            responseString = strArray.pop(1)
            console.log(responseString);

        });
    });
    req.end();
}
function sendPhoneNumber(){
    
}*/
const LocationIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'Do you give me permission to access your phone location?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Sorry, I couldn't understand what you said. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GetPhoneNumberIntent,
        LocationIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)// make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();
