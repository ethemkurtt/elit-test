# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose frontend port
EXPOSE 3000

# Start the frontend
CMD ["npm", "run", "dev"]
