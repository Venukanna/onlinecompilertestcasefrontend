💻 Online Compiler with Test Case Support

Live Demo (UI Only): 🔗 https://onlinecompilertestcasefrontend.vercel.app

⚠️ Note: Code execution feature requires Docker and works in local environment only.
Please refer to the setup instructions below or demo video for full functionality.

Frontend Code: 💾 https://github.com/Venukanna/onlinecompilertestcasefrontend.git

Backend Code: ⚙️ https://github.com/Venukanna/onlinecompilertestcasebackend.git

✨ About the Project

Online Compiler with Test Case Support is a web-based platform that allows users to write, compile, and execute code in multiple programming languages directly from their browser.

It supports custom input, multiple test cases, and real-time output, making it ideal for coding practice, interviews, and learning.
The backend runs securely inside Docker containers using a Java Spring Boot API for scalable and isolated code execution.

🚀 Features

💡 Supports multiple languages — Java, C, C++, Python, JavaScript, etc.

🎨 Syntax-highlighted editor powered by CodeMirror

⚙️ Run code with custom input and multiple test cases

🧩 Secure backend execution inside Docker

⚡ Real-time result rendering via REST API

🧠 Error handling and safe execution limits

📱 Responsive, clean, and modern UI

🛠️ Tech Stack

Frontend: React.js, CodeMirror, Axios, CSS3
Backend: Java Spring Boot, Docker
Deployment: Vercel (Frontend) | Render (Backend Docker Containers)

🌐 Live Demo

🚀 Try it now:
👉 https://onlinecompilertestcasefrontend.vercel.app

🧑‍💻 Getting Started (Run Locally with Docker)

You can run the full project locally using Docker.
Both the frontend and backend must run simultaneously.

🧩 Step 1: Clone Both Repositories
# Clone Frontend
git clone https://github.com/Venukanna/onlinecompilertestcasefrontend.git
cd onlinecompilertestcasefrontend

# Clone Backend
git clone https://github.com/Venukanna/onlinecompilertestcasebackend.git

🐳 Step 2: Build and Run the Backend (Spring Boot + Docker)

Make sure Docker Desktop (or Docker Engine) is running.

Inside your backend folder, run:

docker build -t online-compiler-backend .
docker run -p 8080:8080 online-compiler-backend


✅ This will:

Build a Docker image for the Spring Boot backend

Run it on port 8080

Your backend API will be live at:
👉 http://localhost:8080

⚙️ Step 3: Configure Frontend Environment

Inside your frontend folder, create a .env file:

REACT_APP_API_URL=http://localhost:8080


This tells the React app to connect to your local backend.

🧱 Step 4: Build and Run the Frontend (React + Docker)

Now, build and run the frontend using Docker:

docker build -t online-compiler-frontend .
docker run -p 3000:3000 online-compiler-frontend


✅ The frontend will be available at:
👉 http://localhost:3000

🔗 Step 5: Test the Application

Open http://localhost:3000
 in your browser and test:

Write your code in the editor

Add custom input/test cases

Click Run Code → output appears instantly via backend API

Make sure both containers (frontend + backend) are running.

🧰 Optional: Use Docker Compose (Recommended)

You can create a docker-compose.yml file in the root directory to run both containers with one command.

version: '3'
services:
  backend:
    build: ./onlinecompilertestcasebackend
    ports:
      - "8080:8080"

  frontend:
    build: ./onlinecompilertestcasefrontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8080


Then simply run:

docker-compose up --build


✅ Both services will start together.

📦 Backend Details

The Spring Boot backend handles:

Code execution using Docker containers

Test case validation

Resource/time limits

Error-safe compilation environment

Backend repo:
🔗 https://github.com/Venukanna/onlinecompilertestcasebackend.git


📫 Contact
Mail: Venu996366@gmail.com
