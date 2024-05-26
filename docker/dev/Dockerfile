# Use the official Node.js image as our base
FROM node:18

#Set the working directory inside the container
WORKDIR /usr/src/app

#copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

#Install app dependencies
RUN npm install

#copy the rest of our app's source code into the container
COPY . .

#Expose the port the app will run on
EXPOSE 5501

#the command to run our app

CMD ["npm","run","dev"]

