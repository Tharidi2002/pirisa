@echo off
echo Installing Java 11 for HRM Backend...

REM Download and install Java 11
echo Downloading Java 11...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.23%2B9/OpenJDK11U-jdk_x64_windows_hotspot_11.0.23_9.zip' -OutFile 'java11.zip'"

echo Extracting Java...
powershell -Command "Expand-Archive -Path 'java11.zip' -DestinationPath 'C:\' -Force"

echo Setting JAVA_HOME...
setx JAVA_HOME "C:\jdk-11.0.23+9" /M
set PATH=%PATH%;C:\jdk-11.0.23+9\bin

echo Java installation completed!
echo Please restart your terminal and run: java -version
pause
