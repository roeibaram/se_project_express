# WTWR (What to Wear?): Back End

The back-end project is focused on creating a server for the WTWR application. You’ll gain a deeper understanding of how to work with databases, set up security and testing, and deploy web applications on a remote machine. The eventual goal is to create a server with an API and user authorization.

## Technologies and Techniques

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT for authentication
- bcrypt for password hashing
- Celebrate/Joi for request validation
- ESLint & Prettier for code quality

## Running the Project

`npm run start` — to launch the server

`npm run dev` — to launch the server with hot reload

## Useful Endpoints

- `GET /health` — quick health check with API uptime
- `GET /items/stats` — summary counts grouped by weather and likes
- `GET /items` — public list of clothing items
  - Optional query params:
    - `weather=hot|warm|cold`
    - `search=<text>` (matches item name)
    - `sort=newest|oldest|name`
    - `limit=<1-50>`
    - `skip=<0-500>`

Example:

`GET /items?weather=cold&search=jacket&sort=name&limit=10&skip=0`

## Deployed URLs

Frontend: https://roeibwtwr.crabdance.com  
Backend API: https://api.roeibwtwr.crabdance.com

## Frontend Repo

https://github.com/roeibaram/se_project_react

## Project Pitch Video

Check out [RoeiBaram-ProjectPitch](https://drive.google.com/file/d/1R4BjXOEEJXMYieROQ8rlDnICtI70TjI4/view?usp=sharing), where I describe my
project and some challenges I faced while building it.
