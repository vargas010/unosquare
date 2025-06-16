from flask import Flask
from flask_cors import CORS  # ⬅️ Importar CORS
from routes.accounts_routes import accounts_bp
from routes.leads_routes import leads_bp
from routes.account_leads_routes import account_leads_bp

app = Flask(__name__)
CORS(app)  # ⬅️ Habilitar CORS para todas las rutas

app.register_blueprint(accounts_bp)
app.register_blueprint(leads_bp)
app.register_blueprint(account_leads_bp)

@app.route('/')
def home():
    return 'Bienvenido al backend de Unosquare con Flask y PocketBase'

if __name__ == '__main__':
    app.run(debug=True)
