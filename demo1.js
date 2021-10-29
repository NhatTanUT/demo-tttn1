const { google } = require('googleapis')

const key = require('./auth3.json')
// const scopes = 'https://www.googleapis.com/auth/analytics.readonly'
// const jwt = new google.auth.JWT(key.client_email, null, key.private_key, scopes)
const view_id = '289642934'

process.env.GOOGLE_APPLICATION_CREDENTIALS = './auth.json'

// jwt.authorize((err, response) => {
//   google.analytics('v3').data.ga.get(
//     {
//       auth: jwt,
//       ids: 'ga:' + view_id,
//       'start-date': '30daysAgo',
//       'end-date': 'today',
//       metrics: 'ga:pageviews'
//     },
//     (err, result) => {
//       console.log(err, result)
//     }
//   )
// })

const reporting = google.analyticsreporting('v4');
// console.log(key);
let scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
const authO = new google.auth.OAuth2(
    key.web.client_id,
    key.web.client_secret,
    key.web.redirect_uris
  );
  
// let jwt = new google.auth.JWT(
//     key.client_email, 
//     null, 
//     key.private_key, 
//     scopes
// );


const auth = authO.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
  
    // If you only need one scope you can pass it as a string
    scope: scopes
  });

  console.log(auth);

//   const {tokens} = await oauth2Client.getToken(code)
// oauth2Client.setCredentials(tokens);

// let getReports = async function (reports) {

//     // await jwt.authorize();

//     let request = {
//         'headers': {'Content-Type': 'application/json'}, 'auth': auth, 'resource': reports
//     };

//     return await reporting.reports.batchGet(request);

// };

// let basic_report = {
//     'reportRequests': [
//         {
//             'viewId': view_id,
//             'dateRanges': [{'startDate': '2021-10-28', 'endDate': '2021-10-29'}],
//             'metrics': [{'expression': 'ga:pageviews'}]
//         }
//     ]
// };

// getReports(basic_report)
//     .then(response => console.log(response.data))
//     .catch(e => console.log(e));