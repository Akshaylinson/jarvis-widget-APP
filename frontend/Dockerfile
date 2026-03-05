FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --network-timeout 100000

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]