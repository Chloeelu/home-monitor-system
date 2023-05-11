import os
import wifi
import socketpool
import board
import time
import analogio
import pwmio
import adafruit_hcsr04
from digitalio import DigitalInOut, Direction
from adafruit_onewire.bus import OneWireBus
from adafruit_motor import servo
from adafruit_ds18x20 import DS18X20


# Connect to WiFi network
wifi.radio.connect(os.getenv('CIRCUITPY_WIFI_SSID'), os.getenv('CIRCUITPY_WIFI_PASSWORD'))
print("connect to wifi")
led = DigitalInOut(board.LED)
led.direction = Direction.OUTPUT
led.value = False

led1 = DigitalInOut(board.GP17)
led1.direction = Direction.OUTPUT

photocell = analogio.AnalogIn(board.GP28)
sonar = adafruit_hcsr04.HCSR04(trigger_pin=board.GP14, echo_pin=board.GP15)
# servo motor
pwm_arm = pwmio.PWMOut(board.GP16, duty_cycle=2 ** 15, frequency=50)

# temperature sensor
ow_bus = OneWireBus(board.GP4)
ds18 = DS18X20(ow_bus, ow_bus.scan()[0])
arm = servo.Servo(pwm_arm)
arm.angle = 90

# Initialize socket pool
pool = socketpool.SocketPool(wifi.radio)

# Connect to server
addr = "10.93.48.143"
port = 443
ADDR = (addr, port)
FORMAT = "utf-8"
HEADER = 64
DISCONNECT_MESSAGE = "!DISCONNECT"

sock = pool.socket()
sock.connect(ADDR)

def send(msg):
    message = msg.encode(FORMAT)
    msg_length = len(message)
    send_length = str(msg_length).encode(FORMAT)
    send_length += b' ' * (HEADER - len(send_length))

    sock.send(send_length)
    sock.send(message)

def control_devices(Status):
    if Status:
        led.value = True
        for a in range(90, 0, -25):
            arm.angle = a
            time.sleep(0.1)
    else:
        led.value = False
        for a in range(90, 180, 25):
            arm.angle = a
            time.sleep(0.1)

    arm.angle = 90

def Photoresistor(sonar_D):
    if sonar_D > 100:
        led1.value = False
        return
    if photocell.value < 35000:
        led1.value = True
    else:
        led1.value = False
def read_sonar():
    try:
        print(sonar.distance)
        return sonar.distance
    except RuntimeError:
        print("retry")
        return 800

def Temp():
    temp = ds18.temperature
    send(f"{str(temp)}")
# Send message
print("Message sent")
led.value = False
# Receive response

while True:
    arm.angle = 90
    msg_buf = bytearray(2048)
    sock.recv_into(msg_buf, 2048)
    msg = msg_buf.decode(FORMAT).split()[0]
    if msg:
        print(msg)
        if msg == "ON":
            control_devices(True)
        elif msg == "OFF":
            control_devices(False)
    Temp()
    dis = read_sonar()
    Photoresistor(dis)


