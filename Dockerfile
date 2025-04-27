FROM node:20-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port 5000
EXPOSE 5000

# Start the server
CMD ["node", "dist/server/index.js"]