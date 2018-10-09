
FROM node:8.11.3

# Create a work directory and copy over our dependency manifest files.
RUN mkdir /app
WORKDIR /app
COPY /src /app/src
COPY /public /app/public

# add ENV variables
ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_PATH src/:$NODE_PATH

# install and cache app dependencies
COPY package.json /app/package.json
COPY .env /app/.env
RUN npm install --silent

# Expose PORT 3000 on our virtual machine so we can run our server
EXPOSE 3000

# start app
#CMD ["npm", "start"]