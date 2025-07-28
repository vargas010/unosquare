from flask import Blueprint, jsonify, request
import requests

project_tasks_bp = Blueprint('project_tasks', __name__)

# Crear una nueva tarea
@project_tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()
        payload = {
            "title": data.get("title"),
            "description": data.get("description"),
            "board_id": data.get("board_id"),
            "assignee_id": data.get("assignee_id")
        }
        url = "http://127.0.0.1:8090/api/collections/project_tasks/records"
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return jsonify(response.json()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Obtener una tarea específica por ID
@project_tasks_bp.route('/tasks/<string:task_id>', methods=['GET'])
def get_task_by_id(task_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/project_tasks/records/{task_id}"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Actualizar una tarea
@project_tasks_bp.route('/tasks/<string:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        data = request.get_json()
        payload = {
            "title": data.get("title"),
            "description": data.get("description"),
            "board_id": data.get("board_id"),
            "assignee_id": data.get("assignee_id")
        }
        url = f"http://127.0.0.1:8090/api/collections/project_tasks/records/{task_id}"
        response = requests.patch(url, json=payload)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Eliminar una tarea
@project_tasks_bp.route('/tasks/<string:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/project_tasks/records/{task_id}"
        response = requests.delete(url)
        response.raise_for_status()
        return jsonify({"message": "Tarea eliminada correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
