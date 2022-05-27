var isSubscribed = false;

chrome.runtime.onMessage.addListener(msg =>{
    console.log({msg});
    isSubscribed = msg.is_subscribed;
})

alert('YT skipper Loaded');

window.onload = () =>{
    var mutationObserver = new MutationObserver(function(mutations){
        // for each of those changes we want to find the inner text for skip ad 
        mutations.forEach(function(mutation) {
            if(mutation.target && mutation.target.innerText && mutation.target.innerText.indexOf('Skip Ads')!= -1 && mutation.target.innerText.indexOf('Skip Ad')!= -1 && isSubscribed){
                mutation.target.click();
                console.log('Ad Skipped.')
            }
        })
    });

    // mutationObserver will read the document body(AKA the HTML) and check if there are any changes underneath the entire body 
    //attributes like css, subtree: the html, characterData: text content of a box changes(wording changes within an element)
    mutationObserver.observe(document.body, {attributes: true, subtree: true, childList: true, characterData: true});
}