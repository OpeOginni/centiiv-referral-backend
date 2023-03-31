FROM node:16-alpine3.16

WORKDIR /app

COPY . .

# Install NPM
RUN npm install

RUN npx tsc

EXPOSE 3000

CMD [ "node", "dist/app.js" ]