# Server-side code for the cycle application.
# Provides files to the FE and 
# calls database methods to manipulate the database

import click
from flask import Flask
from flask import g, request, send_from_directory

from cycles import Cycle
from database import CyclesDatabase

app = Flask(__name__)

#--------------------------- Application Files ---------------------------#
#Based on: https://stackoverflow.com/questions/20646822/how-to-serve-static-files-in-flask
@app.route('/<path:path>')
def send_static_file(path):
    return send_from_directory('../web', path)

@app.route('/')
def hello_world():
    return send_from_directory('../web', 'index.html')

#--------------------------- Application Data ---------------------------#
@app.post('/activity')
def save_activity():
    print(f'Save Activity Request: {request.get_json()}')
    data = Cycle(*request.get_json())
    return [get_db().insert_cycle(data)]

@app.get('/activityhistory')
def get_activities():
    print('Getting activity history')
    start_time = int(request.args.get('start_time', 0))

    # End time is one day later. Eventually, we may allow requests
    # for different timespans
    end_time = start_time + 24 * 60 * 60 * 1000
    return get_db().get_cycles_for_timerange(start_time, end_time)


#--------------------------- Database ---------------------------#
def get_db():
    if 'db' not in g:
        g.db = CyclesDatabase('../sqlite')

    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.shutdown()

@click.command('init-db')
def init_db_command():
    db = get_db()
    db.maybe_init()
    click.echo('Database initialized')

# Maybe put this in """def init_app(app):"""
# Stuff to do to cleanup after returning a response.
app.teardown_appcontext(close_db)

# New command to use w/ flask
# This creates an option to initialize the db from command line,
# like: flask --app server init-db
app.cli.add_command(init_db_command)