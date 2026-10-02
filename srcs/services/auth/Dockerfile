FROM node:20-alpine

WORKDIR /app
COPY shared/server.js ./server.js

ENV SERVICE_NAME=auth-service
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
