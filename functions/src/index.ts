import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';


admin.initializeApp(functions.config().firebase);

const SENDGRID_API_KEY = functions.config().sendgrid.key;

sgMail.setApiKey(SENDGRID_API_KEY);

exports.firestoreEmail = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        const userId = context.params.userId;
        const newValue = change.after.data();
        const previousValue = change.before.data();

        // Check if joinUs field is set to true and it was previously false or undefined
        if (newValue.joinUs && !previousValue.joinUs) {
            try {
                // Fetch user details from Firebase Authentication
                const userRecord = await admin.auth().getUser(userId);
                const userEmail = userRecord.email;
                const userName = userRecord.displayName || 'participant';
                
                // Fetch additional user data from Firestore
                const userDoc = await admin.firestore().collection('users').doc(userId).get();
                const user = userDoc.data();

                if (user) {
                    const msg = {
                        to: userEmail,
                        from: 'asociatiabit@gmail.com',
                        subject: 'Join Us',
                        templateId: 'd-840676b41d304586b34dd8c3881358b4',
                        dynamic_template_data: {
                            name: userName
                        }
                    };

                    await sgMail.send(msg);
                    console.log('Email sent to ' + userName);

                    const adminMsg = {
                        to: 'asociatiabit@gmail.com',
                        from: 'asociatiabit@gmail.com',
                        subject: 'New User Joined',
                        templateId: 'd-dd229236332b40adb881ad7063c7baae',  // Replace with your admin template ID
                        dynamic_template_data: {
                            name: userName,
                            email: userEmail,
                            phone: user.telnr,         // Include phone number
                            discordId: user.discord,     // Include Discord ID
                            additionalInfo: user.additionalInfo  // Include additional information
                        }
                    };

                    await sgMail.send(adminMsg);
                    console.log('Notification email sent to admin');

                } else {
                    console.error('No user data found in Firestore');
                }
            } catch (error) {
                console.error('Error sending email:', error);
            }
        }

        return null; // Ensure that the function always returns a value
    });



    exports.sendContactMessageEmail = functions.firestore
    .document('contactMessages/{docId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();

        try {
            console.log(`Confirmation email sent to ${data.email}`);

            // Construct the email to send to the admin
            const adminMsg = {
                to: 'cezar.branga2004@gmail.com',
                from: 'asociatiabit@gmail.com',
                subject: 'New Contact Message Received',
                templateId: 'd-b072901a3ce343dd8d0c0dc11c35fef7',  // Make sure this ID is correct
                dynamic_template_data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phoneNumber,
                    additionalInfo: data.additionalInfo
                }
            };

            // Send the email to the admin
            await sgMail.send(adminMsg);
            console.log('Notification email sent to admin');
        } catch (error) {
            console.error('Error sending email:', error);
        }

        return null;
    });




const db = admin.firestore();

// Trigger the function when a user is created
exports.createUserDocument = functions.auth.user().onCreate((user) => {
    const uid = user.uid;
    const email = user.email;
    

    const userDoc = {
        email: email,
        rank: "student"  // You can change the default rank here
    };

    // Create a document in the "users" collection with the UID as the document ID
    return db.collection('users').doc(uid).set(userDoc)
    .then(() => {
        console.log(`User document created for UID: ${uid}`);
    })
    .catch((error) => {
        console.error(`Error creating user document for UID: ${uid}`, error);
    });
});


exports.setCustomClaims = functions.https.onCall((data, context) => {
    const uid = data.uid;
    const rank = data.rank || 'user';

    return admin.auth().setCustomUserClaims(uid, { rank })
      .then(() => {
        // Fetch the user to verify the claims were set
        return admin.auth().getUser(uid);
      })
      .then((userRecord) => {
        console.log(userRecord.customClaims); // Should log the claims
        return { message: "Custom claims set successfully!" };
      })
      .catch((error) => {
        console.error('Error setting custom claims:', error.message);
        throw new functions.https.HttpsError('internal', error.message);
      });
});
