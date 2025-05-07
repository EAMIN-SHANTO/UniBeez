#!/bin/bash

# This script is run during the build process to ensure environment variables are set
echo "Building UniBeez client with environment variable VITE_API_URL=$VITE_API_URL"

# Create a .env.local file with the API URL
echo "VITE_API_URL=$VITE_API_URL" > .env.local

# Run the actual build command
npm run build
