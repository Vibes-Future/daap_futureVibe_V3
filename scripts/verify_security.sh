#!/bin/bash
# Security Verification Script - Frontend DApp
# Run this before committing to ensure no sensitive data is exposed

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}🔒 SECURITY VERIFICATION - DApp${NC}"
echo -e "${BLUE}=================================${NC}\n"

ERRORS=0
WARNINGS=0

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        ((ERRORS++))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# 1. Check for exposed API keys in application files
echo -e "${BLUE}[1/8] Checking for API keys in application code...${NC}"
if grep -E "e4246c12|10bdc822" index.html src/js/*.js 2>/dev/null | grep -v "SECURITY_AUDIT" > /dev/null 2>&1; then
    print_status 1 "Found hardcoded API keys in application code!"
    echo -e "${YELLOW}   Critical files:${NC}"
    grep -n -E "e4246c12|10bdc822" index.html src/js/*.js 2>/dev/null | grep -v "SECURITY_AUDIT" | head -5
else
    print_status 0 "No API keys in application code"
fi

# 2. Check .env file
echo -e "\n${BLUE}[2/8] Checking .env configuration...${NC}"
if [ -f .env ]; then
    if git check-ignore .env > /dev/null 2>&1; then
        print_status 0 ".env file exists and is protected"
    else
        print_status 1 ".env exists but NOT in .gitignore!"
    fi
else
    print_warning ".env file not found (create from env.example)"
fi

# 3. Check for wallet files
echo -e "\n${BLUE}[3/8] Checking for wallet files...${NC}"
if find . -name "*wallet*.json" -o -name "*keypair*.json" 2>/dev/null | grep -v node_modules > /dev/null 2>&1; then
    if git check-ignore wallets/*.json > /dev/null 2>&1; then
        print_status 0 "Wallet files found but protected by .gitignore"
    else
        print_status 1 "Wallet files found and NOT protected!"
        find . -name "*wallet*.json" -o -name "*keypair*.json" 2>/dev/null | grep -v node_modules
    fi
else
    print_status 0 "No wallet files found"
fi

# 4. Check for sensitive files in git
echo -e "\n${BLUE}[4/8] Checking git tracked files...${NC}"
if git ls-files | grep -E "(wallet|keypair|\.key|\.seed|\.private)" > /dev/null 2>&1; then
    print_status 1 "Sensitive files tracked by git!"
    git ls-files | grep -E "(wallet|keypair|\.key|\.seed|\.private)"
else
    print_status 0 "No sensitive files in git"
fi

# 5. Check config.js
echo -e "\n${BLUE}[5/8] Checking src/js/config.js...${NC}"
if [ -f src/js/config.js ]; then
    if grep -E "api-key=" src/js/config.js > /dev/null 2>&1; then
        print_status 1 "API keys found in config.js!"
    else
        print_status 0 "config.js is clean"
    fi
else
    print_warning "src/js/config.js not found"
fi

# 6. Check documentation files
echo -e "\n${BLUE}[6/8] Checking documentation files...${NC}"
if grep -r "e4246c12\|10bdc822" docs/ --exclude="SECURITY_AUDIT_REPORT.md" 2>/dev/null > /dev/null 2>&1; then
    print_warning "API keys found in documentation"
    echo -e "${YELLOW}   Files with keys:${NC}"
    grep -r "e4246c12\|10bdc822" docs/ --exclude="SECURITY_AUDIT_REPORT.md" -l 2>/dev/null | head -5
else
    print_status 0 "Documentation files are clean"
fi

# 7. Check staged files
echo -e "\n${BLUE}[7/8] Checking staged files...${NC}"
if git diff --cached --name-only 2>/dev/null | grep -E "(wallet|keypair|\.key|\.env)" > /dev/null 2>&1; then
    print_status 1 "Sensitive files are staged!"
    git diff --cached --name-only | grep -E "(wallet|keypair|\.key|\.env)"
else
    print_status 0 "No sensitive files staged"
fi

# 8. Check for debug files
echo -e "\n${BLUE}[8/8] Checking for debug files...${NC}"
if [ -f debug-usdc-error.html ]; then
    if grep -E "api-key=" debug-usdc-error.html > /dev/null 2>&1; then
        print_status 1 "API keys found in debug file!"
    else
        print_warning "Debug file exists (consider removing)"
    fi
else
    print_status 0 "No debug files with keys"
fi

# Summary
echo -e "\n${BLUE}=================================${NC}"
echo -e "${BLUE}📊 VERIFICATION SUMMARY${NC}"
echo -e "${BLUE}=================================${NC}\n"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo -e "${GREEN}   Safe to commit to repository.${NC}\n"
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found:${NC}"
        echo -e "${YELLOW}   Review warnings above (non-critical).${NC}\n"
    fi
    
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. Review changes: ${YELLOW}git diff${NC}"
    echo -e "  2. Stage files: ${YELLOW}git add .${NC}"
    echo -e "  3. Commit: ${YELLOW}git commit -m 'your message'${NC}"
    echo -e "  4. Push: ${YELLOW}git push${NC}\n"
    
    exit 0
else
    echo -e "${RED}❌ $ERRORS critical issue(s) found!${NC}"
    echo -e "${RED}   DO NOT COMMIT until fixed.${NC}\n"
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) also found.${NC}\n"
    fi
    
    echo -e "${YELLOW}Action required:${NC}"
    echo -e "  1. Fix all ❌ errors above"
    echo -e "  2. See: ${BLUE}SECURITY_AUDIT_REPORT.md${NC}"
    echo -e "  3. Run this script again\n"
    
    exit 1
fi

