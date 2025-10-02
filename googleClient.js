const {google} = require('googleapis');
const dotenv = require('dotenv');


dotenv.config();
const oauth2client = new google.auth.OAuth2(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.VITE_GOOGLE_CLIENT_SECRET,
  process.env.VITE_GOOGLE_REDIRECT_URI
);

module.exports = oauth2client;