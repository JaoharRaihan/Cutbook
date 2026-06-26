#!/bin/bash
# Generate app icons for Android and iOS using CutBook_logo.png

SRC="src/assets/CutBook_logo.png"

if [ ! -f "$SRC" ]; then
  echo "Error: Source image $SRC not found!"
  exit 1
fi

echo "Copying source logo to other assets..."
cp "$SRC" "src/assets/loginlogo.png"
cp "$SRC" "src/assets/cutbookicon.png"

echo "Generating Android Icons..."
# Android launcher mipmap icons
sips -z 48 48 "$SRC" --out "android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
sips -z 48 48 "$SRC" --out "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"

sips -z 72 72 "$SRC" --out "android/app/src/main/res/mipmap-hdpi/ic_launcher.png"
sips -z 72 72 "$SRC" --out "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"

sips -z 96 96 "$SRC" --out "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
sips -z 96 96 "$SRC" --out "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"

sips -z 144 144 "$SRC" --out "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
sips -z 144 144 "$SRC" --out "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"

sips -z 192 192 "$SRC" --out "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
sips -z 192 192 "$SRC" --out "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"

sips -z 512 512 "$SRC" --out "android/app/src/main/ic_launcher-playstore.png"

echo "Generating iOS Icons..."
# iOS AppIcon.appiconset
IOS_DIR="ios/CutBook/Images.xcassets/AppIcon.appiconset"
sips -z 20 20 "$SRC" --out "$IOS_DIR/Icon-20.png"
sips -z 40 40 "$SRC" --out "$IOS_DIR/Icon-20@2x.png"
sips -z 60 60 "$SRC" --out "$IOS_DIR/Icon-20@3x.png"

sips -z 29 29 "$SRC" --out "$IOS_DIR/Icon-29.png"
sips -z 58 58 "$SRC" --out "$IOS_DIR/Icon-29@2x.png"
sips -z 87 87 "$SRC" --out "$IOS_DIR/Icon-29@3x.png"

sips -z 40 40 "$SRC" --out "$IOS_DIR/Icon-40.png"
sips -z 80 80 "$SRC" --out "$IOS_DIR/Icon-40@2x.png"
sips -z 120 120 "$SRC" --out "$IOS_DIR/Icon-40@3x.png"

sips -z 120 120 "$SRC" --out "$IOS_DIR/Icon-60@2x.png"
sips -z 180 180 "$SRC" --out "$IOS_DIR/Icon-60@3x.png"

sips -z 76 76 "$SRC" --out "$IOS_DIR/Icon-76.png"
sips -z 152 152 "$SRC" --out "$IOS_DIR/Icon-76@2x.png"

sips -z 167 167 "$SRC" --out "$IOS_DIR/Icon-83.5@2x.png"

sips -z 1024 1024 "$SRC" --out "$IOS_DIR/Icon-1024.png"

echo "Done generating app icons!"
