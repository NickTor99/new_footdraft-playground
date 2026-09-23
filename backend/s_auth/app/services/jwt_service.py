import jwt
from datetime import datetime, timedelta, timezone
import bcrypt

from exceptions.exceptions import *
from repositories.token_repository import TokenRepository
from repositories.user_repository import UserRepository

# Parametri di configurazione (Chiavi e Algoritmo)
ALGORITHM = "HS256"
# In ambiente reale, questa chiave è letta da una variabile d'ambiente segreta
JWT_SECRET = "your-highly-secret-and-long-key-for-signing"
ACCESS_TOKEN_EXPIRE_MINUTES = 3600 # Impostiamo la scadenza a 2 ore (RFN-S04)

# Parametri di configurazione: Il costo del lavoro (work factor) per bcrypt.
# Più alto è, più lento (e sicuro) è l'hashing. 12 è un buon compromesso.
BCRYPT_ROUNDS = 12

tokenRepository = TokenRepository()
userRepository = UserRepository()


async def verify_JWT(token: str, get: str = "sub") -> str:
    is_blacklisted = await tokenRepository.is_blacklisted(token)

    if is_blacklisted:
        raise InvalidTokenError()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload.get(f"{get}")
    except jwt.ExpiredSignatureError:
        raise ExpiredTokenError()
    except jwt.InvalidTokenError:
        raise InvalidTokenError()
    except jwt.PyJWTError:
        raise ServiceException(status_code=status.HTTP_404_NOT_FOUND, detail="JWT Error")


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verifica se una password in chiaro corrisponde a un hash memorizzato.
    """
    try:
        # Confronta l'hash. bcrypt gestisce il salt e l'hashing interno.
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        # Cattura errori se l'hash memorizzato non è valido o formattato male
        return False


def hash_password(password: str) -> str:
    """
    Genera un hash sicuro della password usando bcrypt.
    Il salt è generato automaticamente.
    """
    # Genera il salt (parte casuale)
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS)

    # Hasha la password e decodifica in stringa (bcrypt restituisce bytes)
    hashed_bytes = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_bytes.decode('utf-8')


async def generate_JWT(user_id: str) -> str:
    """
    Crea e firma un nuovo JWT per l'utente specificato.

    Args:
        user_id: L'ID univoco dell'utente da inserire nel payload ('sub').

    Returns:
        La stringa JWT firmata.
    """
    # Calcola la data di scadenza
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    user = await userRepository.find_user_by_id(user_id)

    # Claims (Payload) del token
    to_encode = {
        "sub": user_id,
        "username": user.username, # Subject: l'ID dell'utente (stringa)
        "exp": expire,      # Expiration Time
        "iat": datetime.now(timezone.utc) # Issued At Time
    }

    # Firma il token usando la chiave segreta e l'algoritmo
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

    return encoded_jwt