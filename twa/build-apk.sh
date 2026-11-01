#!/usr/bin/env bash
# Build APK Kisah Lillah (TWA: membuka https://agenda-hijriah.vercel.app di Chrome, layar penuh).
# Pemakaian: ./build-apk.sh 5.0.1
# Versi dinaikkan di app/build.gradle (versionName + versionCode +1), lalu APK bertanda tangan ada di dist/.
# Butuh kisah-lillah.keystore + keystore.properties (TIDAK ada di git; simpan cadangannya, tanpa itu update APK tidak bisa dipasang menimpa versi lama).
set -euo pipefail
cd "$(dirname "$0")"
VER="${1:?Isi versi, mis. ./build-apk.sh 5.0.1}"
SDK="${ANDROID_HOME:-$HOME/Android/Sdk}"
BT="$(ls -d "$SDK"/build-tools/* | sort -V | tail -1)"
export ANDROID_HOME="$SDK" JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}"
PW="$(grep '^storePassword=' keystore.properties | cut -d= -f2-)"

CODE=$(($(grep -oP 'versionCode \K\d+' app/build.gradle) + 1))
sed -i -E "s/versionCode [0-9]+/versionCode $CODE/; s/versionName \"[^\"]*\"/versionName \"$VER\"/" app/build.gradle
sed -i -E "s/\"appVersionCode\": [0-9]+/\"appVersionCode\": $CODE/; s/\"appVersionName\": \"[^\"]*\"/\"appVersionName\": \"$VER\"/; s/\"appVersion\": \"[^\"]*\"/\"appVersion\": \"$VER\"/" twa-manifest.json
[ -f local.properties ] || echo "sdk.dir=$SDK" > local.properties

./gradlew assembleRelease --no-daemon -q
mkdir -p dist
OUT="dist/kisah-lillah-v$VER.apk"
"$BT/zipalign" -f -p 4 app/build/outputs/apk/release/app-release-unsigned.apk dist/aligned.apk
"$BT/apksigner" sign --ks kisah-lillah.keystore --ks-key-alias kisahlillah --ks-pass "pass:$PW" --key-pass "pass:$PW" --out "$OUT" dist/aligned.apk
rm -f dist/aligned.apk "$OUT.idsig"
"$BT/apksigner" verify "$OUT"
echo "Selesai: $OUT (versi $VER, kode $CODE)"
