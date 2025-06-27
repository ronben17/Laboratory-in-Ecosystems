# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy project files
COPY . .

# Install dependencies
RUN pnpm install

# Build the Next.js application
RUN pnpm build

# Expose the port used by Next.js
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
