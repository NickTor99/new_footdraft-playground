import requests
import asyncio

S_AUTH_HOST = "http://localhost:8000"
S_GROUP_HOST = "http://localhost:8001"


def login(login: dict):
    headers = {"Content-Type": "application/json"}
    token = requests.post(f"{S_AUTH_HOST}/auth/login", json=login, headers=headers)

    return token.json()['access_token']


token_admin = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNmJkMWIzOC1kMmRmLTRkMzctOGUxMy02YzU4MWQwOWIxZGIiLCJ1c2VybmFtZSI6Ik5OaW5lOSIsImV4cCI6MTc2OTMwMzY0MywiaWF0IjoxNzY5MDg3NjQzfQ.Va1BnxXunRk0CITjwRi4Ork-HatmR7NLGghl_SEf2_k"
token_member = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYmMzZGExMi01ZGRmLTQ3ZDYtOTUwNC03OGQ0ODI4YjZhNjQiLCJleHAiOjE3NjYzNzM1NDEsImlhdCI6MTc2NjE1NzU0MX0.w8BLg2ZpIKIbDw5oqCZ1LpRWlaURLePwQGe23j_L1gI"

headers_admin = {
    "Authorization": f"Bearer {token_admin}",
    "Content-Type": "application/json"
}

headers_member = {
    "Authorization": f"Bearer {token_member}",
    "Content-Type": "application/json"
}


def create_group(name: str):
    group = {"group_name": name, "max_people": 10, "description": "bel gruppo", "is_private": True,
             "category": "Competitivo"}
    x = requests.post(f"{S_GROUP_HOST}/groups", headers=headers_admin, json=group)

    print(x.text)


def is_admin():
    id = "8d7b676e-3a98-417a-bd64-f1c7953749dc"
    x = requests.get(f"{S_GROUP_HOST}/groups/{id}/is-admin", headers=headers_admin)

    print(x.text)


def send_request(group_id):
    x = requests.post(f"{S_GROUP_HOST}/groups/{group_id}/request", headers=headers_member)

    print(x.text)


def accept_request(request_id):
    status = {"status": "accepted"}
    x = requests.put(f"{S_GROUP_HOST}/groups/request/{request_id}", headers=headers_admin, json=status)

    print(x.text)


def get_users():
    group_id = "6534ff5d-77d4-4baa-b48f-e6d49f0b0ece"
    x = requests.get(f"{S_GROUP_HOST}/groups/{group_id}/users", headers=headers_member)

    print(x.text)


def get_groups():
    x = requests.get(f"{S_GROUP_HOST}/groups/me", headers=headers_member)

    print(x.text)


login_admin = {"email": "nick@gmail.com", "password": "Nicolat9!"}  # admin
login_member = {"username": "NNine9", "password": "Nicolat9!"}  # member


def search_groups(search_query: str):
    x = requests.get(f"{S_GROUP_HOST}/groups/search?q={search_query}", headers=headers_member)

    print(x.text)


def create_player():
    group_id = "3d5e194e-a7c0-4e81-9752-bdc46ed09509"

    data = {
        'nickname': 'zyao',
        'velocita': 89,
        'attacco': 88,
        'difesa': 81,
        'tecnica': 95
    }

    x = requests.post(f"{S_GROUP_HOST}/players/{group_id}", headers=headers_member, json=data)

    print(x.text)


def associate():
    player_id = "494d3633-c75b-402b-8cba-2adc5e8a7a1f"
    group_id = "3d5e194e-a7c0-4e81-9752-bdc46ed09509"

    associated_user_id = {"user_id": "1bc3da12-5ddf-47d6-9504-78d4828b6a64"}

    x = requests.post(f"{S_GROUP_HOST}/players/{group_id}/{player_id}/associate", headers=headers_member,
                      json=associated_user_id)

    print(x.text)


def get_players():
    group_id = "3d5e194e-a7c0-4e81-9752-bdc46ed09509"

    associated_user_id = {"user_id": "1bc3da12-5ddf-47d6-9504-78d4828b6a64"}

    x = requests.get(f"{S_GROUP_HOST}/players/{group_id}", headers=headers_member)

    print(x.text)


def get_player_details():
    group_id = "3d5e194e-a7c0-4e81-9752-bdc46ed09509"
    player_id = "813c628e-203d-44a1-b838-d8c5073b008e"

    associated_user_id = {"user_id": "1bc3da12-5ddf-47d6-9504-78d4828b6a64"}

    x = requests.get(f"{S_GROUP_HOST}/players/{group_id}/{player_id}", headers=headers_member)

    print(x.text)


def remove_user(user_id, group_id):
    x = requests.delete(f"{S_GROUP_HOST}/groups/{group_id}/{user_id}", headers=headers_admin)

    print(x.text)


def is_member(group_id):
    x = requests.get(f"{S_GROUP_HOST}/groups/{group_id}/is-member", headers=headers_member)

    print(x.text)


def logout():
    x = requests.post(f"{S_AUTH_HOST}/auth/logout", headers=headers_admin)

    print(x.text)


def register():
    headers = {
        "Content-Type": "application/json"
    }

    body = {"email": "nick@mail.com", "password": "Nicolat9!", "username": "NNine9"}

    x = requests.post(f"{S_AUTH_HOST}/auth/register", headers=headers, json=body)

    print(x.text)

with open("../s_gen_image/test64") as f:
    base = f.read()

requests.put(f"{S_AUTH_HOST}/users/me/image", headers=headers_admin, json={"user_image_base64": base})
