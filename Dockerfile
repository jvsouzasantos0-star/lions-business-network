FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY server/package*.json ./server/

# Install dependencies
RUN cd server && npm ci --only=production

# Copy source code
COPY server/src ./server/src
COPY public ./public

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "server/src/server.js"]
