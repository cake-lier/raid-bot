FROM node:22.5.1-alpine

COPY package*.json ./
RUN npm install --omit=dev

COPY src/main/*.js src/main/

CMD ["npm", "start"]