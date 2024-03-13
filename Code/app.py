from flask import Flask, render_template, request, jsonify, send_file
from flask_security import Security, auth_required, roles_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_restful import marshal, fields
from celery.result import AsyncResult
from celery.schedules import crontab
from datetime import datetime, date
from config import DevelopmentConfig
from backend.models import db, User, Category, Product, Cart, Order
from backend.security import datastore
from api.resources import api
from backend.worker import celery_init_app
from backend.tasks import create_inventory_csv, create_inventory_excel, daily_reminder, monthly_report, stockout_reminder
from backend.instances import cache

app = Flask(__name__)
app.config.from_object(DevelopmentConfig)
api.init_app(app)
db.init_app(app)
app.security = Security(app, datastore, register_blueprint=False)
celery_app = celery_init_app(app)
cache.init_app(app)
app.app_context().push()

with app.app_context():
    db.create_all()

    datastore.find_or_create_role(name='admin', description='Administrator Description')
    datastore.find_or_create_role(name='store_manager', description='Store Manager Description')
    datastore.find_or_create_role(name='user', description='User Description')
    db.session.commit()

    if not datastore.find_user(email='admin@grocerease.com'):
        datastore.create_user(username='admin',
                              email='admin@grocerease.com',
                              password=generate_password_hash('admin'),
                              roles=['admin'])
    
    db.session.commit()

@app.get('/')
def home():
    return render_template('index.html')

@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data['email']
    password = data['password']
    if not email:
        return jsonify({"message": "Email is required"}), 400
    if not password:
        return jsonify({"message": "Password is required"}), 400

    user = datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "User not found"}), 404
    
    if not user.active:
        return jsonify({"message": "User not activated"}), 400
    
    if check_password_hash(user.password, password):
        return jsonify({"email": user.email, "username": user.username, "role": user.roles[0].name, "token": user.get_auth_token(), "id": user.id}), 200
    else:
        return jsonify({"message": "Invalid password"}), 400
    
@app.post('/user-signup')
def user_signup():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']
    role = data['role']
    if not username:
        return jsonify({"message": "Username is required"}), 400
    if not email:
        return jsonify({"message": "Email is required"}), 400
    if not password:
        return jsonify({"message": "Password is required"}), 400
    if not role:
        return jsonify({"message": "Role is required"}), 400
    
    if role != 'user' and role != 'store_manager':
        return jsonify({"message": "Invalid role"}), 400

    if datastore.find_user(email=email) or datastore.find_user(username=username):
        return jsonify({"message": "User already exists"}), 409
    
    user = datastore.create_user(username=username,
                                 email=email,
                                 password=generate_password_hash(password),
                                 roles=[role])
    
    if role == 'store_manager':
        user.active = False
    
    db.session.commit()

    return jsonify({"message": "User created"}), 200

class User_Role(fields.Raw):
    def format(self, role):
        return role[0].name

user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'role': User_Role(attribute='roles'),
    'active': fields.Boolean
}

@app.get('/users')
@auth_required('token')
@roles_required('admin')
def all_users():
    users = []
    store_managers = []
    admin = []
    
    all_users = User.query.all()
    for user in all_users:
        if user.has_role('user'):
            users.append(user)
        elif user.has_role('store_manager'):
            store_managers.append(user)
        elif user.has_role('admin'):
            admin.append(user)
        else:
            pass
    
    if len(users) + len(store_managers) + len(admin) == 0:
        return jsonify({"message": "No users found"}), 404
    
    return jsonify({
        'users': marshal(users, user_fields),
        'store managers': marshal(store_managers, user_fields),
        'admin': marshal(admin, user_fields)
    }), 200

@app.get('/activate/store_manager/<int:sm_id>')
@auth_required('token')
@roles_required('admin')
def activate_store_manager(sm_id):
    store_manager = User.query.get(sm_id)
    if not store_manager or "store_manager" not in store_manager.roles:
        return jsonify({"message": "Store Manager not found"}), 404
    
    store_manager.active = not store_manager.active
    db.session.commit()
    return jsonify({"message": f"Store Manager {'Activated' if store_manager.active else 'Deactivated'}"}), 200

@app.get('/category/<int:cat_id>/approve')
@auth_required('token')
@roles_required('admin')
def approve_category(cat_id):
    category = Category.query.get(cat_id)
    if not category:
        return jsonify({"message": "Category not found"}), 404
    
    category.is_approved = True
    db.session.commit()
    return jsonify({"message": "Category approved"}), 200

@app.delete('/category/<int:cat_id>/decline')
@auth_required('token')
@roles_required('admin')
def decline_category(cat_id):
    category = Category.query.get(cat_id)
    if not category:
        return jsonify({"message": "Category not found"}), 404
    
    db.session.delete(category)
    try:
        db.session.commit()
        return jsonify({"message": "Category declined"}), 200
    except:
        return jsonify({"message": "Error declining category"}), 500

@app.post('/checkout')
@auth_required('token')
@roles_required('user')
def checkout():
    cart_string = request.get_json()['cart_string']
    user_id = current_user.id
    order_date = datetime.now()
    if cart_string is None or cart_string == '' or len(cart_string) == 0:
        return jsonify({"message": "Cart is empty"}), 400
    
    order = Order(user_id=user_id, order_details=str(cart_string), order_date=order_date)
    db.session.add(order)

    for item in cart_string:
        product_id = item['id']
        quantity = item['quantity']
        product = Product.query.get(product_id)
        product.available_stock -= quantity

    previous_items = Cart.query.filter_by(user_id=user_id).all()
    for previous_item in previous_items:
        db.session.delete(previous_item)

    try:
        db.session.commit()
        return jsonify({"message": "Order placed"}), 200
    except:
        return jsonify({"message": "Error placing order"}), 500

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Daily reminder to users sent at 5pm everyday
    sender.add_periodic_task(
        crontab(minute='0', hour='17'),
        daily_reminder.s(),
        name='Send daily reminders to users'
    )

    # Monthly report to users on the first day of the month
    sender.add_periodic_task(
        crontab(minute='0', hour='0', day_of_month='1'),
        monthly_report.s(),
        name="Send monthly report to users"
    )

    # Stockout reminder to store managers every afternoon
    sender.add_periodic_task(
        crontab(minute='30', hour='12'),
        stockout_reminder.s(),
        name="Send stockout reminder to store managers"
    )

@auth_required('token')
@roles_required('store_manager')
@app.get('/download-inventory-csv')
@cache.cached(timeout=60, make_cache_key=lambda *args: f'inventory_csv_{date.today()}')
def download_inventory_csv():
    print('While cached, this statement will not print')
    task = create_inventory_csv.delay()
    return jsonify({"task-id": task.id})

@auth_required('token')
@roles_required('store_manager')
@app.get('/download-inventory-excel')
@cache.cached(timeout=60, make_cache_key=lambda *args: f'inventory_excel_{date.today()}')
def download_inventory_excel():
    print('While cached, this statement will not print')
    task = create_inventory_excel.delay()
    return jsonify({"task-id": task.id})

@auth_required('token')
@roles_required('store_manager')
@app.get('/get-inventory/<task_id>')
def get_inventory(task_id):
    result = AsyncResult(task_id)
    if result.ready():
        filename = result.result
        return send_file(filename, as_attachment=True), 200
    else:
        return jsonify({"message": "Task not yet completed"}), 202

@app.after_request
def clear_cache(response):
    if request.method != 'GET':
        cache.clear()
    return response


if __name__ == '__main__':
    app.run(debug=True)