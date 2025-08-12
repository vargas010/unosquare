from flask import Blueprint, jsonify, request
import requests
import time

project_boards_bp = Blueprint('project_boards', __name__)

BASE_URL = "http://127.0.0.1:8090/api/collections/project_boards/records"

@project_boards_bp.route('/boards', methods=['POST'])
def create_board():
    try:
        data = request.get_json()
        payload = {
            "title": data.get("title"),
            "project_id": data.get("project_id"),
            # Inicializamos columnas por defecto
            "columns": [
                {"id": "todo", "name": "Por hacer", "order": 1},
                {"id": "inProgress", "name": "En progreso", "order": 2},
                {"id": "done", "name": "Hecho", "order": 3}
            ]
        }
        response = requests.post(BASE_URL, json=payload)
        response.raise_for_status()
        return jsonify(response.json()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@project_boards_bp.route('/projects/<string:project_id>/boards', methods=['GET'])
def get_boards_for_project(project_id):
    try:
        url = f"{BASE_URL}?project_id={project_id}"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@project_boards_bp.route('/boards/<string:board_id>', methods=['PUT'])
def update_board(board_id):
    try:
        data = request.get_json()
        payload = {
            "title": data.get("title"),
            "project_id": data.get("project_id"),
            "order": data.get("order")
        }
        url = f"{BASE_URL}/{board_id}"
        response = requests.patch(url, json=payload)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@project_boards_bp.route('/boards/<string:board_id>', methods=['DELETE'])
def delete_board(board_id):
    try:
        url = f"{BASE_URL}/{board_id}"
        response = requests.delete(url)
        response.raise_for_status()
        return jsonify({"message": "Board eliminado correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# NUEVOS ENDPOINTS DE COLUMNAS
# =========================

@project_boards_bp.route('/boards/<string:board_id>/columns', methods=['GET'])
def get_board_columns(board_id):
    try:
        r = requests.get(f"{BASE_URL}/{board_id}")
        r.raise_for_status()
        board = r.json()
        return jsonify(board.get('columns') or []), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@project_boards_bp.route('/boards/<string:board_id>/columns', methods=['POST'])
def add_board_column(board_id):
    try:
        data = request.get_json()
        col_id = data.get("id") or f"col_{int(time.time() * 1000)}"

        new_col = {
            "id": col_id,
            "name": data.get("name", "Nueva columna"),
            "order": data.get("order", 9999)
        }

        # Obtener columnas actuales
        r = requests.get(f"{BASE_URL}/{board_id}")
        r.raise_for_status()
        board = r.json()
        cols = board.get('columns') or []
        cols.append(new_col)

        pr = requests.patch(f"{BASE_URL}/{board_id}", json={"columns": cols})
        pr.raise_for_status()

        return jsonify(new_col), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@project_boards_bp.route('/boards/<string:board_id>/columns/<string:col_id>', methods=['PUT'])
def update_board_column(board_id, col_id):
    try:
        data = request.get_json()
        new_name = data.get("name")
        new_order = data.get("order")  # opcional

        r = requests.get(f"{BASE_URL}/{board_id}")
        r.raise_for_status()
        board = r.json()
        cols = board.get('columns') or []

        found = False
        updated_cols = []
        for c in cols:
            if c.get("id") == col_id:
                found = True
                updated = {**c}
                if new_name is not None:
                    updated["name"] = new_name
                if new_order is not None:
                    updated["order"] = new_order
                updated_cols.append(updated)
            else:
                updated_cols.append(c)

        if not found:
            return jsonify({"error": "Columna no encontrada"}), 404

        pr = requests.patch(f"{BASE_URL}/{board_id}", json={"columns": updated_cols})
        pr.raise_for_status()

        return jsonify({"id": col_id, "name": new_name, "order": new_order}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@project_boards_bp.route('/boards/<string:board_id>/columns/reorder', methods=['PUT'])
def reorder_board_columns(board_id):
    try:
        data = request.get_json()
        order_ids = data.get("order", [])  # ["col_a", "col_b", "col_c"]

        r = requests.get(f"{BASE_URL}/{board_id}")
        r.raise_for_status()
        board = r.json()
        cols = board.get('columns') or []

        id_to_col = {c['id']: c for c in cols}
        new_cols = []
        for idx, col_id in enumerate(order_ids, start=1):
            col = id_to_col.get(col_id)
            if col:
                col = {**col, "order": idx}
                new_cols.append(col)

        remaining = [c for cid, c in id_to_col.items() if cid not in set(order_ids)]
        next_idx = len(new_cols) + 1
        for c in remaining:
            c = {**c, "order": next_idx}
            new_cols.append(c)
            next_idx += 1

        pr = requests.patch(f"{BASE_URL}/{board_id}", json={"columns": new_cols})
        pr.raise_for_status()

        return jsonify({"ok": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@project_boards_bp.route('/boards/<string:board_id>', methods=['GET'])
def get_board(board_id):
    try:
        url = f"http://127.0.0.1:8090/api/collections/project_boards/records/{board_id}"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
