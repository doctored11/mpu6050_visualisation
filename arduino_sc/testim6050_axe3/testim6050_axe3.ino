// код хорош для трех осей - но немного не то ( смещение из за z)
#include <Wire.h>
#include <Math.h>
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 16, 2);


//диоды
float delta = 5;          // допустимое отклонение
int loopDelay = 40;  //задержка между запросами к мпу6050
// если проверка идет через визуализацию на пк  ставим задержку от 5 до 20, если на lcd экране то от 100


//диоды
constexpr uint8_t ledX_more = A2;
constexpr uint8_t ledX_less = 7;
constexpr uint8_t ledY_more = A1;
constexpr uint8_t ledY_less = 8;
constexpr uint8_t ledZ_more = A0;
constexpr uint8_t ledZ_less = 9;



const int MPU_addr = 0x68;
const int minVal = 600;
const int maxVal = 1100;
const float Accel_Scale_Factor = 16384.0;
const float Gyro_Scale_Factor = 131.0;

float AcX, AcY, AcZ, Tmp, GyroX, GyroY, GyroZ;
float elapsedTime, currentTime, previousTime;
float roll, pitch, yaw;
float startRoll, startPitch, startYaw;
float yaw_prev;


void setup() {
  Wire.begin();
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x6B);
  Wire.write(0x00);
  Wire.endTransmission(true);
  Serial.begin(9600);

  //дисплей (по i2c)
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  //диод
  pinMode(ledX_more, OUTPUT);
  pinMode(ledX_less, OUTPUT);
  pinMode(ledY_more, OUTPUT);
  pinMode(ledY_less, OUTPUT);
  pinMode(ledZ_more, OUTPUT);
  pinMode(ledZ_less, OUTPUT);
  //
  checkSetup();

  
  //берем начальные значения ( зануляем начальное полложение)
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr, 6, true);
  AcX = (Wire.read() << 8 | Wire.read()) / Accel_Scale_Factor;
  AcY = (Wire.read() << 8 | Wire.read()) / Accel_Scale_Factor;
  AcZ = (Wire.read() << 8 | Wire.read()) / Accel_Scale_Factor;

  startRoll = atan2(AcY, AcZ) * RAD_TO_DEG;
  startPitch = atan2(-AcX, sqrt(pow(AcY, 2) + pow(AcZ, 2))) * RAD_TO_DEG;
  
  startYaw = getGyroStart();//  (начальное значение по z плохо калибруется)
  
  // Serial.println(String(startRoll) + " " + String(startPitch) + " " + String(startYaw));
  
  // delay(3000);
  if( loopDelay <80) lcd.print("too fast for lcd");
  yaw=-startYaw;//z калибруется 1 раз в начале из за особенности его вычесления
  ////
}

void loop() {

  Wire.beginTransmission(MPU_addr);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr, 6, true);
  AcX = (Wire.read() << 8 | Wire.read()) / Accel_Scale_Factor;
  AcY = (Wire.read() << 8 | Wire.read()) / Accel_Scale_Factor;
  AcZ = (Wire.read() << 8 | Wire.read()) / Accel_Scale_Factor;

  roll = atan2(AcY, AcZ) * RAD_TO_DEG-startRoll;
  pitch = atan2(-AcX, sqrt(pow(AcY, 2) + pow(AcZ, 2))) * RAD_TO_DEG-startPitch;

  previousTime = currentTime;
  currentTime = millis();
  elapsedTime = (currentTime - previousTime) / 1000.0;
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x43);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr, 6, true);
  GyroX = (Wire.read() << 8 | Wire.read()) / Gyro_Scale_Factor;  //не используем - но для последовательного чтения нужно считать
  GyroY = (Wire.read() << 8 | Wire.read()) / Gyro_Scale_Factor;  //не используем - но для последовательного чтения нужно считать
  GyroZ = (Wire.read() << 8 | Wire.read()) / Gyro_Scale_Factor;
  yaw_prev = yaw;
  yaw += GyroZ * elapsedTime;  // deg/s * s = deg
  

  if (test(yaw,yaw_prev)) yaw=yaw_prev; // протстое устранение дрейфа в неподвижном состоянии


  Serial.println(String(roll) + " " + String(pitch) + " " + String(yaw));
  if (loopDelay>80) displayPrint(roll, pitch, yaw);
  diodsCheck(roll, ledX_more, ledX_less);
  diodsCheck(pitch, ledY_more, ledY_less);
  diodsCheck(yaw, ledZ_more, ledZ_less);

  delay(loopDelay);
}
// 
// 
// 
void displayPrint(float x, float y, float z) {//вывод на lcd дисплей
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("X:");
  lcd.print(ceil(x));
  lcd.print(" Z:");
  lcd.print(ceil(z));
  lcd.setCursor(0, 1);
  lcd.print("Y:");
  lcd.print(ceil(y));
}
void diodsCheck(float now, int pin1, int pin2) {  // функция для проверки отклонения и зажигания диодов

  if (abs(now - 0) <= delta) {
    digitalWrite(pin1, 0);
    digitalWrite(pin2, 0);
    return;
  }
  if (0 > now) {
    digitalWrite(pin1, 1);
    digitalWrite(pin2, 0);
  } else if (0 < now) {
    digitalWrite(pin1, 0);
    digitalWrite(pin2, 1);
  }
}

void checkSetup() {  //просто проверка на все контакты
  lcd.noBacklight();
  int diodArr[] = { ledX_more, ledX_less, ledY_more, ledY_less, ledZ_more, ledZ_less };
  for (int i = 0; i < (sizeof(diodArr) / sizeof(int)); i+=2) {
    digitalWrite(diodArr[i], 1);
    digitalWrite(diodArr[i+1], 1);
    delay(200);
  }
  delay(500);
  lcd.backlight();
  for (int j = 0; j < 2; ++j) {
    for (int i = 0; i < 16; ++i) {
      lcd.setCursor(i, 0);
      lcd.print(char(255));
      lcd.setCursor(i, 1);
      lcd.print(char(255));
      delay(100);
    }
    lcd.clear();
  }
  delay(500);
}

bool test(float now, float prev) {
  // Serial.println(abs(now) - abs(prev) < 2);
  return (abs(now) - abs(prev) < 1 && abs(now) - abs(prev) > -1);
}
// 
float getGyroStart(){
  float _yaw=0,_yaw_prev=0;
  for( int i=0;i<100;++i){
  previousTime = currentTime;
  currentTime = millis();
  elapsedTime = (currentTime - previousTime) / 1000.0;
  // 
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x43);  // starting with register 0x43 (GYRO_XOUT_H)
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_addr,6,true);  // request a total of 6 registers
  GyroX = (Wire.read() << 8 | Wire.read()) / Gyro_Scale_Factor;  //не используем - но для последовательного чтения нужно считать
  GyroY = (Wire.read() << 8 | Wire.read()) / Gyro_Scale_Factor;  //не используем - но для последовательного чтения нужно считать
  GyroZ = (Wire.read() << 8 | Wire.read()) / Gyro_Scale_Factor;
  _yaw_prev = _yaw;
  _yaw += GyroZ * elapsedTime;
  }
  return _yaw;
}