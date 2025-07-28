from flask import Blueprint, request, jsonify
import requests
import logging

# Configura logging
logging.basicConfig(level=logging.DEBUG)

project_bp = Blueprint('project_bp', __name__)

# Definir la URL de la API de PocketBase
POCKETBASE_URL = "http://127.0.0.1:8090"  # Cambia a la URL de tu servidor PocketBase si es diferente

# Crear un nuevo proyecto
@project_bp.route('/projects', methods=['POST'])
def create_project():
    data = request.json
    name = data.get("name")
    status = data.get("status")
    account_id = data.get("account_id")

    if not name or not status or not account_id:
        return jsonify({"error": "Faltan datos"}), 400

    try:
        payload = {
            "name": name,
            "status": status,
            "account_id": account_id
        }
        response = requests.post(f"{POCKETBASE_URL}/api/collections/projects/records", json=payload)
        response.raise_for_status()  # Verifica que la solicitud haya sido exitosa
        return jsonify(response.json()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Crear columna en un proyecto
@project_bp.route('/projects/<project_id>/boards', methods=['POST'])
def create_board(project_id):
    data = request.json
    title = data.get("title")
    order = data.get("order", 1)

    try:
        payload = {
            "project_id": project_id,
            "title": title,
            "order": order
        }
        response = requests.post(f"{POCKETBASE_URL}/api/collections/project_boards/records", json=payload)
        response.raise_for_status()  # Verifica que la solicitud haya sido exitosa
        return jsonify(response.json()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Crear tarea dentro de una columna
@project_bp.route('/boards/<board_id>/tasks', methods=['POST'])
def create_task(board_id):
    data = request.json
    title = data.get("title")
    description = data.get("description", "")
    order = data.get("order", 1)
    assignee_id = data.get("assignee_id")

    payload = {
        "board_id": board_id,
        "title": title,
        "description": description,
        "order": order
    }

    if assignee_id:
        payload["assignee_id"] = assignee_id

    try:
        response = requests.post(f"{POCKETBASE_URL}/api/collections/project_tasks/records", json=payload)
        response.raise_for_status()  # Verifica que la solicitud haya sido exitosa
        return jsonify(response.json()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Obtener todas las columnas y tareas de un proyecto
@project_bp.route('/projects/<project_id>/board-tasks', methods=['GET'])
def get_project_boards_with_tasks(project_id):
    try:
        logging.debug(f"Consultando proyectos con project_id = {project_id}")
        
        # Obtener todas las columnas (project_boards) sin filtro complejo
        all_boards = []
        page = 1
        while True:
            response = requests.get(f"{POCKETBASE_URL}/api/collections/project_boards/records?perPage=200&page={page}")
            response.raise_for_status()
            data = response.json()

            # Verifica si la respuesta contiene los registros
            if 'items' not in data:
                logging.error("Error: 'items' no encontrado en la respuesta de project_boards")
                break

            all_boards.extend(data['items'])
            logging.debug(f"Recibidos {len(data['items'])} boards en la página {page}")
            if len(data['items']) < 200:
                break  # Si los registros devueltos son menores a 200, significa que no hay más páginas
            page += 1

        logging.debug(f"Total boards encontrados: {len(all_boards)}")
        
        # Filtrar las columnas del proyecto por project_id
        boards = [board for board in all_boards if board['project_id'] == project_id]
        logging.debug(f"Boards filtrados para project_id {project_id}: {len(boards)}")

        full_result = []

        # Para cada columna, obtener sus tareas
        for board in boards:
            logging.debug(f"Consultando tareas para board_id = {board['id']}")
            all_tasks = []
            page = 1
            while True:
                response = requests.get(f"{POCKETBASE_URL}/api/collections/project_tasks/records?board_id={board['id']}&perPage=200&page={page}")
                response.raise_for_status()
                data = response.json()

                # Verifica si la respuesta contiene las tareas
                if 'items' not in data:
                    logging.error(f"Error: 'items' no encontrado en la respuesta de project_tasks para board_id = {board['id']}")
                    break

                all_tasks.extend(data['items'])
                logging.debug(f"Recibidos {len(data['items'])} tasks en la página {page} para board_id = {board['id']}")
                if len(data['items']) < 200:
                    break  # No más páginas
                page += 1

            logging.debug(f"Tareas encontradas para board {board['id']}: {len(all_tasks)}")

            full_result.append({
                "board": board,
                "tasks": all_tasks
            })

        return jsonify(full_result), 200

    except Exception as e:
        logging.error(f"Error en la consulta: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Mover una tarea a otra columna
@project_bp.route('/tasks/<task_id>/move', methods=['PATCH'])
def move_task(task_id):
    data = request.json
    new_board_id = data.get("board_id")
    new_order = data.get("order")

    if not new_board_id or new_order is None:
        return jsonify({"error": "Faltan board_id u order"}), 400

    try:
        # Crear payload con la nueva información
        payload = {
            "board_id": new_board_id,
            "order": new_order
        }

        # Usar `requests.patch` para actualizar la tarea
        response = requests.patch(f"{POCKETBASE_URL}/api/collections/project_tasks/records/{task_id}", json=payload)
        response.raise_for_status()  # Verifica que la solicitud haya sido exitosa

        # Devolver la respuesta de PocketBase
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
