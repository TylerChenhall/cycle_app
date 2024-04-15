# Database-related code for the cycle application.
# To start, I've copied over the Parkrun DB code.
import sqlite3

# TODO: maybe have this return a cycle object
def cycle_factory(cursor, row):
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}

# TODO: why execute on the cursor vs database?
class CyclesDatabase:
    def __init__(self, relative_path):
        self.path = relative_path
        self.db = sqlite3.connect(self.path + '/cycles.db')
        self.db.row_factory = cycle_factory
        self.cursor = self.db.cursor()
    
    def maybe_init(self):
        '''Initialize the database connection.
        
           Creates new database files and tables if they don't exist yet.'''
        self.cursor.execute(cycles_table)

    def _print_tables(self):
        '''Prints the table names in the current database.

           This is mainly intended to help with debugging.'''
        result = self.cursor.execute('SELECT name FROM sqlite_master')
        print('Table names:',*[ans[0] for ans in result.fetchall()])
    
    def shutdown(self):
        '''Close database connections.'''
        if self.db is not None:
            self.db.commit()  # Not yet sure if I'll need this.
            self.db.close()

    def insert_cycle(self, cycle):
        self.cursor.execute(insert_cycle, tuple(cycle))
        self.db.commit()

        return self.cursor.lastrowid

    def get_cycles_for_timerange(self, start, end):
        return [x for x in self.cursor.execute(query_cycles, (start, end))]

    def sample_cycles(self, n):
        for row in self.cursor.execute(sample_cycles, (n,)):
            print(row)

    def get_aggregated_statistics(self, size):
        '''Compute cycle statistics per time period of "size".
        
           TODO'''
        pass

# A table representing a single user's cycle data.
# start_time, finish_time: UNIX timestamps
# duration: milliseconds
# choice: 1, 2, or 3 to represent the activity chosen for the cycle
cycles_table = '''
    CREATE TABLE IF NOT EXISTS cycles (
        start_time integer PRIMARY KEY,
        finish_time integer,
        duration integer,
        activity1 text NOT NULL,
        activity2 text NOT NULL,
        activity3 text NOT NULL,
        choice integer NOT NULL,
        notes text
    );
'''

insert_cycle = '''
    INSERT INTO cycles(
        start_time, finish_time, duration, activity1, activity2,
        activity3, choice, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
'''

query_cycles = '''
    SELECT * from cycles
    WHERE (?) <= start_time and start_time <= (?)
    ORDER BY start_time asc
'''

sample_cycles = '''SELECT * from cycles limit (?)'''


if __name__ == '__main__':
    # Use this to setup and inspect the main database.
    db = CyclesDatabase('../sqlite')
    db.maybe_init()
    db.sample_cycles(5)
    db.shutdown()