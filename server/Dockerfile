FROM node:20-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Install tsx globally or locally (it's in devDependencies)
# Copy the rest of the application
COPY . .



# Expose port
EXPOSE 5000

# Start server in dev mode
CMD ["npm", "run", "dev"]
