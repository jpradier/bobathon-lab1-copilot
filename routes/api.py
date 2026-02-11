from flask import Blueprint, jsonify, request
from models.todo import db, Todo

api = Blueprint('api', __name__, url_prefix='/api')


@api.route('/todos', methods=['GET'])
def get_todos():
    """Get all todos."""
    todos = Todo.query.order_by(Todo.created_at.desc()).all()
    return jsonify([todo.to_dict() for todo in todos])


@api.route('/todos', methods=['POST'])
def create_todo():
    """Create a new todo."""
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    title = data['title'].strip()
    if not title:
        return jsonify({'error': 'Title cannot be empty'}), 400
    
    todo = Todo(title=title)
    db.session.add(todo)
    db.session.commit()
    
    return jsonify(todo.to_dict()), 201


@api.route('/todos/<int:todo_id>', methods=['GET'])
def get_todo(todo_id):
    """Get a single todo by ID."""
    todo = Todo.query.get_or_404(todo_id)
    return jsonify(todo.to_dict())


@api.route('/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update a todo."""
    todo = Todo.query.get_or_404(todo_id)
    data = request.get_json()
    
    if 'title' in data:
        title = data['title'].strip()
        if not title:
            return jsonify({'error': 'Title cannot be empty'}), 400
        todo.title = title
    
    if 'completed' in data:
        todo.completed = bool(data['completed'])
    
    db.session.commit()
    return jsonify(todo.to_dict())


@api.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo."""
    todo = Todo.query.get_or_404(todo_id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify({'message': 'Todo deleted successfully'})
