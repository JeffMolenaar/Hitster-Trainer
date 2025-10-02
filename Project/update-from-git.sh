#!/bin/bash

# Hitster Trainer - Server Update Script
# Run this script on the server to pull latest changes from GitHub and deploy

echo ""
echo "🚀 Hitster Trainer - Update from GitHub"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/JeffMolenaar/Hitster-Trainer.git"
TEMP_DIR="/tmp/hitster-update-$$"
WEB_DIR="/var/www/hitster-trainer"
PROJECT_DIR="Project"

echo -e "${CYAN}📥 Cloning repository...${NC}"
git clone --depth 1 --single-branch --branch main $REPO_URL $TEMP_DIR

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to clone repository${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Repository cloned${NC}"
echo ""

echo -e "${CYAN}📋 Files to deploy:${NC}"
cd $TEMP_DIR/$PROJECT_DIR
for file in *.html *.js *.css; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✓ $file${NC}"
    fi
done
echo ""

echo -e "${CYAN}📁 Copying files to web directory...${NC}"
sudo cp $TEMP_DIR/$PROJECT_DIR/*.html $WEB_DIR/ 2>/dev/null && echo -e "${GREEN}  ✓ HTML files${NC}"
sudo cp $TEMP_DIR/$PROJECT_DIR/*.js $WEB_DIR/ 2>/dev/null && echo -e "${GREEN}  ✓ JavaScript files${NC}"
sudo cp $TEMP_DIR/$PROJECT_DIR/*.css $WEB_DIR/ 2>/dev/null && echo -e "${GREEN}  ✓ CSS files${NC}"
echo ""

echo -e "${CYAN}🔐 Fixing permissions...${NC}"
sudo chown -R www-data:www-data $WEB_DIR/
sudo chmod -R 755 $WEB_DIR/
sudo find $WEB_DIR/ -type f -exec chmod 644 {} \;
echo -e "${GREEN}  ✓ Permissions fixed${NC}"
echo ""

echo -e "${CYAN}🔄 Reloading Nginx...${NC}"
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✓ Nginx reloaded${NC}"
else
    echo -e "${RED}  ✗ Nginx reload failed${NC}"
fi
echo ""

echo -e "${CYAN}🧹 Cleaning up...${NC}"
rm -rf $TEMP_DIR
echo -e "${GREEN}  ✓ Temporary files removed${NC}"
echo ""

echo -e "${GREEN}✅ Update complete!${NC}"
echo ""
echo -e "${CYAN}📊 Deployed files:${NC}"
ls -lh $WEB_DIR/*.html $WEB_DIR/*.js $WEB_DIR/*.css 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo -e "${GREEN}🌐 App is live at: https://hitster.millercodings.nl${NC}"
echo ""
