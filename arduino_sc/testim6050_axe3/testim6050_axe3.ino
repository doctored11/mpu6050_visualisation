#include <Wire.h>
#include <Math.h>
// код хорош для трех осей - но немного не то ( смещение из за z)

const int MPU_addr = 0x68;
const int minVal = 600;
const int maxVal = 1100;
const float Accel_Scale_Factor = 16384.0;
const float Gyro_Scale_Factor = 131.0;

float AcX, AcY, AcZ, Tmp, GyroX, GyroY, GyroZ;
float elapsedTime, currentTime, previousTime;
float roll, pitch, yaw;

void setup() {
  Wire.begin();
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x6B);
  Wire.write(0x00);
  Wire.endTransmission(true);
  Serial.begin(9600);
}

void loop() {

  Wire.beginTransmission(MPU_addr);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr, 6, true);
  AcX = (Wire.read() << 8 | Wire.read()) / Accel_Scale_Factor;
  AcY = (Wire.read() << 8 | Wire.read()) / Accel_Scale_Factor;
  AcZ = (Wire.read() << 8 | Wire.read()) / Accel_Scale_Factor;

  roll = atan2(AcY, AcZ) * RAD_TO_DEG;
  pitch = atan2(-AcX, sqrt(pow(AcY, 2) + pow(AcZ, 2))) * RAD_TO_DEG;

  previousTime = currentTime;
  currentTime = millis();
  elapsedTime = (currentTime - previousTime) / 1000.0;
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x43);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr, 6, true);
  GyroX = (Wire.read() << 8 | Wire.read()) / Gyro_Scale_Factor;
  GyroY = (Wire.read() << 8 | Wire.read()) / Gyro_Scale_Factor;
  GyroZ = (Wire.read() << 8 | Wire.read()) / Gyro_Scale_Factor;
  yaw += GyroZ * elapsedTime;

  Serial.println(String(roll) + " " + String(pitch) + " " + String(yaw));
  
  delay(10);
}