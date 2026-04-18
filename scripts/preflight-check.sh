#!/bin/bash

# Phase 5 Testing - Pre-Flight Check Script
# Run this before starting manual testing to catch common issues

echo "🔍 CutBook App - Pre-Flight Check"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASS_COUNT++))
    else
        echo -e "${RED}✗${NC} $2 - File not found: $1"
        ((FAIL_COUNT++))
    fi
}

# Function to check for mock data
check_mock_data() {
    FILE=$1
    NAME=$2

    if [ -f "$FILE" ]; then
        MOCK_COUNT=$(grep -c "mockEntries\|mockUsers\|mockServices" "$FILE" 2>/dev/null || echo "0")
        EMPTY_ARRAY=$(grep -c "const allEntries.*\[\]" "$FILE" 2>/dev/null || echo "0")

        if [ "$MOCK_COUNT" -gt 0 ] || [ "$EMPTY_ARRAY" -gt 0 ]; then
            echo -e "${RED}✗${NC} $NAME - Found mock data ($MOCK_COUNT instances)"
            ((FAIL_COUNT++))
        else
            echo -e "${GREEN}✓${NC} $NAME - No mock data"
            ((PASS_COUNT++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} $NAME - File not found: $FILE"
        ((WARN_COUNT++))
    fi
}

# Function to check TypeScript errors
check_typescript() {
    FILE=$1
    NAME=$2

    if [ -f "$FILE" ]; then
        # Simple check - would need actual TS compiler for full check
        SYNTAX_ISSUES=$(grep -E ":\s*(any|TODO|FIXME|ERROR)" "$FILE" 2>/dev/null | wc -l)

        if [ "$SYNTAX_ISSUES" -gt 5 ]; then
            echo -e "${YELLOW}⚠${NC} $NAME - $SYNTAX_ISSUES potential issues found"
            ((WARN_COUNT++))
        else
            echo -e "${GREEN}✓${NC} $NAME - Looks clean"
            ((PASS_COUNT++))
        fi
    fi
}

echo "1. Checking Core Files..."
echo "------------------------"
check_file "src/context/AuthContext.tsx" "AuthContext"
check_file "src/context/OrgContext.tsx" "OrgContext"
check_file "src/context/DataContext.tsx" "DataContext"
check_file "src/hooks/useDailySummary.ts" "useDailySummary hook"
echo ""

echo "2. Checking Owner Screens..."
echo "----------------------------"
check_file "src/screens/owner/DashboardScreen.tsx" "DashboardScreen"
check_file "src/screens/owner/AddWorkEntryScreen.tsx" "AddWorkEntryScreen"
check_file "src/screens/owner/EmployeesScreen.tsx" "EmployeesScreen"
check_file "src/screens/owner/ServicesScreen.tsx" "ServicesScreen"
echo ""

echo "3. Checking Employee Screens..."
echo "-------------------------------"
check_file "src/screens/employee/EmployeeHomeScreen.tsx" "EmployeeHomeScreen"
check_file "src/screens/employee/HistoryScreen.tsx" "HistoryScreen"
check_file "src/screens/employee/ProfileScreen.tsx" "ProfileScreen"
echo ""

echo "4. Checking for Mock Data (Phase 4 should have removed all)..."
echo "--------------------------------------------------------------"
check_mock_data "src/hooks/useDailySummary.ts" "useDailySummary"
check_mock_data "src/screens/owner/DashboardScreen.tsx" "DashboardScreen"
check_mock_data "src/screens/owner/AddWorkEntryScreen.tsx" "AddWorkEntryScreen"
check_mock_data "src/screens/owner/EmployeesScreen.tsx" "EmployeesScreen"
check_mock_data "src/screens/owner/ServicesScreen.tsx" "ServicesScreen"
check_mock_data "src/screens/employee/EmployeeHomeScreen.tsx" "EmployeeHomeScreen"
check_mock_data "src/screens/employee/HistoryScreen.tsx" "HistoryScreen"
echo ""

echo "5. Checking Firebase Configuration..."
echo "-------------------------------------"
check_file "android/app/google-services.json" "Firebase Android config"
if [ -f "android/app/google-services.json" ]; then
    PROJECT_ID=$(grep -o '"project_id":\s*"[^"]*"' android/app/google-services.json | cut -d'"' -f4)
    if [ "$PROJECT_ID" = "cutbook-47881" ]; then
        echo -e "${GREEN}✓${NC} Firebase project ID correct: $PROJECT_ID"
        ((PASS_COUNT++))
    else
        echo -e "${RED}✗${NC} Firebase project ID mismatch: $PROJECT_ID"
        ((FAIL_COUNT++))
    fi
fi
echo ""

echo "6. Checking Navigation Setup..."
echo "-------------------------------"
check_file "src/navigation/RootNavigator.tsx" "RootNavigator"
check_file "src/navigation/OwnerNavigator.tsx" "OwnerNavigator"
check_file "src/navigation/EmployeeNavigator.tsx" "EmployeeNavigator"
check_file "src/navigation/AuthNavigator.tsx" "AuthNavigator"
echo ""

echo "7. Checking Dependencies..."
echo "---------------------------"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json exists"
    ((PASS_COUNT++))

    # Check critical dependencies
    FIREBASE_DEPS=$(grep -c "@react-native-firebase" package.json)
    if [ "$FIREBASE_DEPS" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Firebase dependencies found ($FIREBASE_DEPS packages)"
        ((PASS_COUNT++))
    else
        echo -e "${RED}✗${NC} Firebase dependencies missing"
        ((FAIL_COUNT++))
    fi
else
    echo -e "${RED}✗${NC} package.json not found"
    ((FAIL_COUNT++))
fi
echo ""

echo "8. Checking Build Files..."
echo "-------------------------"
check_file "android/app/build.gradle" "Android build.gradle"
check_file "android/build.gradle" "Android root build.gradle"
check_file "android/gradle.properties" "Android gradle.properties"
check_file "App.tsx" "App entry point"
echo ""

echo "9. Checking for useData() Integration..."
echo "----------------------------------------"
FILES_TO_CHECK=(
    "src/screens/owner/AddWorkEntryScreen.tsx"
    "src/screens/employee/EmployeeHomeScreen.tsx"
    "src/screens/employee/HistoryScreen.tsx"
    "src/hooks/useDailySummary.ts"
)

for FILE in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$FILE" ]; then
        if grep -q "useData\|DataContext" "$FILE"; then
            echo -e "${GREEN}✓${NC} $(basename $FILE) - useData integrated"
            ((PASS_COUNT++))
        else
            echo -e "${RED}✗${NC} $(basename $FILE) - useData NOT found"
            ((FAIL_COUNT++))
        fi
    fi
done
echo ""

echo "10. Checking for Employee Data Filtering..."
echo "-------------------------------------------"
FILTER_FILES=(
    "src/screens/employee/EmployeeHomeScreen.tsx"
    "src/screens/employee/HistoryScreen.tsx"
)

for FILE in "${FILTER_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        if grep -q "employeeId.*currentUser\|myEntries.*filter" "$FILE"; then
            echo -e "${GREEN}✓${NC} $(basename $FILE) - Employee filtering found"
            ((PASS_COUNT++))
        else
            echo -e "${YELLOW}⚠${NC} $(basename $FILE) - Employee filtering unclear"
            ((WARN_COUNT++))
        fi
    fi
done
echo ""

echo "=================================="
echo "Pre-Flight Check Complete!"
echo "=================================="
echo ""
echo -e "${GREEN}Passed:${NC} $PASS_COUNT"
echo -e "${YELLOW}Warnings:${NC} $WARN_COUNT"
echo -e "${RED}Failed:${NC} $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC} Ready to begin Phase 5 testing."
    echo ""
    echo "Next steps:"
    echo "1. Build app: npx react-native run-android"
    echo "2. Open PHASE_5_QUICK_START.md"
    echo "3. Start with Critical Test Path 1"
    exit 0
elif [ $FAIL_COUNT -lt 3 ]; then
    echo -e "${YELLOW}⚠ Some checks failed.${NC} Review issues above."
    echo "You may still proceed with testing, but fix critical issues first."
    exit 1
else
    echo -e "${RED}✗ Multiple checks failed!${NC} Fix issues before testing."
    echo "Review the failures above and resolve them."
    exit 2
fi
