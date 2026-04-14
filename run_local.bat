@echo off
echo Starting Backend Setup...
cd backend

IF NOT EXIST venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment and installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo Making migrations for apps...
python manage.py makemigrations users teams tasks analytics

echo Applying database migrations (SQLite)...
python manage.py migrate

echo Seeding database with demo data...
python -X utf8 manage.py seed_data

echo Starting Django Server in a new window...
start "TaskFlow Backend (Django)" cmd /k "venv\Scripts\activate.bat & python manage.py runserver 8000"

echo.
echo Starting Frontend Setup...
cd ..\frontend

echo Installing NPM dependencies...
call npm install

echo Starting Next.js Dev Server in a new window...
start "TaskFlow Frontend (Next.js)" cmd /k "npm run dev"

echo.
echo TaskFlow SaaS is now starting!
echo Backend: http://localhost:8000 (API at /api/)
echo Frontend: http://localhost:3000
echo Both processes are running in separate terminal windows.
pause
