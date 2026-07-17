# Use official Node.js lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy all sources
COPY . .

# Build Next.js application
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# Set production environment
ENV NODE_ENV=production

# Expose Next.js port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
