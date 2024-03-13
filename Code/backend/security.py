from flask_security import SQLAlchemyUserDatastore
from backend.models import db, User, Role

datastore = SQLAlchemyUserDatastore(db, User, Role)