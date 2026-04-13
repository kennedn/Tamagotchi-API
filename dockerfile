FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Install curl (needed for download)
RUN apt-get update && apt-get install -y curl

# Make script executable
RUN chmod +x entrypoint.sh

EXPOSE 3535

CMD ["./entrypoint.sh"]