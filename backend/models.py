from sqlalchemy import Column, Integer, String
from database import Base

# Task model represents a task with an ID and a name. It is used to store information about different tasks in the database.
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    user_id = Column(Integer)

# TaskEntry model represents an entry for a task, which includes the task ID, status, comment, and date. It is linked to the Task model through the task_id field.
class TaskEntry(Base):
    __tablename__ = "task_entries"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer)
    status = Column(String)
    comment = Column(String)
    date = Column(String)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)