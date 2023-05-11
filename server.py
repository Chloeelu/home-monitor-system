import socket
import time
import threading

PORT = 443
HEADER = 64  
SERVER = socket.gethostbyname(socket.gethostname())  
ADDR = (SERVER, PORT)
FORMAT = "utf-8"
DISCONNECT_MESSAGE = "!DISCONNECT"

stop_event = threading.Event()
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

server.bind(ADDR)

def handle_client(conn, addr):
    print(f"[NEW CONNECTION] {addr} connected")

    connected = True
    while connected:
        msg_length = conn.recv(HEADER).decode(FORMAT)
        if msg_length:
            msg_length = int(msg_length)
            msg = conn.recv(msg_length).decode(FORMAT)
            if msg == DISCONNECT_MESSAGE:
                connected = False
            else:
                print(f"[{addr}] {msg}")
                updateTemp(msg)
                

    stop_event.set()
    conn.close()

def updateTemp(msg):
    with open("temp.txt", "w") as f:
        f.truncate()
        f.seek(0)
        f.write(f"{msg}")
        
def remote_Pico(conn, addr):
    while not stop_event.is_set():
        read_write(conn, addr)
        time.sleep(1)

def read_write(conn, addr):
    with open("clicks.txt", "r+") as f:
        data = f.read().strip()
        if data == "ON":
            conn.send("ON ".encode(FORMAT))

        elif data == "OFF":
            conn.send("OFF ".encode(FORMAT)) 

        else: 
            conn.send("KEEP ".encode(FORMAT))
        f.seek(0)    
        f.truncate()          

def start():
    server.listen()
    print(f"[LISTENING] Server is listening on {SERVER}:{PORT}\n")

    while True:
        conn, addr = server.accept()
        print(f"[FIND] client is: {conn}:{addr}\n")
        thread = threading.Thread(target=handle_client, args=(conn, addr))
        thread.start()
        print(f"[ACTIVE CONNECTIONS] {threading.active_count() - 1}\n")

        remote_thread = threading.Thread(target=remote_Pico, args=(conn, addr))
        remote_thread.start()

print("[STARTING] server starting...\n")
start()






