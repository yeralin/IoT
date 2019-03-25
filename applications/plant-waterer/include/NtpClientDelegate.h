#ifndef INCLUDE_NTPCLIENTDELEGATEDEMO_H_
#define INCLUDE_NTPCLIENTDELEGATEDEMO_H_


class espNtpClient
{
public:
	espNtpClient()
	{
		ntpcp = new NtpClient("pool.ntp.org", 30, NtpTimeResultDelegate(&espNtpClient::ntpResult, this));
	};

	void ntpResult(NtpClient& client, time_t ntpTime)
	{
		SystemClock.setTime(ntpTime, eTZ_UTC);
		Serial.print("ntpClientDemo Callback Time_t = ");
		Serial.print(ntpTime);
		Serial.print(" Time = ");
		Serial.println(SystemClock.getSystemTimeString());

	}

private:
	NtpClient *ntpcp;
};




#endif /* INCLUDE_NTPCLIENTDELEGATEDEMO_H_ */
