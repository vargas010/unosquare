from flask import Blueprint, jsonify, request
from services.pocketbase_client import get_collection
import requests

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('/accounts', methods=['GET'])
def get_accounts():
    data = get_collection('accounts')
    if data:
        return jsonify(data)
    else:
        return jsonify({'error': 'No se pudieron obtener los datos'}), 500

@accounts_bp.route('/accounts', methods=['POST'])
def create_account():
    try:
        # Recibe los datos enviados en la solicitud
        data = request.get_json()
        payload = {
            "name": data.get("name"),
            "website": data.get("website"),
            "address": data.get("address"),
            "phone": data.get("phone"),
            "tax_id": data.get("tax_id"),
            "type_id": data.get("industry_type")  # Aquí estamos agregando el tipo de industria (type_id)
        }
        # Realiza la solicitud POST para crear la cuenta con el tipo de industria
        response = requests.post("http://127.0.0.1:8090/api/collections/accounts/records", json=payload)
        response.raise_for_status()  # Verifica si la solicitud fue exitosa
        return jsonify(response.json()), 201  # Devuelve la respuesta de la creación de la cuenta
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@accounts_bp.route('/accounts/<string:account_id>', methods=['GET'])
def get_account_by_id(account_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/accounts/records/{account_id}"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@accounts_bp.route('/accounts/<string:account_id>', methods=['PATCH', 'PUT'])  # Permite tanto PATCH como PUT
def update_account(account_id):
    try:
        data = request.get_json()
        payload = {
            "name": data.get("name"),
            "website": data.get("website"),
            "address": data.get("address"),
            "phone": data.get("phone"),
            "tax_id": data.get("tax_id"),
            "type_id": data.get("type_id")  # Asegúrate de incluir type_id en el payload
        }
        url = f"http://127.0.0.1:8090/api/collections/accounts/records/{account_id}"
        response = requests.patch(url, json=payload)  # Usa PATCH para actualizar parcialmente
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@accounts_bp.route('/accounts/<string:account_id>', methods=['DELETE'])
def delete_account(account_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/accounts/records/{account_id}"
        response = requests.delete(url)
        response.raise_for_status()
        return jsonify({"message": "Cuenta eliminada correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
