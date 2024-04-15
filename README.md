# Cycle App

An application for observing and understanding activity choice and completion.

## Motivation

This project started as a way to observe and improve how I make decisions throughout the day.

The basic idea is to break each day into _cycles_, which are small time blocks spent on a single activity. At the start of each cycle, the user nominates 3 possible activities, and chooses one. The user then spends a short block of time on the chosen activity.

__This is not a productivity application__, though improved productivity may be a side-effect of following this method.

Key features include

* Frequent opportunities to consider which activities are meaningful, relevant, or important
* Frequent, intentional choice of action
* Data collection for future reflection

This shifts focus toward developing internal connection and intrinsic motivation, whereas a productivity focus often collides with negative and judgmental emotional states.

## Status

This project is casually in-development [I add features when they seem particularly useful]

Currently, basic cycle management, data recording, and browsing are implemented. Follow-up analysis is still very limited, and the application only supports a single user.

The application has a wider view intended for desktop use, and a narrow view for mobile.

## Technical Details

The app requires Python3 with Flask. The frontend is HTML+CSS+JS. The backend is a Flask server with sqlite database.

### Database setup
```
cd server
python3 database.py
```

Alternatively, use the Flask command
```
cd server
flask --app server init-db
```

### Running the app
```
cd server
flask --app server run
```

By default, Flask serves at [http://localhost:5000](http://localhost:5000)