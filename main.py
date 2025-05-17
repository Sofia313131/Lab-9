from flask import Flask, render_template, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///workplaces.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Workplace(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(300))
    term = db.Column(db.Integer)

    def __repr__(self) -> str:
        return f'Workplace {self.id}: {self.company} - {self.term} months'

@app.route('/')
def main():
    workplaces = Workplace.query.all()
    total_term = sum(wp.term for wp in workplaces)
    return render_template('index.html', workplaces=workplaces, total_term=total_term)

@app.route('/api/workplaces', methods=['GET'])
def get_workplaces():
    workplaces = Workplace.query.all()
    return jsonify([{'id': wp.id, 'company': wp.company, 'term': wp.term} for wp in workplaces])

@app.route('/api/workplaces', methods=['POST'])
def add_workplace():
    data = request.get_json()
    company = data.get('company')
    term = int(data.get('term'))
    workplace = Workplace(company=company, term=term)
    db.session.add(workplace)
    db.session.commit()
    return jsonify({'id': workplace.id, 'company': workplace.company, 'term': workplace.term}), 201

@app.route('/api/workplaces/<int:id>', methods=['DELETE'])
def delete_workplace(id):
    workplace = Workplace.query.get_or_404(id)
    db.session.delete(workplace)
    db.session.commit()
    return jsonify({'message': 'Workplace deleted'})

@app.route('/api/workplaces', methods=['DELETE'])
def clear_workplaces():
    Workplace.query.delete()
    db.session.commit()
    return jsonify({'message': 'All workplaces cleared'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
