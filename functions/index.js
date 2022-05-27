const stripe = require('stripe')('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
const admin = require('firebase-admin').initializeApp();
const functions = require("firebase-functions");
const firestore = admin.firestore().collection('SUBSCRIBERS');


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest(async (request, response) => {
    if(request.header("Authorization")){
        let token;

        try{
            token = await admin.auth().verifyIdToken(request.header("Authorization"))
            if(!token.email){
                functions.logger.error('No email associated with the ID token.', error);
                
                response.sendStatus(401);
                return;
            }

            try {
                var subscription = await (await firestore.doc(token.email).get()).data();

                if(!subscription.subscription_date){
                    response.sendStatus(403);
                    return;
                }

                var subscriptionEndDate = new Date(subscription.subscription_date);

                if(subscription.interval === 'monthly'){
                    subscriptionEndDate.setMonth(1 + subscriptionEndDate.getMonth());
                }

                if(subscriptionEndDate.getTime() >= Date.now()){
                    response.send({ is_subscribed: true });
                }

                else{
                    response.sendStatus(403);
                }

            } catch (e) {
                functions.logger.error('Something happened when checking subscription', e);
            }

        } catch(error) {
            functions.logger.error('Failed to get ID Token.', error);

            response.sendStatus(401);
        }
    } else {
        response.sendStatus(401);
    }
});


exports.home = functions.https.onRequest((request, response) => {
    response.send(`
        <h3> Subscription: $10/Month </h3>
        <form action="/create_checkout_session" method="POST">
            <input type="hidden" name="priceId" value="XXXXXXXXXXXXXXXX" />
            <button type="submit">Checkout</button>
        </form>
    `)
});

exports.create_checkout_session = functions.https.onRequest(async (request, response) => {

     const { priceId } = request.body;

    console.log(priceId);

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: 'XXXXXXXXXXXXXXXXX',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: 'URL/Home',
        cancel_url: 'URL/Home',
      });

      response.redirect(303, session.url);
});

exports.stripe = functions.https.onRequest(async (request, response) => {

    const sigHeader = request.headers['stripe-signature'] || '';

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.rawBody, sigHeader, '*payment_intent_webhook*')
    } catch (error) {
        response.status(400).send('Bad Request sent. ');
        return;
    }

    let { email } = await stripe.customers.retrieve(event.data.object.customer);

    await firestore.doc(email).set({ subscription_date: new Date().toISOString(), interval: 'monthly'}, { merge: true } )


    response.sendStatus(200)

});

