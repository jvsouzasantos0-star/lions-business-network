FROM node:20-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm install --omit=dev
COPY server/src ./server/src
COPY public ./public
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server/src/server.js"]
