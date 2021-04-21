FROM node:15.9.0-alpine3.13

RUN mkdir -p /app

WORKDIR /app

COPY package*.json ./

RUN npm ci \
 && npm cache clean --force 
 
COPY ./ /app

ENV PATH="/app/node_modules/.bin/:${PATH}"

ENV PORT 3000

EXPOSE 3000

CMD ["npm", "run", "_start"]