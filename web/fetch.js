// Based on https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return response.json();
}

async function saveActivity(activity) {
    return await postData('/activity', activity.activityJSON());
}

async function lookupDayHistory(date) {
    const requestURL = `/activityhistory?start_time=${date.getTime()}`;
    const response = await fetch(requestURL);

    const cyclesJSON = await response.json();

    const cycleHistory = [];
    for (const cycle of cyclesJSON) {
        const activity = new Activity(
            cycleHistory.length+1,
            cycle['activity1'],
            cycle['activity2'],
            cycle['activity3']);
        activity.setStartTime(cycle['start_time']);
        activity.setDuration(cycle['duration']);
        activity.setFinishTime(cycle['finish_time']);
        activity.setChoice(cycle['choice']);
        activity.setNotes(cycle['notes']);
        cycleHistory.push(activity);
    }

    console.log(`Number of activities: ${cycleHistory.length}`);
    return cycleHistory;
}
