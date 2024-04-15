/**
 * Represents a single cycle's data.
 *
 * A cycle has fields including
 *   activities considered
 *   which activity was chosen
 *   start and end times
 *   duration
 *
 * Class methods help convert to JSON and an HTML template
 *
 * TOD: rename (should probably be class Cycle)
 */
class Activity {
    constructor(activityNumber, act1, act2, act3) {
        this.activityNumber = activityNumber;
        this.activities = [act1, act2, act3];
    }

    setChoice(choice) {
        this.choice = choice;
    }

    setNotes(notes) {
        this.notes = notes;
    }

    setStartTime(startTime) {
        this.startTime = startTime;
    }

    setFinishTime(finishTime) {
        this.finishTime = finishTime;
    }

    setDuration(duration) {
        this.duration = duration;
    }

    activityJSON() {
        return [this.startTime, this.finishTime, this.duration, this.activities, this.choice, this.notes];
    }

    activityHTML() {
        const fullTimeText = (new Date(this.startTime))
            .toLocaleTimeString('en-US');
        const timeText = fullTimeText.slice(0, fullTimeText.length - 6)
            + fullTimeText.slice(fullTimeText.length - 2).toLowerCase();
        
        const row = document.createElement('tr');

        const count = document.createElement('td');
        count.textContent = `${this.activityNumber}`
        row.appendChild(count);

        const time = document.createElement('td');
        time.textContent = timeText;
        row.appendChild(time);

        for (let i = 1; i <= this.activities.length; i++) {
            const act = document.createElement('td');
            act.textContent = this.activities[i-1];
            if (i == this.choice) {
                act.setAttribute('class', 'selected');
            }
            row.appendChild(act);
        }

        const note = document.createElement('td');
        note.textContent = this.notes;
        row.appendChild(note);

        return row;
    }
}