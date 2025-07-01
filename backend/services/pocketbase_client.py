import requests
from pocketbase import PocketBase

POCKETBASE_URL = "http://127.0.0.1:8090"

pb = PocketBase(POCKETBASE_URL)

def get_collection(collection_name):
    try:
        response = requests.get(f"{POCKETBASE_URL}/api/collections/{collection_name}/records")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error al conectarse con PocketBase: {e}")
        return None
