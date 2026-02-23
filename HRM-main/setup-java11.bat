@echo off
echo Setting up Java 11 for HRM Project...
set JAVA_HOME=D:\Program Files\Java\jdk-11.0.17
set PATH=%JAVA_HOME%\bin;%PATH%
echo JAVA_HOME set to: %JAVA_HOME%
echo Java version:
java -version
echo.
echo Testing Maven compilation...
call mvnw.cmd clean compile
pause
