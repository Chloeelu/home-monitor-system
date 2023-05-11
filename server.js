const http = require('http');
const fs = require('fs');

// Create a server
const server = http.createServer((req, res) => {
  // If the request is a GET request for the home page
  if (req.url === '/' && req.method === 'GET') {
    // Send the HTML form to the client
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-type" content="text/html;charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Home Monitor System</title>
        <style>
            /* Fonts */
            @import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
            html, body {
                height: 100%;
                margin: 0;
                padding: 0;
                font-family: 'Roboto', sans-serif;
                background-color: #f2f2f2;
                text-align: center;
            }
            
            /* Header */
            header {
                background-color: #333;
                color: #fff;
                padding: 20px;
                text-align: center;
            }
            
            header h1 {
                margin: 0;
                font-size: 4.5rem;
            }
            #clock-time {
            color: #333;
            text-align: center;
    
            }
            
            /* Main content */
            main {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                text-align: justify;
            }
            
            main h2 {
                font-size: 2rem;
                margin-top: 0;
            }
            
            main p {
                font-size: 1.2rem;
                line-height: 1.5;
                margin-bottom: 1.5rem;
            }
            
            /* Buttons */
            .button {
                display: inline-block;
                background-color: #333;
                color: #fff;
                border: none;
                border-radius: 4px;
                padding: 10px 20px;
                text-decoration: none;
                font-size: 1.2rem;
                margin: 10px;
                cursor: pointer;
            }
            
            .button:hover {
                background-color: #555;
            }
            
            /* Footer */
            footer {
              background-color: #eee;
              color: #333;
              padding: 10px;
              text-align: center;
              position: fixed;
              bottom: 0;
              width: 100%;
            }
            
            /* Responsive design */
            @media only screen and (max-width: 600px) {
                main {
                    font-size: 1rem;
                }
                
                header h1 {
                    font-size: 2rem;
                }
                
                .button {
                    font-size: 1rem;
                    padding: 5px 10px;
                }
            }
            /* Clock frame */
            #clock-frame {
                display: inline-block;
                margin-right: 10px;
                padding: 5px;
                border: 3px solid #333;
                border-radius: 5px;
                background-color: #f2f2f2;
                box-shadow: 0px 0px 5px #aaa;
                font-size: 1.5rem;
                font-family: Arial, sans-serif;
            }
        
            /* Clock icon */
            #clock-icon {
                display: inline-block;
                vertical-align: middle;
                width: 40px;
                height: 40px;
                margin-right: 5px;
                background-image: url(https://png.pngtree.com/element_our/20190531/ourlarge/pngtree-clock-time-icon-image_1287819.jpg);
                background-repeat: no-repeat;
                background-size: contain;
            }
        </style>
        <script>
            function logOn() {
              const xhr = new XMLHttpRequest();
              xhr.open('POST', '/log');
              xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
              xhr.send('button=ON');
            }
            function logOff() {
              const xhr = new XMLHttpRequest();
              xhr.open('POST', '/log');
              xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
              xhr.send('button=OFF');
            }
          </script>
    </head>
    <body>
        <header>
            <h1>Home Monitor System</h1>
            <div id="clock-frame">
                <span id="clock-icon"></span>
                <span id="clock-time"></span>
            </div>
        </header>
        <script>
            // Get current time in Vancouver and update clock every second
            function updateClock() {
                const now = new Date();
                const vancouverTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Vancouver"}));
                const hours = vancouverTime.getHours().toString().padStart(2, '0');
                const minutes = vancouverTime.getMinutes().toString().padStart(2, '0');
                const seconds = vancouverTime.getSeconds().toString().padStart(2, '0');
                const clockTimeElement = document.getElementById('clock-time');
                clockTimeElement.textContent = hours + ':' + minutes + ':' + seconds;
            }
            setInterval(updateClock, 1000);
        </script>
        
        <!-- Main content -->
        <main>
            <h2>About</h2>
            <p>Our Home Monitor System is a web-based solution that allows remote control and monitoring of indoor environment aspects. It includes a temperature sensor, ultrasonic sensor, photocell, and light control for seamless functionality. Developed by UBC CPEN291 Group 15, our system offers accuracy and user-friendliness for enhancing indoor comfort and safety.</p >
            
            <h2>Temperature</h2>
            <p>The current room temperature is <span style="color: deeppink;" id="content"></span><span style="color: deeppink;">°C</span>.</p >
            
            <h2>Light Control</h2>
            <p>Use the buttons below to control the light switch:</p >
            <button class="button" id="btnOn" type="button" onclick="logOn()">LIGHT ON</button>
            <button class="button" id="btnOff" type="button" onclick="logOff()">LIGHT OFF</button>
            <br>
            <br>
            <br>
            <br>
            <br>
            <script>
            function updateContent() {
              const xhr = new XMLHttpRequest();
              xhr.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                  document.getElementById('content').innerHTML = this.responseText;
                }
              };
              xhr.open('GET', '/content');
              xhr.send();
            }
            setInterval(updateContent, 1000);
          </script>
        </main>
            <!-- Footer -->
            <footer>
                <p>This website was created by UBC CPEN291 Group 15. For more information, please contact us at <a href="mailto:cpen291group15@cpen.ubc.ca">cpen291group15@cpen.ubc.ca</a >.</p >
            </footer>
        </body>
      </html>
    `);
    res.end();
  }
  // If the request is a POST request to the log route
  else if (req.url === '/log' && req.method === 'POST') {
    // Read the data from the request
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      // Parse the data and write it to a file
      const data = new URLSearchParams(body);
      const button = data.get('button');
      fs.writeFile('clicks.txt', button+'\n', err => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Button click logged successfully`);
        }
      });
    });
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(`Button click logged successfully`);
    res.end();
  }
  // If the request is a GET request for the content route
  else if (req.url === '/content' && req.method === 'GET') {
    // Read the data from the file and send it to the client
    fs.readFile('temp.txt', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write('500 Internal Server Error');
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write(data);
        res.end();
      }
    });
  }
  // If the request is anything else
  else {
    // Return a 404 error
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('404 Not Found');
    res.end();
  }
});

// Start the server on port 80
server.listen(80, '10.93.48.143', () => {
  console.log('Server listening on port 80');
});
