#!/bin/sh

echo "Downloading ROM..."

# Download raw paste
curl -s $PASTE_URL > /app/program_raw.js

# Wrap it with your custom code
echo "var my_program = [" > /app/rom.js
cat /app/program_raw.js >> /app/rom.js
echo "];" >> /app/rom.js

echo "ROM prepared."

# Start your server
exec node server.js