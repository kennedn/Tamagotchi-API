FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Make script executable
RUN chmod +x entrypoint.sh

EXPOSE 3535

CMD ["./entrypoint.sh"]