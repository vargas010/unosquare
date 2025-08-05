# BACKEND: project_tasks_routes.py
from flask import Blueprint, jsonify, request
import requests

project_tasks_bp = Blueprint('project_tasks', __name__)
BASE_URL = "http://127.0.0.1:8090/api/collections/project_tasks/records"

# Crear una nueva tarea
@project_tasks_bp.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()
        payload = {
            "title": data.get("title"),
            "description": data.get("description"),
            "board_id": data.get("board_id"),
            "assignee_id": data.get("assignee_id"),
            "column_id": data.get("column_id", "todo")
        }
        response = requests.post(BASE_URL, json=payload)
        response.raise_for_status()
        return jsonify(response.json()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Obtener las tareas para un tablero específico
@project_tasks_bp.route('/boards/<string:board_id>/tasks', methods=['GET'])
def get_tasks_for_board(board_id):
    try:
        url = f"{BASE_URL}?filter=board_id='{board_id}'&expand=assignee_id"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Actualizar una tarea
@project_tasks_bp.route('/tasks/<string:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        data = request.get_json()
        payload = {}

        for field in ["title", "description", "board_id", "column_id", "assignee_id"]:
            if data.get(field) is not None:
                payload[field] = data.get(field)

        response = requests.patch(f"{BASE_URL}/{task_id}", json=payload)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Eliminar una tarea
@project_tasks_bp.route('/tasks/<string:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        response = requests.delete(f"{BASE_URL}/{task_id}")
        response.raise_for_status()
        return jsonify({"message": "Tarea eliminada correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500