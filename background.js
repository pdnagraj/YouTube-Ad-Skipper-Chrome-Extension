 importScripts('firebase-app.js');
 importScripts('firebase-auth.js');

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "XXXXXXXXXXXXXXXXXXX",
    authDomain: "XXXXXXXXXXXXXXXXXX",
    projectId: "XXXXXXXXXXXXXXX",
    storageBucket: "XXXXXXXXXXXXXXXX",
    messagingSenderId: "XXXXXXXXXXXXXXXX",
    appId: "XXXXXXXXXXXXXXXX"
  };


// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

chrome.action.onClicked.addListener(() =>{
    chrome.identity.getAuthToken({ interactive: true }, (token) =>{
        var credential = firebase.auth.GoogleAuthProvider.credential(null, token);

        firebase.auth().signInWithCredential(credential).then((userCred) => {
          userCred.user.getIdToken(true).then((idToken) => {
              fetch('*url*/helloWorld', {
                headers : {
                  Authorization: idToken
                }
            })
            .then((res) => res.json())
            .then((data) => {
              chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
                chrome.tabs.sendMessage(tabs[0].id, data)
              })
            })
            .catch((e) =>{
              console.error(e);
              chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
                chrome.tabs.sendMessage(tabs[0].id, { is_subscribed: false })
              })
            })
          })
        }).catch((e) => {
          console.error(e);
          chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
            chrome.tabs.sendMessage(tabs[0].id, { is_subscribed: false })
          })
        });
    });
})