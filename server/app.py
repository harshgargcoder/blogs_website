import firebase_admin
from firebase_admin import credentials
import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)


cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def doc_to_dict(doc):
    data = doc.to_dict()
    data['id'] = doc.id
    for field in ['createdAt', 'updatedAt']:
        if field in data and hasattr(data[field], 'isoformat'):
            data[field] = data[field].isoformat()
    return data


@app.route('/api/posts', methods=['GET'])
def get_posts():
    try:
        posts_ref = db.collection('posts')
        query = posts_ref.order_by(
            'createdAt', direction=firestore.Query.DESCENDING)
        docs = query.stream()
        posts = [doc_to_dict(doc) for doc in docs]
        return jsonify(posts)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    try:
        doc = db.collection('posts').document(post_id).get()
        if doc.exists:
            return jsonify(doc_to_dict(doc))
        return jsonify({'error': 'Post not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/posts', methods=['POST'])
def create_post():
    try:
        data = request.get_json()
        required_fields = ['title', 'content', 'author']
        if not data or not all(k in data for k in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        post_data = {
            'title': data['title'],
            'content': data['content'],
            'author': data['author'],
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'likesCount': 0,
            'likedBy': [],
            'categories': data.get('categories', [])
        }

        post_ref = db.collection('posts').document()
        post_ref.set(post_data)

        return jsonify({'success': True, 'id': post_ref.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/posts/<post_id>', methods=['PUT'])
def update_post(post_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        post_ref = db.collection('posts').document(post_id)
        updates = {
            'updatedAt': firestore.SERVER_TIMESTAMP
        }

        if 'title' in data:
            updates['title'] = data['title']
        if 'content' in data:
            updates['content'] = data['content']
        if 'categories' in data:
            updates['categories'] = data['categories']

        post_ref.update(updates)
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    try:
        db.collection('posts').document(post_id).delete()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/posts/<post_id>/comments', methods=['GET'])
def get_comments(post_id):
    try:
        comments_ref = db.collection('posts').document(
            post_id).collection('comments')
        query = comments_ref.order_by(
            'createdAt', direction=firestore.Query.DESCENDING)
        docs = query.stream()
        comments = [doc_to_dict(doc) for doc in docs]
        return jsonify(comments)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/posts/<post_id>/comments', methods=['POST'])
def add_comment(post_id):
    try:
        data = request.get_json()
        required_fields = ['content', 'author']
        if not data or not all(k in data for k in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        comment_data = {
            'content': data['content'],
            'author': data['author'],
            'createdAt': firestore.SERVER_TIMESTAMP
        }

        comment_ref = db.collection('posts').document(
            post_id).collection('comments').document()
        comment_ref.set(comment_data)

        return jsonify({'success': True, 'id': comment_ref.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/posts/<post_id>/like', methods=['POST'])
def like_post(post_id):
    try:
        data = request.get_json()
        if not data or 'userEmail' not in data:
            return jsonify({'error': 'User email required'}), 400

        post_ref = db.collection('posts').document(post_id)
        post_ref.update({
            'likesCount': firestore.Increment(1),
            'likedBy': firestore.ArrayUnion([data['userEmail']])
        })
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/posts/<post_id>/unlike', methods=['POST'])
def unlike_post(post_id):
    try:
        data = request.get_json()
        if not data or 'userEmail' not in data:
            return jsonify({'error': 'User email required'}), 400

        post_ref = db.collection('posts').document(post_id)
        post_ref.update({
            'likesCount': firestore.Increment(-1),
            'likedBy': firestore.ArrayRemove([data['userEmail']])
        })
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv(
        'FLASK_ENV') == 'development')
