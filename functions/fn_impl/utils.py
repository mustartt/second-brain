from firebase_functions import https_fn
from wsgiref.headers import Headers

from firebase_admin import auth


def get_bearer_token(auth_header):
    part = auth_header.split('Bearer ')
    if len(part) != 2:
        return https_fn.Response(
            'Unauthorized: Bearer authorization header is malformed',
            status=401
        )
    return part[1]


def validate_tokens(request_headers: Headers):
    forwarded_authorization_header = request_headers.get('X-Forwarded-Authorization')
    authorization_header = request_headers.get('Authorization')

    if not authorization_header and not forwarded_authorization_header:
        return False, https_fn.Response(
            'Unauthorized: Missing Authorization and X-Forwarded-Authorization Headers',
            status=401
        )


def verify_id_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except auth.InvalidIdTokenError:
        return None
