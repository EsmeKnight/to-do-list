//jshint esversion:6

export default { date: getDate(), day: getDay() }

function getDate() {
    const today = new Date();
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    };

    return today.toLocaleDateString('en-GB', options);
}

function getDay() {
    const today = new Date();
    const options = {
        weekday: 'long',
    };

    return today.toLocaleDateString('en-GB', options);
}