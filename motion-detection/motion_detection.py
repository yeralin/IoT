"""Motion detection script"""
import os
import sys
import time
from datetime import datetime
import imutils
import cv2
import telegram

TELEGRAM_BOT_TOKEN = "420641387:AAG224o_u348wYkylaAT7mshzs1YBard4Qo"
TELEGRAM_CHAT_ID = "349300490"
ONE_HOUR = 3600
SENSITIVENESS = 50
OUTPUT_FILE = "output.mp4"


def create_output_stream(fps, frame_width, frame_height):
    return cv2.VideoWriter(OUTPUT_FILE,
                           0x00000020,
                           fps,
                           (frame_width, frame_height))


def main():
    """Cat stalking using CV2"""
    print("Started Motion Detection Service")
    # Initialize telegram bot
    telegram_bot = telegram.Bot(token=TELEGRAM_BOT_TOKEN)

    # Start rtsp video capture
    vcap = cv2.VideoCapture("rtsp://admin:15975345622d@192.168.1.33/2")
    no_frame_times = 0
    if not vcap.isOpened():
        print('VideoCapture not opened')
        sys.exit(0)
    # define output stream
    fps = 24//2
    frame_width = int(vcap.get(3))
    frame_height = int(vcap.get(4))
    output_stream = create_output_stream(fps, frame_width, frame_height)

    base_frame = None  # base frame to compare against
    refresh_base_frame_t = datetime.now()

    cat_detected = False
    cat_detected_at = None

    while True:

        now = datetime.now()
        captured, frame = vcap.read()

        if frame is None or not captured:
            print("no frame")
            time.sleep(0.5)
            no_frame_times += 1
            if no_frame_times > 10:
                sys.exit(0)
            continue

        if cat_detected and (now - cat_detected_at).total_seconds() < 8:
            output_stream.write(frame)
            continue
        elif cat_detected:
            print("Finished dumping")
            output_stream.release()
            print(controus)
            telegram_bot.send_message(chat_id=TELEGRAM_CHAT_ID,
                                      text=",".join(controus))
            telegram_bot.send_video(chat_id=TELEGRAM_CHAT_ID,
                                    video=open(OUTPUT_FILE, 'rb'), supports_streaming=True)
            # perform cleanup and wait
            os.remove(OUTPUT_FILE)
            print("Finished sending, sleeping for one hour")
            time.sleep(ONE_HOUR)
            # restart the process
            output_stream = create_output_stream(
                fps, frame_width, frame_height)
            cat_detected = False
            cat_detected_at = None

        # resize the frame, convert it to grayscale, and blur it
        frame = imutils.resize(frame, width=500)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        if base_frame is None or (now - refresh_base_frame_t).total_seconds() > (2 * ONE_HOUR):
            base_frame = gray
            refresh_base_frame_t = now
            continue

        # compute the absolute difference between the current frame and base frame
        frame_delta = cv2.absdiff(base_frame, gray)
        _, thresh = cv2.threshold(
            frame_delta, SENSITIVENESS, 255, cv2.THRESH_BINARY)

        # dilate the thresholded image to fill in holes, then find contours on thresholded image
        thresh = cv2.dilate(thresh, None, iterations=2)
        cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL,
                                cv2.CHAIN_APPROX_SIMPLE)
        cnts = imutils.grab_contours(cnts)
        controus = []
        # loop over the contours
        for contour in cnts:
            controur_area = cv2.contourArea(contour)
            # if the contour is too small, ignore it
            controus.append(str(controur_area))
            if controur_area < 2000:
                continue
            cat_detected = True

            # (x, y, w, h) = cv2.boundingRect(c)
            # cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        
        if cat_detected:
            cat_detected_at = datetime.now()

        # cv2.imshow("Cat Stalker", frame) # show the frame

    # cleanup the camera and close any open windows
    vcap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
