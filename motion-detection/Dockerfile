FROM mohaseeb/raspberrypi3-python-opencv:latest
WORKDIR /app
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
ENV PYTHONUNBUFFERED=1
COPY motion_detection.py /app/
CMD python motion_detection.py
