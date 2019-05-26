/**
 * Load Twilio configuration from .env config file.
 */
require('dotenv').config({ path: __dirname + '/.env'});

const express = require('express');

const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();

const AccessToken = require('twilio').jwt.AccessToken; 
const VideoGrant = AccessToken.VideoGrant; 


const app = express(); 

app.use(bodyParser.urlencoded({ extended: false}));

app.use(pino);

app.get('/api/greeting', (req, res) => {
    const name = req.query.name || 'World'; 
    res.setHeader('Content-Type', 'application/json'); 
    res.send(JSON.stringify({ greeting: `Hello ${name}!`}));
});


/**
 * Generate an Access Token for a chat application user.
 */
app.get('/api/token', (req, res) =>{
    const identity = req.query.name || 'Anonymous'; 

    /**
     * Create an access token which we will sign and return to the client, 
     * containing the grant we just created. 
     */
    const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID, 
        process.env.TWILIO_API_KEY, 
        process.env.TWILIO_API_SECRET
    );

    // Assign the generated identity to the token. 
    token.identity = identity; 

    // Grant the access token Twilio Video capabilities. 
    const grant = new VideoGrant(); 
    token.addGrant(grant); 

    // Serialize the token to JWT string and include it in a JSON response. 
    res.send({
        identity: identity, 
        token: token.toJwt()
    });
});

// Run the Server 
app.listen(3001, ()=>{
    console.log('Express server is running on localhost:3001')
});



