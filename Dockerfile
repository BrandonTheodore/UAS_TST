# 1. Use the official Node.js image (Version 22 matches your local version)
FROM node:22-alpine

# 2. Create and set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json first 
# (This makes building faster by caching dependencies)
COPY package*.json ./

# 4. Install the dependencies (express, etc.)
RUN npm install

# 5. Copy the rest of your API code (API.js)
COPY . .

# 6. Open the port your API uses
EXPOSE 6969

# 7. The command to run your app
CMD [ "node", "API.js" ]