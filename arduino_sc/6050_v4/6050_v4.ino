#include <Wire.h>

const int MPU_addr = 0x68;
float AcX, AcY, AcZ, Tmp, GyroX, GyroY, GyroZ;
float elapsedTime, currentTime, previousTime;
float accAngleX, accAngleY, gyroAngleX, gyroAngleY, gyroAngleZ;
float roll, pitch, yaw;
float acDegX, acDegY, gyroDegZ = 0, gyroDegY;
float gyroDegZ_prev;

int minVal = 600;
int maxVal = 1100;

double x;
double y;
float z;

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
  //акселерометр
  Wire.requestFrom(MPU_addr, 6, true);
  AcX = (Wire.read() << 8 | Wire.read());
  AcY = (Wire.read() << 8 | Wire.read());
  AcZ = (Wire.read() << 8 | Wire.read());
  //  Serial.println( AcX);
  int xAng = map(AcX, minVal, maxVal, -90, 90);
  int yAng = map(AcY, minVal, maxVal, -90, 90);
  int zAng = map(AcZ, minVal, maxVal, -90, 90);



  acDegX = RAD_TO_DEG * (atan2f(-yAng, -zAng) + PI);
  acDegY = RAD_TO_DEG * (atan2f(-xAng, -zAng) + PI);

  

  //гироскоп
  previousTime = currentTime;                         // Предыдущее время сохраняется до фактического чтения
  currentTime = millis();                             // Текущее время Фактическое время чтения
  elapsedTime = (currentTime - previousTime) / 1000;  // Разделим на 1000, чтобы получить секунды
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x43);  // Адрес первого регистра данных гироскопа 0x43
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr, 6, true);  // Чтение всех 4 регистров, значение каждой оси сохраняется в 2 регистрах

  GyroX = (Wire.read() << 8 | Wire.read()) / 131.0;  // Для диапазона 250 градусов / с мы должны сначала разделить необработанное значение на 131.0, согласно datasheet

  GyroY = (Wire.read() << 8 | Wire.read()) / 131.0;
  GyroZ = (Wire.read() << 8 | Wire.read()) / 131.0;
  // Корректируем выходы с вычисленными значениями ошибок

  gyroDegZ_prev = gyroDegZ;
  gyroDegZ += GyroZ * elapsedTime;  // deg/s * s = deg

  if (test(gyroDegZ,gyroDegZ_prev)) gyroDegZ=gyroDegZ_prev;




  // Serial.println(delta);
  // x = 0.99 * gyroDegX + 0.01 * acDegX;
  // y = 0.9 * gyroDegY + 0.1 * acDegY;
  // Serial.println(String(ceil(acDegY)) + " " + String(ceil(gyroDegY)));
  x = acDegX;
  y = acDegY;
  z =gyroDegZ;



  Serial.println(String(ceil(x)) + " " + String(ceil(y)) + " " + String(ceil(z)));
  delay(10);
}

bool test(float now, float prev) {
  // Serial.println(abs(now) - abs(prev) < 2);
  return (abs(now) - abs(prev) < 1 && abs(now) - abs(prev) > -1);
}