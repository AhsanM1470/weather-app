export const ICON_MAP = new Map();

addMapping([0, 1], "sun");
addMapping([2, 3], "cloud");
addMapping([45, 48], "fog");
addMapping([51, 53, 55], "sunny-rainy");
addMapping([61, 63, 66, 80], "light-rain");
addMapping([65, 67, 81, 82], "heavy-rain");
addMapping([71, 73, 75, 85, 86], "snow");
addMapping([95, 96, 99], "storm");

function addMapping(values, icon){
    values.forEach(value => {
        ICON_MAP.set(value, icon);
    });
}