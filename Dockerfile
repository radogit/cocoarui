# Use an official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package.json package-lock.json ./

# Install dependencies (ensure Parcel 2 is installed globally)
RUN npm install -g parcel@latest && npm install

# Copy the entire project
COPY . .

# Expose the development port
EXPOSE 1234

# Run Parcel with the correct options
CMD ["parcel", "index.html", "--port", "1234", "--host", "0.0.0.0"]
