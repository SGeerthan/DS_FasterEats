FROM node:18

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# OPTIONAL: Ensure bcrypt native module is compiled properly
RUN npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 5560

CMD ["node", "server.js"]
