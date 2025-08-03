from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

# Initialize Firebase
cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts_ref = db.collection('posts')
    docs = posts_ref.stream()
    posts = []
    for doc in docs:
        posts.append(doc.to_dict())
    return jsonify(posts)

@app.route('/api/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    if not data or not all(k in data for k in ['title', 'content', 'author']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    post_ref = db.collection('posts').document()
    post_ref.set({
        'id': post_ref.id,
        'title': data['title'],
        'content': data['content'],
        'author': data['author'],
        'createdAt': firestore.SERVER_TIMESTAMP
    })
    return jsonify({'success': True}), 201

if __name__ == '__main__':
    app.run(debug=True)