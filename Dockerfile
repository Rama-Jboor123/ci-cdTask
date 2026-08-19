FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY BackEnd/package*.json ./BackEnd/
RUN npm ci --omit=dev --prefix ./BackEnd

# Copy backend source
COPY BackEnd ./BackEnd

# Copy frontend static files
COPY FrontEnd ./FrontEnd

WORKDIR /app/BackEnd

EXPOSE 3000

USER node

CMD ["node", "index.js"]