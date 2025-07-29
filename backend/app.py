from flask import Flask
from flask_cors import CORS
from routes.accounts_routes import accounts_bp
from routes.leads_routes import leads_bp  # Asegúrate de que este sea el archivo correcto
from routes.account_leads_routes import account_leads_bp
from routes.types_routes import types_bp
from routes.project_routes import project_bp
from routes.project_boards_routes import project_boards_bp
from routes.project_tasks_routes import project_tasks_bp

app = Flask(__name__)
<<<<<<< HEAD
CORS(app)
=======
CORS(app)  # Habilitar CORS para permitir solicitudes del frontend
>>>>>>> 13a35e6bf56eb9ba8e48801f87715bf4ee8e2f3b

# Registrar el blueprint de leads
app.register_blueprint(accounts_bp)
app.register_blueprint(leads_bp)
app.register_blueprint(account_leads_bp)
app.register_blueprint(types_bp)
<<<<<<< HEAD
app.register_blueprint(project_bp)
app.register_blueprint(project_boards_bp)
app.register_blueprint(project_tasks_bp)
=======
>>>>>>> 13a35e6bf56eb9ba8e48801f87715bf4ee8e2f3b

@app.route('/')
def home():
    return 'Bienvenido al backend de Unosquare con Flask y PocketBase'

if __name__ == '__main__':
    app.run(debug=True)
