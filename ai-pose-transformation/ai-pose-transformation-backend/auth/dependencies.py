from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
from config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")