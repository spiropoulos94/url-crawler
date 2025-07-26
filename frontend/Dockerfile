FROM node:20-alpine

WORKDIR /app

# Delete lock file and node_modules to avoid optional native dep bug
COPY . .

RUN rm -rf package-lock.json node_modules && npm install

EXPOSE 5173

CMD ["npm", "run", "dev"]
