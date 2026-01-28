#!/bin/bash

# API Test Script for Maintenance Reminders
# Make this file executable: chmod +x test-reminders-api.sh
# Usage: ./test-reminders-api.sh

# CONFIGURATION
API_BASE_URL="http://localhost:3000"  # Adjust if your API runs on different port
CUSTOMER_TOKEN="YOUR_CUSTOMER_JWT_TOKEN_HERE"  # Replace with actual customer JWT token

echo "=========================================="
echo "Maintenance Reminders API Test Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Get active reminders (should be empty initially)
echo -e "${YELLOW}Test 1: Get Active Reminders${NC}"
echo "GET $API_BASE_URL/maintenance-reminders"
curl -X GET "$API_BASE_URL/maintenance-reminders" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "Expected: Empty array [] (no reminders yet)"
echo "=========================================="
echo ""

# Test 2: Create a booking without promo code
echo -e "${YELLOW}Test 2: Create Booking Without Promo Code${NC}"
echo "POST $API_BASE_URL/bookings"
read -p "Enter airconId: " AIRCON_ID
read -p "Enter addressId (optional, press enter to skip): " ADDRESS_ID
read -p "Enter service IDs (comma-separated, e.g., 1,3): " SERVICE_IDS

# Convert comma-separated IDs to JSON array
SERVICE_IDS_ARRAY=$(echo $SERVICE_IDS | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')

# Get tomorrow's date in YYYY-MM-DD format
TOMORROW=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d '+1 day' +%Y-%m-%d 2>/dev/null)

BOOKING_DATA="{
  \"airconId\": $AIRCON_ID,
  \"serviceIds\": $SERVICE_IDS_ARRAY,
  \"bookingForDate\": \"$TOMORROW\",
  \"bookingTime\": 10,
  \"description\": \"Test booking without promo code\"
}"

if [ ! -z "$ADDRESS_ID" ]; then
  BOOKING_DATA=$(echo $BOOKING_DATA | sed "s/}/,\"addressId\":$ADDRESS_ID}/")
fi

curl -X POST "$API_BASE_URL/bookings" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$BOOKING_DATA" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "Expected: 201 Created with booking details"
echo "=========================================="
echo ""

# Test 3: Create a booking WITH promo code (should fail if no promo codes exist yet)
echo -e "${YELLOW}Test 3: Create Booking With Promo Code${NC}"
read -p "Enter promo code (or press enter to skip): " PROMO_CODE

if [ ! -z "$PROMO_CODE" ]; then
  BOOKING_WITH_PROMO="{
    \"airconId\": $AIRCON_ID,
    \"serviceIds\": $SERVICE_IDS_ARRAY,
    \"bookingForDate\": \"$TOMORROW\",
    \"bookingTime\": 14,
    \"description\": \"Test booking with promo code\",
    \"promoCode\": \"$PROMO_CODE\"
  }"
  
  if [ ! -z "$ADDRESS_ID" ]; then
    BOOKING_WITH_PROMO=$(echo $BOOKING_WITH_PROMO | sed "s/}/,\"addressId\":$ADDRESS_ID}/")
  fi
  
  curl -X POST "$API_BASE_URL/bookings" \
    -H "Authorization: Bearer $CUSTOMER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$BOOKING_WITH_PROMO" \
    -w "\n\nHTTP Status: %{http_code}\n" \
    -s
  echo ""
  echo "Expected: 201 Created with discounted fees (if promo code valid)"
  echo "         OR 400 Bad Request (if promo code invalid)"
else
  echo "Skipped - No promo code provided"
fi
echo "=========================================="
echo ""

# Test 4: Update booking status to "done" (requires booking ID and technician token)
echo -e "${YELLOW}Test 4: Mark Booking as Done (to generate reminders)${NC}"
echo "This test requires technician/admin privileges"
read -p "Enter booking ID to mark as done (or press enter to skip): " BOOKING_ID
read -p "Enter technician/admin JWT token (or press enter to skip): " TECH_TOKEN

if [ ! -z "$BOOKING_ID" ] && [ ! -z "$TECH_TOKEN" ]; then
  curl -X PATCH "$API_BASE_URL/bookings/$BOOKING_ID" \
    -H "Authorization: Bearer $TECH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status": "done"}' \
    -w "\n\nHTTP Status: %{http_code}\n" \
    -s
  echo ""
  echo "Expected: 200 OK with updated booking"
  echo "Note: This should generate reminders if booking has service types 1,5,6,7"
else
  echo "Skipped - No booking ID or token provided"
fi
echo "=========================================="
echo ""

# Test 5: Get reminders again (should show newly created reminders)
echo -e "${YELLOW}Test 5: Get Active Reminders (After Generating)${NC}"
echo "GET $API_BASE_URL/maintenance-reminders"
echo "Waiting 2 seconds for reminders to be generated..."
sleep 2
curl -X GET "$API_BASE_URL/maintenance-reminders" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s
echo ""
echo "Expected: Array of reminders with promo codes (if booking was marked done)"
echo "=========================================="
echo ""

echo -e "${GREEN}✅ API Testing Complete!${NC}"
echo ""
echo "Manual Steps to Complete Testing:"
echo "1. Copy a promo code from Test 5 response"
echo "2. Create a new booking using that promo code (Test 3)"
echo "3. Verify the discount was applied correctly"
echo "4. Check that promo code is marked as used"
echo ""
