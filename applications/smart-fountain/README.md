# Smart Fountain ESPHome Configuration

## Hardware Components
- ESP32-C3 Development Board
- TB6612 Dual Motor Driver
- 6V DC Dosing Pump

## Wiring Connections

### TB6612 Motor Driver to ESP32-C3:
- PWMA → GPIO4 (PWM Speed Control)
- AIN1 → GPIO5 (Direction Control 1) 
- AIN2 → GPIO6 (Direction Control 2)
- STBY → GPIO7 (Standby/Enable Pin)
- VCC → 3.3V
- GND → GND

### TB6612 Motor Driver to Pump:
- MOTOR A+ → Pump positive terminal
- MOTOR A- → Pump negative terminal

### Power Supply:
- Connect 6V power supply to TB6612 VIN and GND
- Ensure common ground between ESP32 and motor driver

## Features
- **Manual Control**: Forward and backward pump switches
- **Auto Cycle Mode**: Automatically cycles pump forward (12s) then backward (5s)
- **WiFi Connectivity**: Connect to Home Assistant or use web interface
- **Logging**: Monitor pump operations through serial/web logs

## Configuration
1. Update `secrets.yaml` with your WiFi credentials
2. Flash the configuration to your ESP32-C3
3. Use the web interface or Home Assistant to control the pump

## Pump Cycle Timing
- Forward: 12 seconds at 80% speed
- Stop: 1 second pause
- Backward: 5 seconds at 80% speed  
- Stop: 2 second pause before next cycle
