export const formatTime = (time: string) => {
    const [hoursStr, minutesStr] = time.split(":");
    const hours = Number(hoursStr);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutesStr} ${period}`;
};

export const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

export const todayIso = () => new Date().toISOString().slice(0, 10);
