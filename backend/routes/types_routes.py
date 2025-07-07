from flask import Blueprint, jsonify, request
import requests

types_bp = Blueprint('types', __name__)

POCKETBASE_URL = "http://127.0.0.1:8090"

@types_bp.route('/types', methods=['GET'])
def get_types():
    try:
        all_types = []
        page = 1
        while True:
            response = requests.get(f"{POCKETBASE_URL}/api/collections/types/records?perPage=200&page={page}")
            response.raise_for_status()
            data = response.json()
            all_types.extend(data['items'])
            if len(data['items']) < 200:
                break  # Si los registros devueltos son menores a 200, significa que no hay más páginas
            page += 1

        return jsonify({'items': all_types})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@types_bp.route('/types', methods=['POST'])
def create_type():
    try:
        data = request.get_json()
        payload = {
            "name": data.get("name"),
            "description": data.get("description", "")
        }
        response = requests.post(f"{POCKETBASE_URL}/api/collections/types/records", json=payload)
        response.raise_for_status()
        return jsonify(response.json()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@types_bp.route('/types/<string:type_id>', methods=['GET'])
def get_type_by_id(type_id):
    try:
        response = requests.get(f"{POCKETBASE_URL}/api/collections/types/records/{type_id}")
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@types_bp.route('/types/<string:type_id>', methods=['PUT'])
def update_type(type_id):
    try:
        data = request.get_json()  # Recibe el JSON con los datos a actualizar
        payload = {
            "name": data.get("name"),
            "description": data.get("description")
        }
        response = requests.patch(f"{POCKETBASE_URL}/api/collections/types/records/{type_id}", json=payload)
        response.raise_for_status()  # Verifica que la solicitud haya sido exitosa
        return jsonify(response.json())  # Devuelve el resultado
    except Exception as e:
        print(f"Error actualizando tipo: {str(e)}")  # Imprime el error en la consola del backend
        return jsonify({"error": str(e)}), 500  # Devuelve el error con el código 500

# ✅ Eliminar tipo
@types_bp.route('/types/<string:type_id>', methods=['DELETE'])
def delete_type(type_id):
    try:
        response = requests.delete(f"{POCKETBASE_URL}/api/collections/types/records/{type_id}")
        response.raise_for_status()
        return jsonify({"message": "Tipo eliminado correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
