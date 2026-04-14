from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from database import engine, Base
# Import the Task model and SessionLocal from the database module
from models import Task, TaskEntry
from database import SessionLocal
from collections import defaultdict
from models import User


# Create the FastAPI app & set up CORS middleware to allow cross-origin requests from any origin. This is important for frontend applications that may be hosted on a different domain than the backend
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Create the database tables
Base.metadata.create_all(bind=engine)

# A route for the home page
@app.get("/")
def home():
    return {"message": "Backend running 🚀"}

#  A route to add a new task
@app.post("/add-task")
def add_task(name: str, user_id: str):
    db = SessionLocal()
    task = Task(name=name, user_id=user_id)
    db.add(task)
    db.commit()
    return {"message": "Task added"}

# A route to add a new entry for a task
@app.post("/add-entry")
def add_entry(task_id: int, status: str, comment: str, date: str):
    db = SessionLocal()
    entry = TaskEntry(
        task_id=task_id,
        status=status,
        comment=comment,
        date=date
    )
    db.add(entry)
    db.commit()
    return {"message": "Entry saved"}

# A route to get all tasks
@app.get("/tasks")
def get_tasks():
    db = SessionLocal()
    tasks = db.query(Task).all()
    return tasks

# A route to get tasks for a specific user
@app.get("/tasks/{user_id}")
def get_tasks(user_id: str):
    db = SessionLocal()
    return db.query(Task).filter(Task.user_id == user_id).all()

# A route to get all entries
@app.get("/entries")
def get_entries():
    db = SessionLocal()
    entries = db.query(TaskEntry).all()
    return entries

#An API that returns weekly stats
@app.get("/weekly-stats")
def weekly_stats():
    db = SessionLocal()
    entries = db.query(TaskEntry).all()

    stats = defaultdict(int)

    for e in entries:
        if e.status == "Done":
            stats[e.date] += 1

    result = []
    for date, count in stats.items():
        result.append({"date": date, "done": count})

    return result

# A route to handle user login. It checks if a user with the given username exists in the database. If not, it creates a new user and returns the user's ID and username.
@app.post("/login")
def login(username: str):
    db = SessionLocal()

    user = db.query(User).filter(User.username == username).first()

    if not user:
        user = User(username=username)
        db.add(user)
        db.commit()
        db.refresh(user)

    return {"user_id": user.id, "username": user.username}


@app.get("/entries/{user_id}")
def get_entries(user_id: str):
    db = SessionLocal()
    return db.query(TaskEntry).all()