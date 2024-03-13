from celery import shared_task
from jinja2 import Template
from datetime import date, timedelta, datetime
from flask_restful import fields, marshal
import pandas as pd
from backend.models import Category, User, Order, Cart, Product
from backend.mail_service import send_email

class Order_Details(fields.Raw):
    def format(self, value):
        return eval(value)

order_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'order_details': Order_Details(attribute='order_details'),
    'order_date': fields.String
}

@shared_task(ignore_result=False)
def create_inventory_csv():
    inventory = Product.query.join(Category).with_entities(Product.id, Product.name, Category.id, Category.name, Product.description, Product.unit, Product.available_stock, Product.rate_per_unit).all()

    columns = ['Product ID',
        'Product Name',
        'Category ID',
        'Category Name',
        'Description',
        'Unit',
        'Available Stock Units',
        'Rate Per Unit (in ₹)'
    ]

    df = pd.DataFrame(inventory, columns=columns)
    
    products = Product.query.all()

    units_sold_total = {product.id: 0 for product in products}
    units_sold_last_month = {product.id: 0 for product in products}

    orders = marshal(Order.query.all(), order_fields)
    for order in orders:
        for item in order['order_details']:
            try:
                units_sold_total[item['id']] += item['quantity']
                if datetime.strptime(order['order_date'], "%Y-%m-%d").date() >= date.today() - timedelta(days=30):
                    units_sold_last_month[item['id']] += item['quantity']
            except KeyError:
                pass

    df['Units Sold Total'] = df['Product ID'].map(units_sold_total)
    df['Units Sold Last Month'] = df['Product ID'].map(units_sold_last_month)
    
    filename = 'export files/GrocerEase Inventory_' + str(date.today()) + '.csv'
    df.to_csv(filename, index=False)
    return filename

@shared_task(ignore_result=False)
def create_inventory_excel():
    inventory = Product.query.join(Category).with_entities(Product.id, Product.name, Category.id, Category.name, Product.description, Product.unit, Product.available_stock, Product.rate_per_unit).all()

    columns = ['Product ID',
        'Product Name',
        'Category ID',
        'Category Name',
        'Description',
        'Unit',
        'Available Stock Units',
        'Rate Per Unit (in ₹)'
    ]

    df = pd.DataFrame(inventory, columns=columns)
    
    products = Product.query.all()

    units_sold_total = {product.id: 0 for product in products}
    units_sold_last_month = {product.id: 0 for product in products}

    orders = marshal(Order.query.all(), order_fields)
    for order in orders:
        for item in order['order_details']:
            try:
                units_sold_total[item['id']] += item['quantity']
                if datetime.strptime(order['order_date'], "%Y-%m-%d").date() >= date.today() - timedelta(days=30):
                    units_sold_last_month[item['id']] += item['quantity']
            except KeyError:
                pass

    df['Units Sold Total'] = df['Product ID'].map(units_sold_total)
    df['Units Sold Last Month'] = df['Product ID'].map(units_sold_last_month)
    
    filename = 'export files/GrocerEase Inventory_' + str(date.today()) + '.xlsx'
    df.to_excel(filename, index=False)
    return filename

@shared_task(ignore_result=True)
def daily_reminder():
    for user in User.query.all():
        if user.has_role('user'):
            last_order = Order.query.filter_by(user_id=user.id).order_by(Order.order_date.desc()).first()
            last_order_date = last_order.order_date if last_order else None
            not_visited = (date.today() - last_order_date).days >= 1 if last_order_date else True
            cart_exists = True if Cart.query.filter_by(user_id=user.id).first() else False

            if cart_exists:
                with open('templates/daily_reminder_cart_exists.html', 'r') as f:
                    template = Template(f.read())
                    send_email(user.email, "One click and you're done!", template.render(name=user.username))

            elif not_visited:
                with open('templates/daily_reminder_not_visited.html', 'r') as f:
                    template = Template(f.read())
                    send_email(user.email, 'Ready for another GrocerEase adventure?', template.render(name=user.username))

            else:
                continue

@shared_task(ignore_result=True)
def monthly_report():
    for user in User.query.all():
        if user.has_role('user'):
            last_month_orders = Order.query.filter_by(user_id=user.id).filter(Order.order_date >= date.today() - timedelta(days=30)).all()
            last_month_orders = marshal(last_month_orders, order_fields)

            with open('templates/monthly_report.html', 'r') as f:
                template = Template(f.read())

                grand_total = sum(item['rate_per_unit'] * item['quantity'] for order in last_month_orders for item in order['order_details'])
                month_name = (date.today() - timedelta(days=1)).strftime("%B %Y")

                send_email(user.email, 'GrocerEase Monthly Report - ' + month_name, template.render(username=user.username, email=user.email, orders=last_month_orders, month=month_name, total=grand_total))

@shared_task(ignore_result=True)
def stockout_reminder():
    products = Product.query.all()

    out_of_stock = []
    low_stock = []

    for product in products:
        if product.available_stock == 0:
            out_of_stock.append(product)
        elif product.available_stock <= 10:
            low_stock.append(product)

    with open('templates/stockout_reminder.html', 'r') as f:
        template = Template(f.read())

        if len(out_of_stock) > 0 or len(low_stock) > 0:
            send_email('store-managers@grocerease.com', 'GrocerEase - Out of Stock Reminder', template.render(out_of_stock=out_of_stock, low_stock=low_stock))