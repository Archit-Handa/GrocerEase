from flask_restful import Resource, Api, reqparse, marshal, fields
from flask_security import auth_required, roles_accepted, current_user
from datetime import datetime
from backend.models import db, User, Product, Category, Request, Cart as CartDB, Order
from backend.instances import cache

api = Api(prefix='/api/v1')


class Category_Field(fields.Raw):
    def format(self, id):
        category = Category.query.get(id)
        return {'id': category.id, 'name': category.name, 'is_approved': category.is_approved}

product_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'mfg_date': fields.String,
    'img_url': fields.String,
    'rate_per_unit': fields.Float,
    'unit': fields.String,
    'available_stock': fields.Integer,
    'category': Category_Field(attribute='category_id')
}

class Products(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('name', type=str, required=True, help='Product name is required')
        self.parser.add_argument('description', type=str, required=True, help='Product description is required')
        self.parser.add_argument('mfg_date', type=str, required=True, help='Manufacturing date is required')
        self.parser.add_argument('img_url', type=str, required=True, help='Image URL is required')
        self.parser.add_argument('rate_per_unit', type=float, required=True, help='Rate per unit is required')
        self.parser.add_argument('unit', type=str, required=True, help='Unit is required')
        self.parser.add_argument('available_stock', type=int, required=True, help='Available stock is required')
        self.parser.add_argument('category', type=str, required=True, help='Category is required')
        super(Products, self).__init__()
    
    @auth_required('token')
    def get(self, id=None):
        if id is None:
            products = Product.query.all()
            if len(products) == 0:
                return {"message": "No products found"}, 404
            return marshal(products, product_fields), 200
        
        product = Product.query.get(id)
        if not product:
            return {"message": "Product not found"}, 404
        return marshal(product, product_fields), 200
    
    @auth_required('token')
    @roles_accepted('store_manager')
    def post(self):
        args = self.parser.parse_args()

        for arg in args:
            if args[arg] is None or args[arg] == '':
                return {"message": f"{arg.title()} is required"}, 400
            
        if args['rate_per_unit'] < 0:
            return {"message": "Rate per unit must be non-negative"}, 400
        if args['available_stock'] < 0:
            return {"message": "Available stock must be non-negative"}, 400

        category_id = Category.query.filter_by(name=args['category']).first().id
        mfg_date = datetime.strptime(args['mfg_date'], '%Y-%m-%d')
        product = Product(name=args['name'], description=args['description'], mfg_date=mfg_date, img_url=args['img_url'], rate_per_unit=args['rate_per_unit'], unit=args['unit'], available_stock=args['available_stock'], category_id=category_id)
        db.session.add(product)
        try:
            db.session.commit()
            return {"message": "Product created"}, 201
        except:
            return {"message": "Error creating product"}, 500

    @auth_required('token')
    @roles_accepted('store_manager')
    def put(self, id):
        args = self.parser.parse_args()

        for arg in args:
            if args[arg] is None or args[arg] == '':
                return {"message": f"{arg.title()} is required"}, 400
        
        if args['rate_per_unit'] < 0:
            return {"message": "Rate per unit must be non-negative"}, 400
        if args['available_stock'] < 0:
            return {"message": "Available stock must be non-negative"}, 400

        category_id = Category.query.filter_by(name=args['category']).first().id
        mfg_date = datetime.strptime(args['mfg_date'], '%Y-%m-%d')
        
        product = Product.query.get(id)
        product.name = args['name']
        product.description = args['description']
        product.mfg_date = mfg_date
        product.img_url = args['img_url']
        product.rate_per_unit = args['rate_per_unit']
        product.unit = args['unit']
        product.available_stock = args['available_stock']
        product.category_id = category_id

        try:
            db.session.commit()
            return {"message": "Product updated"}, 200
        except:
            return {"message": "Error updating product"}, 500

    @auth_required('token')
    @roles_accepted('store_manager')
    def delete(self, id):
        product = Product.query.get(id)

        if not product:
            return {"message": "Product not found"}, 404
        
        db.session.delete(product)
        try:
            db.session.commit()
            return {"message": "Product deleted"}, 200
        except:
            return {"message": "Error deleting product"}, 500

api.add_resource(Products, '/product', '/product/<int:id>')


class Creator(fields.Raw):
    def format(self, id):
        creator = User.query.get(id)
        return {'username': creator.username, 'email': creator.email}

category_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'creator': Creator(attribute='creator_id'),
    'is_approved': fields.Boolean
}

class Categories(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('name', type=str, required=True, help='Category name is required')
        super(Categories, self).__init__()
    
    @auth_required('token')
    def get(self, id=None):
        if id is None:
            if "user" in current_user.roles:
                categories = Category.query.filter_by(is_approved=True).all()
            
            if "store_manager" in current_user.roles:
                categories = Category.query.filter_by(is_approved=True).all()
            
            if "admin" in current_user.roles:
                categories = Category.query.all()

            if len(categories) > 0:
                return marshal(categories, category_fields), 200
            return {"message": "No categories found"}, 404
        
        category = Category.query.get(id)
        if not category:
            return {"message": "Category not found"}, 404
        return marshal(category, category_fields), 200
    
    @auth_required('token')
    @roles_accepted('admin', 'store_manager')
    def post(self):
        args = self.parser.parse_args()

        for arg in args:
            if args[arg] is None or args[arg] == '':
                return {"message": f"{arg.title()} is required"}, 400
        
        category = Category(name=args['name'], is_approved=False, creator_id=current_user.id)

        if current_user.has_role('admin'):
            category.is_approved = True

        db.session.add(category)
        try:
            db.session.commit()
            return {"message": "Category addition request sent"}, 201
        except:
            return {"message": "Error creating category"}, 500
    
    @auth_required('token')
    @roles_accepted('admin')
    def put(self, id):
        args = self.parser.parse_args()

        for arg in args:
            if args[arg] is None or args[arg] == '':
                return {"message": f"{arg.title()} is required"}, 400
            
        category = Category.query.get(id)
        category.name = args['name']
        try:
            db.session.commit()
            return {"message": "Category updated"}, 201
        except:
            return {"message": "Error updating category"}, 500

    @auth_required('token')
    @roles_accepted('admin')
    def delete(self, id):
        category = Category.query.get(id)

        if not category:
            return {"message": "Category not found"}, 404
        
        db.session.delete(category)
        try:
            db.session.commit()
            return {"message": "Category deleted"}, 200
        except:
            return {"message": "Error deleting category"}, 500

api.add_resource(Categories, '/category', '/category/<int:id>')


request_fields = {
    'id': fields.Integer,
    'initiator': Creator(attribute='initiator_id'),
    'category_id': fields.Integer,
    'request_details': fields.String,
    'request_date': fields.String,
    'is_approved': fields.Boolean
}

class Requests(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('initiator_id', type=int, required=True, help='Initiator ID is required')
        self.parser.add_argument('category', type=str, required=True, help='Category is required')
        self.parser.add_argument('request_details', type=str, required=True, help='Request details are required')
        super(Requests, self).__init__()
    
    @auth_required('token')
    @roles_accepted('admin', 'store_manager')
    def get(self):
        if "store_manager" in current_user.roles:
            requests = Request.query.filter_by(initiator_id=current_user.id).all()
        
        if "admin" in current_user.roles:
            requests = Request.query.all()

        if len(requests) > 0:
            return marshal(requests, request_fields), 200
        return {"message": "No requests found"}, 404
    
    @auth_required('token')
    @roles_accepted('store_manager')
    def post(self):
        args = self.parser.parse_args()

        for arg in args:
            if args[arg] is None or args[arg] == '':
                return {"message": f"{arg.title()} is required"}, 400
        
        category = Category.query.filter_by(name=args['category']).first()
        
        request_details = args['request_details']
        request_details = request_details[0].upper() + request_details[1:]

        request = Request(initiator_id=args['initiator_id'], category_id=category.id, request_details=request_details, request_date=datetime.now(), is_approved=False)
        db.session.add(request)
        try:
            db.session.commit()
            return {"message": "Request sent"}, 201
        except Exception as error:
            print(error)
            return {"message": "Error creating request"}, 500

    @auth_required('token')
    @roles_accepted('admin')
    def put(self, id):
        request = Request.query.get(id)
        
        if not request:
            return {"message": "Request not found"}, 404

        request_type = request.request_details.split()[0]
        category_id = request.category_id

        if request_type.lower() == 'change':
            new_name = request.request_details.split('"')[-2]
            category = Category.query.get(category_id)

            if not category:
                return {"message": "Category not found"}, 404

            category.name = new_name
            request.is_approved = True
            db.session.commit()
            return {"message": "Category name changed"}, 200
        
        elif request_type.lower() == 'delete':
            category = Category.query.get(category_id)
            db.session.delete(category)
            try:
                request.is_approved = True
                db.session.commit()
                return {"message": "Category deleted"}, 200
            except:
                return {"message": "Error deleting category"}, 500
        
        else:
            return {"message": "Invalid request type"}, 400
    
    @auth_required('token')
    @roles_accepted('admin')
    def delete(self, id):
        request = Request.query.get(id)

        if not request:
            return {"message": "Request not found"}, 404
        
        db.session.delete(request)
        try:
            db.session.commit()
            return {"message": "Request deleted"}, 200
        except:
            return {"message": "Error deleting request"}, 500

api.add_resource(Requests, '/request', '/request/<int:id>')


class Product_ID(fields.Raw):
    def format(self, value):
        return value

cart_fields = {
    'id': Product_ID(attribute='product_id'),
    'quantity': fields.Integer
}

class Cart(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('cart_string', type=str, help='Cart string is required', action='append')
        super(Cart, self).__init__()
    
    @auth_required('token')
    @roles_accepted('user')
    def get(self):
        cart = CartDB.query.filter_by(user_id=current_user.id).all()
        if len(cart) > 0:
            return marshal(cart, cart_fields), 200
        return {"message": "Cart is empty"}, 404

    @auth_required('token')
    @roles_accepted('user')
    def post(self):
        args = self.parser.parse_args()
        cart = args['cart_string']
        user_id = current_user.id

        previous_items = CartDB.query.filter_by(user_id=user_id).all()
        for previous_item in previous_items:
            db.session.delete(previous_item)
        
        if cart is None or cart == '' or len(cart) == 0:
            try:
                db.session.commit()
                return {"message": "Cart is empty"}, 200
            except:
                return {"message": "Error updating cart"}, 500

        for item in cart:
            item = eval(item)
            product_id = item['id']
            quantity = item['quantity']
            cart_item = CartDB(user_id=user_id, product_id=product_id, quantity=quantity)
            db.session.add(cart_item)

        try:
            db.session.commit()
            return {"message": "Cart updated"}, 200
        except:
            return {"message": "Error updating cart"}, 500

api.add_resource(Cart, '/cart')


order_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'order_details': fields.String,
    'order_date': fields.String
}

class Orders(Resource):
    @auth_required('token')
    @roles_accepted('user')
    @cache.cached(timeout=30, make_cache_key=lambda *args: f'orders_for_{current_user.username}')
    def get(self):
        print('While cached, this statement will not print')

        orders = Order.query.filter_by(user_id=current_user.id).all()
        if len(orders) > 0:
            return marshal(orders, order_fields), 200
        return {"message": "No orders found"}, 404

api.add_resource(Orders, '/orders')


class Sales(Resource):
    @auth_required('token')
    @roles_accepted('store_manager')
    @cache.cached(timeout=60, query_string=True)
    def get(self, by=None):
        if by.lower() not in ['category', 'product']:
            return {"message": "Invalid parameter"}, 400
        
        orders = marshal(Order.query.all(), order_fields)
        if len(orders) == 0:
            return {"message": "No orders found"}, 404
        
        if by.lower() == 'category':
            sales = {category.name: 0 for category in Category.query.all()}
            for order in orders:
                for item in eval(order['order_details']):
                    product = Product.query.get(item['id'])
                    if product:
                        sales[product.category.name] += item['quantity']
            return sales, 200
        
        if by.lower() == 'product':
            sales = {product.name: 0 for product in Product.query.all()}
            for order in orders:
                for item in eval(order['order_details']):
                    product = Product.query.get(item['id'])
                    if product:
                        sales[product.name] += item['quantity']
            return sales, 200

api.add_resource(Sales, '/sales/<by>')


class Revenue(Resource):
    @auth_required('token')
    @roles_accepted('store_manager')
    @cache.cached(timeout=60, query_string=True)
    def get(self, by=None):
        if by.lower() not in ['category', 'product']:
            return {"message": "Invalid parameter"}, 400
        
        orders = marshal(Order.query.all(), order_fields)
        if len(orders) == 0:
            return {"message": "No orders found"}, 404
        
        if by.lower() == 'category':
            revenue = {category.name: 0 for category in Category.query.all()}
            for order in orders:
                for item in eval(order['order_details']):
                    product = Product.query.get(item['id'])
                    if product:
                        revenue[product.category.name] += item['quantity'] * item['rate_per_unit']
            return revenue, 200
        
        if by.lower() == 'product':
            revenue = {product.name: 0 for product in Product.query.all()}
            for order in orders:
                for item in eval(order['order_details']):
                    product = Product.query.get(item['id'])
                    if product:
                        revenue[product.name] += item['quantity'] * item['rate_per_unit']
            return revenue, 200

api.add_resource(Revenue, '/revenue/<by>')