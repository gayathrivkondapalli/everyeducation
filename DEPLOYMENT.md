# Deployment & Implementation Guide

## Overview
This guide covers deploying the Student Wellbeing Portal to production or a shared server environment.

---

## Phase 1: Pre-Deployment Checklist

### Security
- [ ] Change `JWT_SECRET_KEY` in `backend/app.py`
- [ ] Update database connection string (if using remote DB)
- [ ] Enable HTTPS/SSL encryption
- [ ] Configure CORS properly for your domain
- [ ] Set up environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add input validation

### Database
- [ ] Migrate from SQLite to PostgreSQL (recommended for production)
- [ ] Set up database backups
- [ ] Test database recovery procedures
- [ ] Set up access logs
- [ ] Implement data encryption at rest

### Backend
- [ ] Set `debug=False` in `app.py`
- [ ] Configure proper error logging
- [ ] Set up monitoring/alerts
- [ ] Configure allowed hosts/domains
- [ ] Test all endpoints with production data

### Frontend
- [ ] Update API_BASE_URL to production server
- [ ] Run production build: `npm run build`
- [ ] Test all components
- [ ] Optimize images and assets
- [ ] Set up CDN if needed

---

## Phase 2: Server Setup

### Option A: Docker Deployment

**Dockerfile for Backend:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .

ENV FLASK_APP=app.py
ENV FLASK_ENV=production

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

**Dockerfile for Frontend:**
```dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./backend/data:/app/data

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  postgres:
    image: postgres:13
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=wellbeing_db
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Deploy with Docker:**
```bash
docker-compose up -d
```

---

### Option B: Traditional Server Deployment (Ubuntu/Linux)

#### 1. Install Dependencies
```bash
sudo apt-get update
sudo apt-get install python3 python3-pip nodejs npm postgresql postgresql-contrib nginx supervisor

# Create app directory
sudo mkdir -p /var/www/wellbeing-portal
sudo chown -R $USER:$USER /var/www/wellbeing-portal
cd /var/www/wellbeing-portal
```

#### 2. Setup Backend

```bash
# Clone/copy your code
git clone <your-repo> .

# Setup Python environment
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Create systemd service
sudo nano /etc/systemd/system/wellbeing-backend.service
```

**wellbeing-backend.service:**
```ini
[Unit]
Description=Student Wellbeing Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/wellbeing-portal/backend
Environment="PATH=/var/www/wellbeing-portal/backend/venv/bin"
ExecStart=/var/www/wellbeing-portal/backend/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable wellbeing-backend
sudo systemctl start wellbeing-backend
```

#### 3. Setup Frontend

```bash
cd /var/www/wellbeing-portal/frontend
npm install
npm run build

# Copy to nginx
sudo cp -r build/* /var/www/wellbeing-portal/html/
```

#### 4. Configure Nginx

**Create `/etc/nginx/sites-available/wellbeing-portal`:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/wellbeing-portal/html;
        try_files $uri /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/wellbeing-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

---

## Phase 3: Database Migration (SQLite to PostgreSQL)

### 1. Export SQLite Data

**Create migration script `migrate.py`:**
```python
import sqlite3
import psycopg2
import os

# Connect to SQLite
sqlite_conn = sqlite3.connect('backend/wellbeing.db')
sqlite_cursor = sqlite_conn.cursor()

# Connect to PostgreSQL
pg_conn = psycopg2.connect(
    dbname=os.getenv('DB_NAME', 'wellbeing_db'),
    user=os.getenv('DB_USER', 'postgres'),
    password=os.getenv('DB_PASSWORD', 'password'),
    host=os.getenv('DB_HOST', 'localhost')
)
pg_cursor = pg_conn.cursor()

# Tables to migrate
tables = ['users', 'students', 'wellbeing_records', 'attendance', 'assignments', 'grades', 'alerts', 'staff']

for table in tables:
    print(f'Migrating {table}...')
    sqlite_cursor.execute(f'SELECT * FROM {table}')
    rows = sqlite_cursor.fetchall()
    
    if rows:
        # Get column names
        sqlite_cursor.execute(f'PRAGMA table_info({table})')
        columns = [col[1] for col in sqlite_cursor.fetchall()]
        
        # Insert into PostgreSQL
        placeholders = ', '.join(['%s'] * len(columns))
        insert_query = f'INSERT INTO {table} ({", ".join(columns)}) VALUES ({placeholders})'
        
        for row in rows:
            try:
                pg_cursor.execute(insert_query, row)
            except Exception as e:
                print(f'Error inserting row in {table}: {e}')
        
        pg_conn.commit()

print('Migration complete!')
sqlite_conn.close()
pg_conn.close()
```

### 2. Update Backend

**Update `backend/database.py`:**
```python
import psycopg2
import os
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Get PostgreSQL connection"""
    conn = psycopg2.connect(
        dbname=os.getenv('DB_NAME', 'wellbeing_db'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'password'),
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', 5432)
    )
    conn.set_session(autocommit=True)
    return conn
```

---

## Phase 4: Monitoring & Maintenance

### 1. Set up Log Aggregation

**Configure logging in `backend/app.py`:**
```python
import logging
from logging.handlers import RotatingFileHandler
import os

if not app.debug:
    if not os.path.exists('logs'):
        os.mkdir('logs')
    
    file_handler = RotatingFileHandler('logs/wellbeing.log', maxBytes=10240000, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Student Wellbeing Portal startup')
```

### 2. Database Backups

**Daily backup script `backup.sh`:**
```bash
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/wellbeing-db"
DB_NAME="wellbeing_db"

mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

**Add to crontab:**
```bash
0 2 * * * /var/www/wellbeing-portal/backup.sh
```

### 3. Monitoring Dashboard

Install monitoring tools:
```bash
sudo apt-get install prometheus grafana-server node-exporter

# Access Grafana at http://yourdomain.com:3000
```

### 4. Health Checks

**Add health endpoint monitoring:**
```bash
# Check every 5 minutes
*/5 * * * * curl -f http://localhost:5000/health || systemctl restart wellbeing-backend
```

---

## Phase 5: Performance Optimization

### 1. Frontend Optimization
```bash
cd frontend
npm run build

# Use these files for production
# Build files are in frontend/build/
```

### 2. Backend Optimization

**Add caching:**
```python
from functools import lru_cache
import time

@app.route('/api/wellbeing/heatmap-data', methods=['GET'])
@cache.cached(timeout=300)  # Cache for 5 minutes
def get_heatmap_data():
    # ...
```

### 3. Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_wellbeing_student_date ON wellbeing_records(student_id, recorded_date DESC);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, class_date DESC);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_alerts_student_read ON alerts(student_id, is_read);
```

---

## Phase 6: User Setup & Training

### 1. Staff Access
```bash
# SSH into server
ssh admin@yourdomain.com

# Access the application
https://yourdomain.com
```

### 2. User Accounts

Create staff accounts via API:
```bash
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kayla",
    "email": "kayla@university.edu",
    "password": "securepassword123",
    "role": "staff"
  }'
```

### 3. Training
- Walk through dashboard features
- Show alert system
- Explain heatmap colors
- Train on notification system

---

## Phase 7: Post-Deployment

### Maintenance Schedule
- **Daily:** Monitor logs, check system health
- **Weekly:** Review alerts, update data
- **Monthly:** Database optimization, security audit
- **Quarterly:** Performance review, scaling assessment

### Support Resources
- Error logs: `/var/log/wellbeing-portal/`
- Database: `wellbeing_db` on PostgreSQL
- Backup location: `/backups/wellbeing-db/`
- Frontend build: `/var/www/wellbeing-portal/html/`

### Troubleshooting Commands
```bash
# Check service status
systemctl status wellbeing-backend

# View logs
tail -f /var/log/wellbeing-portal/wellbeing.log

# Restart services
systemctl restart wellbeing-backend nginx

# Database connection test
psql -U postgres -d wellbeing_db -c "SELECT 1"
```

---

## Security Checklist (Pre-Production)

- [ ] SSL/TLS certificate installed
- [ ] JWT secret changed
- [ ] Database password strengthened
- [ ] Input validation enabled
- [ ] CORS configured properly
- [ ] Rate limiting activated
- [ ] Firewall rules configured
- [ ] Regular backups scheduled
- [ ] Monitoring alerts set up
- [ ] Audit logging enabled
- [ ] Access control verified
- [ ] Dependencies updated

---

## Cost Estimation

### Hosting Options
1. **AWS/Azure/GCP:** $20-100/month (depending on scale)
2. **DigitalOcean:** $5-20/month
3. **Heroku:** $7-25/month (easier deployment)
4. **On-premises:** Initial setup + maintenance

### Required Resources
- Web server: 2GB RAM minimum
- Database server: 5GB storage minimum
- Email service (optional): $10-50/month
- SSL certificate: $0-100/year

---

## Contact & Support

For deployment assistance, contact your DevOps team or system administrator.

---

**Last Updated:** December 2024
**Version:** 1.0.0
