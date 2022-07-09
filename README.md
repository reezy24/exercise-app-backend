# exercise-app-backend
https://exercise-app-backend-420.herokuapp.com

## Contributing
1. Create a new branch off of `main` (unless it's a simple change - then committing/pushing straight to `main` should be fine, just keep the commits tidy).
2. Write code.
3. Create a PR and post it in Discord. We aren't enforcing approvals, but just get it sanity checked if it's a big / risky change.
4. Squash and merge.
5. Merges to `main` will automatically deploy to Heroku.

## Installation
### DB Setup
1. [Install PostgreSQL](https://www.postgresql.org/download/). NOTE: WSL2 users, follow [this guide](https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-database#install-postgresql). Postgres will not run locally on WSL 1.
1. Install an SQL client of your choice - I use [DBeaver](https://dbeaver.io/) for Windows.
1. Start the Postgres server (probably via your CLI). For WSL the command is `sudo service postgresql start`. If you use another OS, add your instructions here.
1. Connect to your Postgres server via your SQL client.
    * Note: If you run into the error `FATAL: password authentication failed for user "postgres"` follow [these steps](https://stackoverflow.com/a/55039419).
1. Run the queries inside `/database/migrations` in ascending order.
    * Note: You'll likely have to create the database (very first migration file) and then reconnect to that database before running the other queries.
1. OPTIONAL: Insert a test user using the `/database/helpers/insert-user.sql` query. When the app is running (instructions below), you can verify the DB connection by accessing `localhost:5000/users` and your test user should come back as a JSON object. 

### App Setup
1. `git clone git@github.com:reezy24/exercise-app-backend.git`
1. `cd exercise-app-backend`
1. `npm i`
1. `npm run dev`
1. Check the app is running at `localhost:5000/ping`.

### Heroku Setup (Optional)
You only need to do this if you want to:
- connect to the live DB instance
- deploy a branch other than `main`

Any merges to `main` branch will automatically deploy to Heroku, i.e. you don't need to follow these steps in order to deploy your changes.

#### Steps
1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).
2. `cd` into the root of the project if you aren't already.
3. `heroku git:remote -a exercise-app-backend-420`

#### How to Connect to the Live DB (Heroku Postgres)
1. `heroku pg:credentials:url DATABASE --app exercise-app-backend-420`
2. It should output connection details under `Connection info string`. You can use these to connect via your SQL client.

#### How to Deploy a Branch Other Than Main
NOTE: You should probably notify the Discord if you're going to do this.

1. Commit your changes to `your-branch`.
1. `git push heroku your-branch:main`

## Routes
### `GET /ping`
Sends back "pong".

### `POST /echo`
Sends back the request.

### `GET /users`
Lists users. 
