class Cycle:
    '''A cycle represents a single unit of time, and how that time was spent.
    
       It includes information about start, end, duration
       as well as which activities were considered, which was chosen
       and any follow-up notes.

    '''
    
    def __init__(self, start_time, end_time, duration, activities, choice, notes):
        if (len(activities) != 3):
            raise Exception("A cycle requires 3 activities to create")

        if (choice not in [1, 2, 3]):
            raise Exception("Choice must be an integer representing the selected activity")

        self.start_time = start_time
        self.end_time = end_time
        self.duration = duration
        self.activities = activities
        self.choice = choice
        self.notes = notes

    # Implement __iter__ so we can convert to a tuple quickly.
    def __iter__(self):
        yield self.start_time
        yield self.end_time
        yield self.duration
        for act in self.activities:
            yield act
        yield self.choice
        yield self.notes
        
