from flask import Blueprint, jsonify, request
import requests

account_leads_bp = Blueprint('account_leads', __name__)

# ✅ Obtener todas las relaciones con expand (usado por frontend)
@account_leads_bp.route('/account-leads/all', methods=['GET'])
def get_all_account_leads():
    try:
        print("🟢 Iniciando obtención de relaciones desde PocketBase...")
        response = requests.get(
            "http://127.0.0.1:8090/api/collections/account_leads/records?expand=account_id,lead_id&perPage=200"
        )
        response.raise_for_status()
        data = response.json()
        return jsonify(data.get("items", [])), 200
    except Exception as e:
        print("❌ ERROR REAL EN BACKEND:", str(e))
        return jsonify({'error': str(e)}), 500


# ✅ Obtener relaciones desde PocketBase directamente (opcional, no usado actualmente)
@account_leads_bp.route('/account-leads', methods=['GET'])
def get_account_leads():
    try:
        response = requests.get(
            "http://127.0.0.1:8090/api/collections/account_leads/records?expand=account_id,lead_id&perPage=200"
        )
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ✅ Crear una nueva relación (POST)
@account_leads_bp.route('/account-leads', methods=['POST'])
def create_account_lead():
    try:
        data = request.get_json()
        account_id = data.get("account_id")
        lead_id = data.get("lead_id")

        # 🔎 Validar duplicado activo
        existing = requests.get("http://127.0.0.1:8090/api/collections/account_leads/records?perPage=200")
        existing.raise_for_status()
        items = existing.json().get("items", [])

        for r in items:
            if r.get("account_id") == account_id and r.get("lead_id") == lead_id:
                end_date = r.get("end_date")
                if end_date in [None, "", "null", "0001-01-01 00:00:00Z"]:
                    return jsonify({"error": "Este lead ya está asignado a esta cuenta."}), 409

        # 🧾 Crear relación
        payload = {
            "account_id": account_id,
            "lead_id": lead_id,
            "start_date": data.get("start_date"),
            "notes": data.get("notes", "")
        }

        if data.get("end_date") not in [None, "", "null"]:
            payload["end_date"] = data.get("end_date")

        response = requests.post(
            "http://127.0.0.1:8090/api/collections/account_leads/records",
            json=payload
        )
        response.raise_for_status()
        return jsonify(response.json()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ Obtener relación por ID
@account_leads_bp.route('/account-leads/<string:relation_id>', methods=['GET'])
def get_account_lead_by_id(relation_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/account_leads/records/{relation_id}"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ Actualizar (PUT)
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


# ✅ Eliminar
@account_leads_bp.route('/account-leads/<string:relation_id>', methods=['DELETE'])
def delete_account_lead(relation_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/account_leads/records/{relation_id}"
        response = requests.delete(url)
        response.raise_for_status()
        return jsonify({"message": "Relación eliminada correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ Actualización parcial (PATCH)
@account_leads_bp.route('/account-leads/<string:relation_id>', methods=['PATCH'])
def patch_account_lead(relation_id):
    try:
        data = request.get_json()
        url = f"http://127.0.0.1:8090/api/collections/account_leads/records/{relation_id}"
        response = requests.patch(url, json=data)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
