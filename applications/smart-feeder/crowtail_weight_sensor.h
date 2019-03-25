#include "esphome.h"
#include "esphome/log.h"

using namespace esphome;
static const char *TAG = "sensor.crowtail_weight_sensor";

static const long BOWL_ZERO_WEIGHT = 8264430;

class CrowtailWeightSensor : public PollingComponent, public sensor::Sensor
{
private:
  long _offset;
  float _scale;

public:
  CrowtailWeightSensor() : PollingComponent(5000) {}

  void setup() override
  {
    pinMode(SCL, OUTPUT);
    pinMode(SDA, INPUT);

    digitalWrite(SCL, HIGH);
    delayMicroseconds(100);
    digitalWrite(SCL, LOW);

    //setOffset(averageValue());
    setOffset(BOWL_ZERO_WEIGHT);
    setScale();
  }

  void update() override
  {
    int weight_in_grams = (int) getGram();
    publish_state(weight_in_grams);
  }

  long averageValue(byte times = 15)
  {
    long sum = 0;
    for (byte i = 0; i < times; i++)
    {
      sum += getValue();
    }
    return sum / times;
  }

  long getValue()
  {
    byte data[3];

    while (digitalRead(SDA))
      ;

    for (byte j = 3; j--;)
    {
      for (char i = 8; i--;)
      {
        digitalWrite(SCL, HIGH);
        bitWrite(data[j], i, digitalRead(SDA));
        digitalWrite(SCL, LOW);
      }
    }

    digitalWrite(SCL, HIGH);
    digitalWrite(SCL, LOW);

    data[2] ^= 0x80;

    return ((uint32_t)data[2] << 16) | ((uint32_t)data[1] << 8) | (uint32_t)data[0];
  }

  void setOffset(long offset)
  {
    _offset = offset;
  }

  void setScale(float scale = 742.f)
  {
    _scale = scale;
  }

  float getGram()
  {
    long val = (averageValue() - _offset);
    return (float) (val / _scale * 5 / 3);
  }
};