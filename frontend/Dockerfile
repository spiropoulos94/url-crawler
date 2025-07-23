FROM node:20-alpine

WORKDIR /frontend

# Delete lock file and node_modules to avoid optional native dep bug
COPY . .

RUN rm -rf package-lock.json node_modules && npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
