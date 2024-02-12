import firebase_admin
from fastapi import Request, HTTPException
from firebase_admin import auth

firebase_admin.initialize_app()


async def get_current_user(request: Request):
    authorization: str = request.headers.get('Authorization')
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    token = authorization.split(" ")[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=403, detail="Invalid authentication token")
