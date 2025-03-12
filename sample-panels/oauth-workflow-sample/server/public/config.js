/* Replace "YOUR-DROPBOX-API-KEY" with your Api key 
and "YOUR-DROPBOX-SECRET" with your API Secret */

const dropboxApiKey = "rjatm2tzigv54pw";
const dropboxApiSecret = "uxwvj3yo6kqp6u6";
const publicUrl = "http://localhost:8000";

try {
        if (module) {
                module.exports = {
                        dropboxApiKey: dropboxApiKey,
                        dropboxApiSecret: dropboxApiSecret,
                        publicUrl: publicUrl
                }
        }
}
catch (err) { }
