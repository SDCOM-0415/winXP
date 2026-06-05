FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production 2>/dev/null; exit 0

COPY server.js ./

ENV PORT=3001
ENV ALLOWED_ORIGINS=*

EXPOSE 3001

CMD ["node", "server.js"]
