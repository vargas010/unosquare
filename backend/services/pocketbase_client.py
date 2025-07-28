import requests
from pocketbase import PocketBase

POCKETBASE_URL = "http://127.0.0.1:8090"
pb = PocketBase(POCKETBASE_URL)

def get_collection(collection_name, filter_str=None):
    try:
        # Construir la URL de la colección
        url = f"{POCKETBASE_URL}/api/collections/{collection_name}/records"

        # Si hay un filtro, agrégalo a la URL
        if filter_str:
            url += f"?filter={filter_str}"

        # Realizar la solicitud
        response = requests.get(url)
        response.raise_for_status()

        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error al conectarse con PocketBase: {e}")
        return None
