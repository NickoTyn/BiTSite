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
