from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'), primary_key=True)
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'), primary_key=True)

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer(), primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(20), nullable=False)
    active = db.Column(db.Boolean)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users', backref=db.backref('users', lazy='dynamic'))

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255))

class Category(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    creator_id = db.Column(db.Integer(), db.ForeignKey('user.id'))
    is_approved = db.Column(db.Boolean, default=False)
    products = db.relationship('Product', back_populates='category', lazy='dynamic', cascade='all, delete, delete-orphan')

class Product(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String, nullable=False)
    mfg_date = db.Column(db.Date, nullable=False)
    img_url = db.Column(db.String, nullable=False)
    rate_per_unit = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(10), nullable=False)
    available_stock = db.Column(db.Integer(), nullable=False)
    category_id = db.Column(db.Integer(), db.ForeignKey('category.id'))
    category = db.relationship('Category')
    carts = db.relationship('Cart', back_populates='product', lazy='dynamic', cascade='all, delete, delete-orphan')
    
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id'))
    user = db.relationship('User')
    order_details = db.Column(db.String)
    order_date = db.Column(db.Date)

class Request(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    initiator_id = db.Column(db.Integer(), db.ForeignKey('user.id'))
    initiator = db.relationship('User')
    category_id = db.Column(db.Integer(), nullable=False)
    request_details = db.Column(db.String, nullable=False)
    request_date = db.Column(db.Date, nullable=False)
    is_approved = db.Column(db.Boolean, default=False)

class Cart(db.Model):
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id'), primary_key=True)
    user = db.relationship('User')
    product_id = db.Column(db.Integer(), db.ForeignKey('product.id'), primary_key=True)
    product = db.relationship('Product')
    quantity = db.Column(db.Integer())