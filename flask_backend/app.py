import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE = 'flask_database.sqlite'

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS candidate_evaluations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT,
                candidate_name TEXT NOT NULL,
                role_applied TEXT NOT NULL,
                overall_score INTEGER NOT NULL,
                strengths TEXT,
                weaknesses TEXT,
                status TEXT NOT NULL,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Try to add user_email column if it doesn't exist for legacy databases
        try:
            cursor.execute('ALTER TABLE candidate_evaluations ADD COLUMN user_email TEXT;')
        except sqlite3.OperationalError:
            pass # Column already exists
            
        conn.commit()

@app.route('/api/flask/evaluations', methods=['GET'])
def get_evaluations():
    user_email = request.args.get('user_email')
    if not user_email:
        return jsonify([]), 200
        
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, candidate_name, role_applied, overall_score, 
                       strengths, weaknesses, status, note, created_at, user_email 
                FROM candidate_evaluations 
                WHERE user_email = ?
                ORDER BY created_at DESC
            ''', (user_email,))
            rows = cursor.fetchall()
            
            evaluations = [
                {
                    "id": row[0], 
                    "candidate_name": row[1], 
                    "role_applied": row[2],
                    "overall_score": row[3],
                    "strengths": row[4],
                    "weaknesses": row[5],
                    "status": row[6],
                    "note": row[7],
                    "created_at": row[8],
                    "user_email": row[9]
                }
                for row in rows
            ]
            return jsonify(evaluations), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/flask/evaluations', methods=['POST'])
def add_evaluation():
    try:
        data = request.json
        user_email = data.get('user_email')
        candidate_name = data.get('candidate_name')
        role_applied = data.get('role_applied')
        overall_score = data.get('overall_score', 0)
        strengths = data.get('strengths', '')
        weaknesses = data.get('weaknesses', '')
        status = data.get('status', 'Pending')
        note = data.get('note', '')

        if not candidate_name or not role_applied or not user_email:
            return jsonify({"error": "user_email, candidate_name and role_applied are required"}), 400

        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO candidate_evaluations 
                (user_email, candidate_name, role_applied, overall_score, strengths, weaknesses, status, note) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user_email, candidate_name, role_applied, int(overall_score), strengths, weaknesses, status, note))
            conn.commit()
            
            return jsonify({"message": "Evaluation added successfully!", "id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()
    print("Flask Python Backend running on http://127.0.0.1:5001")
    app.run(port=5001, debug=True)
