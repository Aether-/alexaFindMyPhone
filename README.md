# alexaFindMyPhone
an Alexa Skill that calls your phone to find it; Since Amazon does not have inherent calling functions, we need to use an outside API in order to do the actual calling. The skeleton for the app is as follows: 

User tells Alexa to find their phone 

Through the Alexa Skill Kit and Intent handlers, AWS translates into machine code. Then, the lambda function will call Amazon's API in order to retrieve the user's phone number. 

From there, the lambda function then sends this information to Twilio, which then places the phone call. On successful call, Twilio then sends a "success" message to the lambda function. The lambda function then sends a "success" message to the Alexa Skill Kit which then allows Alexa to respond with a "call successful". 

Front End: Alexa (Voice interface) 

Database: Amazon's servers (since a customer who uses Alexa will have an Amazon account with a phone number linked, just need to call an API) 

Back End: Lambda function + Twilio program (to place call) 

