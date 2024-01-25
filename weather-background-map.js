export const WEATHER_BACKGROUND_MAP = new Map();

addMapping([0, 1], "sun-background");
addMapping([2, 3], "cloud-background");
addMapping([45, 48], "fog-background");
addMapping([51, 53, 55], "sun-rain-background");
addMapping([61, 63, 66, 80], "rain-background");
addMapping([65, 67, 81, 82], "rain-background");
addMapping([71, 73, 75, 85, 86], "snow-background");
addMapping([95, 96, 99], "storm-background");

function addMapping(values, icon){
    values.forEach(value => {
        WEATHER_BACKGROUND_MAP.set(value, icon);
    });
}