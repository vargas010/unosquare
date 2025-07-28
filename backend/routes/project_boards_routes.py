from flask import Blueprint, jsonify, request
import requests

project_boards_bp = Blueprint('project_boards', __name__)

# Crear un nuevo board
@project_boards_bp.route('/boards', methods=['POST'])
def create_board():
    try:
        data = request.get_json()
        payload = {
            "title": data.get("title"),
            "project_id": data.get("project_id")
        }
        url = "http://127.0.0.1:8090/api/collections/project_boards/records"
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return jsonify(response.json()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@project_boards_bp.route('/projects/<string:project_id>/boards', methods=['GET'])
def get_boards_for_project(project_id):
    try:
        # Aquí obtienes los tableros relacionados con el project_id
        url = f"http://127.0.0.1:8090/api/collections/project_boards/records?project_id={project_id}"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Actualizar un board
@project_boards_bp.route('/boards/<string:board_id>', methods=['PUT'])
def update_board(board_id):
    try:
        data = request.get_json()
        payload = {
            "title": data.get("title"),
            "project_id": data.get("project_id"),
            "order": data.get("order")
        }
        url = f"http://127.0.0.1:8090/api/collections/project_boards/records/{board_id}"
        response = requests.patch(url, json=payload)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Eliminar un board
@project_boards_bp.route('/boards/<string:board_id>', methods=['DELETE'])
def delete_board(board_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/project_boards/records/{board_id}"
        response = requests.delete(url)
        response.raise_for_status()
        return jsonify({"message": "Board eliminado correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
