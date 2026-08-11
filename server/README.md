# IDHI server

## Import test data

The test-data import creates 50 linked mock records: five people, organizations,
facilities, projects, tools, services, publications, events, datasets, and
training materials. Relationships between records include affiliations, project
participation and outputs, authorship, providers, publishers, facilities, and
training-material references.

Install the [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/installation/)
so that `mongoimport` is available, then set the target database in
`server/.env.local`:

```env
MONGODB_CONNECTION_STRING=mongodb://localhost:27017
MONGODB_DATABASE_NAME=idhi
```

From the workspace root, run:

```sh
pnpm --filter @idhi/server test-data:import
```

The script invokes `mongoimport` directly. Its deterministic `idhi:*:*mock`
records are upserted, so it is safe to rerun and does not remove unrelated
records. Do not point it at a database where those IDs are used for non-test
data.

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
