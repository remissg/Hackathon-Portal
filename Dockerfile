FROM node:20-alpine

WORKDIR /app

# Copy server dependencies and install
COPY server/package*.json ./
RUN npm install

# Copy backend source code
COPY server/ ./

# Expose port (Railway automatically injects PORT environment variable)
ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
