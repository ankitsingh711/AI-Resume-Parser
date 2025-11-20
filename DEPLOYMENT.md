# Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- nginx or similar web server (for frontend)
- Process manager like PM2 (recommended)

## Backend Deployment

### 1. Build

```bash
cd backend
npm install --production
npm run build
```

### 2. Configure Environment

Create `.env` file:
```env
NODE_ENV=production
PORT=3001
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
FRONTEND_URL=https://your-domain.com
```

### 3. Run with PM2

```bash
npm install -g pm2
pm2 start dist/server.js --name resume-api
pm2 save
pm2 startup
```

### 4. nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }
}
```

## Frontend Deployment

### 1. Build

```bash
cd frontend
npm install
npm run build
```

### 2. Serve Static Files

**Option A: nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Option B: Vercel/Netlify**
- Connect your GitHub repo
- Set build command: `npm run build`
- Set publish directory: `dist`

### 3. Update API URL

In frontend, update `src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://api.your-domain.com';
```

## Docker Deployment (Optional)

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - FRONTEND_URL=http://localhost
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs resume-api
```

### Health Check
```bash
curl http://localhost:3001/api/health
```

## Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for your domain only
- [ ] Set up HTTPS (Let's Encrypt)
- [ ] Enable rate limiting (optional)
- [ ] Set proper file size limits
- [ ] Configure secure headers
- [ ] Set up firewall rules
- [ ] Regular backups of uploads directory

## Performance Optimization

- Enable gzip compression in nginx
- Set proper cache headers
- Use CDN for static assets (optional)
- Monitor memory usage
- Set up log rotation

## Maintenance

### Backup
```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz backend/uploads
```

### Updates
```bash
git pull
cd backend && npm install && npm run build
pm2 restart resume-api
```

### Logs
```bash
pm2 logs resume-api --lines 100
```

---

**Note**: This application runs entirely locally with no external API dependencies, making deployment simple and cost-effective!
