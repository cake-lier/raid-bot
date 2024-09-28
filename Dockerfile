FROM node:22.9.0-alpine

COPY package.json ./
RUN npm install --omit=dev

COPY src/main/*.js src/main/

COPY names.txt ./

CMD ["npm", "start"]
