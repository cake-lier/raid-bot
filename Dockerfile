FROM node:22.7.0-alpine

COPY package.json ./
RUN npm install --omit=dev

COPY src/main/*.js src/main/

CMD ["npm", "start"]
