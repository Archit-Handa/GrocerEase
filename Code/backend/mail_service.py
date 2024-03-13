import os
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

SMTP_SERVER = 'localhost'
SMTP_PORT = 1025
SENDER_EMAIL = 'support@grocerease.com'
SENDER_PASSWORD = 'password'

IMG_DIR = os.path.join(os.path.dirname(__file__), '../static/images/')

def send_email(to, subject, message):
    msg = MIMEMultipart()
    msg['To'] = to
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg.attach(MIMEText(message, 'html'))

    with open(IMG_DIR + 'GrocerEaseLogo.png', 'rb') as f:
        img = MIMEImage(f.read(), name='GrocerEaseLogo.png')
        img.add_header('Content-ID', '<GrocerEaseLogo>')
        msg.attach(img)

    with open(IMG_DIR + 'FreshGrocery.jpg', 'rb') as f:
        img = MIMEImage(f.read(), name='FreshGrocery.jpg')
        img.add_header('Content-ID', '<FreshGrocery>')
        msg.attach(img)

    smtp_server = SMTP(host=SMTP_SERVER, port=SMTP_PORT)
    smtp_server.send_message(msg=msg)
    smtp_server.quit()


def send_monthly_report(to, subject, message):
    msg = MIMEMultipart()
    msg['To'] = to
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg.attach(MIMEText(message, 'html'))

    with open(IMG_DIR + 'GrocerEaseLogo.png', 'rb') as f:
        img = MIMEImage(f.read(), name='GrocerEaseLogo.png')
        img.add_header('Content-ID', '<GrocerEaseLogo>')
        msg.attach(img)

    smtp_server = SMTP(host=SMTP_SERVER, port=SMTP_PORT)
    smtp_server.send_message(msg=msg)
    smtp_server.quit()