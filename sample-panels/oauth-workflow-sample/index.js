/*
**  26 FEB 2025
**  This example makes use of api.dropbox.com references current as of the date
**  above for the purpose of demonstrating successful OAuth authentication and
**  further credentialed API interaction after authentication is complete.
**
**  These external API references are prone to update at any time without 
**  notification and may impact the functionality of this sample.
*/

const publicUrl = "http://localhost:8000";
let accessToken;
let userInfoDisplayString;

async function connectOAuthService() {
  	// Retrieve he access token if it doesn't exist already
	if (!accessToken) {
		const rid = await xhrRequest(`${publicUrl}/getRequestId`, 'GET', {}, 'json')
			.then(response => {
				return response.id;
			});

		// opens the url in the default browser
		require("uxp").shell.openExternal(`${publicUrl}/login?requestId=${rid}`);

		// // --- REFERENCE FOR OPENING WEB PAGE ---- //
		// const { shell }  = require("uxp");
		// try {
		// 	await shell.openExternal("https://www.adobe.com", "Opening browser for testing purpose."); 
		// 	await shell.openExternal("mailto:/example.com/");
		// } catch (e) {
		// 	console.error(e);
		// }

		accessToken = await xhrRequest(`${publicUrl}/getCredentials?requestId=${rid}`, 'GET', {}, 'json')
			.then(tokenResponse => {
				return tokenResponse.accessToken;
			});
	}
	document.getElementById("status").innerText = "OAuth service successfully connected";
	let button = document.getElementById("connect");
	button.innerText = "Fetch User Info";
	button.onclick = fetchUserProfile;
}

async function fetchUserProfile() {
  	// Retrieve the current user's dropbox profile using the access toekn received from OAuth
	const dropboxProfileUrl = `https://api.dropboxapi.com/2/users/get_current_account`;
	const headerData = {
						"Authorization": `Bearer ${accessToken}`,
						};
	
	const dropboxProfile = await xhrRequest(dropboxProfileUrl, 'POST', headerData);
	let dropboxProfile_pasred = JSON.parse(dropboxProfile);

	// Update received user info display
	if(userInfoDisplayString == null){
		let userName = document.createTextNode(`Name: ${dropboxProfile_pasred.name.display_name}`);
		userInfoDisplayString = document.getElementById('info').appendChild(userName);
		
		document.getElementById("connect").innerText = "User info Received";
	}else{
		userInfoDisplayString.nodeValue = `How many times are you gonna click the button, ${dropboxProfile_pasred.name.given_name}?`;
	}
}

// XHR helper function
function xhrRequest(url, method, headerData = {}, responseType = '') {
	return new Promise((resolve, reject) => {
		const req = new XMLHttpRequest();
		req.timeout = 6000;
		req.onload = () => {
			if (req.status === 200) {
				try {
					resolve(req.response);
				} catch (err) {
					reject(`Couldn't parse response. ${err.message}, ${req.response}`);
				}
			} else {
				reject(`Request had an error: ${req.status}`);
			}
		}
		req.ontimeout = () => {
			console.log("polling...");
			resolve(xhrRequest(url, method, headerData, responseType));
		}
		req.onerror = (err) => {
			console.log(err);
			reject(err);
		}
		req.open(method, url, true);

		// Establish all provided headers
		if(Object.keys(headerData).length > 0){
			Object.entries(headerData).forEach(([key, value]) => {
				req.setRequestHeader(key, value);
			});

			// report request status to console once received
			req.onreadystatechange = function() {
				console.log(`Request State Changed: ${req.status} : ${req.statusText}`);
			};
		}

		// Only establish response type if one is explicitly provided
		if(responseType != ''){
			req.responseType = responseType;
		}

		req.send();
		console.log("Request sent...");
	});
}

document.getElementById("connect").onclick = () => connectOAuthService();