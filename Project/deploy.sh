#!/bin/bash

###############################################################################
# Hitster Trainer - Automatisch Deployment Script voor Ubuntu Server
# 
# Dit script installeert en configureert alles wat nodig is om de Hitster 
# Trainer applicatie te draaien op een Ubuntu server met Nginx.
###############################################################################

set -e  # Stop bij errors

echo "🎵 Hitster Trainer Deployment Script"
echo "===================================="
echo ""

# Kleuren voor output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuratie variabelen
APP_NAME="hitster-trainer"
APP_DIR="/var/www/$APP_NAME"
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$APP_NAME"
PORT=3000

# Functie voor het printen van berichten
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check of script als root wordt uitgevoerd
if [ "$EUID" -ne 0 ]; then 
    print_error "Dit script moet als root worden uitgevoerd (gebruik sudo)"
    exit 1
fi

print_info "Script wordt uitgevoerd als root"
echo ""

# Stap 1: Systeem updaten
echo "📦 Stap 1: Systeem updaten..."
apt-get update -qq
print_success "Systeem packages zijn bijgewerkt"
echo ""

# Stap 2: Nginx installeren
echo "🔧 Stap 2: Nginx installeren..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    print_success "Nginx is geïnstalleerd"
else
    print_info "Nginx is al geïnstalleerd"
fi
echo ""

# Stap 3: App directory aanmaken
echo "📁 Stap 3: App directory aanmaken..."
mkdir -p "$APP_DIR"
print_success "Directory $APP_DIR aangemaakt"
echo ""

# Stap 4: Bestanden kopiëren
echo "📋 Stap 4: Applicatie bestanden kopiëren..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Kopieer alleen de noodzakelijke bestanden (geen SSL certs of Python scripts)
cp "$SCRIPT_DIR/index.html" "$APP_DIR/" 2>/dev/null || print_error "index.html niet gevonden"
cp "$SCRIPT_DIR/callback.html" "$APP_DIR/" 2>/dev/null || print_error "callback.html niet gevonden"
cp "$SCRIPT_DIR/demo.html" "$APP_DIR/" 2>/dev/null || print_error "demo.html niet gevonden"
cp "$SCRIPT_DIR/app.js" "$APP_DIR/" 2>/dev/null || print_error "app.js niet gevonden"
cp "$SCRIPT_DIR/quiz.js" "$APP_DIR/" 2>/dev/null || print_error "quiz.js niet gevonden"
cp "$SCRIPT_DIR/spotify-auth.js" "$APP_DIR/" 2>/dev/null || print_error "spotify-auth.js niet gevonden"
cp "$SCRIPT_DIR/hitster-songs.js" "$APP_DIR/" 2>/dev/null || print_error "hitster-songs.js niet gevonden"
cp "$SCRIPT_DIR/style.css" "$APP_DIR/" 2>/dev/null || print_error "style.css niet gevonden"

print_success "Applicatie bestanden gekopieerd"
echo ""

# Stap 5: Nginx configuratie aanmaken
echo "⚙️  Stap 5: Nginx configureren..."

cat > "$NGINX_CONFIG" << EOF
server {
    listen $PORT;
    listen [::]:$PORT;

    server_name _;

    root $APP_DIR;
    index index.html;

    # Logging
    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;

    # Gzip compressie voor betere performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS headers (nodig voor Spotify API)
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable .git access
    location ~ /\.git {
        deny all;
        return 404;
    }
}
EOF

print_success "Nginx configuratie aangemaakt"
echo ""

# Stap 6: Nginx site enablen
echo "🔗 Stap 6: Nginx site activeren..."
if [ -L "$NGINX_ENABLED" ]; then
    rm "$NGINX_ENABLED"
fi
ln -s "$NGINX_CONFIG" "$NGINX_ENABLED"
print_success "Site geactiveerd"
echo ""

# Stap 7: Nginx configuratie testen
echo "🧪 Stap 7: Nginx configuratie testen..."
if nginx -t; then
    print_success "Nginx configuratie is geldig"
else
    print_error "Nginx configuratie bevat fouten!"
    exit 1
fi
echo ""

# Stap 8: Permissions instellen
echo "🔐 Stap 8: Bestandspermissies instellen..."
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"
print_success "Permissions ingesteld"
echo ""

# Stap 9: Nginx herstarten
echo "🔄 Stap 9: Nginx herstarten..."
systemctl restart nginx
systemctl enable nginx
print_success "Nginx herstart en ingesteld om automatisch te starten"
echo ""

# Stap 10: Firewall configureren (optioneel)
echo "🔥 Stap 10: Firewall configureren..."
if command -v ufw &> /dev/null; then
    print_info "UFW firewall gevonden, poort $PORT wordt toegestaan..."
    ufw allow $PORT/tcp
    print_success "Firewall regel toegevoegd voor poort $PORT"
else
    print_info "UFW niet gevonden, firewall stap overgeslagen"
fi
echo ""

# Status check
echo "📊 Deployment Status:"
echo "===================="
echo ""
print_success "✓ Nginx is geïnstalleerd en draait"
print_success "✓ Applicatie bestanden zijn gekopieerd naar $APP_DIR"
print_success "✓ Nginx is geconfigureerd en draait op poort $PORT"
print_success "✓ Site is toegankelijk via HTTP"
echo ""

# Server informatie tonen
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "🌐 Server Informatie:"
echo "===================="
echo "   IP Adres: $SERVER_IP"
echo "   Poort: $PORT"
echo "   App Directory: $APP_DIR"
echo "   Nginx Config: $NGINX_CONFIG"
echo ""

echo "📝 Volgende stappen:"
echo "===================="
echo "1. Configureer je reverse proxy om te forwarden naar:"
echo "   http://$SERVER_IP:$PORT"
echo ""
echo "2. Update de redirect URI in spotify-auth.js naar je HTTPS domein:"
echo "   bijv: https://joudomein.nl/callback.html"
echo ""
echo "3. Voeg deze redirect URI toe in je Spotify Developer Dashboard"
echo ""
echo "4. Test de applicatie via je reverse proxy domein"
echo ""

print_success "🎉 Deployment succesvol afgerond!"
echo ""
echo "📋 Handige commando's:"
echo "   - Nginx status: systemctl status nginx"
echo "   - Nginx logs: tail -f /var/log/nginx/${APP_NAME}_error.log"
echo "   - Nginx herstarten: systemctl restart nginx"
echo "   - Bestanden updaten: kopieer nieuwe bestanden naar $APP_DIR"
echo ""
