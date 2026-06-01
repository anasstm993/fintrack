FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm run build

# Make directories for data and uploads to hold persistent volumes
RUN mkdir -p /app/data /app/uploads

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/fintrack.db"

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
