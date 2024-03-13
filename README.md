# GrocerEase - Grocery Store App
## Modern Application Development II - Project

In this project, we were tasked to create a web-based grocery store application, which I have named 'GrocerEase'. Following are the steps one can follow to run the app after unzipping the zip file:

1. Open terminal window and navigate to the `Code` folder after unzipping the zip file.

2. Run the build.sh file to set up the virtual environment and download essential packages/libraries:
```
$ source build.sh
```

3. Run the app:
```
$ python app.py
```
_You can run the app on the IP address the terminal window is showing_

4. In another terminal window, and run the REDIS server:
```
$ redis-server
```

5. In another terminal window, start the mailhog:
```
$ mailhog
```

6. In another terminal window, source the `.venv` and start the celery worker:
```
$ source .venv/bin/activate
$ celery -A app:celery_app worker --loglevel INFO
```

7. In another terminal window, source the `.venv` and start the celery beat:
```
$ source .venv/bin/activate
$ celery -A app:celery_app beat --loglevel INFO
```

The GrocerEase app is now ready to be explored!