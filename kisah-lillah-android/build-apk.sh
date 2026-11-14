#!/usr/bin/env bash
# Build APK Kisah Lillah (aplikasi Android native; folder ../www dikemas di dalam APK).
# Pemakaian: ./build-apk.sh 5.1.1   -> versionName diganti, versionCode +1, hasil di rilis-apk/kisah-lillah-<versi>.apk
#            dan rilis-apk/Kisah-Lillah-<versi>.aab (untuk Play Store)
# Butuh keystore.properties (menunjuk ../twa/kisah-lillah.keystore; TIDAK ada di git, simpan cadangannya).
set -euo pipefail
cd "$(dirname "$0")"
VER="${1:?Isi versi, mis. ./build-apk.sh 5.1.1}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}" JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}"
[ -f local.properties ] || echo "sdk.dir=$ANDROID_HOME" > local.properties
CODE=$(($(grep -oP "versionCode \K\d+" app/build.gradle) + 1))
sed -i -E "s/versionCode [0-9]+/versionCode $CODE/; s/versionName '[^']*'/versionName '$VER'/" app/build.gradle
./gradlew assembleRelease bundleRelease --no-daemon -q
mkdir -p rilis-apk
cp app/build/outputs/apk/release/app-release.apk "rilis-apk/kisah-lillah-$VER.apk"
# AAB untuk Google Play Console (Play App Signing; kunci unggah = keystore yang sama)
cp app/build/outputs/bundle/release/app-release.aab "rilis-apk/Kisah-Lillah-$VER.aab"
echo "Selesai: rilis-apk/kisah-lillah-$VER.apk + Kisah-Lillah-$VER.aab (versi $VER, kode $CODE)"
