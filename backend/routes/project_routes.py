from flask import Blueprint, jsonify, request
import requests

project_bp = Blueprint('projects', __name__)

# Obtener todos los proyectos
@project_bp.route('/projects', methods=['GET'])
def get_projects():
    try:
        url = "http://127.0.0.1:8090/api/collections/projects/records"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Obtener los tableros para un proyecto específico
@project_bp.route('/projects/<string:project_id>/boards', methods=['GET'])
def get_boards_for_project(project_id):
    try:
        # Asegúrate de que estás filtrando por project_id en la base de datos de los tableros
        url = f"http://127.0.0.1:8090/api/collections/project_boards/records?filter=project_id='{project_id}'"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Crear un nuevo proyecto
@project_bp.route('/projects', methods=['POST'])
def create_project():
    try:
        data = request.get_json()
        print("Datos recibidos del frontend:", data)  # Para depurar
        payload = {
            "name": data.get("name"),
            "status": data.get("status"),
            "account_id": data.get("account_id")  # Cambiar 'accountId' a 'account_id'
        }
        url = "http://127.0.0.1:8090/api/collections/projects/records"
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return jsonify(response.json()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Obtener un proyecto específico por ID
@project_bp.route('/projects/<string:project_id>', methods=['GET'])
def get_project_by_id(project_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/projects/records/{project_id}"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Actualizar un proyecto
@project_bp.route('/projects/<string:project_id>', methods=['PUT'])
def update_project(project_id):
    try:
        data = request.get_json()
        print("Datos recibidos del frontend para actualización:", data)  # Para depurar
        payload = {
            "name": data.get("name"),
            "status": data.get("status"),
            "account_id": data.get("account_id")  # Cambiar 'accountId' a 'account_id'
        }
        url = f"http://127.0.0.1:8090/api/collections/projects/records/{project_id}"
        response = requests.patch(url, json=payload)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Eliminar un proyecto
@project_bp.route('/projects/<string:project_id>', methods=['DELETE'])
def delete_project(project_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/projects/records/{project_id}"
        response = requests.delete(url)
        response.raise_for_status()
        return jsonify({"message": "Proyecto eliminado correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
