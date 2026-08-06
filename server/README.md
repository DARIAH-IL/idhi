TBD

## Gmail SMTP setup

Gmail SMTP requires a Google app password. Do not use the normal password for
the Google account.

1. Enable [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification)
   for the sending Google account.
2. Open [Google App Passwords](https://myaccount.google.com/apppasswords).
3. Create an app password for the server and copy the generated 16-character
   password.
4. Configure in `server/.env.local`:

```env
SMTP_USERNAME=sender@gmail.com
SMTP_PASSWORD=generated-app-password
SMTP_FROM_EMAIL=sender@gmail.com
```
