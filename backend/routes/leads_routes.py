from flask import Blueprint, jsonify, request
from services.pocketbase_client import get_collection
from datetime import datetime, timezone
import requests

leads_bp = Blueprint('leads', __name__)


@leads_bp.route('/leads', methods=['GET'])
def get_leads():
    data = get_collection('leads')
    if data:
        return jsonify(data)
    else:
        return jsonify({'error': 'No se pudieron obtener los datos'}), 500

@leads_bp.route('/leads', methods=['POST'])
def create_lead():
    try:
        data = request.get_json()
        payload = {
            "name": data.get("name"),
            "last_name": data.get("last_name"),
            "phone": data.get("phone"),
            "personal_email": data.get("personal_email"),
            "work_email": data.get("work_email")
        }
        response = requests.post("http://127.0.0.1:8090/api/collections/leads/records", json=payload)
        response.raise_for_status()
        return jsonify(response.json()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@leads_bp.route('/leads/<string:lead_id>', methods=['GET'])
def get_lead_by_id(lead_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/leads/records/{lead_id}"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@leads_bp.route('/leads/<string:lead_id>', methods=['PUT'])
def update_lead(lead_id):
    try:
        data = request.get_json()
        payload = {
            "name": data.get("name"),
            "last_name": data.get("last_name"),
            "phone": data.get("phone"),
            "personal_email": data.get("personal_email"),
            "work_email": data.get("work_email")
        }
        url = f"http://127.0.0.1:8090/api/collections/leads/records/{lead_id}"
        response = requests.patch(url, json=payload)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@leads_bp.route('/leads/<string:lead_id>', methods=['DELETE'])
def delete_lead(lead_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/leads/records/{lead_id}"
        response = requests.delete(url)
        response.raise_for_status()
        return jsonify({"message": "Lead eliminado correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
