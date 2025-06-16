from flask import Blueprint, jsonify,request
from services.pocketbase_client import get_collection
import requests

account_leads_bp = Blueprint('account_leads', __name__)

@account_leads_bp.route('/account-leads', methods=['GET'])
def get_account_leads():
    data = get_collection('account_leads')
    if data:
        return jsonify(data)
    else:
        return jsonify({'error': 'No se pudieron obtener los datos'}), 500

@account_leads_bp.route('/account-leads', methods=['POST'])
def create_account_lead():
    try:
        data = request.get_json()
        payload = {
            "account_id": data.get("account_id"),
            "lead_id": data.get("lead_id"),
            "start_date": data.get("start_date"),
            "end_date": data.get("end_date"),
            "notes": data.get("notes")
        }
        response = requests.post("http://127.0.0.1:8090/api/collections/account_leads/records", json=payload)
        response.raise_for_status()
        return jsonify(response.json()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@account_leads_bp.route('/account-leads/<string:relation_id>', methods=['GET'])
def get_account_lead_by_id(relation_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/account_leads/records/{relation_id}"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@account_leads_bp.route('/account-leads/<string:relation_id>', methods=['PUT'])
def update_account_lead(relation_id):
    try:
        data = request.get_json()
        payload = {
            "account_id": data.get("account_id"),
            "lead_id": data.get("lead_id"),
            "start_date": data.get("start_date"),
            "end_date": data.get("end_date"),
            "notes": data.get("notes")
        }
        url = f"http://127.0.0.1:8090/api/collections/account_leads/records/{relation_id}"
        response = requests.patch(url, json=payload)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@account_leads_bp.route('/account-leads/<string:relation_id>', methods=['DELETE'])
def delete_account_lead(relation_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/account_leads/records/{relation_id}"
        response = requests.delete(url)
        response.raise_for_status()
        return jsonify({"message": "Relación eliminada correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
