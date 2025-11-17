from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import UserCreate, UserLogin, Token, User
from app.utils.database import get_db
from app.utils.auth import hash_password, create_access_token, verify_password, get_current_user

router = APIRouter()

@router.post("/register", response_model=Token, status_code=201)
def register_user(user: UserCreate, db=Depends(get_db)):
    cur = db.cursor()

    # Check if user exists
    cur.execute("SELECT id FROM users WHERE username=%s", (user.username,))
    exists = cur.fetchone()
    if exists:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_pw = hash_password(user.password)

    # Insert user
    cur.execute(
        "INSERT INTO users (username, password, email, imageurl) VALUES (%s, %s, %s, %s) RETURNING id",
        (user.username, hashed_pw, user.email, user.imageurl)
    )
    user_id = cur.fetchone()[0]
    db.commit()

    # Create JWT
    token = create_access_token({"sub": str(user_id)})
    return Token(access_token=token)



@router.post("/login", response_model=Token)
def login(user: UserLogin, db=Depends(get_db)):
    cur = db.cursor()

    # Find user
    cur.execute("SELECT id, password FROM users WHERE email=%s", (user.email,))
    record = cur.fetchone()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    user_id, password = record

    if not verify_password(user.password, password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token({"sub": str(user_id)})
    return Token(access_token=token)



@router.get('/me', response_model=User)
def get_user_details(current_user: str = Depends(get_current_user), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("SELECT username, email, imageurl FROM users WHERE id=%s", (current_user,))
    user = cur.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(username=user[0], email=user[1], imageurl=user[2])



@router.put('/me', response_model=User)
def update_user_username(new_username: str, current_user: str = Depends(get_current_user), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("SELECT id FROM users WHERE username=%s", (new_username,))
    exists = cur.fetchone()
    if exists:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    cur.execute("UPDATE users SET username=%s WHERE id=%s RETURNING username, email, imageurl", (new_username, current_user))
    user = cur.fetchone()
    db.commit()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(username=user[0], email=user[1], imageurl=user[2])



@router.delete('/me', status_code=204)
def delete_user(current_user: str = Depends(get_current_user), db=Depends(get_db)):
    cur = db.cursor()
    cur.execute("DELETE FROM users WHERE id=%s RETURNING id", (current_user,))
    deleted_user = cur.fetchone()
    db.commit()
    if not deleted_user:
        raise HTTPException(status_code=404, detail="User not found")