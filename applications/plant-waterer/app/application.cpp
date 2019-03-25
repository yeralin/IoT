#include <user_config.h>
#include <SmingCore/SmingCore.h>
#include <Libraries/Servo/ServoChannel.h>
#include "../SmingCore/Interrupts.h"
#include <NtpClientDelegate.h>

#define WATER_PUMP 5 // GPIO number
#define SOIL_SENSOR 14
#define MAX_LOG_SIZE 25
DriverPWM waterPWM;
Timer waterTimer;
DateTime lastWatering = -1;
os_event_t *serialQueue = nullptr;
HttpServer server;
espNtpClient *ntp;

template <typename T, int rawSize>
class Logger : public FILO<T, rawSize>
{
	virtual const T &operator[](unsigned int) const {}
	virtual T &operator[](unsigned int) {}
};
Logger<String, MAX_LOG_SIZE> logMessages;

int8_t waterInterval = 5;		//Default to 5 hours, might be changed
unsigned int waterDuration = 3; //Default to 3 seconds, might be changed
String indexMessage = "{\"status\":\"on\"}";

void appendLog(String message);
void logs(HttpRequest &request, HttpResponse &response);
void setWaterInterval(HttpRequest &request, HttpResponse &response);
void setWaterDuration(HttpRequest &request, HttpResponse &response);
void startWatering(HttpRequest &request, HttpResponse &response);
void startPump(os_event_t *arg);
void executeWatering(unsigned int duration);
void timedWaterCheck();
void startWebServer();
void init();

void onNtpReceive(NtpClient& client, time_t timestamp) {
	SystemClock.setTime(timestamp);
}

void appendLog(String message)
{
	int logSize = logMessages.count();
	String currentTime = SystemClock.now().toFullDateTimeString();
	String logOrder = String(logSize + 1);
	String formattedMessage = currentTime + " (" + logOrder + "): " + message;
	if (logSize == MAX_LOG_SIZE)
	{
		logMessages.pop();
	}
	logMessages.push(formattedMessage);
}

void logs(HttpRequest &request, HttpResponse &response)
{
	response.setContentType("plain/text");
	String responseMessage = "";
	Logger<String, MAX_LOG_SIZE> temp = logMessages;
	int logSize = temp.count();
	if (logSize != 0)
	{
		while (logSize != 0)
		{
			responseMessage += temp.pop() + "\n";
			logSize--;
		}
		response.sendString(responseMessage);
	}
	else
	{
		response.sendString("No logs so far...");
	}
}

void setWaterInterval(HttpRequest &request, HttpResponse &response)
{
	String interval = request.getQueryParameter("hours", "");
	if (interval != "")
	{
		int8_t validate = interval.toInt();
		if (validate != 0 && validate > 0)
		{
			waterInterval = validate;
			response.setContentType("plain/text");
			appendLog("Water interval was set to to: " + interval);
			unsigned int waterIntervalInMs = waterInterval * 60 * 60 * 1000;
			waterTimer.setIntervalMs(waterIntervalInMs);
			response.sendString("Water interval is successfuly set to " + interval + " hours");
		}
		else
		{
			response.setContentType("plain/text");
			response.sendString("Could not properly parse \"hours\" parameter: " + interval +
								"\nThe parameter must be an integer");
		}
	}
	else
	{
		response.sendString("Current water interval is set to " + String(waterInterval) +
							" hours \nIf you want to change it provide \"hours\" query parameter");
	}
}

void setWaterDuration(HttpRequest &request, HttpResponse &response)
{
	String duration = request.getQueryParameter("seconds", "");
	if (duration != "")
	{
		int8_t validate = duration.toInt();
		if (validate != 0 && validate > 0)
		{
			waterDuration = validate;
			response.setContentType("plain/text");
			appendLog("Water duration was changed to: " + duration);
			response.sendString("Water duration is successfuly set to " + duration + " seconds");
		}
		else
		{
			response.setContentType("plain/text");
			response.sendString("Could not properly parse \"seconds\" parameter: " + duration +
								"\nThe parameter must be an integer");
		}
	}
	else
	{
		response.sendString("Current water duration is set to " + String(waterDuration) +
							" seconds \nIf you want to change it provide \"seconds\" query parameter");
	}
}

void startWatering(HttpRequest &request, HttpResponse &response)
{
	response.setContentType("plain/text");
	String seconds = request.getQueryParameter("duration", "");
	unsigned int duration = waterDuration;
	if (seconds != "")
	{
		unsigned int validate = seconds.toInt();
		if (validate != 0)
		{
			duration = validate;
		}
		else
		{
			response.sendString("Could not properly parse \"duration\" parameter: " + seconds +
								"\nThe parameter must be an integer");
		}
	}
	lastWatering = SystemClock.now();
	executeWatering(duration);
	response.sendString("Done");
}

void startPump(os_event_t *arg)
{
	waterPWM.analogWrite(WATER_PUMP, 255);
	delay(1000);
	arg->par--;
	if (arg->par > 0)
	{
		system_os_post(USER_TASK_PRIO_0, 0, arg->par);
	}
	else
	{
		waterPWM.noAnalogWrite(WATER_PUMP);
		system_soft_wdt_restart();
	}
}

void executeWatering(unsigned int duration)
{
	appendLog("Watering executed...");
	serialQueue = (os_event_t *)malloc(sizeof(os_event_t) * SERIAL_QUEUE_LEN);
	system_soft_wdt_stop();
	system_os_task(startPump, USER_TASK_PRIO_0, serialQueue, SERIAL_QUEUE_LEN);
	system_os_post(USER_TASK_PRIO_0, 0, duration);
}

void timedWaterCheck()
{
	if (lastWatering != -1)
	{
		DateTime diff = SystemClock.now() - lastWatering;
		if (diff.Hour > waterInterval)
		{
			appendLog("Timed water check did not receive watering command for " 
					+ String(waterInterval) + " hours, watchdog executed");
			executeWatering(waterDuration);
		}
	}
	else
	{
		appendLog("Timed water check did not find any previous watering executions, watchdog executed");
		executeWatering(waterDuration);
	}
}

void startWebServer()
{
	server.listen(80);
	server.addPath("/", logs);
	server.addPath("/setWaterInterval", setWaterInterval);
	server.addPath("/setWaterDuration", setWaterDuration);
	server.addPath("/startWatering", startWatering);

	Serial.println("\r\n=== WEB SERVER STARTED ===");
	Serial.println(WifiStation.getIP());
	Serial.println("==============================\r\n");

	ntp = new espNtpClient();
}

void init()
{
	Serial.begin(SERIAL_BAUD_RATE); // 115200 by default
	waterPWM.initialize();
	WifiStation.enable(true);
	WifiStation.config(WIFI_SSID, WIFI_PWD);
	WifiAccessPoint.enable(false);
	WifiStation.setIP(IPAddress(192, 168, 1, 21));
	unsigned int waterIntervalInMs = waterInterval * 60 * 60 * 1000;
	waterTimer = waterTimer.initializeMs(waterIntervalInMs, timedWaterCheck);
	waterTimer.start();
	startWebServer();
}
